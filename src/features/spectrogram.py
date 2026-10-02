import numpy as np
import librosa

def log_mel(y, sr=16000, n_mels=64, n_fft=1024, hop_length=512):
    mel = librosa.feature.melspectrogram(
        y=y, sr=sr, n_mels=n_mels, n_fft=n_fft, hop_length=hop_length
    )
    return librosa.power_to_db(mel, ref=np.max).astype(np.float32)

def normalize_spec(x):
    x = np.asarray(x, dtype=np.float32)
    return ((x - x.mean()) / (x.std() + 1e-6)).astype(np.float32)
