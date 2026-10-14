# Laporan performa Milestone 11

Tanggal: 2026-09-01. Semua angka berasal dari build produksi (`next build` +
`next start`) di mesin pengembangan (Apple Silicon), memakai emulasi seluler
Lighthouse dengan throttling bawaannya (lebih berat daripada 4G biasa).

## Anggaran dan status

| Anggaran (PRD/M11)                                    | Status                                                                                                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ekstraksi landmark ≥ 24 fps di Android kelas menengah | **Perlu diuji di perangkat fisik** — lihat docs/cross-device-testing.md. Mitigasi siap: turunkan resolusi input, jalankan PoseLandmarker tiap 3 frame.                               |
| Inferensi klasifikasi < 10 ms                         | Model < 500 ribu parameter (dijaga assert di training/train.py); ONNX contoh 270 KB berjalan di WebGPU. Angka akhir menunggu model yang dilatih dengan data nyata.                   |
| Main thread tidak pernah terblokir > 16 ms            | Semua ekstraksi landmark + inferensi berjalan di Web Worker; overlay digambar lewat ref. TBT Lighthouse: landing 660 ms (hidrasi awal), skenario 60 ms.                              |
| Layar latihan interaktif < 3 dtk di 4G                | TTI /skenario/[id]: **3,9 dtk** di bawah throttling seluler Lighthouse (≈ lebih lambat dari 4G); bundel awal 125 KB gzip → target tercapai di 4G sungguhan. Verifikasi di perangkat. |
| Bundel model < 1,5 MB                                 | Belum ada model produksi; arsitekturnya (MLP 26 ribu / TCN 66 ribu parameter ≈ 0,1–0,3 MB ONNX) jauh di bawah anggaran. Kuantisasi int8 tersedia (`--quantize`).                     |
| WASM MediaPipe dimuat malas                           | Ya — dimuat di worker saat modul latihan aktif, bukan di root layout.                                                                                                                |

## Hasil Lighthouse (build produksi)

| Halaman              | Performa | Aksesibilitas | LCP     | TBT    | TTI     |
| -------------------- | -------- | ------------- | ------- | ------ | ------- |
| / (landing)          | 83       | 100           | 2,0 dtk | 660 ms | 4,6 dtk |
| /skenario/kedai-kopi | 88       | 100           | 3,9 dtk | 60 ms  | 3,9 dtk |

Laporan lengkap: `lighthouse-landing.report.html`, `lighthouse-skenario.report.html`.

## Perbaikan yang diterapkan di milestone ini

1. Blok "coba satu isyarat" (three.js + VRM + MediaPipe) dipecah menjadi chunk
   dinamis yang hanya dimuat saat digulir ke dalam tampilan. First Load JS
   landing: 421 KB → 125 KB. LCP landing 58 dtk sebelum perbaikan dan 2,0 dtk
   sesudahnya.
2. Rig avatar (berkas VRM 10,4 MB) tidak lagi dimuat di tahap intro skenario,
   hanya saat masuk fase belajar. LCP halaman skenario 57,9 dtk → 3,9 dtk.
3. Target sentuh slider dinaikkan ke ≥ 28 px (temuan target-size axe).

## Audit aksesibilitas

axe-core (WCAG 2 A/AA + 2.2 AA) pada 10 layar: **0 pelanggaran** setelah dua
perbaikan (label input tersembunyi, ukuran target slider). Lihat
`axe-report.md`. Pemeriksaan khusus M11 yang dibangun dalam desain: tidak ada
keadaan yang dibedakan hanya oleh warna (ikon + teks di semua umpan balik),
alternatif tanpa kamera di setiap latihan, `prefers-reduced-motion`
menonaktifkan transisi, urutan fokus mengikuti DOM dengan indikator fokus 3 px,
dan perubahan keadaan diumumkan lewat `aria-live`.

## Masih menunggu perangkat nyata

Laju frame Android kelas menengah dan TTI 4G sungguhan tidak bisa diukur di
mesin pengembangan. Daftar periksa manual dan tombol mitigasinya ada di
docs/cross-device-testing.md; parameter mitigasi (resolusi capture, frekuensi
pose) cukup diubah di `features/practice/capture.ts` dan
`workers/cv.worker.ts`.
