"""
routes/quiz_routes.py — Quiz, Learning, Remedial, AI, SMS, and Demo endpoints.
"""
from fastapi import APIRouter, Response, HTTPException

from models.quiz_models import (
    QuizStartRequest,
    QuizAnswerRequest,
    QuizSubmitRequest,
    TrackBehaviorRequest,
    SimplifyRequest,
    LearningAnswerRequest,
    RemedialContinueRequest,
    GenerateRemedialRequest,
    SMSSendRequest,
    SimulateRiskRequest,
    WebhookAutomateRequest,
)
from services.quiz_service import (
    start_quiz,
    submit_answer,
    get_quiz_summary,
    submit_quiz_full,
)
from services.groq_service import generate_remedial
from services.db import supabase
from utils.response import ok

router = APIRouter(tags=["quiz"])

# ─── Quiz ─────────────────────────────────────────────────────────────────────

@router.post("/start")
def quiz_start(payload: QuizStartRequest):
    return ok(start_quiz(payload))


@router.post("/submit-answer")
def quiz_submit_answer(payload: QuizAnswerRequest):
    return ok(submit_answer(payload))


@router.get("/summary")
def quiz_summary(session_id: str = "quiz-demo-session"):
    return ok(get_quiz_summary(session_id))


@router.get("/next-question")
def quiz_next_question(session_id: str):
    """Return the pre-generated next question for a session (used as fallback by frontend)."""
    from services.quiz_service import QUIZ_SESSION_STORE
    session = QUIZ_SESSION_STORE.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    nq = session.get("next_question")
    if not nq:
        raise HTTPException(status_code=404, detail="No next question available")
    return ok({"next_question": nq, "current_difficulty": session.get("current_difficulty", "easy")})


@router.post("/submit")
def submit_quiz(payload: QuizSubmitRequest):
    return ok(submit_quiz_full(payload.model_dump()))

# ─── Webhook: trigger automation separately ────────────────────────────────────


@router.post("/webhook/automate")
def webhook_automate(payload: WebhookAutomateRequest):
    """
    Manually trigger the post-quiz automation pipeline (Groq + SMS)
    for a given student. Always returns 200 immediately; automation
    runs in a background daemon thread.
    """
    from services.automation_service import trigger_automation_background
    trigger_automation_background(payload.model_dump())
    return ok({
        "status":     "automation_triggered",
        "student_id": payload.student_id,
        "will_generate_remedial": payload.mastery < 60 or payload.confusion > 65,
        "will_send_sms":          payload.confusion > 70 or payload.risk == "High",
    })




# ─── Learning ─────────────────────────────────────────────────────────────────

@router.get("/lesson")
def learning_lesson(subject: str = "Mathematics", topic: str = "Linear Equations", language: str = "English"):
    """
    Fetch a full lesson (explanation + behavior tracking + quick check).
    Now generates real AI content in the requested language.
    """
    from services.learn_service import generate_full_lesson_data
    return ok(generate_full_lesson_data(subject, topic, language))


@router.post("/track-behavior")
def learning_track_behavior(payload: TrackBehaviorRequest):
    delta = 8 if payload.event_type in {"retry", "hint"} else 5 if payload.event_type in {"language_switch", "time_hesitation"} else 2
    return ok({"confusion_score": min(100, 28 + delta)})


@router.post("/simplify")
def learning_simplify(payload: SimplifyRequest):
    """
    Simplify the explanation or provide an example for a topic using AI.
    """
    from services.learn_service import generate_simplified_explanation
    return ok(generate_simplified_explanation(payload.topic, payload.language))


@router.post("/answer")
def learning_answer(payload: LearningAnswerRequest):
    correct = payload.selected == 1
    return ok({
        "correct": correct,
        "explanation": "Subtract the constant and divide by the coefficient." if correct else "Try isolating the variable step by step.",
        "new_confusion_score": 22 if correct else 44,
    })


# ─── Remedial ─────────────────────────────────────────────────────────────────

@router.get("/plan")
def remedial_plan():
    return ok({
        "trigger_reason": "Intervention triggered due to high confusion in Algebra.",
        "trigger_detail": "The system detected repeated retries and hesitation in recent quiz attempts.",
        "current_mastery": "52%",
        "confusion_score": "74",
        "engagement": "61%",
        "risk_level": "Medium",
        "recovery_completion": 40,
        "estimated_time": "25 min",
        "recovery_steps": [
            {"step": 1, "title": "Simplified Explanation", "desc": "Review basics in simple language", "icon_name": "BookOpen", "status": "done"},
            {"step": 2, "title": "Micro Practice Set", "desc": "Practice 5 short questions", "icon_name": "Star", "status": "current"},
            {"step": 3, "title": "Visual Breakdown", "desc": "See equation steps visually", "icon_name": "Eye", "status": "upcoming"},
            {"step": 4, "title": "Confidence Booster Quiz", "desc": "Short quiz to rebuild confidence", "icon_name": "CheckCircle2", "status": "upcoming"},
        ],
        "weak_subtopics": [
            {"name": "Word Problems", "mastery": 42, "practice": True},
            {"name": "Variable Isolation", "mastery": 55, "practice": True},
        ],
        "confidence_before": "38",
        "confidence_current": "56",
        "improvement_data": [
            {"day": "Mon", "confusion": 78, "mastery": 48, "engagement": 52},
            {"day": "Tue", "confusion": 72, "mastery": 50, "engagement": 57},
            {"day": "Wed", "confusion": 67, "mastery": 53, "engagement": 60},
            {"day": "Thu", "confusion": 61, "mastery": 57, "engagement": 63},
        ],
        "intervention_metrics": [
            {"label": "Confusion Reduction", "value": "-17%", "icon_name": "TrendingDown", "color": "text-emerald-600"},
            {"label": "Mastery Gain", "value": "+9%", "icon_name": "TrendingUp", "color": "text-indigo-600"},
            {"label": "Engagement Gain", "value": "+11%", "icon_name": "Activity", "color": "text-teal-600"},
            {"label": "Risk Status", "value": "Improving", "icon_name": "AlertTriangle", "color": "text-amber-600"},
        ],
    })


@router.post("/continue")
def remedial_continue(payload: RemedialContinueRequest):
    return ok({"step": payload.step, "message": "Recovery step advanced (demo stub)"})


# ─── AI ───────────────────────────────────────────────────────────────────────

@router.post("/generate-remedial")
def generate_remedial_content(payload: GenerateRemedialRequest):
    student_id = payload.student_id
    topic = payload.topic
    language = payload.language

    # Check cache
    try:
        existing_query = (
            supabase.table("ai_generated_remedials")
            .select("*")
            .eq("student_id", student_id)
            .eq("topic", topic)
            .eq("language", language)
            .order("created_at", desc=True)
            .limit(1)
        )
        existing = existing_query.execute()
    except Exception:
        existing = (
            supabase.table("ai_generated_remedials")
            .select("*")
            .eq("student_id", student_id)
            .eq("topic", topic)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

    if existing.data:
        return ok({
            "topic": topic,
            "remedial_content": existing.data[0]["content"],
            "source": "cached",
            "language": language,
        })

    content = generate_remedial(topic, payload.mastery, payload.confusion, language)
    try:
        supabase.table("ai_generated_remedials").insert({
            "student_id": student_id,
            "topic": topic,
            "language": language,
            "content": content,
        }).execute()
    except Exception as e:
        print(f"Failed to cache AI remedial in Supabase: {e}")
        # Insert without language column if that failed
        try:
            supabase.table("ai_generated_remedials").insert({
                "student_id": student_id,
                "topic": topic,
                "content": content,
            }).execute()
        except Exception:
            pass # Silent fail for demo purposes

    return ok({"topic": topic, "remedial_content": content, "source": "generated", "language": language})


# ─── SMS ──────────────────────────────────────────────────────────────────────

@router.post("/send")
def sms_send(payload: SMSSendRequest):
    incoming = payload.message.strip().upper()
    if incoming in {"MATH FRACTIONS", "MATH ALGEBRA"}:
        reply = "Lesson loaded. Q1: Solve 3x = 9. Reply A)2 B)3 C)4"
    elif incoming in {"B", "3"}:
        reply = "Correct! Next question: Solve 5x = 20."
    else:
        reply = "Send a topic keyword like MATH FRACTIONS to start a micro-lesson."
    return ok({
        "session_id": payload.session_id or "sms-demo-session",
        "reply": {"sender": "system", "text": reply, "correct": incoming in {"B", "3"}},
    })


# ─── Demo ─────────────────────────────────────────────────────────────────────

@router.post("/simulate-risk")
def simulate_risk_student(payload: SimulateRiskRequest):
    attempts = [
        {"correct_answers": 8, "total_questions": 10, "hesitation_time": 5, "retries": 0, "hints_used": 0, "instability_score": 5, "engagement_score": 80},
        {"correct_answers": 6, "total_questions": 10, "hesitation_time": 10, "retries": 1, "hints_used": 1, "instability_score": 10, "engagement_score": 60},
        {"correct_answers": 4, "total_questions": 10, "hesitation_time": 20, "retries": 2, "hints_used": 2, "instability_score": 20, "engagement_score": 40},
    ]
    results = []
    for attempt in attempts:
        submit_data = {
            "student_id": payload.student_id,
            "parent_phone": payload.parent_phone,
            "language": payload.language,
            **attempt,
        }
        results.append(submit_quiz_full(submit_data))

    return ok({
        "status": "Risk simulation completed",
        "student_id": payload.student_id,
        "attempts_simulated": len(attempts),
        "latest_result": results[-1] if results else None,
    })
