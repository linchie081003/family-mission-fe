type Variant = 'parent' | 'child' | 'auth'

interface Props {
  variant?: Variant
  className?: string
}

/** Soft organic blobs — calm, Headspace-inspired decoration. */
export default function FamilyVectorBackdrop({ variant = 'parent', className = '' }: Props) {
  const blueBlob = variant === 'child' ? 'opacity-50' : 'opacity-35'

  return (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden -z-10 ${className}`}
      aria-hidden
    >
      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-family-blob-orange blur-2xl opacity-80" />
      <div className={`absolute top-1/3 -left-28 w-80 h-80 rounded-full bg-family-blob-blue blur-3xl ${blueBlob}`} />
      <div className="absolute bottom-20 right-8 w-56 h-56 rounded-full bg-[#FFD4A8]/40 blur-2xl" />

      <svg className="absolute top-[12%] right-[8%] w-16 h-16 opacity-25" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" fill="#FF9F4A" />
      </svg>
      <svg className="absolute bottom-[35%] left-[6%] w-12 h-12 opacity-20" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#7EB8DA" />
      </svg>
      <svg className="absolute top-[55%] right-[18%] w-10 h-10 opacity-15" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="16" fill="#F47B20" />
      </svg>
    </div>
  )
}
