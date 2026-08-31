const FEATURE_LABELS: Record<string, string> = {
  rewards_enabled: 'Reward & poin',
  mission_evidence_enabled: 'Upload bukti foto',
  quiz_enabled: 'Quiz edukasi',
  chat_enabled: 'Chat keluarga',
  agenda_enabled: 'Agenda keluarga',
}

export function featuresFromPreset(preset: Record<string, unknown> | undefined): { ok: string[]; no: string[] } {
  if (!preset) return { ok: [], no: [] }
  const ok: string[] = []
  const no: string[] = []
  for (const [key, label] of Object.entries(FEATURE_LABELS)) {
    if (preset[key]) ok.push(label)
    else no.push(label)
  }
  const limit = preset.daily_mission_limit
  if (limit != null && typeof limit === 'number') {
    ok.push(`Maks ${limit} misi/hari`)
  } else if (preset.daily_mission_limit === null || preset.daily_mission_limit === undefined) {
    if (ok.length > 0) ok.push('Misi tanpa batas')
  }
  return { ok, no }
}

export const PLAN_FEATURE_TOGGLES = [
  { key: 'rewards_enabled' as const, label: 'Reward & Poin' },
  { key: 'mission_evidence_enabled' as const, label: 'Bukti Misi' },
  { key: 'quiz_enabled' as const, label: 'Quiz' },
  { key: 'chat_enabled' as const, label: 'Chat' },
  { key: 'agenda_enabled' as const, label: 'Agenda Keluarga' },
]

export type PlanFeatureKey = typeof PLAN_FEATURE_TOGGLES[number]['key']

export function defaultFeaturePreset(slug: string): Record<string, unknown> {
  if (slug === 'basic') {
    return {
      rewards_enabled: true,
      mission_evidence_enabled: false,
      quiz_enabled: false,
      chat_enabled: false,
      agenda_enabled: false,
      daily_mission_limit: 5,
    }
  }
  if (slug === 'standard') {
    return {
      rewards_enabled: true,
      mission_evidence_enabled: true,
      quiz_enabled: true,
      chat_enabled: false,
      agenda_enabled: false,
      daily_mission_limit: null,
    }
  }
  return {
    rewards_enabled: true,
    mission_evidence_enabled: true,
    quiz_enabled: true,
    chat_enabled: true,
    agenda_enabled: true,
    daily_mission_limit: null,
  }
}
