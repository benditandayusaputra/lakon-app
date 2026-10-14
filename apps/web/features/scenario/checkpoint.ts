import type { Arah } from '@/features/progress/store'
import type { EngineSnapshot, ScenarioEngine } from './engine'
import type { LearningPhase, SignProgress } from './learning'

export type Checkpoint<E> = {
  tahap: 'belajar' | 'ujian'
  learnView: 'demo' | 'praktik'
  learning: SignProgress[]
  engine: EngineSnapshot
  ekstra: E
  elapsedMs?: number
}

export const buatCheckpoint = <E>(
  tahap: 'belajar' | 'ujian',
  learnView: 'demo' | 'praktik',
  learning: LearningPhase,
  engine: ScenarioEngine,
  ekstra: E,
  elapsedMs: number,
): Checkpoint<E> => ({
  tahap,
  learnView,
  learning: learning.snapshot(),
  engine: engine.snapshot(),
  ekstra,
  elapsedMs,
})

export const terapkanCheckpoint = <E>(
  cp: Checkpoint<E>,
  learning: LearningPhase,
  engine: ScenarioEngine,
) => {
  learning.restore(cp.learning)
  engine.restore(cp.engine)
}

export const keteranganCheckpoint = <E>(
  cp: Checkpoint<E>,
  learning: LearningPhase,
  engine: ScenarioEngine,
): string => {
  if (cp.tahap === 'belajar') {
    const selesai = learning
      .progress()
      .filter((item) => item.status === 'dikuasai' || item.status === 'dinilai-sendiri').length
    return `latihan isyarat ke-${Math.min(selesai + 1, learning.order().length)} dari ${learning.order().length}`
  }
  return `percakapan langkah ke-${engine.path().length}`
}

export const labelArah = (direction: Arah) => (direction === 'deaf' ? 'sisi Tuli' : 'sisi pekerja')

export const tahapSetelahMasuk = (direction: Arah, adaCheckpoint: boolean) =>
  direction === 'deaf' || adaCheckpoint ? 'kamera' : 'belajar'
