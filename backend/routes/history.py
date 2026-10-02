from fastapi import APIRouter
router=APIRouter(prefix="/api")
@router.get("/history")
def history(): return {"items":[]}
