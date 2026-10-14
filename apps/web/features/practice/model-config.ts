// Model klasifikasi baru menentukan kelulusan bila diaktifkan; tanpa itu praktik memakai aturan kemiripan.
export const PAKAI_MODEL = process.env.NEXT_PUBLIC_PAKAI_MODEL === '1'
