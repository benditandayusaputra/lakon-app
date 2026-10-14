import type { ReactNode } from 'react'
import { paletteFor } from '@/features/ui/tokens'

const K = 14 / 30
const KACA = '#a9cde4'
const LAMPU = '#ffd98a'
const RODA = '#22262c'

function Balok({
  a = 30,
  b = 30,
  h,
  dasar = 30,
  atas,
  kiri,
  kanan,
  isiKiri,
  isiKanan,
}: {
  a?: number
  b?: number
  h: number
  dasar?: number
  atas: string
  kiri: string
  kanan: string
  isiKiri?: ReactNode
  isiKanan?: ReactNode
}) {
  const yKiri = dasar - a * K
  const yKanan = dasar - b * K
  return (
    <>
      <polygon points={`${-a},${yKiri - h} 0,${dasar - h} 0,${dasar} ${-a},${yKiri}`} fill={kiri} />
      <polygon
        points={`0,${dasar - h} ${b},${yKanan - h} ${b},${yKanan} 0,${dasar}`}
        fill={kanan}
      />
      <polygon
        points={`${-a},${yKiri - h} 0,${dasar - h} ${b},${yKanan - h} ${b - a},${yKiri + yKanan - dasar - h}`}
        fill={atas}
      />
      {isiKiri ? <g transform={`matrix(1 ${K} 0 1 ${-a} ${yKiri - h})`}>{isiKiri}</g> : null}
      {isiKanan ? <g transform={`matrix(1 ${-K} 0 1 0 ${dasar - h})`}>{isiKanan}</g> : null}
    </>
  )
}

function Jendela({
  kolom,
  baris,
  x,
  y,
  w,
  h,
  jarak,
  warna,
  nyala = [],
}: {
  kolom: number
  baris: number
  x: number
  y: number
  w: number
  h: number
  jarak: [number, number]
  warna: string
  nyala?: number[]
}) {
  return (
    <>
      {Array.from({ length: kolom * baris }, (_, i) => (
        <rect
          key={i}
          x={x + (i % kolom) * jarak[0]}
          y={y + Math.floor(i / kolom) * jarak[1]}
          width={w}
          height={h}
          rx={0.6}
          fill={nyala.includes(i) ? LAMPU : warna}
        />
      ))}
    </>
  )
}

function Roda({ x, y }: { x: number; y: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={2.6} fill={RODA} />
      <circle cx={x} cy={y} r={1} fill="#9aa3ad" />
    </>
  )
}

function KedaiKopi() {
  const p = paletteFor('kedai-kopi')
  return (
    <>
      <Balok
        h={26}
        atas="#7a4a24"
        kiri={p.tint}
        kanan={p.ambient}
        isiKiri={
          <>
            <rect x={6} y={1.5} width={18} height={3.5} rx={1} fill={p.deep} />
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i} fill={i % 2 ? '#fff8ea' : p.accent}>
                <rect x={i * 5} y={6} width={5} height={5} />
                <circle cx={i * 5 + 2.5} cy={11} r={2.5} />
              </g>
            ))}
            <rect x={3} y={14} width={15} height={10} rx={1} fill={LAMPU} />
            <path d="M 10.5 14 V 24 M 3 19 H 18" stroke={p.deep} strokeWidth={0.8} />
            <rect x={21} y={13} width={6} height={13} fill={p.deep} />
          </>
        }
        isiKanan={
          <>
            <rect x={6} y={9} width={9} height={8} rx={1} fill={LAMPU} />
            <rect x={19} y={13} width={6} height={9} fill="#2c2a28" />
            <path d="M 20.5 15.5 h 3 M 20.5 18 h 3" stroke="#f5f8fc" strokeWidth={0.6} />
          </>
        }
      />
      <g transform="translate(0 -12)">
        <ellipse cx={0} cy={0} rx={10} ry={2.6} fill="#fff8ea" stroke={p.deep} strokeWidth={1} />
        <path d="M -7 -12 h 14 l -2 11 h -10 Z" fill="#fff8ea" stroke={p.deep} strokeWidth={1.2} />
        <circle cx={8} cy={-8} r={3} fill="none" stroke={p.deep} strokeWidth={1.4} />
        <path
          className="peta-uap"
          d="M -3 -15 q -2 -3 0 -6 t 0 -6 M 3 -15 q -2 -3 0 -6 t 0 -6"
          fill="none"
          stroke="#fff8ea"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(-40 24)">
        <line x1={0} y1={0} x2={0} y2={-13} stroke={p.deep} strokeWidth={1.2} />
        <path d="M -9 -11 Q 0 -19 9 -11 Z" fill={p.accent} />
        <ellipse cx={0} cy={0} rx={5} ry={1.8} fill={p.deep} />
      </g>
    </>
  )
}

function Puskesmas() {
  const p = paletteFor('puskesmas')
  return (
    <>
      <g transform="translate(36 22)">
        <line x1={0} y1={0} x2={0} y2={-46} stroke="#9aa3ad" strokeWidth={1.4} />
        <rect x={0.7} y={-46} width={11} height={3.5} fill="#c8102e" />
        <rect x={0.7} y={-42.5} width={11} height={3.5} fill="#ffffff" />
      </g>
      <Balok
        a={34}
        b={28}
        h={22}
        atas="#c9d6cd"
        kiri="#f6f7f3"
        kanan="#d9e2db"
        isiKiri={
          <>
            <rect x={0} y={0} width={34} height={3} fill={p.accent} />
            <rect x={11.5} y={7} width={12} height={2.6} fill={p.accent} />
            <rect x={14} y={10} width={7} height={12} fill={KACA} />
            <Jendela kolom={2} baris={1} x={3} y={9} w={6} h={6} jarak={[22, 0]} warna={KACA} />
          </>
        }
        isiKanan={
          <>
            <rect x={0} y={0} width={28} height={3} fill={p.accent} />
            <Jendela kolom={3} baris={1} x={3} y={9} w={6} h={6} jarak={[8.5, 0]} warna={KACA} />
          </>
        }
      />
      <g transform="translate(-3 -14)">
        <path d="M -5 4 V 10 M 5 4 V 10" stroke="#9aa3ad" strokeWidth={1.4} />
        <rect
          x={-9}
          y={-14}
          width={18}
          height={18}
          rx={3}
          fill="#ffffff"
          stroke={p.accent}
          strokeWidth={1.4}
        />
        <path d="M -2.5 -11 h 5 v 5 h 5 v 5 h -5 v 5 h -5 v -5 h -5 v -5 h 5 Z" fill={p.accent} />
      </g>
    </>
  )
}

function Halte() {
  const p = paletteFor('transportasi')
  return (
    <>
      <g transform="translate(12 -8)">
        <Balok a={30} b={16} h={5} atas="#d6dde4" kiri="#b9c2cc" kanan="#98a3b0" />
        <g transform="translate(-2 -8)">
          <Balok
            a={9}
            b={9}
            h={13}
            atas={p.accent}
            kiri={p.tint}
            kanan={p.ambient}
            isiKiri={<rect x={1.5} y={3} width={6} height={5} fill={LAMPU} />}
          />
        </g>
        {[3, 16, 27].map((u) => (
          <line
            key={u}
            x1={-30 + u}
            y1={30 - 30 * K + u * K - 5}
            x2={-30 + u}
            y2={30 - 30 * K + u * K - 24}
            stroke="#5b6774"
            strokeWidth={1.6}
          />
        ))}
        <Balok a={33} b={18} h={3} dasar={8} atas={p.accent} kiri={p.deep} kanan="#264b6e" />
      </g>
      <g transform="translate(-14 14)">
        <Balok
          a={30}
          b={11}
          h={12}
          atas="#dfe8f1"
          kiri="#3f78b5"
          kanan="#2c5a8a"
          isiKiri={
            <>
              <rect x={2.5} y={2} width={25} height={4.5} rx={0.8} fill="#cfe6f7" />
              <path
                d="M 9 2 v 4.5 M 15.5 2 v 4.5 M 22 2 v 4.5"
                stroke="#3f78b5"
                strokeWidth={0.8}
              />
              <rect x={0} y={8} width={30} height={1.4} fill="#f2c94c" />
              <Roda x={6} y={12} />
              <Roda x={24} y={12} />
            </>
          }
          isiKanan={
            <>
              <rect x={1.5} y={1.5} width={8} height={5.5} rx={0.8} fill="#cfe6f7" />
              <circle cx={2.5} cy={10} r={0.9} fill={LAMPU} />
              <circle cx={8.5} cy={10} r={0.9} fill={LAMPU} />
            </>
          }
        />
      </g>
    </>
  )
}

function Kantor() {
  const p = paletteFor('wawancara-kerja')
  return (
    <>
      <Balok
        a={22}
        b={22}
        h={64}
        atas="#e6ecf2"
        kiri="#cfd8e3"
        kanan="#9fb0c3"
        isiKiri={
          <Jendela
            kolom={3}
            baris={7}
            x={3}
            y={5}
            w={4}
            h={4.5}
            jarak={[6, 7.5]}
            warna="#6d8cab"
            nyala={[1, 5, 9, 13, 18]}
          />
        }
        isiKanan={
          <Jendela
            kolom={3}
            baris={7}
            x={3}
            y={5}
            w={4}
            h={4.5}
            jarak={[6, 7.5]}
            warna="#55718f"
            nyala={[4, 11, 15]}
          />
        }
      />
      <path d="M 0 -44 V -58" stroke="#7a899f" strokeWidth={1.4} />
      <circle cx={0} cy={-59} r={1.6} fill={p.accent} />
      <g transform="translate(-12 10)">
        <Balok
          a={24}
          b={10}
          h={10}
          atas={p.accent}
          kiri={p.tint}
          kanan={p.ambient}
          isiKiri={
            <>
              <rect x={9} y={3} width={7} height={7} fill={KACA} />
              <rect x={2.5} y={3} width={4.5} height={4} fill={KACA} />
              <rect x={18} y={3} width={4.5} height={4} fill={KACA} />
            </>
          }
        />
      </g>
    </>
  )
}

function PosDarurat() {
  const p = paletteFor('darurat')
  return (
    <>
      <Balok
        a={26}
        b={26}
        h={20}
        atas="#b8c4ce"
        kiri="#f4f6f8"
        kanan="#cdd6de"
        isiKiri={
          <>
            {Array.from({ length: 7 }, (_, i) => (
              <rect
                key={i}
                x={i * 4}
                y={0}
                width={4}
                height={3}
                fill={i % 2 ? '#ffffff' : '#e08a2e'}
              />
            ))}
            <rect x={3} y={8} width={13} height={12} fill="#8b98a5" />
            <path d="M 3 11 h 13 M 3 14 h 13 M 3 17 h 13" stroke="#76838f" strokeWidth={0.7} />
            <rect x={19} y={10} width={5} height={10} fill={p.deep} />
          </>
        }
        isiKanan={
          <>
            {Array.from({ length: 7 }, (_, i) => (
              <rect
                key={i}
                x={i * 4}
                y={0}
                width={4}
                height={3}
                fill={i % 2 ? '#e08a2e' : '#ffffff'}
              />
            ))}
            <rect x={8} y={8} width={10} height={6} rx={0.8} fill={KACA} />
          </>
        }
      />
      <g transform="translate(0 -4)">
        <rect x={-4.5} y={-2} width={9} height={3} rx={0.8} fill={p.deep} />
        <path d="M -3.5 -2 a 3.5 3.5 0 0 1 7 0 Z" fill="#e08a2e" />
        <path
          className="peta-sirene"
          d="M -8 -7 l -3 -2 M 8 -7 l 3 -2 M 0 -9 v -3.5"
          stroke="#e08a2e"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(18 14)">
        <Balok
          a={11}
          b={26}
          h={12}
          atas="#e2e7ec"
          kiri="#ffffff"
          kanan="#eef1f4"
          isiKiri={<rect x={1.5} y={1.5} width={8} height={4.5} rx={0.8} fill={KACA} />}
          isiKanan={
            <>
              <rect x={0} y={6} width={26} height={1.8} fill="#e08a2e" />
              <path
                d="M 12 2 h 2 v 1.6 h 1.6 v 2 h -1.6 v 1.6 h -2 v -1.6 h -1.6 v -2 h 1.6 Z"
                fill="#e08a2e"
              />
              <rect x={20} y={1.5} width={4.5} height={3.5} rx={0.6} fill={KACA} />
              <Roda x={5} y={12} />
              <Roda x={21} y={12} />
            </>
          }
        />
      </g>
    </>
  )
}

function Rumah() {
  return (
    <>
      <Balok h={22} atas="#fbe9c9" kiri="#e4b46f" kanan="#b9803b" />
      <polygon points="-30,-6 0,-20 30,-6 0,-34" fill="#8a3b2d" opacity={0.95} />
      <polygon points="0,-34 30,-6 30,-2 0,-30" fill="#6e2f24" />
      <rect x={4} y={10} width={9} height={14} rx={1.5} fill="#5b3a1e" />
      <rect x={-22} y={2} width={8} height={7} rx={1} fill="#fff3d6" />
    </>
  )
}

function Segera() {
  return (
    <>
      <g fill="none" stroke="#9a9385" strokeWidth={2} strokeDasharray="5 4">
        <polygon points="-30,-6 0,-20 30,-6 0,8" />
        <polygon points="-30,-6 0,8 0,30 -30,16" />
        <polygon points="30,-6 0,8 0,30 30,16" />
      </g>
      <path d="M-22 22 L-16 8 L-10 22 Z" fill="#e08a2e" />
      <rect x={-19} y={13} width={6} height={3} fill="#fff8ea" />
      <path d="M14 26 L14 -30 M14 -30 L34 -30 M30 -30 L30 -18" stroke="#b9803b" strokeWidth={3} />
    </>
  )
}

function Umum({ id }: { id: string }) {
  const p = paletteFor(id)
  return (
    <Balok
      h={22}
      atas={p.tint}
      kiri={p.ambient}
      kanan={p.accent}
      isiKiri={
        <Jendela kolom={2} baris={1} x={6} y={8} w={7} h={6} jarak={[12, 0]} warna="#fff8ea" />
      }
      isiKanan={
        <Jendela kolom={2} baris={1} x={6} y={8} w={7} h={6} jarak={[12, 0]} warna="#fff8ea" />
      }
    />
  )
}

const BENTUK: Record<string, () => ReactNode> = {
  'kedai-kopi': KedaiKopi,
  puskesmas: Puskesmas,
  transportasi: Halte,
  'wawancara-kerja': Kantor,
  darurat: PosDarurat,
  rumah: Rumah,
  segera: Segera,
}

export function Bangunan({
  id,
  x,
  y,
  skala = 1,
}: {
  id: string
  x: number
  y: number
  skala?: number
}) {
  const Bentuk = BENTUK[id]
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`} aria-hidden>
      <ellipse cx={0} cy={28} rx={44} ry={10} fill="rgb(0 0 0 / 0.14)" />
      {Bentuk ? <Bentuk /> : <Umum id={id} />}
    </g>
  )
}

export function Pohon({
  x,
  y,
  skala = 1,
  cemara = false,
}: {
  x: number
  y: number
  skala?: number
  cemara?: boolean
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`} aria-hidden>
      <ellipse cx={2} cy={0} rx={9} ry={2.8} fill="rgb(0 0 0 / 0.13)" />
      <rect x={-1.6} y={-9} width={3.2} height={9} rx={1} fill="#7a5a3a" />
      {cemara ? (
        <>
          <polygon points="-10,-6 0,-22 10,-6" fill="#4f7d55" />
          <polygon points="-8,-14 0,-30 8,-14" fill="#5f9465" />
        </>
      ) : (
        <>
          <circle cx={0} cy={-16} r={10} fill="#6f9a5c" />
          <circle cx={-3.5} cy={-19} r={4.5} fill="#8fb77a" />
        </>
      )}
    </g>
  )
}

const LATAR = ['#dfe5ec', '#c9d2dc', '#b4c0cc'] as const

export function Taman({ x, y, skala = 1 }: { x: number; y: number; skala?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`} aria-hidden>
      <ellipse cx={0} cy={4} rx={44} ry={16} fill="#b9d3a8" opacity={0.7} />
      <ellipse cx={8} cy={6} rx={14} ry={5} fill="#9fd0e6" />
      <Pohon x={-26} y={2} />
      <Pohon x={-10} y={-6} cemara />
      <Pohon x={26} y={0} skala={0.85} />
      <g transform="translate(-14 12)">
        <rect x={-6} y={-3} width={12} height={2} rx={0.6} fill="#8a6a45" />
        <path d="M -5 -1 v 3 M 5 -1 v 3" stroke="#6b5235" strokeWidth={1} />
      </g>
    </g>
  )
}

export function GedungLatar({ x, y, skala = 1 }: { x: number; y: number; skala?: number }) {
  const deret = [
    { dx: -26, dy: -6, h: 34, a: 14, b: 14 },
    { dx: 4, dy: -10, h: 50, a: 14, b: 14 },
    { dx: 28, dy: 2, h: 24, a: 13, b: 13 },
  ]
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`} aria-hidden opacity={0.9}>
      <ellipse cx={4} cy={30} rx={50} ry={10} fill="rgb(0 0 0 / 0.1)" />
      {deret.map(({ dx, dy, h, a, b }, i) => (
        <g key={dx} transform={`translate(${dx} ${dy})`}>
          <Balok
            a={a}
            b={b}
            h={h}
            atas={LATAR[0]}
            kiri={LATAR[1]}
            kanan={LATAR[2]}
            isiKiri={
              <Jendela
                kolom={2}
                baris={Math.floor((h - 6) / 7)}
                x={2.5}
                y={4}
                w={3}
                h={3.5}
                jarak={[6, 7]}
                warna="#f5f8fc"
                nyala={[i + 1]}
              />
            }
          />
        </g>
      ))}
    </g>
  )
}
