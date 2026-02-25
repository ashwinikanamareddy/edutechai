"""
models/quiz_models.py — Pydantic models for quiz, learning, remedial, and AI endpoints.
"""
from pydantic import BaseModel


# ─── Quiz ─────────────────────────────────────────────────────────────────────

class QuizStartRequest(BaseModel):
    subject: str = "Mathematics"
    topic: str = "Linear Equations"
    grade: int | str | None = None
    student_id: str | None = None


class QuizAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    selected: int = -1
    retries: int = 0
    hints_used: int = 0
    time_spent_ms: int = 0


class QuizSubmitRequest(BaseModel):
    session_id: str | None = None
    student_id: str | None = None
    parent_phone: str | None = None
    language: str | None = "English"
    correct_answers: int = 0
    total_questions: int = 0
    hesitation_time: float = 0.0
    retries: int = 0
    hints_used: int = 0
    instability_score: float = 0.0
    engagement_score: float = 0.0


# ─── Learning ─────────────────────────────────────────────────────────────────

class TrackBehaviorRequest(BaseModel):
    event_type: str = ""
    session_id: str | None = None


class SimplifyRequest(BaseModel):
    topic: str = "this topic"
    language: str = "English"


class LearningAnswerRequest(BaseModel):
    selected: int = -1
    session_id: str | None = None


# ─── Remedial ─────────────────────────────────────────────────────────────────

class RemedialContinueRequest(BaseModel):
    step: int | None = None
    session_id: str | None = None


# ─── AI ───────────────────────────────────────────────────────────────────────

class GenerateRemedialRequest(BaseModel):
    student_id: str | None = None
    topic: str = "Mathematics"
    mastery: float = 50.0
    confusion: float = 50.0
    language: str = "English"


# ─── SMS ──────────────────────────────────────────────────────────────────────

class SMSSendRequest(BaseModel):
    message: str = ""
    session_id: str | None = None


# ─── Teacher / Parent ─────────────────────────────────────────────────────────

class TeacherMessageRequest(BaseModel):
    student_id: str | None = None
    message: str | None = None


class TeacherRemedialRequest(BaseModel):
    student_id: str | None = None
    topic: str | None = None


class ParentNotifyRequest(BaseModel):
    student_id: str | None = None
    parent_phone: str | None = None
    summary: str | None = None


class SimulateRiskRequest(BaseModel):
    student_id: str = "demo-student"
    parent_phone: str | None = None
    language: str = "English"


# ─── Webhook ────────────────────────────────────────────────────────────

class WebhookAutomateRequest(BaseModel):
    student_id:   str | None = None
    parent_phone: str | None = None
    mastery:      float      = 0.0
    confusion:    float      = 0.0
    risk:         str        = "Low"
    language:     str        = "English"
    topic:        str        = "Mathematics"
