/** Backend origin when FE/BE are split (e.g. Render static + Render web). Empty = same origin /api proxy. */
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const apiPath = normalized.startsWith('/api') ? normalized : `/api${normalized}`
  return API_BASE ? `${API_BASE}${apiPath}` : apiPath
}

export function wsUrl(familyId: number, token: string): string {
  if (API_BASE) {
    const origin = new URL(API_BASE)
    const protocol = origin.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${origin.host}/ws/${familyId}?token=${encodeURIComponent(token)}`
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/${familyId}?token=${encodeURIComponent(token)}`
}

export function assetUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  const normalized = path.startsWith('/') ? path : `/${path}`
  return API_BASE ? `${API_BASE}${normalized}` : normalized
}
