# Atribusi dan lisensi

## Pustaka dan font

| Sumber daya                                                 | Lisensi                               | Peran                                                                |
| ----------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| Next.js, React                                              | MIT                                   | Kerangka aplikasi                                                    |
| three.js                                                    | MIT                                   | Render 3D                                                            |
| @pixiv/three-vrm                                            | MIT                                   | Pemuat VRM dan rig humanoid                                          |
| @react-three/fiber                                          | MIT                                   | Integrasi three.js untuk React                                       |
| MediaPipe Tasks Vision (Google)                             | Apache-2.0                            | Ekstraksi landmark tangan dan pose di Web Worker                     |
| Model `hand_landmarker` dan `pose_landmarker_lite` (Google) | Apache-2.0                            | Bobot model landmark, diunduh oleh `tools/fetch-assets.mjs`          |
| ONNX Runtime Web (Microsoft)                                | MIT                                   | Inferensi pengklasifikasi opsional di Web Worker (WebGPU/WASM)       |
| Drizzle ORM                                                 | Apache-2.0                            | Akses database                                                       |
| @neondatabase/serverless                                    | MIT                                   | Driver Postgres untuk Neon                                           |
| Zod                                                         | MIT                                   | Validasi                                                             |
| Tailwind CSS                                                | MIT                                   | Penataan gaya                                                        |
| Ikon Lucide (`lucide-react`)                                | ISC                                   | Ikon                                                                 |
| Typeface Fraunces (Google Fonts, lewat `next/font`)         | SIL Open Font License 1.1             | Typeface                                                             |
| PyTorch                                                     | BSD-3-Clause                          | Pelatihan pengklasifikasi di `training/` (tidak dikirim ke produksi) |
| NumPy / ONNX / ONNX Runtime / onnxscript                    | BSD-3-Clause / Apache-2.0 / MIT / MIT | Ekspor ONNX di `training/` (tidak dikirim ke produksi)               |

## Avatar 3D dan metadata izin VRM-nya

Avatar: **Seed-san** (`apps/web/public/models/seed-san.vrm`), VRM 1.0, diambil
dari repositori spesifikasi resmi VRM Consortium (`vrm-c/vrm-specification`,
direktori samples).

`VRMC_vrm.meta` yang tertanam di berkas (dibaca langsung dari binernya):

| Bidang               | Nilai                           |
| -------------------- | ------------------------------- |
| name                 | Seed-san                        |
| authors              | VirtualCast, Inc.               |
| copyrightInformation | VirtualCast, Inc.               |
| licenseUrl           | https://vrm.dev/licenses/1.0/   |
| avatarPermission     | everyone                        |
| commercialUsage      | corporation                     |
| allowRedistribution  | true                            |
| modification         | allowModificationRedistribution |
| creditNotation       | **required**                    |

Syarat pencantuman kredit dipenuhi di sini dan di README:
**Avatar 3D: "Seed-san" © VirtualCast, Inc., dipakai di bawah VRM Public License 1.0.**

Rencana produksi memakai dua karakter buatan tim di VRoid Studio (lihat brief
karakter di dokumen desain); Seed-san adalah pengganti selama pengembangan
sampai model-model itu selesai.

## Sumber konten isyarat

Tim tidak mengarang bentuk isyarat BISINDO. Setiap isyarat di `content/signs/`
dibuat sebagai draf lewat impor video editor isyarat (jalur terbalik) dari
sumber publik di bawah ini dan tetap `draft` sampai penanda Tuli atau juru
bahasa isyarat bersertifikat menyetujuinya di bidang `review` pada berkas
tersebut. Build produksi menolak isyarat draf kecuali `LAKON_ALLOW_DRAFT=1`
diatur. Untuk kosakata, hanya bentuk isyarat yang diturunkan: tidak ada
rekaman atau gambar pihak ketiga yang disertakan. Satu-satunya pengecualian
adalah klip abjad (lihat bagian video peragaan di bawah). Stempel waktu klip
untuk tiap isyarat ada di bidang `notes`-nya.

| Isyarat                                                                  | Sumber                                                                                                                                                                      | Penanda                                            | Varian                                | Ketentuan                                                                       | Diakses     |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- | ----------- |
| halo, terima-kasih, sakit, sama-sama                                     | "PRIVATE LESSON IN SIGN LANGUAGE WITH SURYA SAHETAPY", Gogirl! TV, <https://www.youtube.com/watch?v=G_MnbyHWa50>                                                            | Surya Sahetapy                                     | Jakarta                               | Creative Commons (boleh dipakai ulang)                                          | 1 Sep 2026  |
| kopi                                                                     | "Belajar Bahasa Isyarat di Kopi Tuli", BenarNews Indonesia, <https://www.youtube.com/watch?v=0TBz-UHOYtM>                                                                   | Adhika Prakoso, pendiri Kopi Tuli (KOPTUL) Jakarta | Jakarta                               | Lisensi pemakaian ulang tidak dinyatakan; hanya bentuk isyarat yang dirujuk     | 1 Sep 2026  |
| maaf                                                                     | Animasi "Maaf", Starbucks Indonesia × Pusbisindo, di Kompas JEO "Kopi, Bahasa Isyarat, dan Rasa Aman", <https://jeo.kompas.com/kopi-bahasa-isyarat-dan-rasa-aman>           | Animasi; kosakata disusun bersama Pusbisindo       | Tidak dinyatakan                      | Lisensi pemakaian ulang tidak dinyatakan; hanya bentuk isyarat yang dirujuk     | 1 Sep 2026  |
| dingin, dokter, makan, manis, mata, minum, pahit, panas, perawat, tangan | Seri "Video Kosaisyarat BISINDO", Balai Bahasa Provinsi Jawa Timur (Kemendikdasmen), <https://balaibahasajatim.kemendikdasmen.go.id/video>                                  | Tidak disebutkan                                   | Jawa Timur                            | Publikasi pemerintah tanpa lisensi eksplisit; hanya bentuk isyarat yang dirujuk | 1 Sep 2026  |
| huruf-a sampai huruf-z                                                   | "Belajar Bahasa Isyarat (Perkenalan Dasar Abjad & Jari)", HaiDokter bekerja sama dengan GERKATIN dan PUSBISINDO, 11 Jan 2018, <https://www.youtube.com/watch?v=AZ8pT075NFI> | Tidak disebutkan                                   | Kemungkinan Jakarta, belum dipastikan | Lisensi pemakaian ulang tidak dinyatakan; klip ikut dimuat aplikasi             | 13 Okt 2026 |

Isyarat varian Jawa Timur akan diganti begitu sumber varian Jakarta tersedia.
`uji-gerak` adalah uji gerak teknis, bukan isyarat BISINDO. Kedelapan belas
kandidat bentuk tangan di `content/handshapes/` adalah kandidat anatomis dari
dokumen inventaris tim, bukan klaim tentang bentuk BISINDO. Delapan kandidat
tambahan untuk ejaan jari (`c-index`, `c-wide`, `hook-two`, `l-shape`, `r-hook`,
`three-mid`, `u-thumb`, `v-thumb`) disusun dengan menyamakan pose 3D terhadap klip abjad.

## Video peragaan manusia

Ke-16 klip peraga (disimpan di Vercel Blob, diunduh ke `apps/web/public/peraga/`
saat build) menampilkan anggota tim Lakon, Jessica
Anabella, sebagai penanda dan dipublikasikan atas persetujuannya; berkas mentahnya
tidak ikut git (`content/BISINDO/`).
`pnpm peraga` memotongnya ke 4:3, meng-encode ulang ke 720p tanpa audio, dan
menautkan tiap klip ke isyarat bernama sama lewat `media.video`. Video-video
ini tidak mengubah status `review` isyarat mana pun.

Ke-26 klip `huruf-*.mp4` di folder yang sama adalah potongan video HaiDokter ×
GERKATIN × PUSBISINDO di tabel atas, bukan rekaman tim. `pnpm peraga:abjad`
memotong bagian close-up tangan per huruf dari berkas mentah
`content/BISINDO/Abjad_Bisindo.mp4`. Izin pemakaian ulang dari pemilik video
belum didapat; halaman abjad mencantumkan sumbernya di bawah peraga.
