export const HURUF = 'abcdefghijklmnopqrstuvwxyz'.split('')

export const idHuruf = (huruf: string) => `huruf-${huruf}`

export const geserHuruf = (huruf: string, langkah: number) =>
  HURUF[(HURUF.indexOf(huruf) + langkah + HURUF.length) % HURUF.length]!

export const hurufDariParam = (nilai: string | undefined) => {
  const huruf = nilai?.toLowerCase()
  return huruf && HURUF.includes(huruf) ? huruf : 'a'
}
