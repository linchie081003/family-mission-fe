import confetti from 'canvas-confetti'

export function celebrate(type: 'level' | 'badge' | 'reward' | 'achievement' = 'achievement') {
  const colors = type === 'level'
    ? ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1']
    : type === 'badge'
    ? ['#a855f7', '#ec4899', '#f59e0b']
    : ['#22c55e', '#3b82f6', '#f97316']

  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors })

  if (type === 'level') {
    setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } }), 200)
    setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } }), 400)
  }

  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = type === 'level' ? 880 : 660
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch {}
}
