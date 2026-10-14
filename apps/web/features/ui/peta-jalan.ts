export type Titik = { x: number; y: number }

export const TARIK = 0.55

export function ruasJalan(titik: Titik[]) {
  return titik
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const q = titik[i - 1]!
      const tarik = (p.y - q.y) * TARIK
      return `C ${q.x} ${q.y + tarik} ${p.x} ${p.y - tarik} ${p.x} ${p.y}`
    })
    .join(' ')
}

export function titikSeberang(q: Titik, p: Titik) {
  const sudut = Math.atan2((p.y - q.y) * (1 - TARIK), p.x - q.x)
  return { x: (q.x + p.x) / 2, y: (q.y + p.y) / 2, sudut: (sudut * 180) / Math.PI }
}
