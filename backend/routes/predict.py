from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pathlib import Path
import json
import os
import tempfile
import time
import uuid

import numpy as np
import torch
import librosa

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from src.models.cnn_attention import CNNAttentionAutoencoder
from src.models.cnn_autoencoder import CNNAutoencoder


router = APIRouter(prefix="/api")

ROOT = Path(__file__).resolve().parents[2]

REGISTRY_PATH = ROOT / "models" / "registry.json"

STATIC_RESULTS_DIR = (
    ROOT / "backend" / "static" / "results"
)


# ============================================================
# VERIFIED MODEL THRESHOLDS
# ============================================================

CNN_ATTENTION_THRESHOLD = 0.1252910517156124
CNN_AUTOENCODER_THRESHOLD = 0.1167612619698047


# ============================================================
# REGISTRY
# ============================================================

def load_registry():
    if not REGISTRY_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail="Model registry not found."
        )

    return json.loads(
        REGISTRY_PATH.read_text(
            encoding="utf-8"
        )
    )


# ============================================================
# AUDIO / LOG-MEL PREPROCESSING
# ============================================================

def prepare_log_mel(audio_path):
    audio, sample_rate = librosa.load(
        str(audio_path),
        sr=16000,
        mono=True
    )

    if len(audio) == 0:
        raise ValueError(
            "Audio file contains no samples."
        )

    mel = librosa.feature.melspectrogram(
        y=audio,
        sr=sample_rate,
        n_fft=1024,
        hop_length=512,
        n_mels=64
    )

    log_mel = librosa.power_to_db(
        mel,
        ref=np.max
    )

    mean = log_mel.mean()
    std = log_mel.std()

    log_mel = (
        (log_mel - mean)
        / (std + 1e-8)
    )

    tensor = torch.tensor(
        log_mel,
        dtype=torch.float32
    ).unsqueeze(0).unsqueeze(0)

    duration = len(audio) / sample_rate

    return (
        tensor,
        sample_rate,
        duration,
        log_mel
    )


# ============================================================
# CNN + ATTENTION MODEL
# ============================================================

def load_attention_model():

    checkpoint = (
        ROOT
        / "models"
        / "cnn_attention.pth"
    )

    if not checkpoint.exists():
        raise FileNotFoundError(
            "cnn_attention.pth was not found."
        )

    model = CNNAttentionAutoencoder()

    state_dict = torch.load(
        checkpoint,
        map_location="cpu",
        weights_only=True
    )

    model.load_state_dict(
        state_dict
    )

    model.eval()

    return model


# ============================================================
# CNN AUTOENCODER MODEL
# ============================================================

def load_autoencoder_model():

    checkpoint = (
        ROOT
        / "models"
        / "cnn_autoencoder.pth"
    )

    if not checkpoint.exists():
        raise FileNotFoundError(
            "cnn_autoencoder.pth was not found."
        )

    model = CNNAutoencoder()

    state_dict = torch.load(
        checkpoint,
        map_location="cpu",
        weights_only=True
    )

    model.load_state_dict(
        state_dict
    )

    model.eval()

    return model


# ============================================================
# CNN + ATTENTION PREDICTION
# ============================================================

def attention_prediction(tensor):

    model = load_attention_model()

    with torch.no_grad():

        reconstruction, attention = model(
            tensor,
            return_attention=True
        )

        score = (
            (reconstruction - tensor) ** 2
        ).flatten(1).mean(1)

    anomaly_score = float(
        score.item()
    )

    prediction = (
        "ANOMALY"
        if anomaly_score
        > CNN_ATTENTION_THRESHOLD
        else "NORMAL"
    )

    return (
        prediction,
        anomaly_score,
        CNN_ATTENTION_THRESHOLD,
        attention
    )


# ============================================================
# CNN AUTOENCODER PREDICTION
# ============================================================

def autoencoder_prediction(tensor):

    model = load_autoencoder_model()

    with torch.no_grad():

        reconstruction = model(
            tensor
        )

        score = (
            (reconstruction - tensor) ** 2
        ).flatten(1).mean(1)

    anomaly_score = float(
        score.item()
    )

    prediction = (
        "ANOMALY"
        if anomaly_score
        > CNN_AUTOENCODER_THRESHOLD
        else "NORMAL"
    )

    return (
        prediction,
        anomaly_score,
        CNN_AUTOENCODER_THRESHOLD,
        None
    )


# ============================================================
# SAVE LOG-MEL SPECTROGRAM
# ============================================================

def save_spectrogram(
    log_mel,
    output_dir
):

    output_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    filename = (
        f"{uuid.uuid4().hex}"
        "_spectrogram.png"
    )

    output_path = (
        output_dir
        / filename
    )

    plt.figure(
        figsize=(10, 4)
    )

    plt.imshow(
        log_mel,
        aspect="auto",
        origin="lower"
    )

    plt.xlabel(
        "Time"
    )

    plt.ylabel(
        "Mel Frequency"
    )

    plt.title(
        "MachineGuard Log-Mel Spectrogram"
    )

    plt.colorbar(
        label="Normalized dB"
    )

    plt.tight_layout()

    plt.savefig(
        output_path,
        dpi=120,
        bbox_inches="tight"
    )

    plt.close()

    return filename


# ============================================================
# SAVE CNN ATTENTION MAP
# ============================================================

def save_attention_map(
    attention,
    output_dir
):

    if attention is None:
        return None

    output_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    filename = (
        f"{uuid.uuid4().hex}"
        "_attention.png"
    )

    output_path = (
        output_dir
        / filename
    )

    attention_array = (
        attention.detach()
        .cpu()
        .squeeze()
        .numpy()
    )

    plt.figure(
        figsize=(10, 4)
    )

    plt.imshow(
        attention_array,
        aspect="auto",
        origin="lower"
    )

    plt.xlabel(
        "Time"
    )

    plt.ylabel(
        "Encoded Frequency"
    )

    plt.title(
        "CNN + Attention Attribution Map"
    )

    plt.colorbar(
        label="Attention"
    )

    plt.tight_layout()

    plt.savefig(
        output_path,
        dpi=120,
        bbox_inches="tight"
    )

    plt.close()

    return filename


# ============================================================
# PREDICTION API
# ============================================================

@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model: str | None = Form(
        default=None
    )
):

    # --------------------------------------------------------
    # Validate filename
    # --------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file was provided."
        )

    # --------------------------------------------------------
    # Validate WAV
    # --------------------------------------------------------

    if not file.filename.lower().endswith(
        ".wav"
    ):

        raise HTTPException(
            status_code=400,
            detail="Only WAV files are supported."
        )

    # --------------------------------------------------------
    # Load registry
    # --------------------------------------------------------

    registry = load_registry()

    # --------------------------------------------------------
    # Default model
    # --------------------------------------------------------

    if model is None:
        model = "cnn_attention"

    # --------------------------------------------------------
    # Only deployable models
    # --------------------------------------------------------

    if model not in {
        "cnn_attention",
        "cnn_autoencoder"
    }:

        raise HTTPException(
            status_code=400,
            detail=(
                "Deployable models available "
                "for live inference: "
                "cnn_attention, "
                "cnn_autoencoder"
            )
        )

    # --------------------------------------------------------
    # Registry entry
    # --------------------------------------------------------

    registry_item = registry.get(
        model
    )

    if not registry_item:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Model '{model}' "
                "is not registered."
            )
        )

    # --------------------------------------------------------
    # Artifact path
    # --------------------------------------------------------

    artifact = registry_item.get(
        "artifact_path"
    )

    if not artifact:

        raise HTTPException(
            status_code=503,
            detail=(
                f"No artifact configured "
                f"for '{model}'."
            )
        )

    artifact_path = (
        ROOT / artifact
    )

    if not artifact_path.exists():

        raise HTTPException(
            status_code=503,
            detail=(
                "Model artifact not found: "
                f"{artifact_path}"
            )
        )

    temp_path = None

    try:

        # ====================================================
        # Save uploaded WAV temporarily
        # ====================================================

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".wav"
        ) as temp:

            temp_path = Path(
                temp.name
            )

            temp.write(
                await file.read()
            )

        # ====================================================
        # Start processing timer
        # ====================================================

        start = time.perf_counter()

        # ====================================================
        # Prepare features
        # ====================================================

        (
            tensor,
            sample_rate,
            duration,
            log_mel
        ) = prepare_log_mel(
            temp_path
        )

        # ====================================================
        # Run selected model
        # ====================================================

        if model == "cnn_attention":

            (
                prediction,
                anomaly_score,
                threshold,
                attention
            ) = attention_prediction(
                tensor
            )

        else:

            (
                prediction,
                anomaly_score,
                threshold,
                attention
            ) = autoencoder_prediction(
                tensor
            )

        # ====================================================
        # Generate visualization files
        # ====================================================

        output_dir = (
            ROOT
            / "backend"
            / "static"
            / "results"
        )

        spectrogram_file = (
            save_spectrogram(
                log_mel,
                output_dir
            )
        )

        attention_file = (
            save_attention_map(
                attention,
                output_dir
            )
        )

        # ====================================================
        # Processing time
        # ====================================================

        processing_time_ms = (
            time.perf_counter()
            - start
        ) * 1000

        # ====================================================
        # API response
        # ====================================================

        return {

            "prediction": prediction,

            "anomaly_score": (
                anomaly_score
            ),

            "threshold": (
                threshold
            ),

            "machine_type": "fan",

            "machine_id": "id_00",

            "model": model,

            "processing_time_ms": round(
                processing_time_ms,
                2
            ),

            "audio_duration_seconds": round(
                duration,
                3
            ),

            "sample_rate": (
                sample_rate
            ),

            "spectrogram_url": (
                f"/static/results/"
                f"{spectrogram_file}"
            ),

            "explanation_url": (
                f"/static/results/"
                f"{attention_file}"
                if attention_file
                else None
            ),

            "model_version": (
                registry_item.get(
                    "version"
                )
            ),

            "attention_available": (
                attention is not None
            ),
        }

    # ========================================================
    # HTTP errors
    # ========================================================

    except HTTPException:
        raise

    # ========================================================
    # Unexpected errors
    # ========================================================

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Prediction failed: {exc}"
            )
        )

    # ========================================================
    # Always delete temporary WAV
    # ========================================================

    finally:

        if (
            temp_path
            and temp_path.exists()
        ):

            try:

                os.remove(
                    temp_path
                )

            except OSError:
                pass