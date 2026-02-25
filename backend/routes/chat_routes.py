"""
routes/chat_routes.py — API endpoints for the Global AI Chat Assistant.
"""
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks
from typing import List
from uuid import UUID
from services.chat_service import generate_chat_response
from services.rag_service import store_document
from models.chat_models import ChatMessageRequest, ChatMessageResponse, SpeechToTextResponse, TextToSpeechRequest
from core.security import get_required_auth_user as get_current_user


router = APIRouter(prefix="/api/v1/chat", tags=["AI Chat"])

@router.post("/message", response_model=ChatMessageResponse)
async def chat_message(payload: ChatMessageRequest):
    """
    Send a message to the AI assistant.
    """
    # Note: Authentication can be added here using get_current_user
    return generate_chat_response(payload)

from services.media_service import extract_text_from_pdf, extract_text_from_image
from services.rag_service import store_document

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Upload a PDF or image file to be indexed for RAG.
    """
    content = ""
    file_bytes = await file.read()
    
    if file.filename.endswith(".txt"):
        content = file_bytes.decode("utf-8")
    elif file.filename.endswith(".pdf"):
        content = extract_text_from_pdf(file_bytes)
    elif file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        content = extract_text_from_image(file_bytes)
        
    if content and not content.startswith("Error"):
        # Index in background
        background_tasks.add_task(store_document, file.filename, content)
        return {
            "success": True, 
            "message": f"File '{file.filename}' uploaded successfully.",
            "detail": "Processing in background. It will be available for AI context shortly.",
            "file_type": file.content_type
        }
    
    return {
        "success": False, 
        "message": "Processing failed.",
        "detail": content or "Unsupported file format. Please upload PDF, TXT, or Images (JPG/PNG).",
        "file_type": file.content_type
    }

@router.post("/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(file: UploadFile = File(...)):
    """
    Transcribe audio file to text using Groq Whisper (Mock for now).
    """
    return SpeechToTextResponse(text="Transcribed text from voice input.")

@router.post("/text-to-speech")
async def text_to_speech(payload: TextToSpeechRequest):
    """
    Generate audio from text (Mock / Browser-side TTS preferred for demo).
    """
    return {"success": True, "message": "Audio stream ready."}
