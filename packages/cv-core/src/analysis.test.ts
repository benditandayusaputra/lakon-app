import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FEEDBACK_THRESHOLDS,
  analyzePath,
  createAutoSegmenter,
  createExplicitSegmenter,
  dtwDetailed,
  frameFeatures,
  translateFeedback,
  FLAGS_OFFSET,
  FRAME_FEATURE_DIM,
  maskUnusedHands,
  type Vec3,
} from './index'

const pose = () => {
  const points = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0 }))
  points[11] = { x: 0.2, y: 0, z: 0 }
  points[12] = { x: -0.2, y: 0, z: 0 }
  points[15] = { x: 0.25, y: 0.1, z: 0 }
  points[16] = { x: -0.25, y: 0.1, z: 0 }
  return points
}

const handWithRing = (ringCurled: boolean): Vec3[] => {
  const points: Vec3[] = [{ x: 0, y: 0, z: 0 }]
  const chains: [number, number][] = [
    [1, 0.02],
    [5, 0.015],
    [9, 0],
    [13, -0.015],
    [17, -0.03],
  ]
  for (const [, zBase] of chains) {
    for (let joint = 0; joint < 4; joint++) {
      points.push({ x: 0, y: -0.03 - joint * 0.025, z: zBase })
    }
  }
  if (ringCurled) {
    points[14] = { x: 0, y: -0.06, z: 0.02 }
    points[15] = { x: 0, y: -0.04, z: 0.04 }
    points[16] = { x: 0, y: -0.03, z: 0.05 }
  }
  return points
}

const frame = (ringCurled: boolean) =>
  frameFeatures({
    hands: [{ handedness: 'Left', world: handWithRing(ringCurled) }],
    pose: pose(),
  })

describe('analyzePath dan translateFeedback', () => {
  it('menunjuk jari yang benar-benar salah', () => {
    const reference = Array.from({ length: 10 }, () => frame(false))
    const user = Array.from({ length: 10 }, () => frame(true))
    const result = dtwDetailed(user, reference)
    const analysis = analyzePath(user, reference, result.path)
    const feedback = translateFeedback(analysis, {
      ...DEFAULT_FEEDBACK_THRESHOLDS,
      finger: 0.3,
    })

    expect(feedback.messages.some((message) => message.includes('jari manis'))).toBe(true)
    expect(feedback.messages.some((message) => message.includes('telunjuk'))).toBe(false)
    expect(
      feedback.highlights.some(
        (highlight) => highlight.side === 'Left' && highlight.part === 'ring',
      ),
    ).toBe(true)
  })

  it('gerakan identik menghasilkan pesan positif', () => {
    const reference = Array.from({ length: 8 }, () => frame(false))
    const result = dtwDetailed(reference, reference)
    const analysis = analyzePath(reference, reference, result.path)
    const feedback = translateFeedback(analysis)
    expect(feedback.messages).toEqual(['gerakan sudah sesuai referensi'])
    expect(analysis.joints.every((joint) => joint.distance < 1e-6)).toBe(true)
  })

  it('menemukan fase yang paling menyimpang', () => {
    const reference = Array.from({ length: 12 }, () => frame(false))
    const user = [
      ...Array.from({ length: 6 }, () => frame(false)),
      ...Array.from({ length: 6 }, () => frame(true)),
    ]
    const phaseByFrame = [
      ...Array.from({ length: 6 }, () => 0),
      ...Array.from({ length: 6 }, () => 1),
    ]
    const result = dtwDetailed(user, reference)
    const analysis = analyzePath(user, reference, result.path, phaseByFrame)
    expect(analysis.worstPhase).toBe(1)
  })
})

describe('segmentasi', () => {
  it('mode eksplisit: hitung mundur lalu jendela rekam', () => {
    const segmenter = createExplicitSegmenter({ countdownMs: 3000, windowMs: 2000 })
    const feature = frame(false)
    expect(segmenter.update(feature, 0).phase).toBe('countdown')
    expect(segmenter.update(feature, 2999).phase).toBe('countdown')
    expect(segmenter.update(feature, 3100).phase).toBe('recording')
    expect(segmenter.update(feature, 4900).phase).toBe('recording')
    const done = segmenter.update(feature, 5200)
    expect(done.phase).toBe('done')
    if (done.phase === 'done') expect(done.frames.length).toBe(2)
  })

  it('mode otomatis: mulai saat energi naik, berakhir saat tenang', () => {
    const segmenter = createAutoSegmenter({
      startEnergy: 0.5,
      endEnergy: 0.2,
      minDurationMs: 100,
      quietMs: 100,
    })
    const still = frame(false)
    const moving = () => {
      const f = new Float32Array(still)
      for (let i = 0; i < 60; i++) f[i] = (f[i] ?? 0) + Math.random() * 2
      return f
    }
    let t = 0
    let phase = segmenter.update(still, t).phase
    expect(phase).toBe('idle')
    for (let i = 0; i < 10; i++) {
      t += 33
      phase = segmenter.update(moving(), t).phase
    }
    expect(phase).toBe('recording')
    let result = segmenter.update(still, (t += 33))
    for (let i = 0; i < 20 && result.phase !== 'done'; i++) {
      result = segmenter.update(still, (t += 33))
    }
    expect(result.phase).toBe('done')
    if (result.phase === 'done') expect(result.frames.length).toBeGreaterThan(3)
  })

  it('tangan yang tidak dipakai referensi tidak memengaruhi skor dan kehadiran', () => {
    const reference = Array.from({ length: 8 }, () => frame(false))
    const user = Array.from({ length: 8 }, () =>
      frameFeatures({
        hands: [
          { handedness: 'Left', world: handWithRing(false) },
          { handedness: 'Right', world: handWithRing(true) },
        ],
        pose: pose(),
      }),
    )
    expect(user[0]![FLAGS_OFFSET + 1]).toBe(1)
    const masked = maskUnusedHands(user, reference)
    const result = dtwDetailed(masked, reference)
    expect(result.score).toBeLessThan(1e-6)
    const analysis = analyzePath(masked, reference, result.path)
    expect(analysis.hands.map((hand) => [hand.side, hand.present])).toEqual([['Left', true]])
  })

  it('dimensi fitur konsisten', () => {
    expect(frame(false).length).toBe(FRAME_FEATURE_DIM)
  })
})
