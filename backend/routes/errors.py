from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter(prefix="/api")
ROOT = Path(__file__).resolve().parents[2]

@router.get("/errors")
def errors():
    path = ROOT / "results" / "metrics" / "error_analysis.json"
    if not path.exists():
        return {"conditions": [], "figure_urls": {"errors": [], "explainability": []}, "source_available": False}
    return json.loads(path.read_text(encoding="utf-8"))
