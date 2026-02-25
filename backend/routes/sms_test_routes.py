"""
routes/sms_test_routes.py — Temporary endpoint for debugging Twilio SMS.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.sms_service import send_parent_sms

router = APIRouter(prefix="/api/v1/sms", tags=["SMS Debug"])

from services.sms_service import send_sms

@router.post("/sms/test")
def test_sms(phone: str):
    """
    Directly trigger an SMS to verify connectivity.
    """
    return send_sms(phone, "Test message from backend")
