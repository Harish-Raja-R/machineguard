from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.routes.health import router as health_router
from backend.routes.models import router as models_router
from backend.routes.predict import router as predict_router
from backend.routes.experiments import router as experiments_router
from backend.routes.robustness import router as robustness_router
from backend.routes.errors import router as errors_router
from backend.routes.research import router as research_router
from backend.routes.history import router as history_router


app = FastAPI(
    title="MachineGuard API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STATIC FILES
# ============================================================

STATIC_DIR = "backend/static"

app.mount(
    "/static",
    StaticFiles(directory=STATIC_DIR),
    name="static",
)


# ============================================================
# API ROUTES
# ============================================================

app.include_router(
    health_router
)

app.include_router(
    models_router
)

app.include_router(
    predict_router
)

app.include_router(
    experiments_router
)

app.include_router(
    robustness_router
)

app.include_router(
    errors_router
)

app.include_router(
    research_router
)

app.include_router(
    history_router
)

# ============================================================
# SPA FRONTEND FALLBACK
# ============================================================
import os
from fastapi.responses import FileResponse

FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="frontend-assets")
    
    @app.get("/{catchall:path}")
    def serve_frontend(catchall: str):
        # Allow requests to API and static files to pass through, fallback for UI
        if catchall.startswith("api/") or catchall.startswith("static/"):
            return {"detail": "Not Found"}
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))