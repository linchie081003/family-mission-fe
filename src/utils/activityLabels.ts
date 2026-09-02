export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  punishment: 'Hukuman',
  achievement: 'Bonus pencapaian',
  redemption: 'Penukaran reward',
  quiz: 'Quiz',
  adjustment: 'Penyesuaian',
  mission: 'Misi',
}

export function activityTypeLabel(type: string) {
  return ACTIVITY_TYPE_LABELS[type] || type
}

export function activityTypeIcon(type: string) {
  const icons: Record<string, string> = {
    mission: '✓',
    quiz: '📝',
    punishment: '⚠️',
    achievement: '🌟',
    redemption: '🎁',
    adjustment: '⚙️',
  }
  return icons[type] || '•'
}
