export type Kotak = { top: number; left: number; width: number; height: number }
type Ukuran = { width: number; height: number }

const JARAK = 16

export function posisiKartu(target: Kotak, kartu: Ukuran, layar: Ukuran) {
  const bawah = target.top + target.height + JARAK
  const atas = target.top - JARAK - kartu.height
  const top =
    bawah + kartu.height <= layar.height - JARAK
      ? bawah
      : atas >= JARAK
        ? atas
        : layar.height - kartu.height - JARAK
  const tengah = target.left + target.width / 2 - kartu.width / 2
  const left = Math.max(JARAK, Math.min(tengah, layar.width - kartu.width - JARAK))
  return { top, left }
}
