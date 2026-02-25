"""
routes/analytics_routes.py — Student/teacher/parent dashboard and analytics endpoints.
"""
from fastapi import APIRouter, Header, Response

from core.security import get_optional_auth_user
from models.quiz_models import TeacherMessageRequest, TeacherRemedialRequest, ParentNotifyRequest
from services.analytics_service import get_student_trend, get_risk_students
from services.sms_service import send_parent_sms
from services.db import supabase
from utils.response import ok

router = APIRouter(tags=["analytics"])


# ─── Static Dashboards ─────────────────────────────────────────────────────────

@router.get("/student/dashboard")
def student_dashboard():
    return ok({
        "mastery_score": 75,
        "mastery_trend": "+5%",
        "confusion_score": 30,
        "confusion_label": "Low",
        "engagement_score": 80,
        "engagement_trend": "+3%",
        "risk_indicator": "Low Risk",
        "subjects": [
            {"name": "Math", "mastery": 68, "strength": "Fractions", "weak": "Algebra", "color": "yellow"},
            {"name": "Science", "mastery": 74, "strength": "Plants", "weak": "Electricity", "color": "green"},
            {"name": "English", "mastery": 61, "strength": "Reading", "weak": "Grammar", "color": "yellow"},
        ],
        "confusion_trend": [
            {"day": "Mon", "score": 34}, {"day": "Tue", "score": 31}, {"day": "Wed", "score": 29},
            {"day": "Thu", "score": 33}, {"day": "Fri", "score": 30}, {"day": "Sat", "score": 28}, {"day": "Sun", "score": 30},
        ],
        "engagement_trend_data": [
            {"day": "Mon", "score": 76}, {"day": "Tue", "score": 79}, {"day": "Wed", "score": 74},
            {"day": "Thu", "score": 82}, {"day": "Fri", "score": 80}, {"day": "Sat", "score": 77}, {"day": "Sun", "score": 81},
        ],
        "recommendations": [
            {"text": "Practice Algebra word problems", "type": "warning"},
            {"text": "Complete English grammar quiz", "type": "info"},
            {"text": "Strong in Science! Try advanced challenge", "type": "success"},
        ],
        "topic_heatmap": [
            ["green", "yellow", "red", "green", "green", "yellow", "green", "green"],
            ["yellow", "green", "yellow", "green", "red", "yellow", "green", "green"],
            ["green", "green", "yellow", "red", "yellow", "green", "green", "yellow"],
            ["yellow", "yellow", "green", "green", "green", "yellow", "red", "green"],
        ],
        "avg_session_minutes": 26,
        "sessions_per_week": 6,
        "parent_alerts_active": True,
        "streak_days": 7,
    })


@router.get("/teacher/dashboard")
def teacher_dashboard():
    return ok({
        "avg_mastery": "71%",
        "avg_confusion": "39",
        "avg_engagement": "74%",
        "at_risk_count": 4,
        "alerts_sent": 12,
        "engine_accuracy": "84%",
        "engagement_data": [
            {"week": "W1", "score": 66}, {"week": "W2", "score": 69},
            {"week": "W3", "score": 72}, {"week": "W4", "score": 74},
        ],
        "students": [
            {"name": "Ravi Kumar", "risk": "High", "cause": "High confusion in Algebra", "action": "Assign remedial algebra session", "mastery": 42},
            {"name": "Sita Devi", "risk": "Medium", "cause": "Low engagement trend", "action": "Encourage consistent practice", "mastery": 61},
            {"name": "Arjun", "risk": "Low", "cause": "Stable performance", "action": "Continue regular learning", "mastery": 78},
        ],
        "notification_log": [
            {"student": "Ravi Kumar", "type": "SMS Alert", "date": "2026-02-24", "reason": "High confusion", "status": "Sent"},
            {"student": "Sita Devi", "type": "SMS Alert", "date": "2026-02-23", "reason": "Low engagement", "status": "Sent"},
        ],
        "heatmap_students": ["Ravi", "Sita", "Arjun", "Meena"],
        "heatmap_topics": ["Alg", "Frac", "Geo", "Sci"],
        "mastery_heatmap": [
            ["red", "yellow", "yellow", "green"],
            ["yellow", "green", "yellow", "green"],
            ["green", "green", "green", "yellow"],
            ["yellow", "red", "yellow", "green"],
        ],
        "confusion_heatmap": [
            ["red", "yellow", "yellow", "green"],
            ["yellow", "green", "yellow", "green"],
            ["green", "green", "green", "yellow"],
            ["yellow", "red", "yellow", "green"],
        ],
        "prediction_accuracy": "84%",
        "false_risk_alerts": "6%",
        "missed_weak_topics": "9%",
        "f1_score": "0.82",
    })


@router.get("/parent/dashboard")
def parent_dashboard():
    return ok({
        "child_name": "Ashwini",
        "overall_mastery": "72%",
        "engagement_level": "Good",
        "confusion_level": "Moderate",
        "risk_indicator": "Low",
        "subjects": [
            {"name": "Math", "value": 68, "advice": "Encourage 15 minutes of Algebra practice this week."},
            {"name": "Science", "value": 74, "advice": "Great progress. Keep practicing diagrams."},
            {"name": "English", "value": 61, "advice": "Review grammar exercises together this weekend."},
        ],
        "active_days": "5/7",
        "avg_session": "24 min",
        "incomplete": 2,
        "alerts": [
            {"date": "2026-02-23", "reason": "Low engagement detected in Algebra sessions.", "action": "Encourage short daily practice."},
            {"date": "2026-02-20", "reason": "High confusion in word problems.", "action": "Ask which part feels difficult."},
        ],
        "confusion_percentage": 48,
        "suggestions": [
            "Encourage regular practice",
            "Review weak topics together",
            "Ask what concept feels difficult",
            "Praise improvement",
        ],
        "last_updated": "2026-02-24 10:30 AM",
    })


# ─── Live Analytics ────────────────────────────────────────────────────────────

@router.get("/student/{student_id}/trend")
def get_trend(student_id: str, authorization: str | None = Header(default=None)):
    """
    Return mastery/confusion/risk trends for a student.
    - When the caller is a logged-in student, their own JWT user_id is always used
      (ignores the URL param to prevent data leaks).
    - When called by a teacher, parent, or unauthenticated, the URL param is used.
    Safe fallback: returns empty arrays if no data exists in DB.
    """
    auth_user = get_optional_auth_user(authorization)

    if auth_user and str(auth_user.get("role")) == "student":
        # Enforce: student can only see their own data
        effective_id = str(auth_user.get("id") or student_id)
    else:
        # Teacher / parent / unauthenticated: trust URL param
        effective_id = student_id

    return ok(get_student_trend(effective_id))


@router.get("/teacher/risk-students")
def risk_students(authorization: str | None = Header(default=None)):
    """
    Return flagged at-risk students.
    - When the caller is a logged-in teacher, results are filtered to their
      school_name (from the users table via JWT).
    - Unauthenticated / non-teacher callers see all students (demo mode).
    Safe fallback: returns empty flagged list if no data exists in DB.
    """
    auth_user = get_optional_auth_user(authorization)

    teacher_school: str | None = None
    if auth_user and str(auth_user.get("role")) == "teacher":
        teacher_school = auth_user.get("school_name") or None

    return ok(get_risk_students(teacher_school))


# ─── Teacher Actions ──────────────────────────────────────────────────────────

@router.post("/teacher/send-parent-message")
def teacher_send_parent_message(payload: TeacherMessageRequest):
    return ok({"message": "Parent message sent (demo stub)", "student_id": payload.student_id})


@router.post("/teacher/assign-remedial")
def teacher_assign_remedial(payload: TeacherRemedialRequest):
    return ok({"message": "Remedial assigned (demo stub)", "student_id": payload.student_id, "topic": payload.topic})


@router.get("/teacher/export-report")
def teacher_export_report():
    pdf_bytes = b"%PDF-1.4\n% Demo report\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=class-report.pdf"},
    )


# ─── Parent ───────────────────────────────────────────────────────────────────

@router.post("/parent/notify")
def notify_parent(payload: ParentNotifyRequest):
    message = (
        f"Alert: Your child may need academic support.\n"
        f"Summary: {payload.summary}\nPlease check the learning dashboard."
    )
    status = send_parent_sms(payload.parent_phone, message)
    log_status = "logged"
    try:
        supabase.table("parent_notifications").insert({
            "student_id": payload.student_id,
            "message": message,
            "status": status,
        }).execute()
    except Exception as e:
        print("Parent notification log failed:", e)
        log_status = "failed"

    return ok({"status": status, "log_status": log_status})
