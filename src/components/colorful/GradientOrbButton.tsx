import { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  to: string
  label: string
  icon: LucideIcon
  badge?: number
}

export default function GradientOrbButton({ to, label, icon: Icon, badge }: Props) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 group">
      <div className="relative">
        <div className="w-[4.25rem] h-[4.25rem] rounded-full bg-doodle-sky border-[2.5px] border-doodle-bar shadow-doodle flex items-center justify-center text-white group-active:scale-95 transition-transform">
          <Icon size={28} strokeWidth={2.5} />
        </div>
        {badge != null && badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[22px] h-[22px] px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-doodle-bar">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-[11px] font-extrabold text-doodle-ink text-center leading-tight max-w-[5.5rem]">
        {label}
      </span>
    </Link>
  )
}
