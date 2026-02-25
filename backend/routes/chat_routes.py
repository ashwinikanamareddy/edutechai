"""
routes/chat_routes.py — API endpoints for the Global AI Chat Assistant.
"""
from fastapi import APIRouter
from services.chat_service import generate_chat_response
from models.chat_models import ChatMessageRequest, ChatMessageResponse

router = APIRouter(tags=["AI Chat"])

@router.post("/message", response_model=ChatMessageResponse)
async def chat_message(payload: ChatMessageRequest):
    """
    Send a message to the AI assistant.
    """
    return generate_chat_response(payload)
