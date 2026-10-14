export type PosePewawancara = 'netral' | 'lambai' | 'tunjuk' | 'catat' | 'sajikan'

export type TahapWawancara = 'luar' | 'kamera' | 'belajar' | 'ujian' | 'hasil'

export type MenuTes = {
  opsi: string
  nama: string
  sub: string
  harga: number
  badge?: string
}

export const MENU_TES: MenuTes[] = [
  {
    opsi: 'Kopi Susu Aren',
    nama: 'Kopi Susu Aren',
    sub: 'Espresso, susu segar, gula aren',
    harga: 20000,
    badge: 'Favorit',
  },
  { opsi: 'Teh Melati', nama: 'Teh Melati', sub: 'Daun melati diseduh hangat', harga: 12000 },
  {
    opsi: 'Cokelat Panas',
    nama: 'Cokelat Panas',
    sub: 'Cokelat kental, susu steamed',
    harga: 25000,
  },
]

export const MENU_PAJANGAN: Array<{ nama: string; harga: string; favorit?: boolean }> = [
  { nama: 'Kopi Susu Aren', harga: '20rb', favorit: true },
  { nama: 'Kopi Tubruk', harga: '15rb' },
  { nama: 'Teh Melati', harga: '12rb' },
  { nama: 'Cokelat Panas', harga: '25rb' },
  { nama: 'Roti Bakar', harga: '14rb' },
]

export const JAM_WAWANCARA = '09.00'

export const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`

export const prettify = (id: string) => id.replace(/-/g, ' ')

export const simpulUtama = (nodeId: string) => nodeId.replace(/^repair-/, '')
