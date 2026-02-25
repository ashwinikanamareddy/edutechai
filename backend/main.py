"""
main.py — Application entry point (clean, minimal).

Responsibilities:
  - Create the FastAPI app
  - Configure CORS middleware
  - Register all APIRouters
  - Global exception handler (consistent JSON envelope on unhandled errors)
  - /health and /api/v1/health (DB + env var checks)
  - /api/v1/test-db (quick DB connectivity probe)
"""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import ALLOWED_ORIGINS, GROQ_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
from services.db import supabase
from routes.auth_routes import router as auth_router
from routes.quiz_routes import router as quiz_router
from routes.analytics_routes import router as analytics_router
from routes.chat_routes import router as chat_router
from routes.learn_routes import router as learn_router
from routes.sms_test_routes import router as sms_test_router

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="EduTech AI Backend",
    description="Adaptive learning platform API",
    version="2.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global error handler ─────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    from fastapi import HTTPException
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "data": None, "error": exc.detail},
        )
    return JSONResponse(
        status_code=500,
        content={"success": False, "data": None, "error": "Internal server error"},
    )

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(quiz_router)
app.include_router(analytics_router)
app.include_router(chat_router)
app.include_router(learn_router)
app.include_router(sms_test_router)

# ─── Core endpoints ───────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {"success": True, "data": {"message": "EduTech backend running"}, "error": None}


@app.get("/api/v1/health")
def health_check():
    """
    Health endpoint.
    - Checks Supabase connectivity.
    - Checks presence of critical environment variables.
    """
    db_status = "connected"
    try:
        supabase.table("quiz_attempts").select("id").limit(1).execute()
    except Exception:
        db_status = "error"

    env_checks = {
        "supabase_url": bool(os.getenv("SUPABASE_URL", "").strip()),
        "supabase_key": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()),
        "jwt_secret": bool(os.getenv("JWT_SECRET_KEY", "").strip()),
        "groq_key": bool(GROQ_API_KEY),
        "twilio_configured": bool(TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER),
    }

    all_critical_ok = env_checks["supabase_url"] and env_checks["supabase_key"]

    return {
        "success": all_critical_ok and db_status == "connected",
        "data": {
            "backend": "running",
            "database": db_status,
            "environment": env_checks,
        },
        "error": None if (all_critical_ok and db_status == "connected") else "One or more checks failed",
    }


@app.get("/api/v1/test-db")
def test_db():
    try:
        response = supabase.table("quiz_attempts").select("*").limit(1).execute()
        return {"success": True, "data": response.data, "error": None}
    except Exception as e:
        return {"success": False, "data": None, "error": str(e)}
