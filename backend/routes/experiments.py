from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter(prefix="/api")
ROOT = Path(__file__).resolve().parents[2]

@router.get("/experiments")
def experiments():
    items = []
    for path in sorted((ROOT / "results" / "metrics").glob("*.json")):
        try:
            result = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue
        items.append({"id": path.stem, "result": result})
    return {"experiments": items}
