from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter(prefix="/api")
ROOT = Path(__file__).resolve().parents[2]

@router.get("/research")
def research():
    config = json.loads((ROOT / "configs" / "config.json").read_text(encoding="utf-8"))
    notes = (ROOT / "docs" / "report" / "methodology_notes.md").read_text(encoding="utf-8")
    return {
        "title": "Noise-Robust Industrial Acoustic Anomaly Detection using Kernel, Ensemble and Deep Learning",
        "subtitle": "A CPU-first research implementation for the MIMII-based DCASE 2020 Challenge Task 2 Development Dataset — Fan.",
        "problem_statement": "Industrial acoustic anomaly detection under a normal-only training protocol, with controlled noise robustness evaluation.",
        "dataset": "MIMII-based DCASE 2020 Challenge Task 2 Development Dataset — Fan; controlled fan/id_00 study.",
        "research_questions": [
            "Compare kernel, ensemble and deep anomaly detection approaches under a common protocol.",
            "Evaluate robustness under clean, +6 dB, 0 dB and -6 dB controlled noise conditions when those results are present.",
            "Study computational and interpretability considerations for CPU-first deployment."
        ],
        "hypotheses": [
            "Noise can change anomaly detection performance.",
            "Heterogeneous anomaly detectors can provide complementary score information when experimentally validated."
        ],
        "methodology": [line.lstrip("# ") for line in notes.splitlines() if line.startswith("-")],
        "protocol": {
            "train": 729,
            "validation": 182,
            "final_test": 507,
            "seed": config.get("seed", 42)
        }
    }
