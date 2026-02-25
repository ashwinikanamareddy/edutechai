"""
services/learn_service.py — AI logic for generating topic explanations and storyboards.
"""
import json
import logging
from typing import Dict, Any, List
from services.groq_service import _client as groq_client
from models.learn_models import LearnTopicResponse, StoryboardResponse, FullLessonResponse, LessonData, BehaviorData, LearningQuickCheck

logger = logging.getLogger(__name__)

def generate_full_lesson_data(subject: str, topic: str, language: str) -> Dict[str, Any]:
    """
    Generate a complete lesson object including explanation, steps, and quick check MCQ.
    """
    if not groq_client:
        return {
            "lesson": {
                "subject": subject, "topic": topic, "grade": 8,
                "explanation_html": f"<h3>{topic}</h3><p>Explanation is currently limited as AI client is not configured.</p>",
                "steps": ["Step 1", "Step 2", "Step 3"],
                "real_life_example": "Example details...",
                "progress_percent": 10
            },
            "behavior": {"hesitation": "Low", "retry_count": 0, "hint_usage": 0, "language_switches": 0, "focus": "Good"},
            "confusion_score": 15,
            "quick_check": {
                "question": f"Self-check question for {topic}",
                "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "Explanation..."
            }
        }

    system_prompt = (
        "You are an expert multilingual educational AI tutor.\n"
        f"Language: {language}\n"
        "Rules:\n"
        "- Generate a comprehensive but easy-to-understand lesson for a Grade 8 student.\n"
        "- Respond ENTIRELY in the selected language.\n"
        "- Use proper HTML tags (h3, p, strong, code) for explanation_html.\n"
        "- Return ONLY valid JSON."
    )

    user_prompt = (
        f"Generate a full lesson for Subject: {subject}, Topic: {topic}.\n\n"
        "Required JSON format:\n"
        "{\n"
        '  "lesson": {\n'
        '    "explanation_html": "Detailed explanation with h3, p, strong tags...",\n'
        '    "steps": ["step 1", "step 2", "step 3", "step 4", "step 5"],\n'
        '    "real_life_example": "A concrete real-world application..."\n'
        '  },\n'
        '  "quick_check": {\n'
        '    "question": "A concept check MCQ question...",\n'
        '    "options": ["option 1", "option 2", "option 3", "option 4"],\n'
        '    "correct_index": 0,\n'
        '    "explanation": "Why the correct answer is right..."\n'
        '  }\n'
        "}"
    )

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.6,
            response_format={"type": "json_object"}
        )
        ai_data = json.loads(completion.choices[0].message.content)
        
        return {
            "lesson": {
                "subject": subject,
                "topic": topic,
                "grade": 8,
                "progress_percent": 45,
                **ai_data.get("lesson", {})
            },
            "behavior": {
                "hesitation": "Low",
                "retry_count": 0,
                "hint_usage": 0,
                "language_switches": 1 if language != "English" else 0,
                "focus": "Good"
            },
            "confusion_score": 28,
            "quick_check": ai_data.get("quick_check", {})
        }
    except Exception as e:
        logger.error(f"Error generating full lesson: {e}")
        return {
            "lesson": {"subject": subject, "topic": topic, "grade": 8, "explanation_html": f"Error: {e}", "steps": [], "real_life_example": "", "progress_percent": 0},
            "behavior": {"hesitation": "N/A", "retry_count": 0, "hint_usage": 0, "language_switches": 0, "focus": "None"},
            "confusion_score": 0,
            "quick_check": {"question": "Error", "options": ["-", "-", "-", "-"], "correct_index": 0, "explanation": ""}
        }

def generate_simplified_explanation(topic: str, language: str) -> Dict[str, str]:
    """
    Generate a simpler version or an example for a topic.
    """
    if not groq_client:
        return {"explanation_html": f"<p>AI Simplified: {topic} is about solving things step-by-step.</p>"}

    system_prompt = (
        "You are a helpful educational AI.\n"
        f"Language: {language}\n"
        "Explain the topic in EXTREMELY simple terms (ELI5 style) or with a vivid real-life example.\n"
        "Respond ENTIRELY in the selected language.\n"
        "Use HTML tags like p, strong."
    )

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Simplify this topic or provide a clear example: {topic}"},
            ],
            temperature=0.8,
            max_tokens=400
        )
        content = completion.choices[0].message.content
        return {"explanation_html": content}
    except Exception as e:
        logger.error(f"Error simplifying explanation: {e}")
        return {"explanation_html": "<p>Sorry, I couldn't simplify this right now.</p>"}

def generate_topic_explanation(topic: str, language: str) -> LearnTopicResponse:
    """
    Generate a structured explanation for a topic using Groq.
    """
    if not groq_client:
        return LearnTopicResponse(
            explanation="Groq AI is not configured.",
            example="Social media platforms for communication.",
            key_points=["Connects people", "Content sharing", "Real-time updates", "Digital footprint", "Privacy settings"],
            summary="Groq client is unavailable."
        )

    system_prompt = (
        "You are a multilingual educational tutor.\n"
        f"Language: {language}\n"
        "Rules:\n"
        "- Explain clearly and supporting school students.\n"
        "- Respond ENTIRELY in the selected language.\n"
        "- Return ONLY valid JSON."
    )

    user_prompt = (
        f"Explain the topic: {topic}\n\n"
        "Return JSON with exactly these keys:\n"
        "{\n"
        '  "explanation": "Simple explanation of the concept...",\n'
        '  "example": "A real-life example...",\n'
        '  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],\n'
        '  "summary": "Short 1-sentence summary"\n'
        "}"
    )

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        data = json.loads(completion.choices[0].message.content)
        return LearnTopicResponse(**data)
    except Exception as e:
        logger.error(f"Error generating topic explanation: {e}")
        return LearnTopicResponse(
            explanation=f"Sorry, I couldn't generate an explanation for '{topic}' right now.",
            example="Please try again later.",
            key_points=["Error occurred during generation"],
            summary="Connection error."
        )

def generate_storyboard(topic: str, language: str) -> StoryboardResponse:
    """
    Generate a 5-scene storyboard for an animated explanation.
    """
    if not groq_client:
        return StoryboardResponse(
            scene_1="Groq not configured.",
            scene_2="-", scene_3="-", scene_4="-", scene_5="-"
        )

    system_prompt = (
        "You are an educational animator.\n"
        f"Language: {language}\n"
        "Convert the explanation into 5 short animated teaching scenes.\n"
        "Respond ENTIRELY in the selected language.\n"
        "Return ONLY valid JSON."
    )

    user_prompt = (
        f"Topic: {topic}\n\n"
        "Generate 5 scenes for an animation.\n"
        "Return JSON with keys: scene_1, scene_2, scene_3, scene_4, scene_5"
    )

    try:
        completion = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        data = json.loads(completion.choices[0].message.content)
        return StoryboardResponse(**data)
    except Exception as e:
        logger.error(f"Error generating storyboard: {e}")
        return StoryboardResponse(
            scene_1="Failed to generate storyboard.",
            scene_2="-", scene_3="-", scene_4="-", scene_5="-"
        )
