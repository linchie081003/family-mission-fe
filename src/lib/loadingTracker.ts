export interface LoadingState {
  pending: number
  mutating: number
}

type Listener = (state: LoadingState) => void

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

let pending = 0
let mutating = 0
const listeners = new Set<Listener>()

function notify() {
  const state = { pending, mutating }
  listeners.forEach(listener => listener(state))
}

export function trackRequestStart(method = 'GET') {
  pending += 1
  if (MUTATING_METHODS.has(method.toUpperCase())) {
    mutating += 1
  }
  notify()
}

export function trackRequestEnd(method = 'GET') {
  pending = Math.max(0, pending - 1)
  if (MUTATING_METHODS.has(method.toUpperCase())) {
    mutating = Math.max(0, mutating - 1)
  }
  notify()
}

export function subscribeLoading(listener: Listener) {
  listeners.add(listener)
  listener({ pending, mutating })
  return () => {
    listeners.delete(listener)
  }
}
