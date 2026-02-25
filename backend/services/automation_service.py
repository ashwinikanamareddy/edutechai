"""
services/automation_service.py — Background automation for post-quiz intelligence.

Design contract:
  - run_post_quiz_automation() is called in a daemon thread AFTER the core
    quiz submit response has already been returned to the client.
  - It NEVER blocks the quiz response.
  - It NEVER raises exceptions that could crash the calling thread.
  - All failures are logged and written to Supabase `automation_logs`.

Automation steps (in order):
  1. Generate AI remedial content via Groq (if mastery < 60 or confusion > 65)
  2. Send parent SMS via Twilio (if confusion > 70 or risk == "High")
  3. Log all outcomes to automation_logs table
"""
import logging
import threading
from datetime import datetime, timezone
from typing import Any, Dict

log = logging.getLogger(__name__)


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _log_automation(payload: Dict[str, Any]) -> None:
    """Persist automation run outcome to Supabase (best-effort)."""
    from services.db import supabase
    try:
        supabase.table("automation_logs").insert(payload).execute()
    except Exception as e:
        log.warning(f"[automation] Failed to log to automation_logs: {e}")


def _generate_remedial(student_id: str, topic: str, mastery: float, confusion: float, language: str) -> Dict[str, str]:
    """Call Groq to generate remedial content. Returns {status, content}."""
    from services.groq_service import generate_remedial
    from services.db import supabase
    try:
        content = generate_remedial(topic=topic, mastery=mastery, confusion=confusion, language=language)
        # Persist to ai_generated_remedials
        try:
            supabase.table("ai_generated_remedials").insert({
                "student_id": student_id,
                "topic": topic,
                "language": language,
                "content": content,
            }).execute()
        except Exception:
            # Try without language field (backward compat)
            try:
                supabase.table("ai_generated_remedials").insert({
                    "student_id": student_id,
                    "topic": topic,
                    "content": content,
                }).execute()
            except Exception as e:
                log.warning(f"[automation] ai_generated_remedials insert failed: {e}")
        log.info(f"[automation] Remedial generated for student {student_id}, topic={topic}")
        return {"status": "generated", "content": content[:200]}
    except Exception as exc:
        log.error(f"[automation] Groq remedial generation failed: {exc}")
        return {"status": "failed", "content": ""}


def _send_sms(parent_phone: str | None, student_id: str, risk: str, mastery: float, confusion: float) -> str:
    """Send parent alert SMS. Returns delivery status string."""
    from services.sms_service import send_parent_sms
    message = (
        f"📚 EduTech Academic Alert\n"
        f"Student ID: {student_id}\n"
        f"Risk Level: {risk}\n"
        f"Mastery: {mastery:.0f}% | Confusion: {confusion:.0f}\n\n"
        f"Please check the EduTech parent dashboard for details and recommended actions."
    )
    status = send_parent_sms(parent_phone, message)
    log.info(f"[automation] SMS status={status} → phone={parent_phone!r}")
    return status


def run_post_quiz_automation(data: Dict[str, Any]) -> None:
    """
    Execute all post-quiz automation steps.
    Called from a daemon thread — NEVER raises, logs all outcomes.
    """
    student_id   = str(data.get("student_id") or "unknown")
    parent_phone = data.get("parent_phone")
    mastery      = float(data.get("mastery") or 0)
    confusion    = float(data.get("confusion") or 0)
    risk         = str(data.get("risk") or "Low")
    language     = str(data.get("language") or "English")
    topic        = str(data.get("topic") or data.get("subject") or "Mathematics")

    log_entry: Dict[str, Any] = {
        "student_id":   student_id,
        "mastery":      mastery,
        "confusion":    confusion,
        "risk":         risk,
        "triggered_at": _utc_now(),
        "remedial_status": "skipped",
        "sms_status":      "skipped",
        "error":           None,
    }

    try:
        # ── Step 1: AI Remedial ────────────────────────────────────────────────
        needs_remedial = mastery < 60 or confusion > 65
        if needs_remedial:
            result = _generate_remedial(student_id, topic, mastery, confusion, language)
            log_entry["remedial_status"] = result["status"]
        else:
            log.info(f"[automation] Remedial skipped — mastery={mastery} confusion={confusion}")

        # ── Step 2: Parent SMS ────────────────────────────────────────────────
        needs_sms = confusion > 70 or risk == "High"
        if needs_sms:
            sms_status = _send_sms(parent_phone, student_id, risk, mastery, confusion)
            log_entry["sms_status"] = sms_status
        else:
            log.info(f"[automation] SMS skipped — risk={risk} confusion={confusion}")

    except Exception as exc:
        log.error(f"[automation] Unexpected error in run_post_quiz_automation: {exc}")
        log_entry["error"] = str(exc)

    _log_automation(log_entry)


def trigger_automation_background(data: Dict[str, Any]) -> None:
    """
    Spin up a daemon thread to run automation so the HTTP response
    is never delayed. The thread is fire-and-forget.
    """
    t = threading.Thread(
        target=run_post_quiz_automation,
        args=(data,),
        daemon=True,
        name=f"quiz-automation-{data.get('student_id','?')}",
    )
    t.start()
    log.info(f"[automation] Background thread started: {t.name}")
