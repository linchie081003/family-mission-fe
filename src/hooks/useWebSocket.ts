import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { wsUrl } from '../lib/apiBase'

type WsHandler = (event: string, data: unknown) => void

const subscribers = new Set<WsHandler>()
let sharedWs: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let intentionalClose = false
let activeToken: string | null = null
let activeFamilyId: number | null = null

function notifySubscribers(event: string, data: unknown) {
  subscribers.forEach(handler => handler(event, data))
}

function disconnectShared() {
  intentionalClose = true
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  sharedWs?.close()
  sharedWs = null
}

function connectShared(token: string, familyId: number) {
  if (sharedWs && sharedWs.readyState <= WebSocket.OPEN && activeToken === token && activeFamilyId === familyId) {
    return
  }

  disconnectShared()
  intentionalClose = false
  activeToken = token
  activeFamilyId = familyId

  const ws = new WebSocket(wsUrl(familyId, token))

  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data)
      notifySubscribers(msg.event, msg)
    } catch {
      // ignore malformed payloads
    }
  }

  ws.onclose = () => {
    sharedWs = null
    if (!intentionalClose && activeToken && activeFamilyId) {
      reconnectTimer = setTimeout(() => {
        if (activeToken && activeFamilyId) {
          connectShared(activeToken, activeFamilyId)
        }
      }, 3000)
    }
  }

  sharedWs = ws
}

export function useWebSocket(onMessage: WsHandler) {
  const { token, familyId } = useAuth()
  const handlerRef = useRef(onMessage)
  handlerRef.current = onMessage

  const stableHandler = useCallback((event: string, data: unknown) => {
    handlerRef.current(event, data)
  }, [])

  useEffect(() => {
    subscribers.add(stableHandler)
    return () => {
      subscribers.delete(stableHandler)
    }
  }, [stableHandler])

  useEffect(() => {
    if (!token || !familyId) {
      disconnectShared()
      activeToken = null
      activeFamilyId = null
      return
    }
    connectShared(token, familyId)
  }, [token, familyId])
}
