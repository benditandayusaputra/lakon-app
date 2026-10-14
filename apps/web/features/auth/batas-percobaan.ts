const jejak = new Map<string, { sisa: number; sampai: number }>()

export const bolehCoba = (kunci: string, maks = 10, jendelaMs = 15 * 60_000): boolean => {
  const sekarang = Date.now()
  if (jejak.size > 5_000) {
    for (const [lama, entri] of jejak) if (entri.sampai < sekarang) jejak.delete(lama)
  }
  const entri = jejak.get(kunci)
  if (!entri || entri.sampai < sekarang) {
    jejak.set(kunci, { sisa: maks - 1, sampai: sekarang + jendelaMs })
    return true
  }
  if (entri.sisa <= 0) return false
  entri.sisa -= 1
  return true
}

export const asalPermintaan = (request: Request): string =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'tanpa-ip'
