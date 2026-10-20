import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import FeatureCardArt, { ArtKind } from './FeatureCardArt'
import { CardGradient } from './gradients'

interface Props {
  to: string
  title: string
  subtitle: string
  art: ArtKind
  gradient?: CardGradient
}

export default function GradientFeatureCard({ to, title, subtitle, art }: Props) {
  return (
    <Link
      to={to}
      className="doodle-card px-3 py-3 flex items-center gap-3 active:scale-[0.99] transition-transform min-h-[5.5rem]"
    >
      <div
        className="w-[4.5rem] h-[4.5rem] shrink-0 rounded-doodle bg-white/25 border-2 border-doodle-bar/40 flex items-center justify-center p-1.5"
        aria-hidden
      >
        <FeatureCardArt kind={art} />
      </div>
      <div className="flex-1 min-w-0 pr-1">
        <p className="font-extrabold text-base leading-snug">{title}</p>
        <p className="text-sm text-white/90 mt-0.5 font-bold leading-snug">{subtitle}</p>
      </div>
      <div className="doodle-check-btn" aria-hidden>
        <Check size={22} className="text-doodle-sky" strokeWidth={3} />
      </div>
    </Link>
  )
}
