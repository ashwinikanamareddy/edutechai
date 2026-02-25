"""
services/chat_service.py — Core AI logic for the Global AI Chat Assistant.
Handles prompt construction, RAG injection, and Groq API orchestration.
"""
import json
import logging
from datetime import datetime
from typing import List, Optional
from services.groq_service import _client as groq_client
from services.rag_service import search_similar_documents
from services.db import supabase
from models.chat_models import ChatMessageRequest, ChatMessageResponse

logger = logging.getLogger(__name__)

def generate_chat_response(payload: ChatMessageRequest) -> ChatMessageResponse:
    """
    Generate an AI response using Groq, enriched with RAG and user context.
    """
    user_id = payload.user_id
    message = payload.message
    language = payload.language
    context_page = payload.context
    role = payload.role

    # 1. Retrieve RAG context
    rag_docs = search_similar_documents(message, user_id=str(user_id) if user_id else None)
    rag_context = "\n".join(rag_docs) if rag_docs else "No relevant documents found."

    # 2. Retrieve last 3 messages for history (simplified for demo)
    history_context = ""
    if user_id:
        try:
            res = supabase.table("chat_messages").select("message, reply").eq("user_id", str(user_id)).order("created_at", desc=True).limit(3).execute()
            if res.data:
                history_context = "\n".join([f"User: {m['message']}\nAI: {m['reply']}" for m in reversed(res.data)])
        except Exception:
            pass

    # 3. Build Master System Prompt
    system_prompt = (
        f"You are 'Vidya Saathi' (विद्या साथी), a highly intelligent and supportive AI Educational Assistant for the EduTech platform.\n"
        f"Language: {language}\n"
        f"Target User Role: {role}\n\n"
        "CORE MANDATES:\n"
        f"1. PRIMARY LANGUAGE: You MUST respond ENTIRELY in {language}. Use natural, accurate phrasing.\n"
        "2. ACCURACY & DEPTH: Provide high-quality, scientifically accurate, and logically structured educational explanations. Do not be overly brief.\n"
        "3. TONE: Be supportive and professional. Use analogies and real-world examples to make learning fun.\n"
        "4. RAG CONTEXT: Use the 'Relevant Document Info' provided below to ground your answer in the user's uploaded materials.\n"
        "5. FOLLOW-UP: End with exactly 3 numbered follow-up questions relevant to the current topic.\n"
        "6. SUMMARY: Start your response with a concise 1-sentence 'Quick Take'.\n"
        "7. SAFETY: Refuse any harmful, offensive, or non-educational content politely.\n"
    )

    full_prompt = (
        f"--- CONTEXT ---\n"
        f"Current Page: {context_page or 'Dashboard'}\n"
        f"Relevant Document Info: {rag_context}\n"
        f"Recent History:\n{history_context}\n\n"
        f"--- USER QUESTION ---\n"
        f"{message}"
    )

    # 4. Call Groq
    reply_text = "I'm sorry, I'm having trouble connecting to my brain right now. Please check your connection!"
    follow_ups = []
    actions = ["Practice Quiz", "Review Topic"] if role == "student" else ["View Report", "Send Alert"]
    
    if groq_client:
        try:
            completion = groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": full_prompt},
                ],
                temperature=0.7,
                max_tokens=1500,
            )
            reply_text = completion.choices[0].message.content
            
            # Extract follow-up questions
            lines = [l.strip() for l in reply_text.split("\n") if l.strip()]
            potential_questions = [l for l in lines[-7:] if "?" in l and (l[0].isdigit() or l.startswith("-") or l.startswith("?"))]
            
            if potential_questions:
                follow_ups = [q.lstrip("0123456789.-? ").strip() for q in potential_questions[:3]]
            else:
                if role == "student":
                    follow_ups = ["Can you explain that more simply?", "Give me another example.", "Is this important for my exam?"]
                else:
                    follow_ups = ["Show me more details.", "What are the next steps?", "Is there a summary available?"]
        except Exception as e:
            logger.error(f"[chat_service] Groq call failed: {e}")

    # 5. Store message
    if user_id:
        try:
            supabase.table("chat_messages").insert({
                "user_id": str(user_id),
                "role": role,
                "message": message,
                "reply": reply_text,
                "language": language,
                "context_page": context_page
            }).execute()
        except Exception:
            pass

    return ChatMessageResponse(
        reply=reply_text,
        suggested_actions=actions,
        follow_up_questions=follow_ups,
        language=language
    )
