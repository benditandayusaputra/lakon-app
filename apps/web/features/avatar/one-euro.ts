import type { Point3 } from '../practice/protocol'

export type OneEuroParams = {
  minCutoff: number
  beta: number
  dCutoff: number
}

export const DEFAULT_ONE_EURO: OneEuroParams = {
  minCutoff: 1.4,
  beta: 0.4,
  dCutoff: 1.0,
}

const smoothingFactor = (cutoff: number, dtSeconds: number) => {
  const tau = 1 / (2 * Math.PI * cutoff)
  return 1 / (1 + tau / dtSeconds)
}

type Channel = { value: number; derivative: number }

type Series = { channels: Channel[]; lastTimestampMs: number }

export type LandmarkFilter = {
  filter: (points: Point3[], timestampMs: number, key: string) => Point3[]
  setParams: (params: Partial<OneEuroParams>) => void
  reset: () => void
}

const RESET_GAP_MS = 400

export const createLandmarkFilter = (initial: Partial<OneEuroParams> = {}): LandmarkFilter => {
  const params: OneEuroParams = { ...DEFAULT_ONE_EURO, ...initial }
  const seriesByKey = new Map<string, Series>()

  const filter = (points: Point3[], timestampMs: number, key: string): Point3[] => {
    const existing = seriesByKey.get(key)
    const gap = existing ? timestampMs - existing.lastTimestampMs : Infinity
    const dt = gap / 1000

    if (
      !existing ||
      existing.channels.length !== points.length * 3 ||
      gap <= 0 ||
      gap > RESET_GAP_MS
    ) {
      const channels = points.flatMap((p) => [
        { value: p.x, derivative: 0 },
        { value: p.y, derivative: 0 },
        { value: p.z, derivative: 0 },
      ])
      seriesByKey.set(key, { channels, lastTimestampMs: timestampMs })
      return points
    }

    existing.lastTimestampMs = timestampMs
    const aDerivative = smoothingFactor(params.dCutoff, dt)
    const output: Point3[] = []

    for (let i = 0; i < points.length; i++) {
      const point = points[i]!
      const raw = [point.x, point.y, point.z]
      const smoothed = [0, 0, 0]
      for (let axis = 0; axis < 3; axis++) {
        const channel = existing.channels[i * 3 + axis]!
        const rawDerivative = (raw[axis]! - channel.value) / dt
        channel.derivative = channel.derivative + aDerivative * (rawDerivative - channel.derivative)
        const cutoff = params.minCutoff + params.beta * Math.abs(channel.derivative)
        const a = smoothingFactor(cutoff, dt)
        channel.value = channel.value + a * (raw[axis]! - channel.value)
        smoothed[axis] = channel.value
      }
      output.push({ x: smoothed[0]!, y: smoothed[1]!, z: smoothed[2]! })
    }
    return output
  }

  const setParams = (next: Partial<OneEuroParams>) => {
    Object.assign(params, next)
  }

  const reset = () => seriesByKey.clear()

  return { filter, setParams, reset }
}
