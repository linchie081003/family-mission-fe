export type ArtKind =
  | 'kids'
  | 'missions'
  | 'pending'
  | 'reports'
  | 'agenda'
  | 'quiz'
  | 'chat'
  | 'star'
  | 'rocket'
  | 'building'
  | 'billing'
  | 'broadcast'
  | 'referral'
  | 'audit'
  | 'templates'
  | 'settings'

export default function FeatureCardArt({ kind }: { kind: ArtKind }) {
  switch (kind) {
    case 'kids':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <circle cx="40" cy="28" r="14" fill="#FFE0BD" />
          <path d="M22 58 Q40 48 58 58" fill="#FF9F4A" />
          <rect x="18" y="62" width="12" height="10" rx="2" fill="#6366F1" />
          <rect x="34" y="58" width="12" height="14" rx="2" fill="#F472B6" />
          <rect x="50" y="62" width="12" height="10" rx="2" fill="#34D399" />
        </svg>
      )
    case 'missions':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <rect x="22" y="16" width="36" height="48" rx="4" fill="#FFF" opacity="0.95" />
          <rect x="28" y="26" width="24" height="4" rx="2" fill="#C084FC" />
          <rect x="28" y="34" width="18" height="4" rx="2" fill="#E9D5FF" />
          <path d="M48 52 L54 58 L62 46" stroke="#22C55E" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'pending':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <rect x="24" y="14" width="32" height="44" rx="4" fill="#FFF" />
          <circle cx="40" cy="30" r="8" fill="#A7F3D0" />
          <path d="M32 42 H48 M32 48 H44" stroke="#6EE7B7" strokeWidth="3" strokeLinecap="round" />
          <circle cx="52" cy="52" r="12" fill="#22C55E" />
          <path d="M47 52 L51 56 L58 47" stroke="#FFF" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'reports':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <rect x="20" y="48" width="10" height="18" rx="2" fill="#FDE68A" />
          <rect x="35" y="38" width="10" height="28" rx="2" fill="#FFF" />
          <rect x="50" y="28" width="10" height="38" rx="2" fill="#FCD34D" />
        </svg>
      )
    case 'agenda':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <rect x="22" y="20" width="36" height="40" rx="4" fill="#FFF" />
          <rect x="22" y="20" width="36" height="10" rx="4" fill="#93C5FD" />
          <circle cx="32" cy="38" r="3" fill="#3B82F6" />
          <circle cx="40" cy="46" r="3" fill="#60A5FA" />
          <circle cx="48" cy="38" r="3" fill="#3B82F6" />
        </svg>
      )
    case 'quiz':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <rect x="18" y="22" width="44" height="32" rx="4" fill="#FFF" />
          <text x="28" y="44" fill="#7C3AED" fontSize="16" fontWeight="bold">?</text>
          <rect x="26" y="50" width="28" height="6" rx="3" fill="#DDD6FE" />
        </svg>
      )
    case 'chat':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <path d="M20 24 H60 a8 8 0 0 1 8 8 V44 a8 8 0 0 1-8 8 H36 L24 58 V52 H20 a8 8 0 0 1-8-8 V32 a8 8 0 0 1 8-8Z" fill="#FFF" />
          <circle cx="32" cy="38" r="3" fill="#C084FC" />
          <circle cx="40" cy="38" r="3" fill="#C084FC" />
          <circle cx="48" cy="38" r="3" fill="#C084FC" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <polygon points="40,14 48,32 68,34 54,46 58,66 40,56 22,66 26,46 12,34 32,32" fill="#FFF" />
        </svg>
      )
    case 'rocket':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <path d="M40 16 C40 16 52 28 52 44 C52 50 46 56 40 56 C34 56 28 50 28 44 C28 28 40 16 40 16Z" fill="#FFF" />
          <circle cx="40" cy="38" r="6" fill="#FCA5A5" />
          <path d="M34 56 L30 64 M46 56 L50 64" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'building':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <rect x="26" y="22" width="28" height="42" rx="2" fill="#FFF" />
          <rect x="32" y="30" width="6" height="6" fill="#C4B5FD" />
          <rect x="42" y="30" width="6" height="6" fill="#C4B5FD" />
          <rect x="32" y="42" width="6" height="6" fill="#DDD6FE" />
          <rect x="42" y="42" width="6" height="6" fill="#DDD6FE" />
        </svg>
      )
    case 'billing':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <rect x="20" y="28" width="40" height="26" rx="4" fill="#FFF" />
          <rect x="20" y="36" width="40" height="8" fill="#86EFAC" />
          <rect x="26" y="46" width="16" height="4" rx="1" fill="#BBF7D0" />
        </svg>
      )
    case 'broadcast':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <path d="M28 44 H44 V32 H36 L28 24 V44Z" fill="#FFF" />
          <path d="M48 30 C56 34 56 46 48 50" stroke="#FFF" strokeWidth="3" fill="none" />
          <path d="M54 26 C66 32 66 48 54 54" stroke="#FFF" strokeWidth="3" fill="none" opacity="0.7" />
        </svg>
      )
    case 'referral':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <circle cx="30" cy="34" r="8" fill="#FFF" />
          <circle cx="50" cy="34" r="8" fill="#FFF" opacity="0.85" />
          <path d="M22 54 Q40 44 58 54" stroke="#FFF" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'audit':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <rect x="24" y="18" width="32" height="44" rx="3" fill="#FFF" />
          <path d="M30 30 H50 M30 38 H46 M30 46 H42" stroke="#5EEAD4" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'templates':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <rect x="22" y="20" width="36" height="28" rx="3" fill="#FFF" />
          <rect x="22" y="52" width="36" height="10" rx="2" fill="#FFF" opacity="0.8" />
        </svg>
      )
    case 'settings':
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden>
          <circle cx="40" cy="40" r="10" fill="#FFF" />
          <circle cx="40" cy="40" r="18" stroke="#FFF" strokeWidth="6" fill="none" strokeDasharray="8 6" />
        </svg>
      )
    default:
      return null
  }
}
