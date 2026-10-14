export type AttemptEntry = {
  signId: string
  similarity: number | null
  passed: boolean
  createdAt: number
}

export type RingkasanRiwayat = {
  total: number
  berhasil: number
  persenBerhasil: number
  rataKemiripan: number | null
}

export type RiwayatIsyarat = RingkasanRiwayat & { signId: string; percobaan: AttemptEntry[] }

const rataRata = (nilai: number[]) =>
  nilai.length > 0 ? Math.round(nilai.reduce((a, b) => a + b, 0) / nilai.length) : null

export const ringkas = (attempts: AttemptEntry[]): RingkasanRiwayat => {
  const berhasil = attempts.filter((attempt) => attempt.passed).length
  return {
    total: attempts.length,
    berhasil,
    persenBerhasil: attempts.length > 0 ? Math.round((berhasil / attempts.length) * 100) : 0,
    rataKemiripan: rataRata(
      attempts.flatMap((attempt) => (attempt.similarity === null ? [] : [attempt.similarity])),
    ),
  }
}

// Isyarat yang terakhir dilatih tampil paling atas; percobaan di dalamnya urut dari yang paling lama.
export const riwayatPerIsyarat = (attempts: AttemptEntry[]): RiwayatIsyarat[] => {
  const kelompok = new Map<string, AttemptEntry[]>()
  for (const attempt of [...attempts].sort((a, b) => a.createdAt - b.createdAt)) {
    kelompok.set(attempt.signId, [...(kelompok.get(attempt.signId) ?? []), attempt])
  }
  return [...kelompok]
    .map(([signId, percobaan]) => ({ signId, percobaan, ...ringkas(percobaan) }))
    .sort((a, b) => b.percobaan.at(-1)!.createdAt - a.percobaan.at(-1)!.createdAt)
}
