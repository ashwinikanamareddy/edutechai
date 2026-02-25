"""
routes/learn_routes.py — API endpoints for the FAST Learn Topic feature.
"""
import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from gtts import gTTS
from core.security import get_required_auth_user as get_current_user
from models.learn_models import LearnTopicRequest, LearnTopicResponse, TTSRequest, StoryboardResponse
from services.learn_service import generate_topic_explanation, generate_storyboard

router = APIRouter(tags=["Learning"])

@router.post("/topic", response_model=LearnTopicResponse)
async def learn_topic(payload: LearnTopicRequest, current_user=Depends(get_current_user)):
    """
    Get an AI-generated explanation for a topic.
    """
    return generate_topic_explanation(payload.topic, payload.language)

@router.post("/storyboard", response_model=StoryboardResponse)
async def learn_storyboard(payload: LearnTopicRequest, current_user=Depends(get_current_user)):
    """
    Get an AI-generated 5-scene storyboard for a topic.
    """
    return generate_storyboard(payload.topic, payload.language)

@router.post("/text-to-speech")
async def text_to_speech(payload: TTSRequest):
    """
    Generate audio from text using gTTS and return as a file.
    """
    try:
        # Map language name to gTTS code
        lang_map = {
            "English": "en",
            "Hindi": "hi",
            "Telugu": "te"
        }
        lang_code = lang_map.get(payload.language, "en")
        
        tts = gTTS(text=payload.text, lang=lang_code)
        
        # Create a persistent temporary file that won't be deleted immediately
        # We'll use a specific prefix to identify them if needed
        fd, path = tempfile.mkstemp(suffix=".mp3", prefix="edu_tts_")
        os.close(fd)
        
        tts.save(path)
        
        # FileResponse will handle streaming the file
        return FileResponse(
            path, 
            media_type="audio/mpeg", 
            filename="explanation.mp3"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
