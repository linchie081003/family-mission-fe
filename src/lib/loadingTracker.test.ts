import { describe, it, expect } from 'vitest'
import { subscribeLoading, trackRequestEnd, trackRequestStart } from './loadingTracker'

describe('loadingTracker', () => {
  it('tracks pending and mutating requests', () => {
    let state = { pending: 0, mutating: 0 }
    const unsubscribe = subscribeLoading(next => {
      state = next
    })

    trackRequestStart('GET')
    expect(state.pending).toBe(1)
    expect(state.mutating).toBe(0)

    trackRequestStart('POST')
    expect(state.pending).toBe(2)
    expect(state.mutating).toBe(1)

    trackRequestEnd('POST')
    expect(state.pending).toBe(1)
    expect(state.mutating).toBe(0)

    trackRequestEnd('GET')
    expect(state.pending).toBe(0)

    unsubscribe()
  })
})
