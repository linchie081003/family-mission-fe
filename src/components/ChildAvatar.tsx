import { assetUrl } from '../lib/apiBase'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_CLASSES: Record<Size, { box: string; text: string }> = {
  sm: { box: 'w-8 h-8', text: 'text-sm' },
  md: { box: 'w-12 h-12', text: 'text-lg' },
  lg: { box: 'w-16 h-16', text: 'text-2xl' },
  xl: { box: 'w-20 h-20', text: 'text-3xl' },
}

interface Props {
  name: string
  color: string
  avatarUrl?: string | null
  size?: Size
  className?: string
}

export default function ChildAvatar({ name, color, avatarUrl, size = 'md', className = '' }: Props) {
  const { box, text } = SIZE_CLASSES[size]
  const src = avatarUrl ? assetUrl(avatarUrl) : ''
  const initial = name.trim()[0]?.toUpperCase() || '?'

  return (
    <div
      className={`${box} rounded-full flex items-center justify-center overflow-hidden shrink-0 font-bold text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className={text}>{initial}</span>
      )}
    </div>
  )
}
