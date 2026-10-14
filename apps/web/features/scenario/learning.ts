import type { Scenario } from '@lakon/sign-schema'

export type MasteryStatus = 'belum' | 'berlatih' | 'dikuasai' | 'dinilai-sendiri'

export type SignProgress = {
  sign: string
  status: MasteryStatus
  attempts: number
  consecutiveFailures: number
  escapeAvailable: boolean
}

export const ESCAPE_AFTER_FAILURES = 3

export type LearningPhase = {
  snapshot: () => SignProgress[]
  restore: (entries: SignProgress[]) => void
  order: () => readonly string[]
  progress: () => readonly SignProgress[]
  progressFor: (sign: string) => SignProgress | null
  next: () => string | null
  recordResult: (sign: string, passed: boolean) => SignProgress
  selfAssessPass: (sign: string) => SignProgress
  isComplete: () => boolean
}

export const learningOrder = (scenario: Scenario): string[] => {
  const inNodeOrder: string[] = []
  for (const node of scenario.nodes) {
    if (node.task) {
      for (const role of ['deaf', 'service'] as const) {
        const task = node.task[role]
        if (task.type === 'point') continue
        if (!inNodeOrder.includes(task.sign)) inNodeOrder.push(task.sign)
      }
    }
  }
  const vocab = scenario.vocab.length > 0 ? scenario.vocab : inNodeOrder
  const ordered = inNodeOrder.filter((sign) => vocab.includes(sign))
  for (const sign of vocab) {
    if (!ordered.includes(sign)) ordered.push(sign)
  }
  return ordered
}

export const createLearningPhase = (scenario: Scenario): LearningPhase => {
  const order = learningOrder(scenario)
  const bySign = new Map<string, SignProgress>(
    order.map((sign) => [
      sign,
      { sign, status: 'belum', attempts: 0, consecutiveFailures: 0, escapeAvailable: false },
    ]),
  )

  const isDone = (progress: SignProgress) =>
    progress.status === 'dikuasai' || progress.status === 'dinilai-sendiri'

  return {
    snapshot: () => order.map((sign) => ({ ...bySign.get(sign)! })),
    restore(entries) {
      for (const entry of entries) {
        const progress = bySign.get(entry.sign)
        if (progress) Object.assign(progress, entry, { sign: progress.sign })
      }
    },
    order: () => order,
    progress: () => order.map((sign) => bySign.get(sign)!),
    progressFor: (sign) => bySign.get(sign) ?? null,
    next: () => order.find((sign) => !isDone(bySign.get(sign)!)) ?? null,
    recordResult(sign, passed) {
      const progress = bySign.get(sign)
      if (!progress) throw new Error(`isyarat di luar daftar belajar: ${sign}`)
      progress.attempts++
      if (passed) {
        progress.status = 'dikuasai'
        progress.consecutiveFailures = 0
      } else {
        progress.status = 'berlatih'
        progress.consecutiveFailures++
        if (progress.consecutiveFailures >= ESCAPE_AFTER_FAILURES) {
          progress.escapeAvailable = true
        }
      }
      return { ...progress }
    },
    selfAssessPass(sign) {
      const progress = bySign.get(sign)
      if (!progress) throw new Error(`isyarat di luar daftar belajar: ${sign}`)
      progress.status = 'dinilai-sendiri'
      return { ...progress }
    },
    isComplete: () => order.every((sign) => isDone(bySign.get(sign)!)),
  }
}
