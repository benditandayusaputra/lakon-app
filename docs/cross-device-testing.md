# Daftar periksa uji lintas perangkat (manual)

Jalankan pada build produksi (`LAKON_ALLOW_DRAFT=1 pnpm build && next start`).
Catat hasil di kolom yang kosong. Kolom "jalur" dibaca dari /dev/pipeline
(perlu akun admin).

## Matriks perangkat

| Perangkat / browser           | Jalur capture (diharapkan) | Backend MediaPipe | Backend klasifikasi | Laju inferensi                | Lulus? |
| ----------------------------- | -------------------------- | ----------------- | ------------------- | ----------------------------- | ------ |
| Chrome desktop (macOS/Win)    | track-processor            | GPU (WebGL)       | WebGPU              | ≥ 24 fps                      |        |
| Safari desktop                | video-frame-callback       | GPU (WebGL)       | WASM SIMD           | ≥ 24 fps                      |        |
| Firefox desktop               | video-frame-callback       | GPU/CPU           | WASM SIMD           | ≥ 24 fps                      |        |
| Chrome Android kelas menengah | track-processor            | GPU (WebGL)       | WASM SIMD           | **≥ 24 fps (anggaran keras)** |        |
| Safari iOS                    | video-frame-callback       | GPU (WebGL)       | WASM SIMD           | ≥ 24 fps                      |        |

Bila Android berjalan di bawah 24 fps, atasi dengan urutan ini (jangan pernah
menurunkan HandLandmarker):

1. Turunkan resolusi capture di `features/practice/capture.ts` (640×480 → 480×360).
2. Jalankan PoseLandmarker tiap 3 frame di `workers/cv.worker.ts`.
3. Turunkan `inferEvery` klasifikasi dari panel /dev/pipeline.

## Alur yang diperiksa di tiap perangkat

- [ ] Landing → blok coba-satu-isyarat tanpa masuk akun, kamera menyala, verifikasi berjalan
- [ ] Izin kamera ditolak → jalur "Latihan tanpa kamera" berfungsi
- [ ] /dev/mirror: telapak terbuka, kepalan, menunjuk; putar pergelangan 180°; dua tangan; tidak bergetar saat diam
- [ ] Uji dengan orang kidal dan ukuran tangan yang berbeda (gerbang M2)
- [ ] /dev/verify: sengaja salahkan satu jari → kalimat umpan balik menyebut jari itu (gerbang M6)
- [ ] Skenario penuh di arah A dan arah B sampai ringkasan
- [ ] Mode pesawat setelah pemuatan pertama → seluruh skenario tetap berjalan
- [ ] Progres bertahan setelah browser ditutup dan dibuka lagi
- [ ] prefers-reduced-motion aktif → transisi suasana mati

## Sebelum presentasi

- [ ] Rekam video demo 2–3 menit sebagai cadangan (aplikasi bergantung pada webcam dan pencahayaan)
- [ ] Panaskan sistem paling lambat 15 menit sebelum presentasi (cache SW terisi, model termuat)
- [ ] Siapkan perangkat cadangan yang sudah dipanaskan
- [ ] Uji demo dari jaringan yang bukan milik tim (hotspot lain)
- [ ] Pastikan akun demo (`demo@lakon.id`) punya progres: `node tools/seed.mjs`
- [ ] Periksa /dev/health hijau semua sebelum presentasi
