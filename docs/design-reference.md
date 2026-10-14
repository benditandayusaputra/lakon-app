# Referensi desain Lakon

Dokumen ini merangkum sistem desain yang berlaku di aplikasi. Sumber
kebenarannya adalah token di `apps/web/app/globals.css` dan palet adegan di
`apps/web/features/ui/tokens.ts`; bila berbeda, kode yang benar.

## Prinsip

1. **Panggung, bukan daftar kata.** Antarmuka memakai metafora teater: sorot,
   tirai, adegan. Pengguna "naik panggung" untuk berlatih satu situasi.
2. **Dua peran, satu adegan.** Sisi Tuli dan sisi pekerja layanan setara dan
   ditampilkan di permukaan antarmuka, bukan disembunyikan di menu.
3. **Zona tenang dan zona hidup.** Layar latihan dan peragaan netral dan
   stabil; kepribadian visual hanya ada di landing, kartu adegan, dan
   ringkasan.
4. **Visual lebih dulu.** Video penanda dan umpan balik visual jadi pusat
   layar; teks pendek dan sederhana.
5. **Tenang di saat genting.** Adegan darurat sengaja memakai palet paling
   tenang; ketegangan datang dari isi percakapan.
6. **Tanpa audio, tanpa metafora pendengaran** di visual maupun teks.

## Identitas

### Logo

Kotak membulat berwarna primary dengan huruf **L** warna kertas dan satu
titik emas sebagai sorot panggung.

| Elemen  | Spesifikasi                              |
| ------- | ---------------------------------------- |
| Kanvas  | `viewBox="0 0 64 64"`                    |
| Kotak   | `rx="14"`, isi `#2b6cb0` (primary)       |
| Huruf L | `M20 14v30h24v-8H30V14z`, isi `#faf7f2`  |
| Titik   | `cx=44 cy=19 r=5`, isi `#d9a521` (sorot) |
| Sumber  | `components/logo.tsx`, `app/icon.svg`    |

Aturan pemakaian:

- Ukuran minimum 16 px (favicon); di navigasi 28–30 px.
- Boleh di atas latar terang (`#f5f8fc`) maupun panggung gelap (`#0d1b2e`);
  tidak perlu varian lain karena kotak primary sudah kontras di keduanya.
- Jangan ubah warna titik emas; itu satu-satunya warna hangat di identitas.
- Nama "Lakon" ditulis dengan huruf judul (Fraunces), bukan huruf kapital semua.

## Warna

Semua warna didefinisikan sebagai token di blok `@theme` dan dipakai lewat
kelas Tailwind (`bg-primary`, `text-teks`, dan seterusnya). Jangan menulis
hex baru di komponen bila token sudah ada.

### Permukaan dan teks

| Token                   | Hex       | Peran                                  |
| ----------------------- | --------- | -------------------------------------- |
| `--color-halaman`       | `#f5f8fc` | Latar halaman (putih kebiruan)         |
| `--color-kartu`         | `#ffffff` | Latar kartu                            |
| `--color-terangkat`     | `#eaf0f7` | Permukaan terangkat, chip ikon         |
| `--color-border-halus`  | `#dbe3ee` | Garis pemisah                          |
| `--color-border-tegas`  | `#7a899f` | Garis kontrol (tombol sekunder, input) |
| `--color-teks`          | `#142033` | Teks utama (navy tinta)                |
| `--color-teks-sekunder` | `#44526a` | Teks pendukung                         |
| `--color-teks-samar`    | `#566377` | Keterangan, label tak aktif            |

### Primary (biru)

| Token                   | Hex       | Peran                                             |
| ----------------------- | --------- | ------------------------------------------------- |
| `--color-primary`       | `#2b6cb0` | Tombol utama, tautan, fokus, kartu terpilih, logo |
| `--color-primary-hover` | `#1f5290` | Hover dan tekan tombol primary                    |
| `--color-primary-tint`  | `#e8f0f9` | Latar kartu atau baris terpilih                   |

Teks di atas primary selalu putih (`#fff`). Primary bukan warna status;
jangan dipakai untuk "berhasil" atau "gagal".

### Panggung dan sorot

| Token                     | Hex       | Peran                                                                     |
| ------------------------- | --------- | ------------------------------------------------------------------------- |
| `--color-panggung`        | `#0d1b2e` | Latar hero dan navigasi gelap (navy)                                       |
| `--color-panggung-lantai` | `#08121f` | Lapisan terdalam panggung                                                 |
| `--color-sorot`           | `#8cc8ff` | Biru langit sorot: judul kecil, bar progres dan garis jalan di panggung |
| `--color-aksen`           | `#1f5f99` | Biru tua: ikon dan tautan sekunder di latar terang                              |

Sorot dan aksen bersifat dekoratif atau sekunder. Aksi utama selalu primary.

### Status

| Token                | Hex       | Dipakai untuk                              |
| -------------------- | --------- | ------------------------------------------ |
| `--color-berhasil`   | `#256b45` | Jawaban tepat, tahap selesai               |
| `--color-ulang`      | `#46536a` | "Belum tepat", coba lagi (netral tegas)    |
| `--color-peringatan` | `#8a5f10` | Peringatan yang bisa diabaikan             |
| `--color-galat`      | `#b3261e` | **Hanya** kegagalan sistem yang sebenarnya |

Merah tidak pernah dipakai untuk "belum tepat". Setiap status selalu
dipasangkan dengan ikon dan teks, tidak pernah warna saja.

### Zona tenang

`--color-zona-tenang` (`#6e7a86`) adalah latar abu-biru tetap di belakang
tangan pada layar latihan dan peragaan, dengan gradasi radial
(`.zona-tenang-gradasi`) untuk menyamakan luminans. Warna ini tidak berubah
mengikuti adegan agar penilaian bentuk tangan tidak terganggu.

### Palet adegan

Tiap adegan membawa empat warna lewat kelas `palet-*` (variabel
`--skenario-accent`, `--skenario-tint`, `--skenario-deep`,
`--skenario-ambient`). Definisi ada di `tokens.ts` dan `globals.css`.

| Adegan          | Kelas                   | Aksen     | Tint      | Dalam     | Ambient   | Suasana                 |
| --------------- | ----------------------- | --------- | --------- | --------- | --------- | ----------------------- |
| Kedai kopi      | `palet-kedai-kopi`      | `#b4632c` | `#f7eadb` | `#53300f` | `#c89b6e` | Amber pagi, kayu jati   |
| Puskesmas       | `palet-puskesmas`       | `#3e7d5e` | `#e7f2ea` | `#1d442f` | `#9dbfa9` | Hijau teduh             |
| Transportasi    | `palet-transportasi`    | `#33608c` | `#e4edf5` | `#1c3a55` | `#8fa9c0` | Beton, biru peron       |
| Wawancara kerja | `palet-wawancara-kerja` | `#8a6a45` | `#f4ede2` | `#453419` | `#c9b695` | Kedai pagi, kayu terang |
| Darurat         | `palet-darurat`         | `#5b7285` | `#e9eef2` | `#2c3a47` | `#a6b4c0` | Siang, paling tenang    |

Palet adegan hanya mewarnai ilustrasi dan kartu adegan. Tombol aksi di dalam
adegan tetap primary.

### Kontras (rasio WCAG)

Batas teks normal 4,5:1; komponen UI dan teks besar 3:1.

| Pasangan                         | Rasio   |
| -------------------------------- | ------- |
| Teks / halaman                   | 15,35:1 |
| Teks sekunder / halaman          | 7,41:1  |
| Teks samar / halaman             | 5,72:1  |
| Putih / primary                  | 5,42:1  |
| Putih / primary hover            | 7,87:1  |
| Primary / halaman (tautan)       | 5,09:1  |
| Primary / primary tint           | 4,71:1  |
| Berhasil / kartu                 | 6,43:1  |
| Ulang / kartu                    | 7,76:1  |
| Peringatan / kartu               | 5,64:1  |
| Galat / kartu                    | 6,54:1  |
| Aksen / halaman                  | 6,25:1  |
| Sorot / panggung                 | 9,74:1  |
| Halaman / panggung               | 16,25:1 |
| Primary / panggung (komponen UI) | 3,19:1  |

Primary di atas panggung gelap hanya memenuhi batas komponen UI (3:1), jadi
jangan menulis teks biru di atas panggung; pakai tombol primary berisi teks
putih atau teks warna halaman/sorot. Uji otomatis kontras primary ada di
`features/ui/primary-contrast.test.ts`.

## Tipografi

| Peran       | Huruf                                                            | Catatan                                    |
| ----------- | ---------------------------------------------------------------- | ------------------------------------------ |
| Judul       | Fraunces (`--font-display`, lewat `next/font`)                   | Serif kontras tinggi, kesan editorial      |
| Isi         | Font sistem (`--font-sans`)                                      | Tanpa unduhan tambahan, cepat di perangkat |
| Label kecil | Monospace sistem, `text-xs font-bold uppercase tracking-[0.2em]` | Judul kecil di atas judul bagian           |

- Ukuran dasar **17 px**, tinggi baris 1,6.
- Kalimat pendek dan sederhana; banyak pengguna Tuli membaca bahasa Indonesia
  tulis yang panjang dengan usaha ekstra.
- Layar besar: ukuran root dikali `--skala-layar`, naik bertahap di 1800, 2200,
  2500, 3000, dan 3600 px (1,12 sampai 1,8). Tata letak berbasis `rem` ikut
  menskala; ikon Lucide diskalakan dengan `zoom`.

## Bentuk, jarak, dan elevasi

| Token                   | Nilai  | Dipakai untuk                |
| ----------------------- | ------ | ---------------------------- |
| `--radius-kontrol`      | 10 px  | Tombol, input                |
| `--radius-kartu`        | 16 px  | Kartu                        |
| `--radius-kartu-besar`  | 24 px  | Panel besar, kartu peran     |
| `--shadow-kartu`        | lembut | Kartu diam                   |
| `--shadow-kartu-angkat` | dalam  | Kartu terpilih atau melayang |

Ukuran target sentuh minimum: tombol 48 px, tombol aksi besar 56 px, tautan
navigasi 44 px, penggeser 28 px.

## Komponen

### Tombol

| Kelas                  | Tampilan                                                       | Dipakai untuk                                      |
| ---------------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| `.tombol-utama`        | Isi primary, teks putih, tinggi 48 px                          | Aksi utama di panel, dialog, dan layar latihan     |
| `.tombol-sekunder`     | Garis `border-tegas`, latar transparan                         | Aksi pendamping (kembali, lewati, ulangi)          |
| `.tombol-cta`          | Isi primary, tinggi 56 px, bayangan biru, naik 2 px saat hover | Aksi besar di hero dan adegan ("Mulai", "Selesai") |
| `.tombol-garis-terang` | Garis terang di atas panggung gelap                            | Aksi pendamping di atas latar panggung             |

Aturan: satu tombol utama per tampilan; keadaan nonaktif memakai opacity 0,5;
fokus keyboard selalu berupa garis 3 px berwarna primary dengan jarak 2 px.

### Kartu dan pilihan

- Kartu: latar `kartu`, garis `border-halus`, radius 16 px, `shadow-kartu`.
- Pilihan terpilih (mis. kartu peran aktif): garis 2 px primary, latar
  `primary-tint`, `shadow-kartu-angkat`, chip ikon berisi primary berikon putih.
- Pilihan tidak aktif: garis `border-halus`, chip ikon `terangkat` berikon
  aksen.

### Progres

Bar setinggi kecil berujung bulat. Di latar panggung gelap isinya sorot (biru langit);
di latar terang mengikuti aksen adegan. Selalu ada teks angka atau persen di
dekatnya.

### Umpan balik latihan

Umpan balik terdiri dari **ikon + teks + posisi** (jari atau bagian tangan yang
perlu diperbaiki), tidak pernah warna saja:

| Keadaan          | Ikon (Lucide) | Warna    | Contoh teks                |
| ---------------- | ------------- | -------- | -------------------------- |
| Tepat            | `Check`       | berhasil | Bentuk tangan sudah sesuai |
| Belum tepat      | `RotateCcw`   | ulang    | Luruskan jari telunjuk     |
| Informasi        | ikon + teks   | primary  | Kamera bisa dilewati       |
| Kegagalan sistem | ikon + teks   | galat    | Kamera tidak bisa dibuka   |

### Peta perjalanan

Peta berlatar hijau pucat dengan jalan beraspal dan penanda tiap adegan
berwarna palet adegannya. Karakter berjalan dari rumah ke adegan berikutnya;
adegan terkunci diberi label "terkunci" dan "segera", bukan hanya diredupkan.

### Layar latihan

Video penanda atau avatar 3D di atas `zona-tenang`, overlay landmark digambar
ke canvas, area aman tangan ditentukan `HAND_SAFE_ZONE` di `tokens.ts`. Semua
tombol latihan punya alternatif keyboard dan jalur tanpa kamera.

## Gerak

| Token            | Durasi | Dipakai untuk                       |
| ---------------- | ------ | ----------------------------------- |
| `--gerak-cepat`  | 160 ms | Hover, tekan, perubahan warna       |
| `--gerak-sedang` | 240 ms | Buka-tutup panel, pergantian tab    |
| `--gerak-tahap`  | 420 ms | Perubahan suasana antartahap adegan |

Suasana adegan berubah lewat tiga tahap (`suasana-tahap-1` sampai `-3`) yang
mengatur blur, saturasi, dan kecerahan latar. Dengan `prefers-reduced-motion`,
semua animasi dan transisi dimatikan (durasi 0,01 ms) dan elemen yang
tersingkap langsung tampil.

## Aksesibilitas

Target WCAG 2.2 AA.

- Tidak ada umpan balik atau isyarat berupa suara.
- Tidak ada keadaan yang hanya dibedakan warna; selalu ada ikon dan teks.
- Merah hanya untuk kegagalan sistem, bukan "belum tepat".
- Setiap latihan gerakan punya alternatif keyboard.
- Setiap tempat yang memerlukan kamera punya jalur tanpa kamera.
- Fokus terlihat jelas (garis 3 px primary); urutan fokus mengikuti DOM.
- Perubahan keadaan diumumkan lewat `aria-live`.
- Hormati `prefers-reduced-motion`.
- Audit axe-core dan Lighthouse ada di
  [accessibility-audit](accessibility-audit/).

## Menambah atau mengubah desain

1. **Warna baru:** tambah token di `@theme`, jangan hex langsung di komponen.
2. **Adegan baru:** tambah entri di `SCENARIO_PALETTES` (`tokens.ts`) dan kelas
   `palet-*` di `globals.css` dengan empat variabel yang sama.
3. **Ubah warna primary:** ganti tiga token primary lalu jalankan `pnpm test`;
   uji kontras akan gagal bila teks putih atau tautan tidak lagi memenuhi 4,5:1.
4. **Tombol baru:** pakai kelas yang sudah ada; jangan membuat varian warna.

## Utang desain yang diketahui

- Ilustrasi adegan (SVG karakter, properti, latar) masih menulis hex langsung.
  Hex di kelas antarmuka yang sama dengan token sudah diganti kelas token.
- Huruf isi memakai font sistem; belum ada huruf isi khusus.
- Aksen per adegan belum diuji kontrasnya secara otomatis.
