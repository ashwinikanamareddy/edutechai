from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class ChatMessageRequest(BaseModel):
    message: str
    language: str = "English"
    user_id: Optional[str] = None
    role: str = "student"
    context: Optional[str] = None
    attachments: Optional[List[dict]] = None

class ChatMessageResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []
    follow_up_questions: List[str] = []
    language: str

class ChatHistoryItem(BaseModel):
    id: str
    user_id: str
    role: str
    message: str
    reply: str
    language: str
    context_page: Optional[str]
    created_at: datetime

class RAGDocument(BaseModel):
    id: UUID
    title: str
    content: str
    uploaded_by: UUID
    created_at: datetime

class SpeechToTextResponse(BaseModel):
    text: str

class TextToSpeechRequest(BaseModel):
    text: str
    language: str = "English"
