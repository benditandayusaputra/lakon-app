export type PoseBarista = 'netral' | 'lambai' | 'tunjuk' | 'sajikan'

export type TahapKedai = 'luar' | 'kamera' | 'belajar' | 'ujian' | 'struk'

export type MenuKedai = {
  opsi: string
  nama: string
  sub: string
  harga: number
  badge?: string
}

export const MENU_UTAMA: MenuKedai[] = [
  {
    opsi: 'Kopi',
    nama: 'Kopi Susu',
    sub: 'Espresso, susu segar, gula aren',
    harga: 20000,
    badge: 'Favorit',
  },
  { opsi: 'Teh', nama: 'Teh Melati', sub: 'Daun melati diseduh hangat', harga: 12000 },
  { opsi: 'Cokelat', nama: 'Cokelat Panas', sub: 'Cokelat kental, susu steamed', harga: 25000 },
]

export const MENU_PAJANGAN: Array<[string, string]> = [
  ['Kopi Susu', '20rb'],
  ['Teh Melati', '12rb'],
  ['Cokelat Panas', '25rb'],
  ['Kopi Tubruk', '15rb'],
  ['Roti Bakar', '14rb'],
]

export const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`

export const prettify = (id: string) => id.replace(/-/g, ' ')

export const simpulUtama = (nodeId: string) => nodeId.replace(/^repair-/, '')
