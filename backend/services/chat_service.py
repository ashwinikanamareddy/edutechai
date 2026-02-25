"""
services/chat_service.py — Core AI logic for the Global AI Chat Assistant.
Handles prompt construction, RAG injection, and Groq API orchestration.
"""
import json
from datetime import datetime
from uuid import UUID
from typing import List, Optional
from services.groq_service import _client as groq_client
from services.rag_service import search_similar_documents
from services.db import supabase
from models.chat_models import ChatMessageRequest, ChatMessageResponse

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
        f"You are a helpful, adaptive AI Educational Assistant for a platform called 'EduTech'.\n"
        f"Selected Language: {language}\n"
        f"User Role: {role}\n\n"
        f"RULES:\n"
        f"1. You MUST respond primarily in {language}.\n"
        f"2. Be supportive, clear, and age-appropriate.\n"
        f"3. If the user is a student, use simpler terms and provide analogies.\n"
        f"4. If context from documents is provided below, prioritize it in your answer.\n"
        f"5. Suggest 2-3 short follow-up questions at the end.\n"
        f"6. Provide a very short summary (1 sentence) for important explanations.\n"
        f"7. Never answer harmful or non-educational off-topic content.\n"
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
    reply_text = "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment!"
    follow_ups = []
    actions = ["Practice Quiz", "Review Topic"] if role == "student" else ["View Report", "Send Alert"]
    
    if groq_client:
        try:
            print(f"[chat_service] Calling Groq with prompt length: {len(full_prompt)}")
            completion = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": full_prompt},
                ],
                temperature=0.7,
                max_tokens=1000,
            )
            if completion and completion.choices:
                reply_text = completion.choices[0].message.content
                
                # Extract follow-up questions from response if AI included them
                lines = [l.strip() for l in reply_text.split("\n") if l.strip()]
                potential_questions = [l for l in lines[-5:] if "?" in l and (l[0].isdigit() or l.startswith("-") or l.startswith("?"))]
                
                if potential_questions:
                    follow_ups = [q.lstrip("0123456789.-? ").strip() for q in potential_questions[:3]]
            
            if not follow_ups:
                # Default follow-ups if AI didn't provide them clearly
                if role == "student":
                    follow_ups = ["Can you explain that more simply?", "Give me another example.", "Is this important for my exam?"]
                else:
                    follow_ups = ["Show me more details.", "What are the next steps?", "Is there a summary available?"]
                    
        except Exception as e:
            import traceback
            print(f"[chat_service] Groq call failed: {str(e)}")
            print(traceback.format_exc())
    else:
        print("[chat_service] Groq client not initialized - using fallback")

    # 5. Store message in background (Try/Catch to not block response)
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
        except Exception as e:
            print(f"[chat_service] Failed to log message to DB: {str(e)}")

    return ChatMessageResponse(
        reply=reply_text,
        suggested_actions=actions,
        follow_up_questions=follow_ups,
        language=language
    )
