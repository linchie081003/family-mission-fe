import { getStoredToken } from './lib/authStorage'
import { apiUrl } from './lib/apiBase'
import { trackRequestEnd, trackRequestStart } from './lib/loadingTracker'

type UnauthorizedHandler = (() => void) | null
let unauthorizedHandler: UnauthorizedHandler = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler
}

interface RequestOptions extends RequestInit {
  logoutOn401?: boolean
  silent?: boolean
}

function formatApiErrorDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map(item => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'msg' in item) {
          const loc = 'loc' in item && Array.isArray(item.loc) ? item.loc.filter((p: unknown) => p !== 'body').join('.') : ''
          const msg = String((item as { msg: unknown }).msg)
          return loc ? `${loc}: ${msg}` : msg
        }
        return 'Validasi gagal'
      })
      .join(', ')
  }
  if (detail && typeof detail === 'object' && 'msg' in detail) {
    return String((detail as { msg: unknown }).msg)
  }
  return 'Request failed'
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { logoutOn401 = false, silent = false, ...fetchOptions } = options
  const method = (fetchOptions.method || 'GET').toUpperCase()
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  if (!silent) trackRequestStart(method)
  try {
    const res = await fetch(apiUrl(path), { ...fetchOptions, headers })
    if (!res.ok) {
      if (res.status === 401 && logoutOn401 && unauthorizedHandler) {
        unauthorizedHandler()
      }
      const err = await res.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(formatApiErrorDetail(err.detail))
    }
    if (res.status === 204) return undefined as T
    return res.json()
  } finally {
    if (!silent) trackRequestEnd(method)
  }
}

export const api = {
  // Auth
  register: (data: {
    email: string
    password: string
    confirm_password: string
    family_name: string
    name: string
    role: 'father' | 'mother'
    referral_code?: string
    accept_terms: boolean
    accept_privacy: boolean
    accept_parental_consent: boolean
    accept_child_data_protection: boolean
  }) =>
    request<{ status: string; message: string; family_id: number }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; role: string; family_id: number; parent_id?: number }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  verifyEmail: (token: string) =>
    request<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`),
  resendVerification: (data: { email: string }) =>
    request<{ message: string }>('/auth/resend-verification', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data: { email: string }) =>
    request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data: { token: string; new_password: string; confirm_password: string }) =>
    request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  getPrivacy: () => request<{ version: string; title: string; content: string }>('/legal/privacy'),
  getTerms: () => request<{ version: string; title: string; content: string }>('/legal/terms'),
  listParents: () => request<{ id: number; email: string; name: string; role: string; is_primary: boolean; email_verified: boolean }[]>('/parents'),
  inviteParent: (data: { email: string; name: string; role: 'father' | 'mother' }) =>
    request<{ message: string; email_sent: boolean }>('/parents/invite', { method: 'POST', body: JSON.stringify(data) }),
  listPendingParentInvites: () =>
    request<{ id: number; email: string; name: string; role: string; expires_at: string; expired: boolean }[]>('/parents/invites/pending'),
  resendParentInvite: (inviteId: number) =>
    request<{ message: string; email_sent: boolean }>(`/parents/invites/${inviteId}/resend`, { method: 'POST' }),
  acceptParentInvite: (data: { token: string; password: string; confirm_password: string }) =>
    request<{ message: string }>('/parents/accept-invite', { method: 'POST', body: JSON.stringify(data) }),
  removeParent: (id: number) => request<{ message: string }>(`/parents/${id}`, { method: 'DELETE' }),
  referralStats: () => request<{ referral_code: string; invites_sent: number; families_joined: number }>('/referrals/stats'),
  referralInvite: (data: { email: string }) =>
    request<{ message: string }>('/referrals/invite', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<import('./types').Family>('/auth/me', { logoutOn401: true }),
  childMe: () => request<{ id: number; name: string; family_id: number }>('/child-auth/me', { logoutOn401: true }),

  // Child auth
  getChildrenByCode: (code: string) =>
    request<{ id: number; name: string; color: string; has_pin: boolean }[]>(`/child-auth/family/${code}/children`),
  childLogin: (data: { family_code: string; child_id: number; pin: string }) =>
    request<{ access_token: string; role: string; family_id: number; child_id: number }>('/child-auth/login', { method: 'POST', body: JSON.stringify(data) }),
  firstTimeSetup: (data: { family_code: string; child_id: number; pin: string }) =>
    request<{ access_token: string; role: string; family_id: number; child_id: number }>('/child-auth/first-time-setup', { method: 'POST', body: JSON.stringify(data) }),
  setupPin: (pin: string) =>
    request('/child-auth/setup-pin', { method: 'POST', body: JSON.stringify({ pin }) }),
  changePin: (pin: string, current_pin: string) =>
    request('/child-auth/change-pin', { method: 'POST', body: JSON.stringify({ pin, current_pin }) }),
  resetPin: (childId: number) =>
    request(`/child-auth/${childId}/reset-pin`, { method: 'POST' }),

  // Children
  getChildren: () => request<import('./types').Child[]>('/children'),
  createChild: (data: { name: string; color: string; weekly_target: number }) =>
    request('/children', { method: 'POST', body: JSON.stringify(data) }),
  updateChild: (id: number, data: Partial<{ name: string; display_name: string | null; color: string; weekly_target: number }>) =>
    request(`/children/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Dashboard
  getDashboard: () => request<import('./types').DashboardSummary>('/dashboard'),
  getPending: () => request<import('./types').PendingItem[]>('/dashboard/pending'),
  getChildDetail: (id: number) => request<unknown>(`/dashboard/child/${id}/detail`),
  getChildrenReports: () => request<import('./types').ChildReportSummary[]>('/dashboard/reports/children'),
  getWeeklyReports: (weeks?: number) =>
    request<import('./types').WeeklySalaryReport[]>(`/dashboard/reports/weekly?weeks=${weeks || 5}`),
  getPointsSummary: () => request<import('./types').FamilyPointsSummary>('/dashboard/points-summary'),
  getChildPointsSummary: (id: number) => request<import('./types').PointsSummary>(`/dashboard/child/${id}/points-summary`),
  getChildRedemptions: (id: number) => request<import('./types').RedemptionSummary>(`/dashboard/child/${id}/redemptions`),
  getAuditLogs: (limit?: number) => request<import('./types').AuditLogEntry[]>(`/audit?limit=${limit || 100}`),

  // Missions
  getMissions: (category?: string) =>
    request<import('./types').Mission[]>(`/missions${category ? `?category=${category}` : ''}`),
  createMission: (data: unknown) => request('/missions', { method: 'POST', body: JSON.stringify(data) }),
  updateMission: (id: number, data: unknown) => request(`/missions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMission: (id: number) => request(`/missions/${id}`, { method: 'DELETE' }),

  // Catalog
  getPunishments: () => request<import('./types').Punishment[]>('/catalog/punishments'),
  createPunishment: (data: { title: string; points_deducted: number }) =>
    request('/catalog/punishments', { method: 'POST', body: JSON.stringify(data) }),
  getRewards: () => request<import('./types').Reward[]>('/catalog/rewards'),
  createReward: (data: { title: string; description?: string; points_cost: number }) =>
    request('/catalog/rewards', { method: 'POST', body: JSON.stringify(data) }),

  // Actions
  completeMission: (childId: number, missionId: number, proofImage?: string, note?: string) =>
    request(`/actions/child/${childId}/complete-mission`, {
      method: 'POST',
      body: JSON.stringify({
        mission_id: missionId,
        ...(proofImage ? { proof_image: proofImage } : {}),
        note,
      }),
    }),
  recordMissionForChild: (childId: number, data: { mission_id: number; completed_date?: string; note?: string; proof_image?: string }) =>
    request<{ message: string; points_awarded: number; completed_date: string }>(
      `/actions/child/${childId}/record-mission`,
      { method: 'POST', body: JSON.stringify(data) },
    ),
  approveCompletion: (id: number) => request(`/actions/completions/${id}/approve`, { method: 'POST' }),
  rejectCompletion: (id: number) => request(`/actions/completions/${id}/reject`, { method: 'POST' }),
  recordAchievement: (childId: number, data: { title: string; points: number; note?: string }) =>
    request(`/actions/child/${childId}/achievement`, { method: 'POST', body: JSON.stringify(data) }),
  recordPunishment: (childId: number, data: { title: string; points_deducted: number; punishment_id?: number; note?: string }) =>
    request(`/actions/child/${childId}/punishment`, { method: 'POST', body: JSON.stringify(data) }),
  redeem: (data: { redemption_type: string; reward_id?: number; points: number; note?: string }) =>
    request('/actions/child/redeem', { method: 'POST', body: JSON.stringify(data) }),
  approveRedemption: (id: number) => request(`/actions/redemptions/${id}/approve`, { method: 'POST' }),
  rejectRedemption: (id: number) => request(`/actions/redemptions/${id}/reject`, { method: 'POST' }),

  // Settings
  getSettings: () => request<import('./types').Family>('/settings'),
  updateSettings: (data: unknown) => request('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  getSettingsHistory: () => request<unknown[]>('/settings/history'),

  // Child app
  childHome: () => request<unknown>('/child-app/home'),
  childMissions: (category?: string) =>
    request<import('./types').Mission[]>(`/child-app/missions${category ? `?category=${category}` : ''}`),
  childHistory: (days?: number) => request<import('./types').Transaction[]>(`/child-app/history?days=${days || 30}`),
  childRedemptions: () => request<import('./types').RedemptionSummary>('/child-app/redemptions'),
  getChildRewards: () => request<import('./types').Reward[]>('/child-app/rewards'),
  childPointsSummary: () => request<import('./types').PointsSummary>('/child-app/points-summary'),
  updateChildProfile: (data: { display_name?: string | null }) =>
    request<import('./types').Child>('/child-app/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadChildAvatar: async (file: File) => {
    const token = getStoredToken()
    const form = new FormData()
    form.append('file', file)
    trackRequestStart('POST')
    try {
      const res = await fetch(apiUrl('/child-app/avatar'), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(formatApiErrorDetail(err.detail))
      }
      return res.json() as Promise<{ avatar_url: string }>
    } finally {
      trackRequestEnd('POST')
    }
  },
  childGoals: () => request<import('./types').Goal[]>('/child-app/goals'),
  createGoal: (data: { title: string; target_points: number }) =>
    request('/child-app/goals', { method: 'POST', body: JSON.stringify(data) }),
  levelInfo: () => request<unknown>('/child-app/level-info'),

  // Notifications
  getNotifications: (unreadOnly?: boolean) =>
    request<import('./types').AppNotification[]>(`/notifications${unreadOnly ? '?unread_only=true' : ''}`),
  getUnreadCount: () => request<{ count: number }>('/notifications/unread-count'),
  markNotificationRead: (id: number) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),
  getChildNotifications: (unreadOnly?: boolean) =>
    request<import('./types').AppNotification[]>(`/notifications/child${unreadOnly ? '?unread_only=true' : ''}`),
  getChildUnreadCount: () => request<{ count: number }>('/notifications/child/unread-count'),
  markChildNotificationRead: (id: number) => request(`/notifications/child/${id}/read`, { method: 'POST' }),
  markAllChildNotificationsRead: () => request('/notifications/child/read-all', { method: 'POST' }),

  // Agenda
  getAgenda: (month?: string) =>
    request<import('./types').AgendaItem[]>(`/agenda${month ? `?month=${month}` : ''}`),
  createAgenda: (data: {
    title: string
    description?: string
    event_date: string
    event_time?: string
    all_day?: boolean
    color?: string
    child_id?: number
    reminder_hours_before?: number
  }) => request<import('./types').AgendaItem>('/agenda', { method: 'POST', body: JSON.stringify(data) }),
  updateAgenda: (id: number, data: Partial<{
    title: string
    description: string
    event_date: string
    event_time: string
    all_day: boolean
    color: string
    child_id: number | null
    reminder_hours_before: number | null
  }>) => request<import('./types').AgendaItem>(`/agenda/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAgenda: (id: number) => request(`/agenda/${id}`, { method: 'DELETE' }),
  getParentCalendar: (childId: number, month: string) =>
    request<import('./types').CalendarResponse>(`/agenda/calendar/${childId}?month=${month}`),
  getFamilyCalendarOverview: (month: string) =>
    request<import('./types').FamilyOverviewCalendarResponse>(`/agenda/calendar-overview?month=${month}`),
  getChildCalendar: (month: string) =>
    request<import('./types').CalendarResponse>(`/child-app/calendar?month=${month}`),
  getChildWeeklyEvaluations: () =>
    request<import('./types').WeeklyPointsReport[]>('/child-app/weekly-evaluations'),
  getChildAgenda: (month?: string) =>
    request<import('./types').AgendaItem[]>(`/agenda/child/list${month ? `?month=${month}` : ''}`),

  // Quizzes (parent)
  getQuizTemplates: () => request<import('./types').QuizTemplate[]>('/quizzes/templates'),
  cloneQuizTemplate: (templateId: number, data?: { points_reward?: number; passing_score?: number }) =>
    request<{ id: number; title: string; message: string }>(`/quizzes/from-template/${templateId}`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
  getFamilyQuizzes: () => request<import('./types').FamilyQuiz[]>('/quizzes'),
  getFamilyQuiz: (id: number) => request<import('./types').FamilyQuizDetail>(`/quizzes/${id}`),
  createFamilyQuiz: (data: import('./types').QuizEditorPayload) =>
    request<import('./types').FamilyQuizDetail>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFamilyQuiz: (id: number, data: import('./types').QuizEditorPayload) =>
    request<import('./types').FamilyQuizDetail>(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  setFamilyQuizActive: (id: number, isActive: boolean) =>
    request<{ id: number; is_active: boolean }>(`/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }),
  deleteFamilyQuiz: (id: number) =>
    request<{ id: number; message: string }>(`/quizzes/${id}`, { method: 'DELETE' }),
  getQuizAttempts: () => request<import('./types').QuizAttemptSummary[]>('/quizzes/attempts'),

  // Quizzes (child)
  getChildQuizzes: () => request<import('./types').FamilyQuiz[]>('/child-app/quizzes'),
  getChildQuiz: (quizId: number) =>
    request<{
      id: number
      title: string
      subject: string
      sub_material?: string | null
      passing_score: number
      points_reward: number
      question_pool_size: number
      questions_per_attempt: number
      questions: { id: number; question: string; image_url?: string | null; options: string[] }[]
    }>(`/child-app/quizzes/${quizId}`),
  submitChildQuiz: (quizId: number, answers: { question_id: number; selected_option: string }[]) =>
    request<{
      score: number
      passed: boolean
      points_awarded: number
      points_reward: number
      passing_score: number
      already_passed_today: boolean
      correct_count: number
      total_questions: number
    }>(`/child-app/quizzes/${quizId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // Chat (parent)
  getFamilyChatMessages: (limit?: number) =>
    request<import('./types').ChatMessage[]>(`/chat/family/messages?limit=${limit || 100}`),
  sendFamilyChatMessage: (body: string) =>
    request<{ id: number; created_at: string }>('/chat/family/messages', {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
  markFamilyChatRead: () =>
    request<{ marked_read: number }>('/chat/family/read', { method: 'POST' }),
  getChatThreads: () => request<import('./types').ChatThread[]>('/chat/children'),
  getChatUnreadCount: () => request<{ count: number }>('/chat/unread-count'),
  broadcastChatMessage: (body: string) =>
    request<{ sent_count: number }>('/chat/broadcast', { method: 'POST', body: JSON.stringify({ body }) }),
  getChatMessages: (childId: number, limit?: number) =>
    request<import('./types').ChatMessage[]>(`/chat/${childId}/messages?limit=${limit || 50}`),
  sendChatMessage: (childId: number, body: string) =>
    request<{ id: number; created_at: string }>(`/chat/${childId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
  markChatRead: (childId: number) =>
    request<{ marked_read: number }>(`/chat/${childId}/read`, { method: 'POST' }),

  // Chat (child)
  getChildChatMessages: (limit?: number) =>
    request<import('./types').ChatMessage[]>(`/child-app/chat/messages?limit=${limit || 50}`),
  sendChildChatMessage: (body: string) =>
    request<{ id: number; created_at: string }>('/child-app/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
  markChildChatRead: () => request<{ marked_read: number }>('/child-app/chat/read', { method: 'POST' }),
  getChildChatUnreadCount: () => request<{ count: number }>('/child-app/chat/unread-count'),

  changeParentPassword: (data: { current_password: string; new_password: string; confirm_password: string }) =>
    request<{ message: string }>('/settings/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Platform admin
  platformLogin: (data: { email: string; password: string }) =>
    request<{ access_token: string; role: string }>('/platform/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  platformMe: () => request<import('./types').PlatformAdmin>('/platform/auth/me', { logoutOn401: true }),
  platformUpdateProfile: (data: { name?: string; notification_email?: string }) =>
    request<import('./types').PlatformAdmin>('/platform/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  platformNotifications: (unreadOnly?: boolean) =>
    request<import('./types').PlatformNotification[]>(`/platform/notifications${unreadOnly ? '?unread_only=true' : ''}`),
  platformNotificationsUnreadCount: () => request<{ count: number }>('/platform/notifications/unread-count'),
  platformMarkNotificationRead: (id: number) =>
    request<import('./types').PlatformNotification>(`/platform/notifications/${id}/read`, { method: 'POST' }),
  platformApproveFamily: (familyId: number) =>
    request<import('./types').PlatformFamily>(`/platform/families/${familyId}/approve`, { method: 'POST' }),
  platformFamilies: (params?: { search?: string; status?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.status) q.set('status', params.status)
    if (params?.limit != null) q.set('limit', String(params.limit))
    if (params?.offset != null) q.set('offset', String(params.offset))
    const qs = q.toString()
    return request<import('./types').PlatformFamilyListResponse>(`/platform/families${qs ? `?${qs}` : ''}`)
  },
  platformPendingActivation: (limit?: number, offset?: number) =>
    request<import('./types').PlatformFamilyListResponse>(
      `/platform/families/pending-activation?limit=${limit || 50}&offset=${offset || 0}`,
    ),
  platformPendingActivationCount: () =>
    request<{ count: number }>('/platform/families/pending-activation/count'),
  platformActivateFamily: (familyId: number, preset: 'standard' | 'family') =>
    request<import('./types').PlatformFamily>(`/platform/families/${familyId}/activate`, {
      method: 'POST',
      body: JSON.stringify({ preset }),
    }),
  platformAssignDemoPlan: (familyId: number, data: { plan_slug: string; note?: string }) =>
    request<import('./types').PlatformFamily>(`/platform/families/${familyId}/assign-plan`, {
      method: 'POST',
      body: JSON.stringify({ ...data, is_demo: true }),
    }),
  platformRevokeDemo: (familyId: number) =>
    request<import('./types').PlatformFamily>(`/platform/families/${familyId}/revoke-demo`, {
      method: 'POST',
    }),
  platformResendVerification: (familyId: number) =>
    request<import('./types').PlatformFamily>(`/platform/families/${familyId}/resend-verification`, {
      method: 'POST',
    }),
  platformManualVerifyEmail: (familyId: number) =>
    request<import('./types').PlatformFamily>(`/platform/families/${familyId}/verify-email`, {
      method: 'POST',
    }),
  platformUpdateFeatures: (
    familyId: number,
    data: Partial<{
      quiz_enabled: boolean
      chat_enabled: boolean
      agenda_enabled: boolean
      rewards_enabled: boolean
      mission_evidence_enabled: boolean
      daily_mission_limit: number | null
      is_active: boolean
    }>,
  ) =>
    request<import('./types').PlatformFamily>(`/platform/families/${familyId}/features`, { method: 'PATCH', body: JSON.stringify(data) }),
  platformStats: () => request<import('./types').PlatformStats>('/platform/stats'),
  platformQuizTemplates: () => request<import('./types').QuizTemplate[]>('/platform/quiz-templates'),
  platformQuizTemplate: (id: number) => request<import('./types').QuizTemplateDetail>(`/platform/quiz-templates/${id}`),
  platformCreateQuizTemplate: (data: import('./types').QuizEditorPayload) =>
    request<import('./types').QuizTemplateDetail>('/platform/quiz-templates', { method: 'POST', body: JSON.stringify(data) }),
  platformUpdateQuizTemplate: (id: number, data: import('./types').QuizEditorPayload) =>
    request<import('./types').QuizTemplateDetail>(`/platform/quiz-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  platformDeleteQuizTemplate: (id: number) =>
    request<{ id: number; deleted?: boolean; message: string }>(`/platform/quiz-templates/${id}`, { method: 'DELETE' }),
  platformToggleQuizTemplate: (templateId: number, isActive: boolean) =>
    request<{ id: number; is_active: boolean }>(`/platform/quiz-templates/${templateId}/active?is_active=${isActive}`, { method: 'PATCH' }),
  platformAudit: (limit?: number) =>
    request<import('./types').PlatformAuditEntry[]>(`/platform/audit?limit=${limit || 100}`),
  platformReferralStats: () => request<import('./types').PlatformReferralStats>('/platform/referrals/stats'),
  platformReferralLeaderboard: (limit?: number) =>
    request<import('./types').PlatformReferralLeaderboardEntry[]>(`/platform/referrals/leaderboard?limit=${limit || 20}`),
  platformReferralActivity: (limit?: number) =>
    request<import('./types').PlatformReferralActivity[]>(`/platform/referrals/activity?limit=${limit || 50}`),
  platformBroadcasts: (limit?: number) =>
    request<import('./types').PlatformBroadcast[]>(`/platform/broadcasts?limit=${limit || 20}`),
  platformCreateBroadcast: (data: { title: string; body: string; send_email?: boolean }) =>
    request<import('./types').PlatformBroadcast>('/platform/broadcasts', { method: 'POST', body: JSON.stringify(data) }),
  platformBillingStats: () => request<import('./types').BillingStats>('/platform/billing/stats'),
  platformPlans: () => request<import('./types').Plan[]>('/platform/plans'),
  platformCreatePlan: (data: Partial<import('./types').Plan>) =>
    request<import('./types').Plan>('/platform/plans', { method: 'POST', body: JSON.stringify(data) }),
  platformUpdatePlan: (id: number, data: Partial<import('./types').Plan>) =>
    request<import('./types').Plan>(`/platform/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  platformTogglePlan: (id: number, isActive: boolean) =>
    request<import('./types').Plan>(`/platform/plans/${id}/active?is_active=${isActive}`, { method: 'PATCH' }),
  platformPayments: (params?: { search?: string; status?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.status) q.set('status', params.status)
    if (params?.limit != null) q.set('limit', String(params.limit))
    if (params?.offset != null) q.set('offset', String(params.offset))
    const qs = q.toString()
    return request<import('./types').PaymentListResponse>(`/platform/payments${qs ? `?${qs}` : ''}`)
  },
  platformCreateManualPayment: (data: {
    family_id: number
    amount: number
    plan_id: number
    billing_period?: 'monthly' | 'yearly'
    pending_payment_id?: number
    description?: string
    invoice_number?: string
    provider_ref?: string
  }) =>
    request<{ id: number; status: string; subscription_id?: number }>('/platform/payments/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  platformPendingPaymentCount: () => request<{ count: number }>('/platform/payments/pending-count'),
  platformConfirmPayment: (paymentId: number) =>
    request<{ id: number; status: string; subscription_id?: number }>(
      `/platform/payments/${paymentId}/confirm`,
      { method: 'POST' },
    ),
  platformRejectPayment: (paymentId: number, reason: string) =>
    request<{ id: number; status: string; rejection_reason?: string }>(
      `/platform/payments/${paymentId}/reject`,
      { method: 'POST', body: JSON.stringify({ reason }) },
    ),
  platformPaymentSettings: () =>
    request<import('./types').PaymentSettings>('/platform/billing/payment-settings'),
  platformUpdatePaymentSettings: (data: Partial<import('./types').PaymentSettings>) =>
    request<import('./types').PaymentSettings>('/platform/billing/payment-settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  platformUploadQris: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const token = getStoredToken()
    const res = await fetch(apiUrl('/platform/billing/payment-settings/qris-upload'), {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Upload gagal')
    }
    return res.json() as Promise<{ qris_image_url: string }>
  },
  billingPlans: () => request<import('./types').BillingPlan[]>('/billing/plans'),
  billingSubscription: () => request<import('./types').BillingSubscription>('/billing/subscription'),
  billingPendingPayment: () =>
    request<import('./types').PendingPayment | null>('/billing/pending-payment'),
  billingPaymentInstructions: () =>
    request<import('./types').PaymentSettings>('/billing/payment-instructions'),
  billingUpgradeRequest: (data: {
    plan_slug: string
    method: 'qris_static' | 'bank_transfer'
    proof_image: string
    provider_ref?: string
    note?: string
  }) =>
    request<{
      payment_id: number
      amount: number
      currency: string
      plan_slug: string
      plan_name: string
      method: string
      instructions: import('./types').PaymentSettings
    }>('/billing/upgrade-request', { method: 'POST', body: JSON.stringify(data) }),
  platformTrials: (limit?: number, offset?: number) =>
    request<import('./types').TrialListResponse>(`/platform/trials?limit=${limit || 50}&offset=${offset || 0}`),
  platformExtendTrial: (subscriptionId: number, data: { extra_days: number; reason: string }) =>
    request<{ subscription_id: number; trial_ends_at: string }>(`/platform/trials/${subscriptionId}/extend`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}
