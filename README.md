# Lakon

Aplikasi web untuk belajar Bahasa Isyarat Indonesia (BISINDO, varian Jakarta)
lewat skenario transaksi nyata. Pengguna mempelajari tiap isyarat dari video
penanda manusia asli atau avatar 3D, mempraktikkannya di depan webcam dengan
verifikasi langsung di perangkat, lalu memainkan simulasi percakapan bercabang
secara utuh.

Satu skenario, dua peran: sisi Tuli belajar menjalani transaksi, sisi pekerja
layanan belajar melayani pelanggan Tuli. Lakon adalah alat belajar bahasa untuk
kedua pihak — tidak pernah dibingkai sebagai bantuan untuk satu pihak.

**Demo langsung: <https://lakon-learn.vercel.app>** — Aplikasi berbahasa
Indonesia dan landing page punya pilihan bahasa Inggris. Latihan memakai webcam
(disarankan Chrome desktop); setiap latihan juga punya jalur tanpa kamera.

## Mengapa penting

Komunikasi antara orang Tuli dan pekerja layanan sering gagal di kedua sisi,
padahal kebanyakan alat hanya menerjemahkan isyarat untuk pihak yang
mendengar dan mengajarkan kosakata, bukan situasi utuh. Lakon mengajarkan
kedua pihak transaksi sehari-hari yang sama, dalam bahasa yang dipakai orang
Tuli Indonesia di antara mereka.

| SDG                                       | Kontribusi                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| 4 Pendidikan Berkualitas                  | Pelajaran BISINDO berbasis situasi nyata, di luar pendidikan khusus formal          |
| 10 Berkurangnya Kesenjangan               | Pekerja layanan belajar menyesuaikan diri, bukan membebankannya pada pelanggan Tuli |
| 8 Pekerjaan Layak dan Pertumbuhan Ekonomi | Skenario wawancara kerja dan keterampilan layanan yang inklusif                     |
| 3 Kehidupan Sehat dan Sejahtera           | Skenario puskesmas dan darurat                                                      |
| 11 Kota dan Permukiman Berkelanjutan      | Skenario transportasi untuk mobilitas mandiri                                       |

## Fitur

- **Lima adegan, dua peran**: kedai kopi, puskesmas, transportasi, darurat, dan
  wawancara kerja. Masing-masing berupa percakapan delapan langkah yang bisa
  dimainkan dari sisi Tuli atau sisi pekerja layanan, dengan progres dicatat
  per peran.
- **Peta perjalanan**: adegan terbuka berurutan dan karakter berjalan menuju
  adegan berikutnya; checkpoint melanjutkan adegan dari tempat pengguna
  berhenti.
- **Peragaan isyarat**: video penanda asli secara bawaan, atau avatar 3D dengan
  tampak depan, kanan, dan kiri; keduanya punya kecepatan 1×, 0,5×, dan 0,25×,
  putar per langkah, dan tombol cermin.
- **Latihan webcam yang diverifikasi di perangkat**: MediaPipe berjalan di Web
  Worker, dan DTW terhadap referensi terkompilasi menyorot bagian tangan yang
  perlu diperbaiki. Tidak ada frame video yang keluar dari perangkat. Pada
  tahap belajar, tiga kali gagal akan menampilkan peragaan dan pilihan
  membandingkan sendiri.
- **Latihan membaca untuk sisi layanan**: pelanggan berisyarat dan pengguna
  memilih maknanya.
- **Aksesibel sejak awal**: tanpa audio, tanpa keadaan yang hanya dibedakan
  warna, kontrol bisa dioperasikan dengan keyboard, dan mendukung
  `prefers-reduced-motion`.

## Akun contoh

Masuk di <https://lakon-learn.vercel.app/masuk>. Semua akun di bawah dibuat
oleh `node tools/seed.mjs`; menjalankannya lagi akan mengatur ulang progres
keempat akun `demo`.

| Email                 | Kata sandi       | Peran   | Yang terlihat                                                  |
| --------------------- | ---------------- | ------- | -------------------------------------------------------------- |
| `demo.baru@lakon.id`  | BaruLakon2026    | Pelajar | Akun baru: tanpa progres, hanya adegan 1 yang terbuka          |
| `demo.dua@lakon.id`   | DuaLakon2026     | Pelajar | Adegan 1–2 selesai, adegan 3 terbuka, di kedua peran           |
| `demo.penuh@lakon.id` | PenuhLakon2026   | Pelajar | Kelima adegan selesai di kedua peran, adegan baru segera hadir |
| `demo@lakon.id`       | CobaLakon2026    | Pelajar | Progres sebagian: kedai kopi selesai di sisi Tuli              |
| `bendi@lakon.id`      | BendiLakon2026   | Pelajar | Contoh pelajar                                                 |
| `kevin@lakon.id`      | KevinLakon2026   | Pelajar | Contoh pelajar                                                 |
| `jessica@lakon.id`    | JessicaLakon2026 | Pelajar | Contoh pelajar                                                 |
| `nawal@lakon.id`      | NawalLakon2026   | Pelajar | Contoh pelajar                                                 |

Akun-akun ini dipakai bersama, dan keempat akun `demo` tidak bisa menghapus
data belajar atau mengubah profilnya. Untuk memulai dari nol, daftarkan akun
sendiri di <https://lakon-learn.vercel.app/daftar>.

Akun internal `admin@lakon.id` dan `validator@lakon.id` membuka `/dev/*` dan
`/tools/*`. Kata sandinya tidak pernah di-commit: atur `SEED_ADMIN_PASSWORD`
dan `SEED_VALIDATOR_PASSWORD` di `.env` sebelum menjalankan
`node tools/seed.mjs`.

## Tumpukan teknologi

- Next.js App Router, TypeScript strict, Tailwind CSS
- React Three Fiber + three.js + @pixiv/three-vrm (avatar 3D)
- MediaPipe Tasks Vision di Web Worker (landmark tangan + pose, di-host sendiri)
- ONNX Runtime Web (WebGPU, cadangan WASM SIMD) untuk pengklasifikasi opsional
- Kompiler isyarat buatan sendiri: satu spesifikasi parametrik → keyframe avatar
  **dan** referensi verifikasi DTW (satu sumber kebenaran)
- Drizzle ORM + Postgres (Neon), autentikasi sesi, progres langsung disimpan ke
  database, cache offline lewat service worker
- Vitest (76 uji unit), Playwright (21 uji end-to-end termasuk alur offline dan
  kamera ditolak)

## Memulai

Prasyarat: Node.js 20.12 atau lebih baru, pnpm 9 atau lebih baru, database
Postgres [Neon](https://neon.tech) (aplikasi memakai driver serverless Neon;
paket gratis sudah cukup), dan akses internet pada saat pertama kali dijalankan
untuk mengunduh model MediaPipe. `ffmpeg` hanya diperlukan untuk
`pnpm peraga`, dan Python 3 dengan `training/requirements.txt` hanya untuk
pelatihan model.

```bash
pnpm install
cp .env.example .env                  # isi DATABASE_URL (Postgres Neon)
ln -s ../../.env apps/web/.env.local  # Next.js membaca berkas env dari apps/web
pnpm db:push                          # terapkan skema
node tools/seed.mjs                   # akun demo + admin + validator
pnpm dev                              # http://localhost:3000 (aset diunduh otomatis)
```

Di Windows, salin `.env` ke `apps/web/.env.local`, jangan ditautkan.

Video peragaan manusia: taruh klip yang sudah diganti namanya (misalnya
`SAMA SAMA.MP4`) di `content/BISINDO/` (tidak ikut git) lalu jalankan
`pnpm peraga`. Skrip ini memotongnya ke 4:3, meng-encode H.264 720p tanpa audio,
mengunggahnya ke Vercel Blob (private), dan menautkan tiap klip ke isyarat yang
namanya sama. Klip tidak ikut git; `pnpm dev` dan `pnpm build` mengunduhnya ke
`apps/web/public/peraga/` bila `BLOB_READ_WRITE_TOKEN` terisi di `.env`.

Build produksi: `LAKON_ALLOW_DRAFT=1 pnpm build`. Tanpa variabel itu, build
**gagal bila ada isyarat yang belum `approved`** — itu gerbang tata kelola
konten, dijalankan oleh skrip, bukan diserahkan pada ingatan.

Ke-16 isyarat di lima adegan masih berstatus draf yang diturunkan dari video
dan animasi BISINDO publik (sumber di [docs/attribution.md](docs/attribution.md)).
Statusnya dicatat sebagai draf di berkas datanya dan menunggu sesi validasi
oleh orang Tuli, sehingga demo langsung dibangun dengan `LAKON_ALLOW_DRAFT=1`;
antarmuka adegan belum menandainya sebagai draf.

`predev`/`prebuild` menjalankan `tools/fetch-assets.mjs`, yang menyalin WASM
MediaPipe dari node_modules dan mengunduh dua model landmark ke
`apps/web/public/` (di-host sendiri agar latihan tetap jalan offline dan tanpa
CDN).

Dua hal perlu diperbarui manual saat aset di baliknya berubah:

- Mengganti `apps/web/public/models/seed-san.vrm` membuat ukuran di
  `apps/web/features/avatar/seed-san-rig.ts` tidak berlaku lagi; berkas itu
  dibaca kompiler isyarat sebagai pengganti mengunduh avatar 10 MB. Buat ulang
  berkas tersebut dari VRM baru sebelum dipakai.
- Mengganti apa pun di `apps/web/public/models/` atau `/mediapipe/` memerlukan
  kenaikan `CACHE_VERSION` di `apps/web/public/sw.js`, kalau tidak perangkat
  yang sudah menyimpan berkas lama akan terus memakainya.

## Dokumentasi teknis

- [docs/architecture.md](docs/architecture.md) — diagram alur data, susunan
  paket, keputusan utama
- [docs/attribution.md](docs/attribution.md) — sumber isyarat, lisensi pihak
  ketiga, dan metadata izin yang tertanam di avatar VRM
- [docs/accessibility-audit/](docs/accessibility-audit/) — laporan axe-core (0
  pelanggaran di 10 layar) dan Lighthouse, anggaran performa (1 Sep 2026)
- [docs/cross-device-testing.md](docs/cross-device-testing.md) — daftar periksa
  manual lintas perangkat dan persiapan presentasi

Halaman internal (admin): `/dev/pipeline` (diagnostik CV), `/dev/mirror`
(cermin penyelesai rotasi), `/dev/compile` (pratinjau isyarat), `/dev/verify`
(penilaian DTW), `/dev/health` (kesehatan sistem), `/tools/collect` (pengumpul
data latih), `/tools/sign-editor` (editor isyarat dengan impor video ke draf).

Skrip: `pnpm test` (unit), `pnpm e2e` (Playwright, membangun produksi dan
memakai umpan kamera palsu), `pnpm check:content` (validator konten),
`pnpm typecheck`, `pnpm lint`, `python3 training/train.py` (pelatihan
pengklasifikasi + ekspor ONNX dengan laporan akurasi per kontributor).

## Keputusan desain yang diambil manual oleh tim

Ini keputusan manusia yang disengaja, dicatat di sini sesuai daftar periksa
serah terima desain kami:

- **Konsep dua arah** — setiap skenario bisa dimainkan dari sisi Tuli dan sisi
  layanan — adalah gagasan inti produk dan ditampilkan di antarmuka, bukan
  disembunyikan di menu.
- **Zona tenang vs. zona hidup**: layar latihan dan peragaan memakai latar
  netral tetap (`#6e7a86`) dengan gradasi radial penyeimbang luminans di
  belakang tangan; kepribadian (palet khas Betawi yang didesaturasi) hanya ada
  di landing page, kartu skenario, dan ringkasan.
- **Tidak ada merah untuk "belum tepat"** dan tidak ada keadaan yang hanya
  dibedakan warna; umpan balik selalu memasangkan ikon + teks + posisi. Merah
  dicadangkan untuk kegagalan sistem yang sebenarnya.
- **Skenario darurat (S5) sengaja memakai palet paling tenang** — orang yang
  cemas belajar lebih buruk; ketegangan datang dari isi percakapan.
- **Tipografi dasar 17 px**, kalimat pendek: banyak pengguna Tuli membaca
  bahasa Indonesia tulis yang panjang dengan usaha ekstra.
- **Tidak ada audio di mana pun**, dan tidak ada metafora pendengaran di teks.
- **Bentuk isyarat tidak pernah ditebak**: isyarat BISINDO baru diterbitkan
  setelah divalidasi oleh penanda atau juru bahasa isyarat Tuli (dijaga oleh
  gerbang build pada status review; demo saat ini mengabaikannya, dan setiap
  isyarat masih tercatat sebagai draf). Isyarat `uji-gerak` adalah uji teknis
  yang diberi label jujur.

## Kredit

Avatar 3D (pengganti selama pengembangan): **"Seed-san" © VirtualCast, Inc.**,
dipakai di bawah [VRM Public License 1.0](https://vrm.dev/licenses/1.0/).
Sumber isyarat, video peragaan manusia, serta lisensi pustaka dan font
tercantum di [docs/attribution.md](docs/attribution.md).
