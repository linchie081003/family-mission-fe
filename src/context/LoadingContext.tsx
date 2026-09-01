import { ReactNode, useEffect, useState } from 'react'
import { LoadingState, subscribeLoading } from '../lib/loadingTracker'

function GlobalLoadingBar({ pending, mutating, visible, completing }: {
  pending: number
  mutating: number
  visible: boolean
  completing: boolean
}) {
  if (!visible && !completing) return null

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[70] h-1 overflow-hidden bg-primary-100/40 pointer-events-none"
        role="progressbar"
        aria-busy={pending > 0}
        aria-label="Memuat data"
      >
        {completing ? (
          <div className="h-full w-full bg-gradient-to-r from-primary-500 to-indigo-500 animate-loading-complete" />
        ) : (
          <div className="api-loading-bar h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-primary-400 rounded-full" />
        )}
      </div>

      {mutating > 0 && visible && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl backdrop-blur-sm border border-white/10">
            <span className="w-3.5 h-3.5 border-2 border-white/25 border-t-white rounded-full animate-spin shrink-0" />
            Memproses...
          </div>
        </div>
      )}
    </>
  )
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadingState>({ pending: 0, mutating: 0 })
  const [visible, setVisible] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => subscribeLoading(setState), [])

  useEffect(() => {
    if (state.pending > 0) {
      const showTimer = window.setTimeout(() => {
        setVisible(true)
        setCompleting(false)
      }, 120)
      return () => window.clearTimeout(showTimer)
    }

    if (!visible) return undefined

    setCompleting(true)
    const hideTimer = window.setTimeout(() => {
      setVisible(false)
      setCompleting(false)
    }, 320)
    return () => window.clearTimeout(hideTimer)
  }, [state.pending, visible])

  return (
    <>
      <GlobalLoadingBar
        pending={state.pending}
        mutating={state.mutating}
        visible={visible}
        completing={completing}
      />
      {children}
    </>
  )
}
