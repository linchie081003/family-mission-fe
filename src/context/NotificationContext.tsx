import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../api'
import { useAuth } from './AuthContext'
import { useWebSocket } from '../hooks/useWebSocket'
import { AppNotification } from '../types'
import { celebrate } from '../utils/celebrate'

export interface ToastItem {
  id: number
  title: string
  body: string
}

interface NotificationContextType {
  notifications: AppNotification[]
  unreadCount: number
  toasts: ToastItem[]
  refresh: () => Promise<void>
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  dismissToast: (id: number) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

let toastId = 0

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token, role, childId } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((title: string, body: string) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, title, body }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const refresh = useCallback(async () => {
    if (!token) return
    try {
      if (role === 'parent') {
        const [list, count] = await Promise.all([api.getNotifications(), api.getUnreadCount()])
        setNotifications(list)
        setUnreadCount(count.count)
      } else if (role === 'child') {
        const [list, count] = await Promise.all([api.getChildNotifications(), api.getChildUnreadCount()])
        setNotifications(list)
        setUnreadCount(count.count)
      }
    } catch {
      // ignore when backend unavailable
    }
  }, [token, role])

  const markRead = useCallback(async (id: number) => {
    if (role === 'parent') await api.markNotificationRead(id)
    else await api.markChildNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [role])

  const markAllRead = useCallback(async () => {
    if (role === 'parent') await api.markAllNotificationsRead()
    else await api.markAllChildNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }, [role])

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleWsNotification = useCallback((payload: {
    id?: number
    type?: string
    title?: string
    body?: string
    recipient_role?: string
    child_id?: number
    data?: Record<string, unknown>
    created_at?: string
  }) => {
    if (payload.recipient_role && payload.recipient_role !== role) return
    if (role === 'child' && payload.child_id && payload.child_id !== childId) return

    if (payload.id && payload.title && payload.body) {
      const n: AppNotification = {
        id: payload.id,
        type: payload.type || 'system',
        title: payload.title,
        body: payload.body,
        data: payload.data,
        is_read: false,
        child_id: payload.child_id,
        created_at: payload.created_at || new Date().toISOString(),
      }
      setNotifications(prev => [n, ...prev])
      setUnreadCount(prev => prev + 1)
      showToast(payload.title, payload.body)

      if (role === 'child') {
        if (payload.type === 'mission_approved') celebrate('achievement')
        if (payload.type === 'redemption_approved') celebrate('reward')
        if (payload.type === 'achievement') celebrate('achievement')
      }
    }
  }, [role, childId, showToast])

  useWebSocket((event, msg) => {
    const data = msg as { child_id?: number; data?: Record<string, unknown> }

    if (event === 'notification' && data.data) {
      handleWsNotification(data.data as Parameters<typeof handleWsNotification>[0])
      refresh()
      return
    }

    if (role === 'parent') {
      if (event === 'mission_pending' || event === 'redemption_pending') {
        refresh()
      }
    }

    if (role === 'child' && (!data.child_id || data.child_id === childId)) {
      if (event === 'inactivity_reminder') {
        showToast('Pengingat isi misi 📝', 'Sudah 1 hari belum isi misi. Yuk kerjakan task hari ini!')
        refresh()
      }
    }
  })

  useEffect(() => {
    if (token) refresh()
  }, [token, role, refresh])

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, toasts, refresh, markRead, markAllRead, dismissToast,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

export function NotificationBell({ onNavigate }: { onNavigate?: (n: AppNotification) => void }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = async (n: AppNotification) => {
    if (!n.is_read) await markRead(n.id)
    onNavigate?.(n)
    setOpen(false)
  }

  const dropdown = open ? (
    <>
      <div className="fixed inset-0 z-40 bg-black/10" onClick={() => setOpen(false)} aria-hidden="true" />
      <div className="fixed top-16 left-4 right-4 z-50 mx-auto max-w-sm max-h-[min(24rem,calc(100vh-5rem))] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white rounded-t-xl">
          <span className="font-bold text-sm text-gray-900">Notifikasi</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-primary-600 font-semibold whitespace-nowrap"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Belum ada notifikasi</p>
        ) : (
          notifications.slice(0, 20).map(n => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleClick(n)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!n.is_read ? 'bg-primary-50/50' : ''}`}
            >
              <p className="text-sm font-semibold text-gray-900">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString('id-ID')}
              </p>
            </button>
          ))
        )}
      </div>
    </>
  ) : null

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative p-2 hover:bg-white/10 rounded-lg"
        aria-label="Notifikasi"
        aria-expanded={open}
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {dropdown && createPortal(dropdown, document.body)}
    </div>
  )
}

export function ToastContainer() {
  const { toasts, dismissToast } = useNotifications()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto bg-gray-900 text-white rounded-xl px-4 py-3 shadow-lg animate-slide-down flex justify-between gap-2"
        >
          <div>
            <p className="font-semibold text-sm">{t.title}</p>
            <p className="text-xs text-gray-300 mt-0.5">{t.body}</p>
          </div>
          <button type="button" onClick={() => dismissToast(t.id)} className="text-gray-400 hover:text-white text-sm">✕</button>
        </div>
      ))}
    </div>
  )
}
