export type PosePetugas = 'netral' | 'lambai' | 'tunjuk' | 'serahkan'

export type TahapTransportasi = 'luar' | 'kamera' | 'belajar' | 'ujian' | 'tiket'

export const HALTE_RUTE = [
  { kode: '01', nama: 'Halte Lakon' },
  { kode: '02', nama: 'Pasar Lama' },
  { kode: '03', nama: 'Balai Kota' },
  { kode: '04', nama: 'Taman Bunga' },
  { kode: '05', nama: 'Stasiun Timur' },
] as const

export const TUJUAN = 'Balai Kota'

export const HARGA_TIKET = 5000

export const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`

export const prettify = (id: string) => id.replace(/-/g, ' ')

export const simpulUtama = (nodeId: string) => nodeId.replace(/^repair-/, '')
