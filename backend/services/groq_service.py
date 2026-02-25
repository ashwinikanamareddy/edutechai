"""
services/groq_service.py — AI question and remedial content generation via Groq.

Design:
- API key loaded once from config (no double dotenv loading).
- generate_question() returns a valid MCQ dict; falls back to static pool on any failure.
- generate_remedial() returns explanation text; falls back to static text on any failure.
- NEVER raises — all exceptions are caught internally.
"""
import json
import random
from typing import Any, Dict

import os
from core.config import GROQ_API_KEY

# ─── Groq client (singleton) ──────────────────────────────────────────────────
_client = None
_key = os.getenv("GROQ_API_KEY") or GROQ_API_KEY

if _key:
    try:
        from groq import Groq
        _client = Groq(api_key=_key)
        print("[groq_service] Groq client initialised OK")
    except Exception as e:
        import traceback
        print(f"[groq_service] Groq client init failed: {str(e)}")
        print(traceback.format_exc())


# ─── Static fallback question pool ────────────────────────────────────────────
_FALLBACK_POOL: Dict[str, list] = {
    "easy": [
        {"question_text": "Solve: 2x + 3 = 7",          "options": ["x = 1", "x = 2", "x = 3", "x = 4"],    "correct_answer": 1, "explanation": "Subtract 3 → 2x = 4, then divide by 2 → x = 2."},
        {"question_text": "If 3x = 12, what is x?",      "options": ["x = 2", "x = 3", "x = 4", "x = 6"],    "correct_answer": 2, "explanation": "Divide both sides by 3 → x = 4."},
        {"question_text": "Solve: x - 5 = 9",             "options": ["x = 4", "x = 14", "x = 45", "x = 13"], "correct_answer": 1, "explanation": "Add 5 to both sides → x = 14."},
        {"question_text": "Solve: x + 8 = 20",            "options": ["x = 12", "x = 28", "x = 10", "x = 14"],"correct_answer": 0, "explanation": "Subtract 8 from both sides → x = 12."},
        {"question_text": "Which value satisfies 5x = 25?","options": ["x = 4", "x = 5", "x = 6", "x = 3"],   "correct_answer": 1, "explanation": "Divide both sides by 5 → x = 5."},
    ],
    "medium": [
        {"question_text": "Solve: 4x - 6 = 10",                                 "options": ["x = 2", "x = 3", "x = 4", "x = 5"], "correct_answer": 2, "explanation": "Add 6 → 4x = 16, divide by 4 → x = 4."},
        {"question_text": "Solve: 5x + 5 = 30",                                 "options": ["x = 3", "x = 4", "x = 5", "x = 6"], "correct_answer": 2, "explanation": "Subtract 5 → 5x = 25, divide by 5 → x = 5."},
        {"question_text": "Solve: 3x - 4 = 11",                                 "options": ["x = 3", "x = 4", "x = 5", "x = 6"], "correct_answer": 2, "explanation": "Add 4 → 3x = 15, divide by 3 → x = 5."},
        {"question_text": "A number tripled minus 2 equals 13. Find the number.","options": ["4", "5", "6", "7"],                 "correct_answer": 1, "explanation": "3x - 2 = 13 → 3x = 15 → x = 5."},
        {"question_text": "Solve: 2x + 7 = 19",                                 "options": ["x = 5", "x = 6", "x = 7", "x = 4"], "correct_answer": 1, "explanation": "Subtract 7 → 2x = 12, divide by 2 → x = 6."},
    ],
    "hard": [
        {"question_text": "Solve: 2(x + 3) = 18",                                                             "options": ["x = 4", "x = 5", "x = 6", "x = 7"],   "correct_answer": 2, "explanation": "Expand → 2x + 6 = 18 → 2x = 12 → x = 6."},
        {"question_text": "Solve: 3(x - 2) = 15",                                                             "options": ["x = 5", "x = 6", "x = 7", "x = 8"],   "correct_answer": 2, "explanation": "Expand → 3x - 6 = 15 → 3x = 21 → x = 7."},
        {"question_text": "Solve: (x + 4) / 2 = 7",                                                           "options": ["x = 6", "x = 8", "x = 10", "x = 14"], "correct_answer": 2, "explanation": "Multiply 2 both sides → x + 4 = 14 → x = 10."},
        {"question_text": "A shop sold 5 more apples than oranges. Total is 25. How many oranges?",            "options": ["7", "8", "10", "12"],                   "correct_answer": 2, "explanation": "x + (x+5) = 25 → 2x = 20 → x = 10 oranges."},
        {"question_text": "Solve: 4(2x - 1) = 28",                                                            "options": ["x = 3", "x = 3.5", "x = 4", "x = 4.5"],"correct_answer": 2, "explanation": "Expand → 8x - 4 = 28 → 8x = 32 → x = 4."},
    ],
}


def generate_question(subject: str, topic: str, grade: int, difficulty: str) -> Dict[str, Any]:
    """
    Ask Groq to generate a unique MCQ for the given params.
    Falls back to _FALLBACK_POOL on any error or if Groq not configured.
    NEVER raises.
    Returns: {question_text, options[4], correct_answer (0-indexed), explanation}
    """
    if _client:
        prompt = (
            f"You are an adaptive quiz engine for school students.\n\n"
            f"Generate ONE multiple-choice question for:\n"
            f"- Subject: {subject}\n"
            f"- Topic: {topic}\n"
            f"- Grade: {grade}\n"
            f"- Difficulty: {difficulty}\n\n"
            f"Rules:\n"
            f"- Do NOT use common textbook examples like '2x+3=7' or '3x=12'.\n"
            f"- Make the question fresh, realistic, and age-appropriate for Grade {grade}.\n"
            f"- Return ONLY valid JSON, no markdown, no preamble.\n\n"
            f"Required JSON format:\n"
            f'{{"question_text":"...","options":["...","...","...","..."],'
            f'"correct_answer":<0-indexed int 0-3>,"explanation":"Brief step-by-step solution"}}'
        )
        try:
            completion = _client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are an exam question generator. Respond with valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.8,
                max_tokens=400,
            )
            raw = completion.choices[0].message.content.strip()
            # Strip markdown fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:].strip()
            q: Dict[str, Any] = json.loads(raw)
            if (
                all(k in q for k in ("question_text", "options", "correct_answer", "explanation"))
                and isinstance(q["options"], list)
                and len(q["options"]) == 4
                and isinstance(q["correct_answer"], int)
            ):
                return q
            print(f"[groq_service] Invalid JSON structure from Groq — falling back")
        except Exception as e:
            print(f"[groq_service] generate_question failed: {e} — falling back to static pool")

    pool = _FALLBACK_POOL.get(difficulty.lower(), _FALLBACK_POOL["easy"])
    return random.choice(pool).copy()


def generate_remedial(topic: str, mastery: float, confusion: float, language: str = "English") -> str:
    """
    Generate remedial explanation for a struggling student via Groq.
    Falls back to static text on any error.
    NEVER raises.
    """
    if _client:
        prompt = (
            f"A student is struggling with: {topic}.\n"
            f"Mastery: {mastery:.0f}%   Confusion: {confusion:.0f}\n"
            f"Language: {language}\n\n"
            f"RULES:\n"
            f"1. You MUST write the ENTIRE response in {language}.\n"
            f"2. Generate a supportive, simple explanation including:\n"
            f"   - Core concept in very simple terms.\n"
            f"   - Step-by-step breakdown with one worked example.\n"
            f"   - Three short practice questions.\n"
            f"   - Motivational encouragement for the student.\n"
            f"3. Keep it school-appropriate for the given language."
        )
        try:
            completion = _client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are an education support assistant."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.4,
                max_tokens=600,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"[groq_service] generate_remedial failed: {e} — falling back")

    return fallback_content(topic, language)


def fallback_content(topic: str, language: str = "English") -> str:
    """Static remedial content used when Groq is unavailable."""
    return (
        f"Topic: {topic}\n"
        f"Language: {language}\n\n"
        f"Simple Explanation:\n"
        f"Break this topic into smaller steps and focus on the core idea first.\n\n"
        f"Step-by-step:\n"
        f"1. Read the question slowly.\n"
        f"2. Identify the key values or concepts.\n"
        f"3. Solve one step at a time.\n\n"
        f"Practice Questions:\n"
        f"1. Solve one basic example of this topic.\n"
        f"2. Try a slightly harder variation.\n"
        f"3. Explain the concept in your own words.\n\n"
        f"Motivation:\n"
        f"Keep practicing. You can improve step by step! 🌟"
    )
