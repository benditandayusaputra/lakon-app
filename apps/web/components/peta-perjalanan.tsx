'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Construction, Flag, FlagTriangleRight, Hand, Lock, Star } from 'lucide-react'
import { Bangunan, GedungLatar, Pohon, Taman } from '@/components/peta-bangunan'
import { Pejalan, type Karakter } from '@/components/pejalan'
import { ruasJalan, titikSeberang } from '@/features/ui/peta-jalan'
import { SCENE_ICONS } from '@/features/ui/adegan'
import { paletteFor } from '@/features/ui/tokens'

export type SimpulPeta = {
  id: string
  judul: string
  suasana: string
  isyarat: number
  menit: number
  href: string
  status?: 'buka' | 'kunci' | 'selesai'
  persen?: number
  keterangan?: string
}

export type TeksPeta = {
  adegan: string
  mulai: string
  ulangi: string
  terkunci: string
  isyarat: string
  menit: string
  mulaiDiSini: string
  garisAkhir: string
  segera: string
  adeganBaru: string
  segeraKeterangan: string
  dibangun: string
  kamuDiSini?: string
  rumah?: string
  sudahSelesai?: string
  belumDimulai?: string
  dikuasai?: string
}

const POSISI_X = [22, 74, 24, 76, 30] as const
const RUMAH_X = 60
const JUMLAH_SEGERA = 2
const durasiUntuk = (langkah: number) => Math.min(1400, Math.max(500, langkah * 450))
const POHON = [
  { x: 0.08, y: 0.1, cemara: false },
  { x: 0.06, y: 0.44, cemara: true },
  { x: 0.9, y: 0.74, cemara: false },
  { x: 0.95, y: 0.12, cemara: true },
  { x: 0.93, y: 0.32, cemara: true },
  { x: 0.04, y: 0.7, cemara: false },
  { x: 0.96, y: 0.52, cemara: false },
]

export function PetaPerjalanan({
  simpul,
  teks,
  posisiPemain,
  karakter = 'robot',
  onSampai,
}: {
  simpul: SimpulPeta[]
  teks: TeksPeta
  posisiPemain?: number
  karakter?: Karakter
  onSampai?: (item: SimpulPeta, index: number) => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [ukuran, setUkuran] = useState({ lebar: 0, s: 1 })
  const [tujuan, setTujuan] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const akar = parseFloat(getComputedStyle(document.documentElement).fontSize)
      setUkuran({ lebar: entry.contentRect.width, s: akar > 0 ? akar / 17 : 1 })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { lebar, s } = ukuran
  const segera = simpul.length > 0 ? JUMLAH_SEGERA : 0
  const total = simpul.length + segera
  const ponsel = lebar < 640
  const tinggiBaris = (ponsel ? 320 : 240) * s
  const atas = 250 * s
  const bawah = (ponsel ? 330 : 150) * s
  const tinggi = atas + Math.max(0, total - 1) * tinggiBaris + bawah

  const rumah = { x: (RUMAH_X / 100) * lebar, y: 96 * s }
  const semuaTitik = Array.from({ length: total }, (_, index) => ({
    x: ((POSISI_X[index % POSISI_X.length] ?? 50) / 100) * lebar,
    y: atas + index * tinggiBaris,
  }))
  const titik = semuaTitik.slice(0, simpul.length)
  const titikSegera = semuaTitik.slice(simpul.length)
  const akhir = {
    x: lebar * (total % 2 === 0 ? 0.26 : 0.72),
    y: tinggi - (ponsel ? 44 : 56) * s,
  }
  const jalur = [rumah, ...titik, akhir]
  const lebarJalan = (ponsel ? 36 : 44) * s
  const seberang = titik[1] && titik[2] ? titikSeberang(titik[1], titik[2]) : null
  const dSungai = seberang
    ? `M -40 ${seberang.y + 10 * s} Q ${seberang.x / 2} ${seberang.y + 22 * s} ${seberang.x} ${seberang.y} T ${lebar + 40} ${seberang.y - 10 * s}`
    : undefined
  const panjangJembatan = seberang
    ? Math.min(
        150 * s,
        (48 * s) / Math.max(0.35, Math.abs(Math.sin((seberang.sudut * Math.PI) / 180))),
      )
    : 0
  const d = ruasJalan(segera > 0 ? [rumah, ...titik] : jalur)
  const dBangun = segera > 0 ? ruasJalan([titik[titik.length - 1]!, ...titikSegera, akhir]) : null

  const pemain =
    typeof posisiPemain === 'number'
      ? Math.max(-1, Math.min(posisiPemain, simpul.length - 1))
      : null
  const posisi = (index: number) => (index < 0 ? rumah : titik[index]!)
  const asal = pemain !== null ? posisi(pemain) : undefined
  const langkah = tujuan !== null && pemain !== null ? Math.abs(tujuan - pemain) : 0
  const durasi = durasiUntuk(langkah)
  const jalurPemain =
    tujuan !== null && pemain !== null && langkah > 0
      ? ruasJalan(
          tujuan > pemain
            ? jalur.slice(pemain + 1, tujuan + 2)
            : jalur.slice(tujuan + 1, pemain + 2).reverse(),
        )
      : null
  const hadapPemain: 'kiri' | 'kanan' =
    tujuan !== null && pemain !== null && posisi(tujuan).x < posisi(pemain).x ? 'kiri' : 'kanan'

  const pilih = (item: SimpulPeta, index: number) => {
    if (!onSampai) return
    if (tujuan !== null) {
      if (timer.current) clearTimeout(timer.current)
      onSampai(item, index)
      return
    }
    const cepat =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTujuan(index)
    if (cepat || pemain === null || index === pemain) {
      timer.current = setTimeout(() => onSampai(item, index), cepat ? 0 : 400)
      return
    }
    timer.current = setTimeout(() => onSampai(item, index), durasiUntuk(Math.abs(index - pemain)))
  }

  const posisiKartu = (p: { x: number }, kiri: boolean) =>
    ponsel
      ? {
          top: 100 * s,
          [kiri ? 'left' : 'right']: -(kiri ? p.x : lebar - p.x) + lebar * 0.04 + 33 * s,
          width: lebar * 0.7,
        }
      : { top: 0, [kiri ? 'left' : 'right']: 83 * s, width: Math.min(300 * s, lebar * 0.4) }
  const kelasSimpul =
    'group absolute z-10 block h-[4.6rem] w-[3.9rem] -translate-x-1/2 -translate-y-full rounded-full'

  return (
    <div
      ref={ref}
      className="peta-jalan border-border-halus rounded-kartu-besar relative w-full overflow-hidden border shadow-inner"
      style={{ height: tinggi }}
    >
      {lebar > 0 && titik.length > 0 ? (
        <svg
          aria-hidden
          className="absolute inset-0"
          width={lebar}
          height={tinggi}
          viewBox={`0 0 ${lebar} ${tinggi}`}
        >
          {seberang ? (
            <g fill="none" strokeLinecap="round">
              {(
                [
                  ['#cfe3c9', 40],
                  ['#7fbbd8', 28],
                  ['#9fd0e6', 20],
                ] as const
              ).map(([warna, tebal]) => (
                <path key={warna} d={dSungai} stroke={warna} strokeWidth={tebal * s} />
              ))}
              <path
                className="peta-arus"
                d={dSungai}
                stroke="#ffffff"
                strokeOpacity={0.7}
                strokeWidth={1.6 * s}
                strokeDasharray={`${10 * s} ${26 * s}`}
              />
            </g>
          ) : null}
          {dBangun ? (
            <>
              <path
                d={dBangun}
                fill="none"
                stroke="rgb(0 0 0 / 0.1)"
                strokeWidth={(ponsel ? 36 : 44) * s}
                strokeLinecap="round"
                transform={`translate(0 ${7 * s})`}
              />
              <path
                d={dBangun}
                fill="none"
                stroke="#d3cfc2"
                strokeWidth={(ponsel ? 36 : 44) * s}
                strokeLinecap="round"
              />
              <path
                d={dBangun}
                fill="none"
                stroke="#c2b59b"
                strokeWidth={(ponsel ? 22 : 27) * s}
                strokeDasharray={`${16 * s} ${9 * s}`}
              />
              <path
                d={dBangun}
                fill="none"
                stroke="#e08a2e"
                strokeWidth={3 * s}
                strokeDasharray={`${6 * s} ${14 * s}`}
                strokeLinecap="round"
              />
            </>
          ) : null}
          <path
            d={d}
            fill="none"
            stroke="rgb(0 0 0 / 0.22)"
            strokeWidth={(ponsel ? 36 : 44) * s}
            strokeLinecap="round"
            transform={`translate(0 ${7 * s})`}
          />
          <path
            d={d}
            fill="none"
            stroke="#d3cfc2"
            strokeWidth={(ponsel ? 36 : 44) * s}
            strokeLinecap="round"
          />
          <path
            d={d}
            fill="none"
            stroke="#2f333a"
            strokeWidth={(ponsel ? 26 : 32) * s}
            strokeLinecap="round"
          />
          <path
            d={d}
            fill="none"
            stroke="#4a4f57"
            strokeWidth={(ponsel ? 22 : 27) * s}
            strokeLinecap="round"
            transform={`translate(0 ${-2 * s})`}
          />
          <path
            d={d}
            fill="none"
            stroke="#f2c94c"
            strokeWidth={3 * s}
            strokeDasharray={`${14 * s} ${12 * s}`}
            strokeLinecap="round"
          />
          {seberang ? (
            <g
              transform={`translate(${seberang.x} ${seberang.y}) rotate(${seberang.sudut})`}
              fill="#8a7f6a"
            >
              {[-1, 1].map((sisi) => (
                <rect
                  key={sisi}
                  x={-panjangJembatan / 2}
                  y={sisi * (lebarJalan / 2) - (sisi < 0 ? 4 : 0) * s}
                  width={panjangJembatan}
                  height={4 * s}
                  rx={2 * s}
                />
              ))}
            </g>
          ) : null}
          {POHON.filter((_, i) => !ponsel || i < 4).map(({ x, y, cemara }) => (
            <Pohon
              key={`${x}-${y}`}
              x={x * lebar}
              y={y * tinggi}
              skala={(ponsel ? 0.8 : 1.1) * s}
              cemara={cemara}
            />
          ))}
          {ponsel ? null : <GedungLatar x={0.2 * lebar} y={100 * s} skala={0.9 * s} />}
          {semuaTitik.map((p, index) => {
            const kiri = (POSISI_X[index % POSISI_X.length] ?? 50) < 50
            const Latar = index % 2 ? GedungLatar : Taman
            return (
              <Latar
                key={index}
                x={(kiri ? 0.82 : 0.18) * lebar}
                y={p.y - 30 * s}
                skala={(ponsel ? 0.7 : 0.95) * s}
              />
            )
          })}
          <Bangunan
            id="rumah"
            x={rumah.x + (ponsel ? 62 : 82) * s}
            y={rumah.y - 8 * s}
            skala={(ponsel ? 0.8 : 1) * s}
          />
          {semuaTitik.map((p, index) => {
            const kiri = (POSISI_X[index % POSISI_X.length] ?? 50) < 50
            const dx = (ponsel ? 78 : 112) * s
            const skala = (ponsel ? 0.72 : 1.25) * s
            const tepi = 46 * skala
            return (
              <Bangunan
                key={index}
                id={simpul[index]?.id ?? 'segera'}
                x={Math.min(lebar - tepi, Math.max(tepi, kiri ? p.x - dx : p.x + dx))}
                y={p.y - (ponsel ? 26 : 34) * s}
                skala={skala}
              />
            )
          })}
        </svg>
      ) : null}

      {lebar > 0 && titik.length > 0 ? (
        <>
          <span
            className="bg-panggung text-sorot absolute z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider shadow-md"
            style={{
              left: asal ? asal.x : rumah.x,
              top:
                (asal ? asal.y : rumah.y) -
                (asal && pemain !== null && pemain >= 0 ? (ponsel ? 104 : 132) : 84) * s,
              transform: 'translateX(-50%)',
            }}
          >
            <Flag aria-hidden size={13} />
            {pemain !== null && pemain >= 0
              ? (teks.kamuDiSini ?? teks.mulaiDiSini)
              : pemain === -1
                ? `${teks.rumah ?? 'Rumah'} · ${teks.kamuDiSini ?? teks.mulaiDiSini}`
                : `${teks.rumah ?? 'Rumah'} · ${teks.mulaiDiSini}`}
          </span>
          <span
            className="absolute z-20 flex flex-col items-center gap-1"
            style={{ left: akhir.x, top: akhir.y, transform: 'translate(-50%, -100%)' }}
          >
            <span className="bg-kartu border-border-halus text-teks flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider shadow-md">
              {segera > 0 ? (
                <Construction aria-hidden size={13} className="text-aksen" />
              ) : (
                <FlagTriangleRight aria-hidden size={13} className="text-berhasil" />
              )}
              {segera > 0 ? teks.dibangun : teks.garisAkhir}
            </span>
            <span aria-hidden className="bg-panggung h-6 w-1.5 rounded-full" />
          </span>
        </>
      ) : null}

      {lebar > 0
        ? simpul.map((item, index) => {
            const palette = paletteFor(item.id)
            const Icon = SCENE_ICONS[item.id] ?? Hand
            const status = item.status ?? 'buka'
            const kunci = status === 'kunci'
            const kiri = (POSISI_X[index % POSISI_X.length] ?? 50) < 50
            const p = titik[index]!
            const warna = kunci ? '#9a9385' : palette.accent
            const kartu = (
              <span
                className={`border-border-halus bg-kartu shadow-kartu-angkat rounded-kartu flex flex-col gap-0.5 border p-3 text-left ${
                  kunci ? 'opacity-80' : ''
                }`}
              >
                <span className="text-teks-samar font-mono text-xs font-bold uppercase tracking-[0.2em]">
                  {teks.adegan} {index + 1}
                  {kunci ? ` · ${teks.terkunci}` : ''}
                </span>
                <span
                  className={`font-display text-base font-semibold leading-tight sm:text-lg ${kunci ? 'text-teks-samar' : ''}`}
                  style={kunci ? undefined : { color: palette.deep }}
                >
                  {item.judul}
                </span>
                <span className="text-teks-sekunder text-xs sm:text-sm">
                  {item.keterangan ?? item.suasana}
                </span>
                <span className="text-teks-samar mt-0.5 font-mono text-[0.65rem]">
                  {item.isyarat} {teks.isyarat} · ±{item.menit} {teks.menit}
                </span>
                {typeof item.persen === 'number' && !kunci ? (
                  <span aria-hidden className="mt-1.5 flex items-center gap-2">
                    <span className="bg-terangkat h-1.5 flex-1 rounded-full">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${item.persen}%`, backgroundColor: palette.accent }}
                      />
                    </span>
                    <span className="text-teks-samar font-mono text-[0.65rem]">{item.persen}%</span>
                  </span>
                ) : null}
                {kunci ? null : (
                  <span
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold"
                    style={{ color: palette.accent }}
                  >
                    {status === 'selesai' ? teks.ulangi : teks.mulai}
                    <ArrowRight aria-hidden size={13} strokeWidth={2.5} />
                  </span>
                )}
              </span>
            )
            const pin = (
              <span
                aria-hidden
                className="relative flex h-[3.9rem] w-[3.9rem] items-center justify-center rounded-full border-4 border-white shadow-[0_12px_24px_-10px_rgba(0,0,0,0.6)] transition-transform group-hover:-translate-y-1 group-focus-visible:-translate-y-1"
                style={{ backgroundColor: warna }}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white"
                  style={{ color: kunci ? '#7c7568' : palette.deep }}
                >
                  {kunci ? (
                    <Lock size={20} strokeWidth={2.25} />
                  ) : (
                    <Icon size={24} strokeWidth={2} />
                  )}
                </span>
                <span
                  className="absolute -bottom-3 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-b-4 border-r-4 border-white"
                  style={{ backgroundColor: warna }}
                />
                <span className="bg-panggung text-sorot absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white font-mono text-xs font-bold">
                  {index + 1}
                </span>
                {status === 'selesai' ? (
                  <span
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-white"
                    style={{ backgroundColor: palette.accent }}
                  >
                    <Star size={12} strokeWidth={2.5} fill="currentColor" />
                  </span>
                ) : null}
              </span>
            )
            const isi = (
              <>
                {pin}
                <span className="absolute" style={posisiKartu(p, kiri)}>
                  {kartu}
                </span>
              </>
            )
            const label = [
              `${teks.adegan} ${index + 1}: ${item.judul}`,
              kunci
                ? teks.terkunci
                : status === 'selesai'
                  ? teks.sudahSelesai
                  : item.status
                    ? teks.belumDimulai
                    : null,
              !kunci && typeof item.persen === 'number'
                ? `${item.persen}% ${teks.dikuasai ?? teks.isyarat}`
                : null,
              item.keterangan,
            ]
              .filter(Boolean)
              .join(', ')
            if (onSampai && !kunci) {
              return (
                <button
                  key={item.id}
                  type="button"
                  className={kelasSimpul}
                  style={{ left: p.x, top: p.y }}
                  aria-label={label}
                  aria-busy={tujuan === index}
                  onClick={() => pilih(item, index)}
                >
                  {isi}
                </button>
              )
            }
            return kunci ? (
              <span
                key={item.id}
                className={kelasSimpul}
                style={{ left: p.x, top: p.y }}
                aria-label={label}
                role="img"
              >
                {isi}
              </span>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className={kelasSimpul}
                style={{ left: p.x, top: p.y }}
                aria-label={label}
              >
                {isi}
              </Link>
            )
          })
        : null}

      {lebar > 0
        ? titikSegera.map((p, urutan) => {
            const nomor = simpul.length + urutan + 1
            const kiri = (POSISI_X[(nomor - 1) % POSISI_X.length] ?? 50) < 50
            return (
              <span
                key={`segera-${nomor}`}
                className={kelasSimpul}
                style={{ left: p.x, top: p.y }}
                aria-label={`${teks.adegan} ${nomor}: ${teks.adeganBaru}, ${teks.segera}`}
                role="img"
              >
                <span
                  aria-hidden
                  className="border-border-tegas bg-terangkat relative flex h-[3.9rem] w-[3.9rem] items-center justify-center rounded-full border-4 border-dashed shadow-[0_12px_24px_-12px_rgba(0,0,0,0.35)]"
                >
                  <Construction size={24} strokeWidth={2} className="text-[#8a7f6a]" />
                  <span className="absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#8a7f6a] font-mono text-xs font-bold text-white">
                    {nomor}
                  </span>
                </span>
                <span className="absolute" style={posisiKartu(p, kiri)}>
                  <span className="rounded-kartu bg-halaman/90 flex flex-col gap-0.5 border-2 border-dashed border-[#c9bfa9] p-3 text-left">
                    <span className="text-aksen font-mono text-xs font-bold uppercase tracking-[0.2em]">
                      {teks.adegan} {nomor} · {teks.segera}
                    </span>
                    <span className="font-display text-teks-samar text-base font-semibold leading-tight sm:text-lg">
                      {teks.adeganBaru}
                    </span>
                    <span className="text-teks-sekunder text-xs sm:text-sm">
                      {teks.segeraKeterangan}
                    </span>
                  </span>
                </span>
              </span>
            )
          })
        : null}

      {lebar > 0 && titik.length > 0 && asal ? (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30"
          width={lebar}
          height={tinggi}
          viewBox={`0 0 ${lebar} ${tinggi}`}
        >
          <g transform={jalurPemain ? undefined : `translate(${asal.x} ${asal.y})`}>
            {jalurPemain ? (
              <animateMotion
                dur={`${durasi}ms`}
                fill="freeze"
                calcMode="linear"
                path={jalurPemain}
              />
            ) : null}
            <Pejalan
              karakter={karakter}
              berjalan={tujuan !== null && jalurPemain !== null}
              hadap={hadapPemain}
              y={-12 * s}
              skala={(ponsel ? 0.9 : 1) * s}
            />
          </g>
        </svg>
      ) : null}
    </div>
  )
}
