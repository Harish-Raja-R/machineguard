from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter(prefix="/api")
ROOT = Path(__file__).resolve().parents[2]

@router.get("/robustness")
def robustness():
    path = ROOT / "results" / "metrics" / "noise_robustness.json"
    if not path.exists():
        return {"conditions": [], "source_available": False, "message": "Noise robustness results have not been generated in this source package."}
    return json.loads(path.read_text(encoding="utf-8"))
