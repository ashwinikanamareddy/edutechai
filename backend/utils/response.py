"""
utils/response.py — Centralized JSON response helpers.

All API responses follow the envelope:
    { "success": bool, "data": any, "error": str | null }
"""
from typing import Any
from fastapi.responses import JSONResponse


def ok(data: Any = None) -> dict:
    """Return a success envelope (used directly in route return values)."""
    return {"success": True, "data": data, "error": None}


def err(message: str, status_code: int = 400) -> JSONResponse:
    """Return a JSONResponse with a failure envelope."""
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "data": None, "error": message},
    )
