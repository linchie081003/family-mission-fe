import { ChevronLeft, Menu } from 'lucide-react'
import { ReactNode } from 'react'

interface Props {
  title: string
  onBack?: () => void
  onMenu?: () => void
  rightSlot?: ReactNode
  titleClassName?: string
  maxWidthClass?: string
}

export default function ColorfulPageHeader({
  title,
  onBack,
  onMenu,
  rightSlot,
  maxWidthClass = 'max-w-lg',
}: Props) {
  return (
    <header className="sticky top-0 z-20">
      <div className="bg-doodle-bar text-white">
        <div className={`${maxWidthClass} mx-auto flex items-center justify-between gap-2 px-3 py-2.5`}>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
              aria-label="Kembali"
            >
              <ChevronLeft size={26} strokeWidth={2.5} />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <span className="text-sm font-bold opacity-90 truncate flex-1 text-center">{title}</span>
          {rightSlot ?? (
            onMenu ? (
              <button
                type="button"
                onClick={onMenu}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
                aria-label="Menu"
              >
                <Menu size={24} strokeWidth={2.5} />
              </button>
            ) : (
              <div className="w-10" />
            )
          )}
        </div>
      </div>
      <div className={`bg-doodle-cream px-4 pt-3 pb-1 ${maxWidthClass} mx-auto`}>
        <div className="doodle-pill text-lg truncate">{title}</div>
      </div>
    </header>
  )
}
