export const featureDistance = (a: Float32Array, b: Float32Array): number => {
  let sum = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0)
    sum += d * d
  }
  return Math.sqrt(sum)
}

export const dtw = (
  a: readonly Float32Array[],
  b: readonly Float32Array[],
  dist = featureDistance,
): number => {
  if (a.length === 0 || b.length === 0) return Infinity
  const w = b.length
  let prev = new Float64Array(w + 1).fill(Infinity)
  let curr = new Float64Array(w + 1).fill(Infinity)
  prev[0] = 0
  for (let i = 1; i <= a.length; i++) {
    curr[0] = Infinity
    for (let j = 1; j <= w; j++) {
      const c = dist(a[i - 1]!, b[j - 1]!)
      curr[j] = c + Math.min(prev[j]!, curr[j - 1]!, prev[j - 1]!)
    }
    const t = prev
    prev = curr
    curr = t
  }
  return prev[w]! / (a.length + b.length)
}

export type DtwPathPair = [number, number]

export type DtwResult = {
  score: number
  path: DtwPathPair[]
  pairDistances: number[]
}

export const dtwDetailed = (
  user: readonly Float32Array[],
  reference: readonly Float32Array[],
  dist = featureDistance,
): DtwResult => {
  const n = user.length
  const m = reference.length
  if (n === 0 || m === 0) return { score: Infinity, path: [], pairDistances: [] }

  const cost = new Float64Array((n + 1) * (m + 1)).fill(Infinity)
  const at = (i: number, j: number) => i * (m + 1) + j
  cost[at(0, 0)] = 0

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const c = dist(user[i - 1]!, reference[j - 1]!)
      cost[at(i, j)] =
        c + Math.min(cost[at(i - 1, j)]!, cost[at(i, j - 1)]!, cost[at(i - 1, j - 1)]!)
    }
  }

  const path: DtwPathPair[] = []
  let i = n
  let j = m
  while (i > 0 && j > 0) {
    path.push([i - 1, j - 1])
    const diagonal = cost[at(i - 1, j - 1)]!
    const up = cost[at(i - 1, j)]!
    const left = cost[at(i, j - 1)]!
    if (diagonal <= up && diagonal <= left) {
      i--
      j--
    } else if (up <= left) {
      i--
    } else {
      j--
    }
  }
  path.reverse()

  const pairDistances = path.map(([ui, rj]) => dist(user[ui]!, reference[rj]!))

  return { score: cost[at(n, m)]! / (n + m), path, pairDistances }
}

export const confidence = (distance: number, tolerance: number): number =>
  distance <= 0 ? 1 : Math.max(0, Math.min(1, 1 - distance / tolerance))
