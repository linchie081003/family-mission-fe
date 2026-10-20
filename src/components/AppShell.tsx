import { ReactNode } from 'react'
import DoodleBackdrop from './doodle/DoodleBackdrop'

export default function AppShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen pb-[4.75rem] bg-doodle-cream text-doodle-ink relative ${className}`}>
      <DoodleBackdrop />
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
