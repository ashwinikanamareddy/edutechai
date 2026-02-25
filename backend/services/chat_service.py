"""
services/chat_service.py — Core AI logic for the Global AI Chat Assistant.
Lightweight version: Calls Groq directly without RAG or heavy ML.
"""
import os
from groq import Groq
from models.chat_models import ChatMessageRequest, ChatMessageResponse
from core.config import GROQ_API_KEY

# Initialize Groq client
_client = Groq(api_key=GROQ_API_KEY or os.getenv("GROQ_API_KEY"))

def generate_chat_response(payload: ChatMessageRequest) -> ChatMessageResponse:
    """
    Generate an AI response using Groq (llama3-8b-8192).
    """
    try:
        completion = _client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": f"You are a helpful AI tutor for students. Reply in {payload.language}."},
                {"role": "user", "content": payload.message}
            ],
            temperature=0.7,
            max_tokens=1024,
        )

        reply = completion.choices[0].message.content

        return ChatMessageResponse(
            reply=reply,
            suggested_actions=[],
            follow_up_questions=[],
            language=payload.language
        )

    except Exception as e:
        print(f"[chat_service] Error: {str(e)}")
        return ChatMessageResponse(
            reply="I'm temporarily unavailable. Please try again.",
            suggested_actions=[],
            follow_up_questions=[],
            language=payload.language
        )
