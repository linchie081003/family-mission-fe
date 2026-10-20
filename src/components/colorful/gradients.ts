export type CardGradient = 'rose' | 'purple' | 'green' | 'amber' | 'blue' | 'teal'

export const CARD_GRADIENT_CLASS: Record<CardGradient, string> = {
  rose: 'bg-grad-card-rose',
  purple: 'bg-grad-card-purple',
  green: 'bg-grad-card-green',
  amber: 'bg-grad-card-amber',
  blue: 'bg-grad-card-blue',
  teal: 'bg-grad-card-teal',
}

export const CARD_SHADOW_CLASS: Record<CardGradient, string> = {
  rose: 'shadow-[0_14px_32px_-10px_rgba(255,71,87,0.55)]',
  purple: 'shadow-[0_14px_32px_-10px_rgba(168,85,247,0.5)]',
  green: 'shadow-[0_14px_32px_-10px_rgba(16,185,129,0.5)]',
  amber: 'shadow-[0_14px_32px_-10px_rgba(245,158,11,0.5)]',
  blue: 'shadow-[0_14px_32px_-10px_rgba(59,130,246,0.45)]',
  teal: 'shadow-[0_14px_32px_-10px_rgba(20,184,166,0.45)]',
}

export const ORB_CLASS =
  'bg-gradient-to-br from-sky-300 via-sky-400 to-blue-600 shadow-[0_12px_28px_-6px_rgba(37,99,235,0.55)]'
