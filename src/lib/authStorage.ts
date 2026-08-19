export type UserRole = 'parent' | 'child' | 'platform_admin'

export interface StoredAuth {
  token: string
  role: UserRole
  familyId: number | null
  childId: number | null
}

const KEYS = {
  token: 'fm_token',
  role: 'fm_role',
  familyId: 'fm_family_id',
  childId: 'fm_child_id',
} as const

const LEGACY_KEYS = ['token', 'role', 'familyId', 'childId']

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore quota / private mode errors
  }
}

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

function parseRole(value: string | null): UserRole | null {
  if (value === 'parent' || value === 'child' || value === 'platform_admin') return value
  return null
}

function parseId(value: string | null): number | null {
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function loadAuth(): StoredAuth | null {
  const token = safeGet(KEYS.token) ?? safeGet('token')
  const role = parseRole(safeGet(KEYS.role) ?? safeGet('role'))
  const familyId = parseId(safeGet(KEYS.familyId) ?? safeGet('familyId'))
  const childId = parseId(safeGet(KEYS.childId) ?? safeGet('childId'))

  if (!token || !role) return null
  if (role === 'platform_admin') {
    return { token, role, familyId: null, childId: null }
  }
  if (!familyId) return null
  return { token, role, familyId, childId }
}

export function saveAuth(auth: StoredAuth) {
  safeSet(KEYS.token, auth.token)
  safeSet(KEYS.role, auth.role)
  if (auth.familyId !== null) {
    safeSet(KEYS.familyId, String(auth.familyId))
    safeSet('familyId', String(auth.familyId))
  } else {
    safeRemove(KEYS.familyId)
    safeRemove('familyId')
  }
  if (auth.childId) {
    safeSet(KEYS.childId, String(auth.childId))
    safeSet('childId', String(auth.childId))
  } else {
    safeRemove(KEYS.childId)
    safeRemove('childId')
  }

  safeSet('token', auth.token)
  safeSet('role', auth.role)
}

export function clearAuth() {
  for (const key of Object.values(KEYS)) safeRemove(key)
  for (const key of LEGACY_KEYS) safeRemove(key)
}

export function getStoredToken(): string | null {
  return loadAuth()?.token ?? null
}
