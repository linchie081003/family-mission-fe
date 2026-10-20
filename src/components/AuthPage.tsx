import { ReactNode } from 'react'
import AppShell from './AppShell'

/** Centered auth / legal content on doodle cream background */
export default function AuthPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <AppShell className={`flex items-center justify-center px-6 py-8 ${className}`}>
      {children}
    </AppShell>
  )
}
