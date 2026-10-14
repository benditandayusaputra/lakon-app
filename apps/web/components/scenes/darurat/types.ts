export type PoseWarga = 'netral' | 'lambai' | 'tunjuk' | 'telepon' | 'tenang'

export type TahapDarurat = 'luar' | 'kamera' | 'belajar' | 'ujian' | 'laporan'

export type KartuKejadian = {
  opsi: string
  judul: string
  sub: string
  gambar: 'sepeda' | 'dompet' | 'peta'
}

export const KARTU_KEJADIAN: KartuKejadian[] = [
  {
    opsi: 'Kehilangan dompet',
    judul: 'Kehilangan dompet',
    sub: 'Barang hilang, tidak ada yang terluka',
    gambar: 'dompet',
  },
  {
    opsi: 'Jatuh dari sepeda',
    judul: 'Jatuh dari sepeda',
    sub: 'Terjatuh saat bersepeda, ada luka',
    gambar: 'sepeda',
  },
  {
    opsi: 'Tersesat',
    judul: 'Tersesat',
    sub: 'Tidak tahu arah pulang',
    gambar: 'peta',
  },
]

export type TitikPeta = {
  opsi: string
  kode: string
  x: number
  y: number
}

export const TITIK_PETA: TitikPeta[] = [
  { opsi: 'Taman RW', kode: 'A', x: 22, y: 30 },
  { opsi: 'Perempatan depan pos', kode: 'B', x: 55, y: 58 },
  { opsi: 'Warung ujung jalan', kode: 'C', x: 84, y: 34 },
]

export const LOKASI_KEJADIAN_INDEX = 1

export type NomorDarurat = {
  opsi: string
  nama: string
  nomor: string
  sub: string
  badge?: string
}

export const NOMOR_DARURAT: NomorDarurat[] = [
  {
    opsi: 'Ambulans',
    nama: 'Ambulans',
    nomor: '119',
    sub: 'Luka, sakit, orang pingsan',
    badge: 'Untuk luka',
  },
  { opsi: 'Polisi', nama: 'Polisi', nomor: '110', sub: 'Kejahatan, kecelakaan lalu lintas' },
  { opsi: 'Damkar', nama: 'Pemadam kebakaran', nomor: '113', sub: 'Api, asap, gas bocor' },
]

export const NOMOR_PAJANGAN: Array<[string, string]> = [
  ['Darurat umum', '112'],
  ['Ambulans', '119'],
  ['Polisi', '110'],
  ['Damkar', '113'],
  ['SAR', '115'],
]

export type Laporan = {
  kejadian: KartuKejadian | null
  lokasi: TitikPeta | null
  pihak: NomorDarurat | null
}

export const LAPORAN_KOSONG: Laporan = { kejadian: null, lokasi: null, pihak: null }

export const prettify = (id: string) => id.replace(/-/g, ' ')

export const simpulUtama = (nodeId: string) => nodeId.replace(/^repair-/, '')
