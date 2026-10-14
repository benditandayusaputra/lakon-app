export type RawPrediction = {
  label: string
  confidence: number
}

export type StablePrediction = {
  label: string | null
  meanConfidence: number
  votes: number
}

export type StabilizerParams = {
  inferEvery: number
  bufferSize: number
  minVotes: number
  minConfidence: number
}

export const DEFAULT_STABILIZER: StabilizerParams = {
  inferEvery: 3,
  bufferSize: 10,
  minVotes: 6,
  minConfidence: 0.8,
}

export type PredictionStabilizer = {
  shouldInfer: () => boolean
  push: (prediction: RawPrediction) => StablePrediction
  current: () => StablePrediction
  setParams: (params: Partial<StabilizerParams>) => void
  reset: () => void
}

export const createPredictionStabilizer = (
  initial: Partial<StabilizerParams> = {},
): PredictionStabilizer => {
  const params: StabilizerParams = { ...DEFAULT_STABILIZER, ...initial }
  let buffer: RawPrediction[] = []
  let frameCounter = 0

  const evaluate = (): StablePrediction => {
    const counts = new Map<string, { votes: number; totalConfidence: number }>()
    for (const prediction of buffer) {
      const entry = counts.get(prediction.label) ?? { votes: 0, totalConfidence: 0 }
      entry.votes++
      entry.totalConfidence += prediction.confidence
      counts.set(prediction.label, entry)
    }
    let bestLabel: string | null = null
    let bestVotes = 0
    let bestMean = 0
    for (const [label, entry] of counts) {
      const mean = entry.totalConfidence / entry.votes
      if (entry.votes > bestVotes || (entry.votes === bestVotes && mean > bestMean)) {
        bestLabel = label
        bestVotes = entry.votes
        bestMean = mean
      }
    }
    const accepted =
      bestLabel !== null && bestVotes >= params.minVotes && bestMean >= params.minConfidence
    return {
      label: accepted ? bestLabel : null,
      meanConfidence: bestMean,
      votes: bestVotes,
    }
  }

  return {
    shouldInfer() {
      frameCounter++
      return frameCounter % Math.max(1, Math.round(params.inferEvery)) === 0
    },
    push(prediction) {
      buffer.push(prediction)
      if (buffer.length > params.bufferSize) buffer.shift()
      return evaluate()
    },
    current: evaluate,
    setParams(next) {
      Object.assign(params, next)
      while (buffer.length > params.bufferSize) buffer.shift()
    },
    reset() {
      buffer = []
      frameCounter = 0
    },
  }
}

export type VerdictKind = 'lulus' | 'lulus-dengan-catatan' | 'belum-tepat'

export type FusionInput = {
  expectedSign: string
  stableLabel: string | null
  dtwScore: number
  dtwThreshold: number
}

export type Verdict = {
  kind: VerdictKind
  reason: 'klasifikasi-dan-dtw' | 'klasifikasi-saja' | 'dtw-saja' | 'klasifikasi-salah'
}

export const fuseDecision = (input: FusionInput): Verdict => {
  const dtwOk = input.dtwScore <= input.dtwThreshold

  if (input.stableLabel === null) {
    return dtwOk
      ? { kind: 'lulus', reason: 'dtw-saja' }
      : { kind: 'belum-tepat', reason: 'dtw-saja' }
  }
  if (input.stableLabel === input.expectedSign) {
    return dtwOk
      ? { kind: 'lulus', reason: 'klasifikasi-dan-dtw' }
      : { kind: 'lulus-dengan-catatan', reason: 'klasifikasi-saja' }
  }
  return { kind: 'belum-tepat', reason: 'klasifikasi-salah' }
}
