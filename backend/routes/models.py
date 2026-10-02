from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter(prefix="/api")
ROOT = Path(__file__).resolve().parents[2]

@router.get("/models")
def models():
    registry = json.loads((ROOT / "models" / "registry.json").read_text(encoding="utf-8"))
    items = []
    for model_id, item in registry.items():
        trained = item.get("status") == "trained"
        artifact = item.get("artifact_path")
        deployable = bool(trained and artifact and (ROOT / artifact).exists())
        items.append({
            "id": model_id,
            "name": model_id.replace("_", " ").title(),
            "status": item.get("status", "unknown"),
            "deployable": deployable,
            "model_version": item.get("version"),
            "reason": "Trained artifact available" if deployable else "No deployable trained artifact is bundled",
        })
    return {"models": items}
