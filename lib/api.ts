import axios, { type AxiosInstance, type AxiosError } from "axios"
import type {
  LoginRequest,
  AuthUser,
  StudentDashboardData,
  StudentTrendResponse,
  TeacherDashboardData,
  TeacherRiskStudentsResponse,
  ParentDashboardData,
  LearningPageData,
  BehaviorEvent,
  QuizSession,
  QuizSubmission,
  QuizSubmissionResult,
  QuizEngineSubmitPayload,
  QuizEngineSubmitResponse,
  QuizSummary,
  RemedialData,
  AIGenerateRemedialRequest,
  AIGenerateRemedialResponse,
  SMSSendRequest,
  SMSSendResponse,
} from "./types"

// ============================================================
// Centralized Axios instance – single source of truth
// ============================================================

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/+$/, "")

function readStoredToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("edu_token") ?? sessionStorage.getItem("edu_token")
}

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 15_000,
    headers: { "Content-Type": "application/json" },
  })

  // Attach token from persistent storage on every request
  client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = readStoredToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  })

  // Normalize API errors
  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError<{ detail?: string; error?: string | null }>) => {
      const isNetworkError = !error.response
      const rawDetail = error.response?.data?.error ?? error.response?.data?.detail
      const detail = typeof rawDetail === "object" ? JSON.stringify(rawDetail) : rawDetail

      const message =
        (isNetworkError
          ? `Cannot connect to backend at ${BASE_URL}. Start FastAPI server or update NEXT_PUBLIC_API_URL in .env.local.`
          : undefined) ??
        detail ??
        error.message ??
        "An unexpected error occurred"
      return Promise.reject(new Error(message))
    }
  )

  return client
}

const api = createClient()

function isBackendConnectionError(error: unknown) {
  return error instanceof Error && error.message.includes("Cannot connect to backend")
}

const demoStudentDashboard: StudentDashboardData = {
  mastery_score: 68,
  mastery_trend: "+4%",
  confusion_score: 45,
  confusion_label: "Moderate",
  engagement_score: 72,
  engagement_trend: "+6%",
  risk_indicator: "Low Risk",
  subjects: [
    { name: "Math", mastery: 68, strength: "Fractions", weak: "Algebra", color: "yellow" },
    { name: "Science", mastery: 74, strength: "Plants", weak: "Electricity", color: "green" },
    { name: "English", mastery: 61, strength: "Reading", weak: "Grammar", color: "yellow" },
  ],
  confusion_trend: [
    { day: "Mon", score: 41 }, { day: "Tue", score: 44 }, { day: "Wed", score: 40 },
    { day: "Thu", score: 46 }, { day: "Fri", score: 48 }, { day: "Sat", score: 45 }, { day: "Sun", score: 43 },
  ],
  engagement_trend_data: [
    { day: "Mon", score: 70 }, { day: "Tue", score: 72 }, { day: "Wed", score: 68 },
    { day: "Thu", score: 73 }, { day: "Fri", score: 75 }, { day: "Sat", score: 71 }, { day: "Sun", score: 72 },
  ],
  recommendations: [
    { text: "Revise Algebra - confusion detected", type: "warning" },
    { text: "Practice Fractions - low mastery", type: "warning" },
    { text: "Strong in Science! Try advanced challenge", type: "success" },
  ],
  topic_heatmap: [
    ["green", "yellow", "red", "green", "green", "yellow", "green", "green"],
    ["yellow", "yellow", "green", "green", "red", "yellow", "green", "green"],
    ["green", "green", "yellow", "red", "yellow", "green", "green", "yellow"],
    ["red", "yellow", "yellow", "green", "green", "yellow", "red", "green"],
  ],
  avg_session_minutes: 23,
  sessions_per_week: 6,
  parent_alerts_active: true,
  streak_days: 7,
}

const demoTeacherDashboard: TeacherDashboardData = {
  avg_mastery: "71%",
  avg_confusion: "39",
  avg_engagement: "74%",
  at_risk_count: 4,
  alerts_sent: 12,
  engine_accuracy: "84%",
  engagement_data: [
    { week: "W1", score: 66 }, { week: "W2", score: 69 }, { week: "W3", score: 72 }, { week: "W4", score: 74 },
  ],
  students: [
    { name: "Ravi Kumar", risk: "High", cause: "High confusion in Algebra", action: "Assign remedial algebra session", mastery: 42 },
    { name: "Sita Devi", risk: "Medium", cause: "Low engagement trend", action: "Encourage consistent practice", mastery: 61 },
    { name: "Arjun", risk: "Low", cause: "Stable performance", action: "Continue regular learning", mastery: 78 },
  ],
  notification_log: [
    { student: "Ravi Kumar", type: "SMS Alert", date: "2026-02-24", reason: "High confusion", status: "Sent" },
    { student: "Sita Devi", type: "SMS Alert", date: "2026-02-23", reason: "Low engagement", status: "Sent" },
  ],
  heatmap_students: ["Ravi", "Sita", "Arjun", "Meena"],
  heatmap_topics: ["Alg", "Frac", "Geo", "Sci"],
  mastery_heatmap: [
    ["red", "yellow", "yellow", "green"],
    ["yellow", "green", "yellow", "green"],
    ["green", "green", "green", "yellow"],
    ["yellow", "red", "yellow", "green"],
  ],
  confusion_heatmap: [
    ["red", "yellow", "yellow", "green"],
    ["yellow", "green", "yellow", "green"],
    ["green", "green", "green", "yellow"],
    ["yellow", "red", "yellow", "green"],
  ],
  prediction_accuracy: "84%",
  false_risk_alerts: "6%",
  missed_weak_topics: "9%",
  f1_score: "0.82",
}

const demoStudentTrend: StudentTrendResponse = {
  attempt_count: 6,
  mastery_trend: [48, 56, 61, 58, 66, 72],
  confusion_trend: [72, 64, 55, 60, 49, 42],
  risk_trend: ["High", "Medium", "Medium", "Medium", "Low", "Low"],
  risk_alert: false,
}

const demoLessonData: LearningPageData = {
  lesson: {
    subject: "Mathematics",
    topic: "Linear Equations",
    grade: 8,
    explanation_html: `
      <h3>What is a Linear Equation?</h3>
      <p>A <strong>linear equation</strong> is a math statement that shows two expressions are equal, and the variable appears to the power of 1.</p>
      <p><strong>Example:</strong> <code>2x + 3 = 7</code></p>
      <p>To solve, we isolate the variable <strong>x</strong> step by step:</p>
      <ol>
        <li>Subtract 3 from both sides: <code>2x = 4</code></li>
        <li>Divide both sides by 2: <code>x = 2</code></li>
      </ol>
      <p><strong>Real-life example:</strong> If 2 notebooks cost ₹40, then 1 notebook costs ₹20. This is solving: <code>2x = 40 → x = 20</code></p>
    `,
    steps: [
      "Identify the variable (usually x) that you need to find.",
      "Move all numbers (constants) to one side of the equation.",
      "Simplify both sides as much as possible.",
      "Divide both sides by the coefficient of the variable.",
      "Verify your answer by substituting back into the original equation.",
    ],
    real_life_example: "If 2 notebooks cost ₹40, one notebook costs ₹20. Equation: 2x = 40, so x = 20.",
    progress_percent: 45,
  },
  behavior: {
    hesitation: "Low",
    retry_count: 0,
    hint_usage: 0,
    language_switches: 0,
    focus: "Good",
  },
  confusion_score: 28,
  quick_check: {
    question: "Solve: 2x + 4 = 10",
    options: ["x = 2", "x = 3", "x = 4", "x = 5"],
    correct_index: 1,
    explanation: "Subtract 4 from both sides: 2x = 6. Then divide by 2: x = 3.",
  },
}

const demoTeacherRiskStudents: TeacherRiskStudentsResponse = {
  total_students_with_attempts: 4,
  flagged_count: 2,
  students: [
    {
      student_id: "stu-001",
      attempt_count: 5,
      latest_mastery: 46,
      latest_confusion: 78,
      latest_risk: "High",
      risk_alert: true,
      intervention_required: true,
      recommended_action: "Immediate teacher intervention required",
      parent_notification_required: true,
      teacher_priority: "Critical",
      mastery_trend: [68, 61, 55, 50, 46],
      confusion_trend: [42, 51, 60, 69, 78],
      risk_trend: ["Medium", "Medium", "Medium", "High", "High"],
    },
    {
      student_id: "stu-002",
      attempt_count: 4,
      latest_mastery: 59,
      latest_confusion: 63,
      latest_risk: "Medium",
      risk_alert: false,
      intervention_required: true,
      recommended_action: "Assign remedial practice module",
      parent_notification_required: false,
      teacher_priority: "High",
      mastery_trend: [64, 62, 60, 59],
      confusion_trend: [52, 57, 61, 63],
      risk_trend: ["Medium", "Medium", "Medium", "Medium"],
    },
  ],
}

const demoParentDashboard: ParentDashboardData = {
  child_name: "Ashwini",
  overall_mastery: "72%",
  engagement_level: "Good",
  confusion_level: "Moderate",
  risk_indicator: "Low",
  subjects: [
    { name: "Math", value: 68, advice: "Encourage 15 minutes of Algebra practice this week." },
    { name: "Science", value: 74, advice: "Great progress. Keep practicing diagrams." },
    { name: "English", value: 61, advice: "Review grammar exercises together this weekend." },
  ],
  active_days: "5/7",
  avg_session: "24 min",
  incomplete: 2,
  alerts: [
    { date: "2026-02-23", reason: "Low engagement detected in Algebra sessions.", action: "Encourage short daily practice." },
    { date: "2026-02-20", reason: "High confusion in word problems.", action: "Ask child which part feels difficult." },
  ],
  confusion_percentage: 48,
  suggestions: [
    "Encourage regular practice",
    "Review weak topics together",
    "Ask what concept feels difficult",
    "Praise improvement",
  ],
  last_updated: "2026-02-24 10:30 AM",
}

function createDemoQuizSession(subject: string, topic: string): QuizSession {
  return {
    session_id: `demo-session-${Date.now()}`,
    subject,
    topic,
    questions: [
      {
        id: "demo-q1",
        q: "Solve: 2x + 3 = 7",
        options: ["x = 1", "x = 2", "x = 3", "x = 4"],
        correct: 1,
        explanation: "Subtract 3 from both sides to get 2x = 4, then divide by 2.",
        difficulty: "easy",
      },
      {
        id: "demo-q2",
        q: "If 3x = 12, what is x?",
        options: ["2", "3", "4", "6"],
        correct: 2,
        explanation: "Divide both sides by 3. x = 12 ÷ 3 = 4.",
        difficulty: "easy",
      },
      {
        id: "demo-q3",
        q: "Solve: x - 5 = 9",
        options: ["4", "14", "15", "45"],
        correct: 1,
        explanation: "Add 5 to both sides. x = 14.",
        difficulty: "medium",
      },
      {
        id: "demo-q4",
        q: "Which value satisfies 4x = 20?",
        options: ["4", "5", "6", "8"],
        correct: 1,
        explanation: "Divide 20 by 4. x = 5.",
        difficulty: "medium",
      },
      {
        id: "demo-q5",
        q: "A number increased by 6 is 15. What is the number?",
        options: ["7", "8", "9", "10"],
        correct: 2,
        explanation: "Let x + 6 = 15. Subtract 6 from both sides to get x = 9.",
        difficulty: "hard",
      },
    ],
  }
}

// ============================================================
// Auth – Backend returns {success, data, error} envelope
// ============================================================

type ApiEnvelope<T> = { success: boolean; data: T; error: string | null }

export async function login(payload: LoginRequest): Promise<AuthUser> {
  const res = await api.post<ApiEnvelope<AuthUser>>("/auth/login", payload)
  const user = res.data.data
  if (typeof window !== "undefined" && user?.token) {
    localStorage.setItem("edu_token", user.token)
    localStorage.setItem("edu_user", JSON.stringify(user))
    sessionStorage.setItem("edu_token", user.token)
    sessionStorage.setItem("edu_user", JSON.stringify(user))
  }
  return user
}

export async function register(payload: LoginRequest): Promise<AuthUser> {
  const res = await api.post<ApiEnvelope<AuthUser>>("/auth/register", payload)
  const user = res.data.data
  if (typeof window !== "undefined" && user?.token) {
    localStorage.setItem("edu_token", user.token)
    localStorage.setItem("edu_user", JSON.stringify(user))
    sessionStorage.setItem("edu_token", user.token)
    sessionStorage.setItem("edu_user", JSON.stringify(user))
  }
  return user
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("edu_token")
    localStorage.removeItem("edu_user")
    sessionStorage.removeItem("edu_token")
    sessionStorage.removeItem("edu_user")
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("edu_user") ?? sessionStorage.getItem("edu_user")
  return raw ? (JSON.parse(raw) as AuthUser) : null
}

export function persistAuthUser(user: AuthUser) {
  if (typeof window === "undefined") return
  if (user.token) {
    localStorage.setItem("edu_token", user.token)
    sessionStorage.setItem("edu_token", user.token)
  }
  localStorage.setItem("edu_user", JSON.stringify(user))
  sessionStorage.setItem("edu_user", JSON.stringify(user))
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await api.get<ApiEnvelope<Omit<AuthUser, "token"> & { token?: string | null }>>("/auth/me")
  const raw = res.data.data
  const token = readStoredToken() ?? ""
  const normalized: AuthUser = {
    ...raw,
    token: raw?.token ?? token,
  }
  if (typeof window !== "undefined") {
    persistAuthUser(normalized)
  }
  return normalized
}

// ============================================================
// Student Dashboard
// ============================================================
export async function fetchStudentDashboard(): Promise<StudentDashboardData> {
  try {
    const res = await api.get<ApiEnvelope<StudentDashboardData>>("/student/dashboard")
    return res.data.data ?? demoStudentDashboard
  } catch (error) {
    return demoStudentDashboard
  }
}

export async function fetchStudentTrend(student_id: string): Promise<StudentTrendResponse> {
  try {
    const res = await api.get<ApiEnvelope<StudentTrendResponse>>(`/student/${student_id}/trend`)
    return res.data.data ?? demoStudentTrend
  } catch (error) {
    return demoStudentTrend
  }
}

// ============================================================
// Teacher Dashboard
// ============================================================
export async function fetchTeacherDashboard(): Promise<TeacherDashboardData> {
  try {
    const res = await api.get<ApiEnvelope<TeacherDashboardData>>("/teacher/dashboard")
    return res.data.data ?? demoTeacherDashboard
  } catch (error) {
    return demoTeacherDashboard
  }
}

export async function fetchTeacherRiskStudents(): Promise<TeacherRiskStudentsResponse> {
  try {
    const res = await api.get<ApiEnvelope<TeacherRiskStudentsResponse>>("/teacher/risk-students")
    return res.data.data ?? demoTeacherRiskStudents
  } catch (error) {
    return demoTeacherRiskStudents
  }
}

export async function sendParentMessage(payload: { student_id: string; message: string }): Promise<void> {
  await api.post("/teacher/send-parent-message", payload)
}

export async function assignRemedialTopic(payload: { student_id: string; topic: string }): Promise<void> {
  await api.post("/teacher/assign-remedial", payload)
}

export async function exportClassReport(): Promise<Blob> {
  const { data } = await api.get("/teacher/export-report", { responseType: "blob" })
  return data as unknown as Blob
}

export async function simulateRiskStudent(payload?: { student_id?: string; parent_phone?: string; language?: string }): Promise<{ status: string }> {
  const { data } = await api.post<{ status: string }>("/demo/simulate-risk", payload ?? {})
  return data
}

// ============================================================
// Parent Dashboard
// ============================================================
export async function fetchParentDashboard(): Promise<ParentDashboardData> {
  try {
    const res = await api.get<ApiEnvelope<ParentDashboardData>>("/parent/dashboard")
    return res.data.data ?? demoParentDashboard
  } catch (error) {
    return demoParentDashboard
  }
}

// ============================================================
// Learning / Lesson
// ============================================================
export async function fetchLesson(subject: string, topic: string, language: string = "English"): Promise<LearningPageData> {
  try {
    const res = await api.get<ApiEnvelope<LearningPageData>>("/learning/lesson", { params: { subject, topic, language } })
    return res.data.data ?? demoLessonData
  } catch (error) {
    return demoLessonData
  }
}

export async function trackBehavior(event: BehaviorEvent): Promise<{ confusion_score: number }> {
  try {
    const res = await api.post<ApiEnvelope<{ confusion_score: number }>>("/learning/track-behavior", event)
    return res.data.data ?? { confusion_score: 30 }
  } catch {
    return { confusion_score: 30 }
  }
}

export async function requestSimplified(topic: string, language: string = "English"): Promise<{ explanation_html: string }> {
  try {
    const res = await api.post<ApiEnvelope<{ explanation_html: string }>>("/learning/simplify", { topic, language })
    return res.data.data ?? { explanation_html: `<p>Simple explanation for <strong>${topic}</strong>: solve one step at a time.</p>` }
  } catch {
    return { explanation_html: `<p>Simple explanation for <strong>${topic}</strong>: solve one step at a time.</p>` }
  }
}

export async function submitLessonAnswer(payload: {
  question_id?: string
  selected: number
}): Promise<{ correct: boolean; explanation: string; new_confusion_score: number }> {
  try {
    const res = await api.post<ApiEnvelope<{ correct: boolean; explanation: string; new_confusion_score: number }>>("/learning/answer", payload)
    return res.data.data ?? { correct: false, explanation: "Try isolating the variable step by step.", new_confusion_score: 35 }
  } catch {
    return { correct: false, explanation: "Try isolating the variable step by step.", new_confusion_score: 35 }
  }
}

// ============================================================
// Quiz
// ============================================================
export async function startQuiz(
  subject: string,
  topic: string,
  opts?: { grade?: number; student_id?: string | null }
): Promise<QuizSession> {
  try {
    const res = await api.post<ApiEnvelope<QuizSession>>("/quiz/start", { subject, topic, ...opts })
    const session = res.data.data
    if (!session?.questions?.length) {
      return createDemoQuizSession(subject, topic)
    }
    return session
  } catch (error) {
    if (isBackendConnectionError(error)) return createDemoQuizSession(subject, topic)
    throw error
  }
}

export async function submitQuizAnswer(payload: QuizSubmission): Promise<QuizSubmissionResult> {
  const res = await api.post<ApiEnvelope<QuizSubmissionResult>>("/quiz/submit-answer", payload)
  return res.data.data
}

export async function submitQuizToEngine(payload: QuizEngineSubmitPayload): Promise<QuizEngineSubmitResponse> {
  const res = await api.post<ApiEnvelope<QuizEngineSubmitResponse>>("/quiz/submit", payload)
  return res.data.data
}

export async function getQuizSummary(session_id: string): Promise<QuizSummary> {
  const res = await api.get<ApiEnvelope<QuizSummary>>("/quiz/summary", { params: { session_id } })
  return res.data.data
}

// ============================================================
// Remedial / Recovery
// ============================================================
const demoRemedialData: RemedialData = {
  trigger_reason: "Intervention triggered due to high confusion in Algebra.",
  trigger_detail: "The system detected repeated retries and hesitation in recent quiz attempts.",
  current_mastery: "52%",
  confusion_score: "74",
  engagement: "61%",
  risk_level: "Medium",
  recovery_completion: 40,
  estimated_time: "25 min",
  recovery_steps: [
    { step: 1, title: "Simplified Explanation", desc: "Review basics in simple language", icon_name: "BookOpen", status: "done" },
    { step: 2, title: "Micro Practice Set", desc: "Practice 5 short questions", icon_name: "Star", status: "current" },
    { step: 3, title: "Visual Breakdown", desc: "See equation steps visually", icon_name: "Eye", status: "upcoming" },
    { step: 4, title: "Confidence Booster Quiz", desc: "Short quiz to rebuild confidence", icon_name: "CheckCircle2", status: "upcoming" },
  ],
  weak_subtopics: [
    { name: "Word Problems", mastery: 42, practice: true },
    { name: "Variable Isolation", mastery: 55, practice: true },
  ],
  confidence_before: "38",
  confidence_current: "56",
  improvement_data: [
    { day: "Mon", confusion: 78, mastery: 48, engagement: 52 },
    { day: "Tue", confusion: 72, mastery: 50, engagement: 57 },
    { day: "Wed", confusion: 67, mastery: 53, engagement: 60 },
    { day: "Thu", confusion: 61, mastery: 57, engagement: 63 },
  ],
  intervention_metrics: [
    { label: "Confusion Reduction", value: "-17%", icon_name: "TrendingDown", color: "text-emerald-600" },
    { label: "Mastery Gain", value: "+9%", icon_name: "TrendingUp", color: "text-indigo-600" },
    { label: "Engagement Gain", value: "+11%", icon_name: "Activity", color: "text-teal-600" },
    { label: "Risk Status", value: "Improving", icon_name: "AlertTriangle", color: "text-amber-600" },
  ],
}

export async function fetchRemedialData(): Promise<RemedialData> {
  try {
    const res = await api.get<ApiEnvelope<RemedialData>>("/remedial/plan")
    return res.data.data ?? demoRemedialData
  } catch (error) {
    return demoRemedialData
  }
}

export async function continueRecoveryStep(step: number): Promise<void> {
  try {
    await api.post("/remedial/continue", { step })
  } catch (error) {
    if (isBackendConnectionError(error)) return
    throw error
  }
}

export async function generateRemedialContent(payload: AIGenerateRemedialRequest): Promise<AIGenerateRemedialResponse> {
  try {
    const { data } = await api.post<AIGenerateRemedialResponse>("/ai/generate-remedial", payload)
    return data
  } catch (error) {
    // Demo fallback for all errors
    const lang = payload.language?.toLowerCase() ?? "english"
    let content = ""
    if (lang === "hindi") {
      content = `विषय: ${payload.topic}\nभाषा: हिंदी\n\nसरल व्याख्या:\nइस विषय को छोटे-छोटे चरणों में विभाजित करके आधारभूत अवधारणा पर ध्यान दें।\n\nचरण-दर-चरण:\n1. प्रश्न को धीरे-धीरे पढ़ें।\n2. मुख्य मूल्यों या अवधारणाओं को पहचानें।\n3. एक समय में एक कदम हल करें।\n\nअभ्यास प्रश्न:\n1. इस विषय का एक बुनियादी उदाहरण हल करें।\n2. थोड़ा कठिन परिवर्तन आजमाएं।\n3. अवधारणा को अपने शब्दों में समझाएं।\n\nप्रेरणा:\nअभ्यास करते रहें। आप कदम दर कदम सुधार कर सकते हैं! 🌟`
    } else if (lang === "telugu") {
      content = `అంశం: ${payload.topic}\nభాష: తెలుగు\n\nసరళమైన వివరణ:\nఈ అంశాన్ని చిన్న చిన్న దశలుగా విభజించి, ముందుగా ప్రధాన భావనపై దృష్టి పెట్టండి.\n\nదశలవారీగా:\n1. ప్రశ్నను నెమ్మదిగా చదవండి।\n2. కీలక విలువలు లేదా భావనలను గుర్తించండి।\n3. ఒకేసారి ఒక దశను పరిష్కరించండి।\n\nఅభ్యాస ప్రశ్నలు:\n1. ఈ అంశానికి సంబంధించిన ఒక ప్రాథమిక ఉదాహరణను పరిష్కరించండి।\n2. కొంచెం కష్టమైన వైవిధ్యాన్ని ప్రయత్నించండి।\n3. మీ స్వంత మాటలలో భావనను వివరించండి।\n\nప్రేరణ:\nఅభ్యాసం చేస్తూనే ఉండండి। మీరు దశలవారీగా మెరుగుపడవచ్చు! 🌟`
    } else {
      content = `Topic: ${payload.topic}\nLanguage: ${payload.language ?? "English"}\n\nSimple Explanation:\nBreak this topic into smaller steps and focus on the core idea first.\n\nStep-by-step:\n1. Read the problem slowly.\n2. Identify the key values or concepts.\n3. Solve one step at a time.\n\nPractice Questions:\n1. Solve one basic example of this topic.\n2. Try a slightly harder variation.\n3. Explain the concept in your own words.\n\nMotivation:\nKeep practicing. You can improve step by step! 🌟`
    }
    return {
      topic: payload.topic,
      remedial_content: content.trim(),
      source: "frontend-fallback",
      language: payload.language ?? "English",
    }
  }
}

// ============================================================
// SMS
// ============================================================
export async function sendSMS(payload: SMSSendRequest): Promise<SMSSendResponse> {
  const { data } = await api.post<SMSSendResponse>("/sms/send", payload)
  return data
}

// Export the raw axios instance for edge cases
export { api }
