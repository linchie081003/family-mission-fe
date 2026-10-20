const BRAND_IMAGE = '/brand/family-kawaii.png'

type Variant = 'full' | 'mark' | 'fab'

interface Props {
  size?: number
  variant?: Variant
  className?: string
  title?: string
}

export default function FamilyMissionLogo({
  size = 112,
  variant = 'full',
  className = '',
  title = 'Family Mission',
}: Props) {
  if (variant === 'fab') {
    return (
      <img
        src={BRAND_IMAGE}
        alt=""
        aria-hidden
        className={`w-full h-full object-cover object-[center_35%] ${className}`}
        draggable={false}
      />
    )
  }

  const px = size
  const rounded = variant === 'mark' ? 'rounded-2xl' : 'rounded-[1.75rem]'

  return (
    <div
      className={`inline-block overflow-hidden bg-[#EDE4D9] ${rounded} shadow-[0_14px_36px_-14px_rgba(120,72,48,0.45)] ring-1 ring-stone-900/5 ${className}`}
      style={{ width: px, height: px }}
      role="img"
      aria-label={title}
    >
      <img
        src={BRAND_IMAGE}
        alt={title}
        className="w-full h-full object-cover object-[center_38%] select-none"
        draggable={false}
        width={px}
        height={px}
      />
    </div>
  )
}
