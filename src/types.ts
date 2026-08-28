export interface Child {
  id: number
  name: string
  color: string
  weekly_target: number
  avatar_url?: string
  lifetime_points: number
  active_balance: number
  spendable_balance: number
  reward_redeemed_total: number
  total_redeemed: number
  current_streak: number
  longest_streak: number
  level: string
  has_pin: boolean
}

export interface Mission {
  id: number
  title: string
  description?: string
  category: string
  points: number
  difficulty: string
  is_active: boolean
  sort_order: number
  completed_today?: boolean
  pending_approval?: boolean
}

export interface DashboardSummary {
  total_weekly_points: number
  total_lifetime_points: number
  total_active_balance: number
  pending_count: number
  children_ranking: ChildRanking[]
}

export interface ChildRanking {
  id: number
  name: string
  color: string
  lifetime_points: number
  active_balance: number
  weekly_points: number
  level: string
  rank: number
}

export interface PendingItem {
  id: number
  type: string
  child_name: string
  child_color: string
  title: string
  points: number
  created_at: string
  extra?: Record<string, unknown>
}

export interface Family {
  id: number
  email: string
  family_name: string
  family_code: string
  rupiah_per_point: number
  daily_point_limit: number
  min_cash_redemption: number
  quiz_enabled: boolean
  chat_enabled: boolean
  agenda_enabled: boolean
  rewards_enabled: boolean
  mission_evidence_enabled: boolean
  daily_mission_limit?: number | null
  is_active?: boolean
}

export interface PointsSummary {
  child_id?: number
  child_name?: string
  child_color?: string
  active_balance: number
  lifetime_points: number
  total_redeemed: number
  reward_redeemed_total: number
  cash_redeemed_total: number
  weekly_net_points: number
  weekly_earned: number
  weekly_deducted: number
}

export interface FamilyPointsSummary {
  total_lifetime_points: number
  total_active_balance: number
  total_redeemed: number
  total_weekly_net: number
  children: PointsSummary[]
}

export interface RedemptionSummary {
  total_redeemed: number
  total_reward_points: number
  total_cash_points: number
  redemptions: {
    id?: number
    type: string
    points: number
    status: string
    reward_title?: string
    created_at: string
  }[]
}

export interface WeeklySalaryReport {
  child_id: number
  child_name: string
  child_color: string
  weeks: (WeeklyPointsReport & { rupiah_per_point?: number; salary_rupiah?: number })[]
}

export interface QuizTemplate {
  id: number
  subject: string
  title: string
  grade_level: string
  is_active?: boolean
}

export interface QuizQuestion {
  id?: number
  question: string
  image_url?: string | null
  options: string[]
  correct_index: number
  explanation?: string | null
  sort_order?: number
}

export interface QuizEditorPayload {
  subject: string
  title: string
  description?: string | null
  sub_material?: string | null
  grade_level?: string
  points_reward?: number
  passing_score?: number
  questions_per_attempt?: number | null
  target_all_children?: boolean
  assigned_child_ids?: number[]
  questions: QuizQuestion[]
}

export interface QuizTemplateDetail extends QuizTemplate {
  description?: string | null
  questions: QuizQuestion[]
}

export interface FamilyQuiz {
  id: number
  subject: string
  title: string
  sub_material?: string | null
  points_reward: number
  passing_score: number
  question_pool_size?: number
  questions_per_attempt?: number | null
  target_all_children?: boolean
  assigned_child_ids?: number[]
  is_active?: boolean
  template_id?: number | null
  completed_today?: boolean
}

export interface FamilyQuizDetail extends FamilyQuiz {
  questions: QuizQuestion[]
}

export interface QuizAttemptSummary {
  id: number
  child_name: string
  quiz_title: string
  score: number
  passed: boolean
  points_awarded: number
  completed_at: string
}

export interface ChatThread {
  child_id: number
  child_name: string
  child_color: string
  unread_count: number
}

export interface ChatMessage {
  id: number
  sender_role: string
  body: string
  created_at: string
  read_at?: string | null
}

export interface PlatformStats {
  families_total: number
  families_pending?: number
  pending_activation_count?: number
  platform_notifications_unread?: number
  features_enabled: Record<string, number>
  feature_labels: Record<string, string>
}

export interface Reward {
  id: number
  title: string
  description?: string
  points_cost: number
  is_active: boolean
}

export interface Punishment {
  id: number
  title: string
  points_deducted: number
  is_active: boolean
}

export interface Transaction {
  id: number
  transaction_type: string
  points: number
  active_balance_after: number
  lifetime_points_after: number
  description: string
  created_at: string
}

export interface Goal {
  id: number
  title: string
  target_points: number
  is_achieved: boolean
}

export interface AppNotification {
  id: number
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  is_read: boolean
  child_id?: number
  created_at: string
}

export interface AgendaItem {
  id: number
  title: string
  description?: string
  event_date: string
  event_time?: string
  all_day: boolean
  color: string
  child_id?: number
  reminder_hours_before?: number
  created_at: string
}

export interface CalendarDayPointEntry {
  id: number
  type: string
  title: string
  points: number
}

export interface CalendarDayData {
  missions: { id: number; title: string; status: string; points: number }[]
  agenda: { id: number; title: string; description?: string; time?: string; all_day: boolean; color: string; child_id?: number }[]
  net_points: number
  point_entries?: CalendarDayPointEntry[]
}

export interface CalendarResponse {
  month: string
  child_id: number
  days: Record<string, CalendarDayData>
}

export interface FamilyOverviewChildDay {
  child_id: number
  child_name: string
  child_color: string
  missions: CalendarDayData['missions']
  agenda: CalendarDayData['agenda']
  net_points: number
  point_entries?: CalendarDayPointEntry[]
}

export interface FamilyOverviewDay {
  family_agenda: CalendarDayData['agenda']
  children: FamilyOverviewChildDay[]
}

export interface FamilyOverviewCalendarResponse {
  month: string
  days: Record<string, FamilyOverviewDay>
}

export interface WeeklyPointsReport {
  week_start: string
  week_end: string
  points_earned: number
  points_deducted: number
  net_points: number
}

export interface ChildReportSummary {
  id: number
  name: string
  color: string
  weekly_points: number
  lifetime_points: number
  spendable_balance: number
  reward_redeemed_total: number
  recent_transactions: Transaction[]
  weekly_evaluations: WeeklyPointsReport[]
}

export interface AuditLogEntry {
  id: number
  actor_role: string
  actor_label: string
  action: string
  entity_type: string
  entity_id?: number
  summary: string
  details?: Record<string, unknown>
  created_at: string
}

export interface PlatformAdmin {
  id: number
  email: string
  name: string
  notification_email?: string | null
}

export interface PlatformNotification {
  id: number
  type: string
  title: string
  body: string
  family_id?: number | null
  data?: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface PlatformFamily {
  id: number
  email: string
  family_name: string
  family_code: string
  quiz_enabled: boolean
  chat_enabled: boolean
  agenda_enabled: boolean
  rewards_enabled: boolean
  mission_evidence_enabled: boolean
  daily_mission_limit: number | null
  is_active: boolean
  children_count: number
  created_at: string
  activated_at?: string | null
  activation_preset?: string | null
  email_verified?: boolean
  referral_code?: string | null
  referrer_name?: string | null
}

export interface PlatformFamilyListResponse {
  items: PlatformFamily[]
  total: number
  limit: number
  offset: number
}

export interface PlatformReferralStats {
  total_invites: number
  total_conversions: number
  families_with_code: number
  conversion_rate: number
}

export interface PlatformReferralLeaderboardEntry {
  family_id: number
  family_name: string
  referral_code: string | null
  invites_sent: number
  families_joined: number
}

export interface PlatformReferralActivity {
  family_id: number
  family_name: string
  email: string
  referrer_id: number | null
  referrer_name: string | null
  created_at: string
}

export interface PlatformBroadcast {
  id: number
  platform_admin_id: number
  title: string
  body: string
  target: string
  families_reached: number
  send_email: boolean
  created_at: string
}

export interface Plan {
  id: number
  slug: string
  name: string
  description?: string | null
  price_monthly: number
  price_yearly: number
  currency: string
  trial_days: number
  feature_preset: Record<string, unknown>
  is_active: boolean
  sort_order: number
  subscriber_count: number
  created_at: string
  updated_at: string
}

export interface PaymentEntry {
  id: number
  family_id: number
  family_name: string
  email: string
  amount: number
  currency: string
  status: string
  provider: string
  provider_ref?: string | null
  invoice_number?: string | null
  description?: string | null
  paid_at?: string | null
  created_at: string
}

export interface PaymentListResponse {
  items: PaymentEntry[]
  total: number
  limit: number
  offset: number
}

export interface TrialEntry {
  subscription_id: number
  family_id: number
  family_name: string
  email: string
  plan_name: string
  plan_slug: string
  trial_ends_at: string | null
  days_remaining: number | null
  referral_code?: string | null
  manual_notes?: string | null
}

export interface TrialListResponse {
  items: TrialEntry[]
  total: number
  limit: number
  offset: number
}

export interface BillingStats {
  mrr: number
  revenue_this_month: number
  revenue_last_month: number
  trial_active_count: number
  trial_conversion_rate: number
  tier_breakdown: { plan_name: string; count: number; mrr: number }[]
}

export interface PlatformAuditEntry {
  id: number
  platform_admin_id: number
  family_id: number
  feature_key: string
  enabled: boolean
  summary: string
  details?: Record<string, unknown>
  created_at: string
}

export const LEVEL_ICONS: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
}

export const DIFFICULTY_ICONS: Record<string, string> = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
}

export function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}
