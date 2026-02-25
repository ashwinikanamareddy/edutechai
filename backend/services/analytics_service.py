"""
services/analytics_service.py — Business logic for student trend analysis
and teacher risk-student identification.

Key design goals:
- Never raise 500 errors if DB is empty or a column is missing.
- Return safe fallback arrays/values in all edge cases.
- 3-point consecutive decline detection for mastery (risk_alert).
"""
from typing import Any, Dict, List, Optional

from services.db import supabase


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _safe_float(val: Any, default: float = 0.0) -> float:
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


def _safe_str(val: Any, default: str = "Low") -> str:
    return str(val) if val is not None else default


def _detect_decline(mastery_trend: List[float], window: int = 3) -> bool:
    """
    True if the last `window` consecutive mastery values are strictly decreasing.
    Returns False if there are fewer than `window` data points.
    """
    if len(mastery_trend) < window:
        return False
    tail = mastery_trend[-window:]
    return all(tail[i] > tail[i + 1] for i in range(len(tail) - 1))


def _safe_db_query(fn) -> List[Dict[str, Any]]:
    """Execute a lambda that returns a Supabase response; return [] on any error."""
    try:
        result = fn()
        return result.data or []
    except Exception as e:
        print(f"[analytics_service] DB query failed: {e}")
        return []


# ─── Student Trend ─────────────────────────────────────────────────────────────

def get_student_trend(student_id: str) -> Dict[str, Any]:
    """
    Fetch up to 20 quiz_attempts for `student_id` (also tries user_id column),
    compute mastery/confusion/risk trends, and flag 3-point decline.
    Returns safe empty arrays if DB is empty or errors.
    """
    # Primary: look up by student_id
    rows = _safe_db_query(
        lambda: supabase.table("quiz_attempts")
        .select("mastery, confusion, risk, created_at")
        .eq("student_id", student_id)
        .order("created_at", desc=False)
        .limit(20)
        .execute()
    )

    # Fallback: some records may only have user_id set
    if not rows:
        rows = _safe_db_query(
            lambda: supabase.table("quiz_attempts")
            .select("mastery, confusion, risk, created_at")
            .eq("user_id", student_id)
            .order("created_at", desc=False)
            .limit(20)
            .execute()
        )

    mastery_trend  = [_safe_float(r.get("mastery"))   for r in rows]
    confusion_trend = [_safe_float(r.get("confusion")) for r in rows]
    risk_trend      = [_safe_str(r.get("risk"))        for r in rows]

    risk_alert = _detect_decline(mastery_trend, window=3)

    return {
        "attempt_count":    len(rows),
        "mastery_trend":    mastery_trend,
        "confusion_trend":  confusion_trend,
        "risk_trend":       risk_trend,
        "risk_alert":       risk_alert,
    }


# ─── Teacher Risk Students ─────────────────────────────────────────────────────

def _get_student_school(student_id: str) -> Optional[str]:
    """Lookup a student's school_name from the users table; return None on error."""
    rows = _safe_db_query(
        lambda: supabase.table("users")
        .select("school_name")
        .eq("id", student_id)
        .limit(1)
        .execute()
    )
    return rows[0].get("school_name") if rows else None


def get_risk_students(teacher_school: Optional[str] = None) -> Dict[str, Any]:
    """
    Aggregate quiz_attempts by student, optionally filtering to `teacher_school`.
    Returns safe empty result if DB is empty or errors.
    """
    # Fetch all attempts that have a student_id or user_id
    rows = _safe_db_query(
        lambda: supabase.table("quiz_attempts")
        .select("student_id, user_id, mastery, confusion, risk, created_at")
        .order("created_at", desc=False)
        .limit(500)
        .execute()
    )

    # Group by student identity (prefer student_id, fall back to user_id)
    grouped: Dict[str, List[Dict[str, Any]]] = {}
    for row in rows:
        sid = row.get("student_id") or row.get("user_id")
        if not sid:
            continue
        grouped.setdefault(str(sid), []).append(row)

    flagged: List[Dict[str, Any]] = []

    for student_id, attempts in grouped.items():
        # ── School filter ─────────────────────────────────────────────────────
        if teacher_school:
            school = _get_student_school(student_id)
            if school and school != teacher_school:
                # Strict filter: skip students from other schools
                continue
            # If school is None (not found in DB), include the student safely (demo mode)

        # ── Compute trends ────────────────────────────────────────────────────
        mastery_trend   = [_safe_float(a.get("mastery"))   for a in attempts if a.get("mastery")   is not None]
        confusion_trend = [_safe_float(a.get("confusion")) for a in attempts if a.get("confusion") is not None]
        risk_trend      = [_safe_str(a.get("risk"))        for a in attempts]

        latest_mastery   = mastery_trend[-1]   if mastery_trend   else 0.0
        latest_confusion = confusion_trend[-1] if confusion_trend else 0.0
        latest_risk      = risk_trend[-1]      if risk_trend      else "Low"

        risk_alert = _detect_decline(mastery_trend, window=3)

        # ── Triage priority ───────────────────────────────────────────────────
        recommended_action        = None
        parent_notification_req   = False
        teacher_priority          = "Low"

        if risk_alert:
            recommended_action = "Assign remedial practice module"
            teacher_priority   = "High"

        if latest_confusion > 70:
            parent_notification_req = True
            teacher_priority        = "High"

        if latest_risk == "High":
            recommended_action    = "Immediate teacher intervention required"
            parent_notification_req = True
            teacher_priority        = "Critical"

        # ── Only include students who need attention ────────────────────────
        needs_attention = (
            risk_alert
            or latest_confusion > 60
            or latest_risk in {"High", "Medium"}
            or latest_mastery < 55
        )
        if not needs_attention:
            continue

        flagged.append({
            "student_id":                  student_id,
            "attempt_count":               len(attempts),
            "latest_mastery":              latest_mastery,
            "latest_confusion":            latest_confusion,
            "latest_risk":                 latest_risk,
            "risk_alert":                  risk_alert,
            "intervention_required":       bool(risk_alert or latest_risk in {"High", "Medium"} or latest_confusion > 60),
            "recommended_action":          recommended_action,
            "parent_notification_required": parent_notification_req,
            "teacher_priority":            teacher_priority,
            "mastery_trend":               mastery_trend[-5:],
            "confusion_trend":             confusion_trend[-5:],
            "risk_trend":                  risk_trend[-5:],
        })

    # ── Sort by severity ──────────────────────────────────────────────────────
    _pkey = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    _rkey = {"High": 0, "Medium": 1, "Low": 2}
    flagged.sort(key=lambda s: (
        _pkey.get(s["teacher_priority"], 3),
        _rkey.get(s["latest_risk"], 2),
        0 if s["risk_alert"] else 1,
        -(s["latest_confusion"] or 0),
    ))

    return {
        "total_students_with_attempts": len(grouped),
        "flagged_count":                len(flagged),
        "students":                     flagged,
    }
