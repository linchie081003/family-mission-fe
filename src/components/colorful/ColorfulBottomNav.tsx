import { LucideIcon, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import FamilyMissionLogo from '../brand/FamilyMissionLogo'

export type ColorfulNavItem = {
  to: string
  icon: LucideIcon
  label: string
  end?: boolean
  badge?: number
}

interface Props {
  left: ColorfulNavItem[]
  right: ColorfulNavItem[]
  fab: { to: string; icon?: LucideIcon; badge?: number; ariaLabel: string; useBrandLogo?: boolean }
  pathname: string
  maxWidthClass?: string
}

function isActive(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

function NavLink({ item, pathname }: { item: ColorfulNavItem; pathname: string }) {
  const active = isActive(pathname, item.to, item.end)
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 text-[10px] font-bold ${
        active ? 'text-doodle-yellow' : 'text-white/55'
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      <span className="truncate max-w-full">{item.label}</span>
      {active && <span className="absolute -bottom-0.5 w-8 h-1 rounded-full bg-doodle-yellow" />}
      {item.badge != null && item.badge > 0 && (
        <span className="absolute top-0 right-[calc(50%-20px)] min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-doodle-bar">
          {item.badge > 9 ? '9+' : item.badge}
        </span>
      )}
    </Link>
  )
}

export default function ColorfulBottomNav({ left, right, fab, pathname, maxWidthClass = 'max-w-lg' }: Props) {
  const FabIcon = fab.icon ?? Plus
  const fabActive = isActive(pathname, fab.to, fab.to === left[0]?.to)
  const anyActive = [...left, ...right].some(i => isActive(pathname, i.to, i.end)) || fabActive
  const progress = anyActive ? 'w-[55%]' : 'w-[20%]'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-doodle-bar border-t-[2.5px] border-black/20">
      <div className={`${maxWidthClass} mx-auto px-3 pt-2 pb-2`}>
        <div className="h-1.5 rounded-full bg-black/35 mb-2 overflow-hidden">
          <div className={`h-full rounded-full bg-doodle-yellow transition-all duration-300 ${progress}`} />
        </div>
        <div className="flex items-end relative min-h-[3.25rem]">
          <div className="flex flex-1 justify-around">{left.map(item => <NavLink key={item.to} item={item} pathname={pathname} />)}</div>

          <Link to={fab.to} aria-label={fab.ariaLabel} className="relative -mt-6 mx-2 shrink-0">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center border-[3px] border-white shadow-doodle overflow-hidden ${
                fab.useBrandLogo ? 'bg-[#EDE4D9]' : 'bg-doodle-bar ring-2 ring-doodle-yellow/80'
              } ${fabActive ? 'ring-4 ring-doodle-yellow' : ''}`}
            >
              {fab.useBrandLogo ? (
                <FamilyMissionLogo variant="fab" />
              ) : (
                <FabIcon size={28} strokeWidth={2.5} className="text-white" />
              )}
            </div>
            {fab.badge != null && fab.badge > 0 && (
              <span className="absolute top-0 right-0 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {fab.badge > 99 ? '99+' : fab.badge}
              </span>
            )}
          </Link>

          <div className="flex flex-1 justify-around">{right.map(item => <NavLink key={item.to} item={item} pathname={pathname} />)}</div>
        </div>
      </div>
    </nav>
  )
}
