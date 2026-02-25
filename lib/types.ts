// ============================================================
// EduIntellect AI – Shared TypeScript types
// Every API response & request is typed here so the entire
// frontend stays strongly‑typed end‑to‑end.
// ============================================================

/* ---- Auth ------------------------------------------------ */
export interface LoginRequest {
  role: "student" | "teacher" | "parent"
  name?: string
  email?: string
  phone?: string
  password?: string
  grade?: number
  school?: string
  language?: string
  parent_phone?: string
  student_id?: string
}

export interface AuthUser {
  id: string
  role: "student" | "teacher" | "parent"
  name: string
  token: string
  grade?: number
  school?: string
  language?: string
}

/* ---- Student Dashboard ----------------------------------- */
export interface SubjectMastery {
  name: string
  mastery: number
  strength: string
  weak: string
  color: string
}

export interface Recommendation {
  text: string
  type: "warning" | "info" | "success"
}

export interface TrendPoint {
  day: string
  score: number
}

export interface StudentDashboardData {
  mastery_score: number
  mastery_trend: string
  confusion_score: number
  confusion_label: string
  engagement_score: number
  engagement_trend: string
  risk_indicator: string
  subjects: SubjectMastery[]
  confusion_trend: TrendPoint[]
  engagement_trend_data: TrendPoint[]
  recommendations: Recommendation[]
  topic_heatmap: string[][]
  avg_session_minutes: number
  sessions_per_week: number
  parent_alerts_active: boolean
  streak_days: number
}

export interface StudentTrendResponse {
  attempt_count: number
  mastery_trend: number[]
  confusion_trend: number[]
  risk_trend: string[]
  risk_alert: boolean
}

/* ---- Teacher Dashboard ----------------------------------- */
export interface StudentRisk {
  name: string
  risk: "High" | "Medium" | "Low"
  cause: string
  action: string
  mastery: number
}

export interface NotificationLogItem {
  student: string
  type: string
  date: string
  reason: string
  status: string
}

export interface TeacherDashboardData {
  avg_mastery: string
  avg_confusion: string
  avg_engagement: string
  at_risk_count: number
  alerts_sent: number
  engine_accuracy: string
  engagement_data: { week: string; score: number }[]
  students: StudentRisk[]
  notification_log: NotificationLogItem[]
  heatmap_students: string[]
  heatmap_topics: string[]
  mastery_heatmap: string[][]
  confusion_heatmap: string[][]
  prediction_accuracy: string
  false_risk_alerts: string
  missed_weak_topics: string
  f1_score: string
}

export interface TeacherRiskStudentAnalytics {
  student_id: string
  attempt_count: number
  latest_mastery: number | null
  latest_confusion: number
  latest_risk: "Low" | "Medium" | "High" | string
  risk_alert: boolean
  intervention_required: boolean
  recommended_action: string | null
  parent_notification_required: boolean
  teacher_priority: "Low" | "High" | "Critical" | string
  mastery_trend: number[]
  confusion_trend: number[]
  risk_trend: string[]
}

export interface TeacherRiskStudentsResponse {
  total_students_with_attempts: number
  flagged_count: number
  students: TeacherRiskStudentAnalytics[]
}

/* ---- Parent Dashboard ------------------------------------ */
export interface ParentAlert {
  date: string
  reason: string
  action: string
}

export interface SubjectProgress {
  name: string
  value: number
  advice: string
}

export interface ParentDashboardData {
  child_name: string
  overall_mastery: string
  engagement_level: string
  confusion_level: string
  risk_indicator: string
  subjects: SubjectProgress[]
  active_days: string
  avg_session: string
  incomplete: number
  alerts: ParentAlert[]
  confusion_percentage: number
  suggestions: string[]
  last_updated: string
}

/* ---- Learning -------------------------------------------- */
export interface LessonContent {
  subject: string
  topic: string
  grade: number
  explanation_html: string
  steps: string[]
  real_life_example: string
  progress_percent: number
}

export interface BehaviorSignals {
  hesitation: string
  retry_count: number
  hint_usage: number
  language_switches: number
  focus: string
}

export interface LessonQuickCheck {
  question: string
  options: string[]
  correct_index: number
  explanation: string
}

export interface LearningPageData {
  lesson: LessonContent
  behavior: BehaviorSignals
  confusion_score: number
  quick_check: LessonQuickCheck
}

export interface BehaviorEvent {
  event_type: "answer" | "hint" | "retry" | "language_switch" | "simplify" | "time_hesitation"
  value?: string | number
  timestamp?: string
}

/* ---- Quiz ------------------------------------------------ */
export interface QuizQuestion {
  id: string
  q: string
  options: string[]
  correct: number
  explanation: string
  difficulty: string
}

export interface QuizSession {
  session_id: string
  questions: QuizQuestion[]
  subject: string
  topic: string
  max_questions?: number
}

export interface QuizSubmission {
  session_id: string
  question_id: string
  selected: number
  retries: number
  hints_used: number
  time_spent_ms: number
}

export interface QuizSubmissionResult {
  correct: boolean
  explanation: string
  new_confusion_score: number
  next_difficulty?: string
  /** The next adaptively-generated question to show, or null if quiz is complete */
  next_question?: QuizQuestion | null
  questions_answered?: number
  max_questions?: number
}

export interface QuizEngineSubmitPayload {
  session_id?: string | null
  student_id?: string | null
  parent_phone?: string | null
  language?: string
  correct_answers: number
  total_questions: number
  hesitation_time: number
  retries: number
  hints_used: number
  instability_score: number
  engagement_score: number
}

export interface QuizEngineSubmitResponse {
  mastery: number
  confusion: number
  risk: "Low" | "Medium" | "High" | string
  intervention_triggered: boolean
  parent_alert_triggered: boolean
  sms_delivery_status?: "sent" | "failed" | "skipped" | string
}

export interface QuizSummary {
  score: number
  total: number
  mastery_percent: number
  confusion_change: number
  engagement: string
  confidence: string
  risk: string
  strengths: string[]
  weaknesses: string[]
  predicted_mastery: string
  actual_performance: string
  prediction_accuracy: string
  adaptive_status: string
}

/* ---- Remedial -------------------------------------------- */
export interface RecoveryStep {
  step: number
  title: string
  desc: string
  icon_name: string
  status: "done" | "current" | "upcoming"
}

export interface WeakSubtopic {
  name: string
  mastery: number
  practice: boolean
}

export interface InterventionMetric {
  label: string
  value: string
  icon_name: string
  color: string
}

export interface RemedialData {
  trigger_reason: string
  trigger_detail: string
  current_mastery: string
  confusion_score: string
  engagement: string
  risk_level: string
  recovery_completion: number
  estimated_time: string
  recovery_steps: RecoveryStep[]
  weak_subtopics: WeakSubtopic[]
  confidence_before: string
  confidence_current: string
  improvement_data: { day: string; confusion: number; mastery: number; engagement: number }[]
  intervention_metrics: InterventionMetric[]
}

export interface AIGenerateRemedialRequest {
  student_id?: string | null
  topic: string
  mastery: number
  confusion: number
  language?: string
}

export interface AIGenerateRemedialResponse {
  topic: string
  remedial_content: string
  source: "cached" | "generated" | string
  language?: string
}

/* ---- SMS ------------------------------------------------- */
export interface SMSMessage {
  sender: "student" | "system"
  text: string
  correct?: boolean
}

export interface SMSSendRequest {
  message: string
  session_id?: string
}

export interface SMSSendResponse {
  reply: SMSMessage
  session_id: string
}

/* ---- Generic API wrapper --------------------------------- */
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}
