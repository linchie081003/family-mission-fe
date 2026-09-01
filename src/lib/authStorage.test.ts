import { describe, it, expect, beforeEach } from 'vitest'
import { clearAuth, loadAuth, saveAuth } from './authStorage'

describe('authStorage', () => {
  beforeEach(() => {
    clearAuth()
  })

  it('returns null when empty', () => {
    expect(loadAuth()).toBeNull()
  })

  it('persists parent session', () => {
    saveAuth({ token: 'abc', role: 'parent', familyId: 1, childId: null })
    const auth = loadAuth()
    expect(auth?.role).toBe('parent')
    expect(auth?.familyId).toBe(1)
    expect(auth?.token).toBe('abc')
  })

  it('persists platform admin without familyId', () => {
    saveAuth({ token: 'admin-token', role: 'platform_admin', familyId: null, childId: null })
    const auth = loadAuth()
    expect(auth?.role).toBe('platform_admin')
    expect(auth?.familyId).toBeNull()
  })

  it('clears session', () => {
    saveAuth({ token: 'abc', role: 'child', familyId: 2, childId: 5 })
    clearAuth()
    expect(loadAuth()).toBeNull()
  })
})
