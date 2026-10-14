import { Hand } from 'lucide-react'
import type { CSSProperties } from 'react'
import { NOMOR_PAJANGAN, TITIK_PETA } from './types'

const BIRU = '#33465a'
const BIRU_TUA = '#1f2d3a'
const AMBER = '#f2a93b'
const KRIM = '#f6f2ea'

export function Matahari({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="44" fill="rgba(255,236,190,0.35)" />
      <circle cx="50" cy="50" r="26" fill="#fff3cf" />
    </svg>
  )
}

export function AwanPutih({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg viewBox="0 0 160 60" className={className} style={style} aria-hidden>
      <ellipse cx="46" cy="40" rx="40" ry="18" fill="#ffffff" opacity="0.92" />
      <ellipse cx="86" cy="32" rx="44" ry="24" fill="#ffffff" opacity="0.92" />
      <ellipse cx="124" cy="42" rx="32" ry="16" fill="#ffffff" opacity="0.92" />
    </svg>
  )
}

export function Burung({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 24" className={className} aria-hidden>
      <path
        d="M4 14 q8 -10 16 0 M32 10 q8 -10 16 0"
        stroke="#41546b"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LampuSirene({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 60" className={className} aria-hidden>
      <rect x="22" y="44" width="36" height="8" rx="3" fill={BIRU_TUA} />
      <path d="M24 44 Q24 14 40 14 Q56 14 56 44 Z" fill="#f9c766" opacity="0.9" />
      <path d="M28 44 Q28 20 40 20 Q52 20 52 44 Z" fill="#ffd98a" />
      <g className="dr-sirene" style={{ transformOrigin: '40px 42px' }}>
        <path d="M40 42 L10 20 Q22 6 40 6 Z" fill="rgba(255,255,255,0.75)" />
      </g>
      <ellipse
        cx="40"
        cy="42"
        rx="30"
        ry="18"
        fill="rgba(255,214,140,0.28)"
        className="kk-lampu-nyala"
      />
    </svg>
  )
}

export function Kentongan({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 120" className={`kk-goyang ${className}`} aria-hidden>
      <line x1="30" y1="0" x2="30" y2="16" stroke={BIRU_TUA} strokeWidth="3" />
      <path d="M18 16 H42 Q46 60 42 104 Q30 112 18 104 Q14 60 18 16 Z" fill="#8a5a33" />
      <path d="M22 18 H38 Q41 60 38 100 Q30 106 22 100 Q19 60 22 18 Z" fill="#a8703f" />
      <rect x="27" y="30" width="6" height="56" rx="3" fill="#4a2b18" />
      <line
        x1="46"
        y1="52"
        x2="56"
        y2="86"
        stroke="#4a2b18"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function KerucutJalan({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 70" className={className} aria-hidden>
      <ellipse cx="30" cy="66" rx="26" ry="4" fill="rgba(0,0,0,0.25)" />
      <rect x="6" y="58" width="48" height="8" rx="2" fill={BIRU_TUA} />
      <path d="M20 58 L26 8 H34 L40 58 Z" fill="#f28c38" />
      <path d="M22.5 42 H37.5 L38.5 50 H21.5 Z" fill="#ffffff" />
      <path d="M24.5 26 H35.5 L36.5 34 H23.5 Z" fill="#ffffff" />
    </svg>
  )
}

export function SepedaJatuh({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 140" className={className} aria-hidden>
      <ellipse cx="110" cy="128" rx="96" ry="6" fill="rgba(0,0,0,0.22)" />
      <g transform="translate(10 12) rotate(-22 100 70)">
        <circle cx="50" cy="70" r="26" fill="none" stroke={BIRU_TUA} strokeWidth="5" />
        <circle cx="150" cy="70" r="26" fill="none" stroke={BIRU_TUA} strokeWidth="5" />
        <circle cx="50" cy="70" r="4" fill={BIRU_TUA} />
        <circle cx="150" cy="70" r="4" fill={BIRU_TUA} />
        <path
          d="M50 70 L84 30 H124 M50 70 L98 70 L84 30 M98 70 L124 30 M124 30 L150 70"
          fill="none"
          stroke="#c8553d"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M118 26 h16 M80 24 q-8 -4 -12 2"
          stroke={BIRU_TUA}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M94 28 h14 l-2 -8 h-10 Z" fill={BIRU_TUA} />
      </g>
    </svg>
  )
}

export function Pohon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 180" className={className} aria-hidden>
      <rect x="52" y="110" width="16" height="66" rx="4" fill="#6b4a32" />
      <g className="kk-daun-goyang">
        <circle cx="60" cy="70" r="46" fill="#5f8f5a" />
        <circle cx="34" cy="86" r="30" fill="#6f9e66" />
        <circle cx="88" cy="84" r="30" fill="#557f50" />
        <circle cx="60" cy="42" r="26" fill="#78a86e" />
      </g>
      <ellipse cx="60" cy="176" rx="34" ry="4" fill="rgba(0,0,0,0.2)" />
    </svg>
  )
}

export function TongSampah({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" className={className} aria-hidden>
      <ellipse cx="30" cy="76" rx="24" ry="4" fill="rgba(0,0,0,0.22)" />
      <path d="M10 18 H50 L46 74 H14 Z" fill="#5f7d5a" />
      <rect x="6" y="10" width="48" height="10" rx="3" fill="#4a6647" />
      <rect x="24" y="4" width="12" height="8" rx="2" fill="#4a6647" />
      <path d="M22 30 v34 M30 30 v34 M38 30 v34" stroke="rgba(0,0,0,0.18)" strokeWidth="3" />
    </svg>
  )
}

export function KotakP3K({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden>
      <rect
        x="6"
        y="14"
        width="88"
        height="60"
        rx="8"
        fill="#ffffff"
        stroke={BIRU}
        strokeWidth="4"
      />
      <rect x="34" y="6" width="32" height="12" rx="4" fill={BIRU} />
      <rect x="42" y="30" width="16" height="30" rx="3" fill="#3e8e5e" />
      <rect x="35" y="37" width="30" height="16" rx="3" fill="#3e8e5e" />
      <text x="50" y="70" textAnchor="middle" fontSize="8" fontWeight="700" fill={BIRU}>
        P3K
      </text>
    </svg>
  )
}

export function RadioHT({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 100" className={className} aria-hidden>
      <rect x="22" y="2" width="5" height="26" rx="2" fill={BIRU_TUA} />
      <rect x="8" y="26" width="34" height="70" rx="7" fill="#2b3a48" />
      <rect x="13" y="32" width="24" height="16" rx="3" fill="#1a2430" />
      <rect x="15" y="34" width="20" height="12" rx="2" fill="#5fd0a4" opacity="0.8" />
      <path
        d="M14 56 h22 M14 62 h22 M14 68 h22 M14 74 h22"
        stroke="#5c6b7a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="25" cy="86" r="4" fill={AMBER} className="kk-lampu-nyala" />
    </svg>
  )
}

export function JamDinding({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <circle cx="40" cy="40" r="36" fill="#ffffff" stroke={BIRU} strokeWidth="5" />
      {[0, 90, 180, 270].map((deg) => (
        <line
          key={deg}
          x1="40"
          y1="10"
          x2="40"
          y2="15"
          stroke={BIRU_TUA}
          strokeWidth="3"
          transform={`rotate(${deg} 40 40)`}
        />
      ))}
      <line
        x1="40"
        y1="40"
        x2="40"
        y2="20"
        stroke={BIRU_TUA}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="40"
        x2="56"
        y2="46"
        stroke={BIRU_TUA}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="46"
        x2="40"
        y2="14"
        stroke="#c8553d"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="dr-jarum-detik"
        style={{ transformOrigin: '40px 40px' }}
      />
      <circle cx="40" cy="40" r="3" fill={BIRU_TUA} />
    </svg>
  )
}

export function TeleponMeja({
  diangkat = false,
  className = '',
}: {
  diangkat?: boolean
  className?: string
}) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <path d="M12 72 H108 L100 44 H20 Z" fill="#2b3a48" />
      <rect x="34" y="50" width="52" height="16" rx="3" fill="#1a2430" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={40 + c * 15}
            y={52 + r * 4.5}
            width="10"
            height="3"
            rx="1"
            fill="#8fa3b5"
          />
        )),
      )}
      {diangkat ? (
        <path
          d="M18 40 Q12 26 26 24 L34 30 Q40 34 32 44"
          fill="none"
          stroke="#3b4c5c"
          strokeWidth="4"
          strokeLinecap="round"
          className="dr-kabel"
        />
      ) : (
        <g>
          <path d="M14 42 Q14 30 26 30 H94 Q106 30 106 42 L98 46 H22 Z" fill="#3b4c5c" />
          <path
            d="M14 42 Q22 34 32 40 M106 42 Q98 34 88 40"
            stroke="#2b3a48"
            strokeWidth="3"
            fill="none"
          />
          <path d="M20 44 q6 -8 14 -2" stroke="#4d6072" strokeWidth="2" fill="none" />
        </g>
      )}
      <circle
        cx="94"
        cy="60"
        r="3"
        fill={diangkat ? '#5fd0a4' : AMBER}
        className="kk-lampu-nyala"
      />
    </svg>
  )
}

export function GagangTelepon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 100" className={className} aria-hidden>
      <path
        d="M22 8 Q8 8 8 22 L14 34 Q18 40 26 38 L30 34 Q28 50 30 66 L26 62 Q18 60 14 66 L8 78 Q8 92 22 92 Q34 92 44 76 Q54 56 52 44 Q54 24 44 16 Q34 8 22 8 Z"
        fill="#2b3a48"
      />
    </svg>
  )
}

export function PapanNomorDarurat({
  judul = 'NOMOR DARURAT',
  kompak = false,
  className = '',
}: {
  judul?: string
  kompak?: boolean
  className?: string
}) {
  return (
    <div
      className={`dr-papan-nomor rounded-xl ${kompak ? 'p-2.5' : 'p-4'} ${className}`}
      aria-hidden
    >
      <p
        className={`text-center font-black uppercase tracking-[0.3em] text-[#ffd98a] ${kompak ? 'text-[8px]' : 'text-[11px]'}`}
      >
        {judul}
      </p>
      <div className="mx-auto mt-1.5 h-px w-16 bg-[#ffd98a]/50" />
      <ul className={kompak ? 'mt-1.5 space-y-1' : 'mt-2.5 space-y-1.5'}>
        {NOMOR_PAJANGAN.map(([nama, nomor]) => (
          <li
            key={nama}
            className={`flex items-center gap-2 whitespace-nowrap text-[#e6edf2] ${kompak ? 'text-[10px]' : 'text-sm'}`}
          >
            <span
              className={`rounded-md bg-[#f2a93b] font-mono font-black text-[#1f2d3a] ${kompak ? 'px-1 text-[10px]' : 'px-1.5 py-0.5 text-sm'}`}
            >
              {nomor}
            </span>
            <span className="min-w-2 flex-1 border-b border-dotted border-[#8fa3b5]/40" />
            <span className={kompak ? 'hidden font-bold sm:inline' : 'font-bold'}>{nama}</span>
          </li>
        ))}
      </ul>
      {kompak ? null : (
        <p className="kk-font-kapur mt-3 text-center text-base text-[#9fd8c0]">
          tenang · jelas · tunjuk nomornya
        </p>
      )}
    </div>
  )
}

export function PetaLingkungan({
  tandaiIndex,
  judul = 'PETA LINGKUNGAN RW 05',
  ringkas = false,
  className = '',
}: {
  tandaiIndex?: number
  judul?: string
  ringkas?: boolean
  className?: string
}) {
  return (
    <div
      className={`dr-kertas rounded-kartu border-2 border-[#8fa3b5] shadow-lg ${ringkas ? 'p-2' : 'p-3'} ${className}`}
      aria-hidden
    >
      <p
        className={`text-center font-black uppercase text-[#33465a] ${ringkas ? 'whitespace-nowrap text-[7px] tracking-[0.2em]' : 'text-[10px] tracking-[0.3em]'}`}
      >
        {judul}
      </p>
      <svg viewBox="0 0 100 70" className="mt-2 w-full rounded-lg bg-[#e6f0e6]">
        <rect x="0" y="0" width="100" height="70" fill="#e4eee2" />
        <rect x="8" y="12" width="26" height="24" rx="3" fill="#b9d9a8" />
        <path
          d="M14 18 q5 -6 10 0 M20 24 q5 -6 10 0"
          stroke="#6a9a5c"
          strokeWidth="1.5"
          fill="none"
        />
        <rect x="0" y="52" width="100" height="10" fill="#c5ccd3" />
        <rect x="50" y="0" width="10" height="70" fill="#c5ccd3" />
        <path d="M0 57 H100 M55 0 V70" stroke="#f4f4f4" strokeWidth="1" strokeDasharray="3 3" />
        <rect x="64" y="14" width="30" height="18" rx="2" fill="#f1d9b5" />
        <rect x="66" y="18" width="10" height="8" fill="#e0b070" />
        <rect x="80" y="18" width="10" height="8" fill="#e0b070" />
        <rect
          x="40"
          y="36"
          width="8"
          height="10"
          rx="1"
          fill="#dfe6ec"
          stroke="#33465a"
          strokeWidth="1"
        />
        <path d="M42 38 h4 v2 h-4 Z" fill="#f2a93b" />
        <rect x="12" y="40" width="26" height="8" rx="1" fill="#e8ded0" />
        <rect x="66" y="40" width="28" height="8" rx="1" fill="#e8ded0" />
        {TITIK_PETA.map((titik, index) => {
          const aktif = tandaiIndex === index
          return (
            <g key={titik.kode} transform={`translate(${titik.x} ${titik.y})`}>
              {aktif ? (
                <circle
                  r="7"
                  fill="rgba(200,85,61,0.25)"
                  className="dr-denyut"
                  style={{ transformOrigin: '0 0' }}
                />
              ) : null}
              <path
                d="M0 2 C-4 -3 -4 -9 0 -9 C4 -9 4 -3 0 2 Z"
                fill={aktif ? '#c8553d' : '#33465a'}
                transform="scale(1.3)"
              />
              <circle cy="-6.5" r="2.4" fill="#ffffff" />
              <text y="8" textAnchor="middle" fontSize="4.2" fontWeight="800" fill="#1f2d3a">
                {titik.kode}
              </text>
            </g>
          )
        })}
        <text x="21" y="10" textAnchor="middle" fontSize="3.6" fill="#33465a" fontWeight="700">
          TAMAN RW
        </text>
        <text x="44" y="34" textAnchor="middle" fontSize="3.4" fill="#33465a" fontWeight="700">
          POS
        </text>
        <text x="79" y="12" textAnchor="middle" fontSize="3.4" fill="#33465a" fontWeight="700">
          WARUNG
        </text>
      </svg>
      <ul
        className={`mt-2 grid grid-cols-3 gap-1 text-[10px] font-bold text-[#33465a] ${ringkas ? 'hidden' : ''}`}
      >
        {TITIK_PETA.map((titik) => (
          <li key={titik.kode} className="flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#33465a] text-[9px] text-white">
              {titik.kode}
            </span>
            <span className="truncate">{titik.opsi}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function GambarKejadian({
  jenis,
  className = '',
}: {
  jenis: 'sepeda' | 'dompet' | 'peta'
  className?: string
}) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <ellipse cx="60" cy="92" rx="40" ry="5" fill="rgba(31,45,58,0.12)" />
      {jenis === 'sepeda' ? (
        <g transform="translate(10 8) scale(0.5)">
          <SepedaJatuhPath />
        </g>
      ) : jenis === 'dompet' ? (
        <g>
          <rect x="24" y="30" width="72" height="48" rx="8" fill="#8a5a33" />
          <rect x="24" y="40" width="72" height="10" fill="#6b4226" />
          <rect x="70" y="50" width="26" height="14" rx="3" fill="#a8703f" />
          <circle cx="86" cy="57" r="3" fill={AMBER} />
          <path
            d="M40 22 l6 -10 M56 20 l0 -12 M72 22 l-6 -10"
            stroke="#33465a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text x="60" y="88" textAnchor="middle" fontSize="11" fontWeight="800" fill="#33465a">
            ?
          </text>
        </g>
      ) : (
        <g>
          <path
            d="M20 30 L48 22 L76 34 L104 26 V78 L76 86 L48 74 L20 82 Z"
            fill="#dfe8df"
            stroke="#33465a"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M48 22 V74 M76 34 V86" stroke="#33465a" strokeWidth="2" />
          <path
            d="M30 60 q14 -20 30 -4 q14 12 30 -8"
            stroke="#c5ccd3"
            strokeWidth="4"
            fill="none"
          />
          <path d="M62 40 C55 30 55 20 62 20 C69 20 69 30 62 40 Z" fill="#c8553d" />
          <circle cx="62" cy="27" r="3" fill="#ffffff" />
          <text x="90" y="20" fontSize="14" fontWeight="800" fill="#33465a">
            ?
          </text>
        </g>
      )}
    </svg>
  )
}

function SepedaJatuhPath() {
  return (
    <g transform="rotate(-22 100 70)">
      <circle cx="50" cy="70" r="26" fill="none" stroke={BIRU_TUA} strokeWidth="6" />
      <circle cx="150" cy="70" r="26" fill="none" stroke={BIRU_TUA} strokeWidth="6" />
      <path
        d="M50 70 L84 30 H124 M50 70 L98 70 L84 30 M98 70 L124 30 M124 30 L150 70"
        fill="none"
        stroke="#c8553d"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M118 26 h16 M80 24 q-8 -4 -12 2"
        stroke={BIRU_TUA}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  )
}

export function Ambulans({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 130" className={className} aria-hidden>
      <ellipse cx="130" cy="122" rx="120" ry="6" fill="rgba(0,0,0,0.25)" />
      <rect x="20" y="30" width="170" height="70" rx="8" fill="#ffffff" />
      <path d="M190 40 H226 Q244 40 250 62 L252 100 H190 Z" fill="#ffffff" />
      <rect x="20" y="66" width="232" height="10" fill="#c8553d" />
      <rect x="20" y="76" width="232" height="4" fill={BIRU} />
      <rect x="198" y="46" width="34" height="20" rx="4" fill="#bcdcf0" />
      <rect x="40" y="42" width="28" height="18" rx="3" fill="#bcdcf0" />
      <rect x="100" y="38" width="22" height="22" rx="2" fill="#c8553d" />
      <rect x="108" y="40" width="6" height="18" fill="#ffffff" />
      <rect x="102" y="46" width="18" height="6" fill="#ffffff" />
      <rect x="126" y="40" width="60" height="14" rx="2" fill={BIRU} />
      <text
        x="156"
        y="51"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="800"
        fill="#ffffff"
        letterSpacing="0.6"
      >
        AMBULANS
      </text>
      <rect x="90" y="18" width="40" height="14" rx="4" fill="#4c6fa5" className="dr-lampu-biru" />
      <rect
        x="130"
        y="18"
        width="24"
        height="14"
        rx="4"
        fill="#c8553d"
        className="dr-lampu-merah"
      />
      <circle cx="64" cy="102" r="16" fill={BIRU_TUA} />
      <circle cx="64" cy="102" r="7" fill="#c5ccd3" />
      <circle cx="206" cy="102" r="16" fill={BIRU_TUA} />
      <circle cx="206" cy="102" r="7" fill="#c5ccd3" />
      <rect x="244" y="82" width="10" height="8" rx="2" fill="#ffe9a8" />
    </svg>
  )
}

export function GarisSiaga({ className = '' }: { className?: string }) {
  return <div className={`dr-garis-siaga ${className}`} aria-hidden />
}

export function PapanPengumuman({ className = '' }: { className?: string }) {
  return (
    <div className={`dr-papan-tulis rounded-lg p-2.5 ${className}`} aria-hidden>
      <p className="text-center text-[9px] font-black uppercase tracking-[0.25em] text-[#33465a]">
        Pengumuman RW
      </p>
      <div className="mt-1.5 space-y-1">
        <p className="kk-font-kapur text-sm leading-tight text-[#1f2d3a]">Ronda malam: Kamis</p>
        <p className="kk-font-kapur text-sm leading-tight text-[#1f2d3a]">
          Kerja bakti: Minggu 07.00
        </p>
        <p className="kk-font-kapur text-sm leading-tight text-[#2f7d52]">
          Pos ramah isyarat{' '}
          <Hand aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
        </p>
      </div>
      <div className="mt-1.5 flex justify-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[#c8553d]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#f2a93b]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#3e8e5e]" />
      </div>
    </div>
  )
}

export const WARNA_DARURAT = { BIRU, BIRU_TUA, AMBER, KRIM }
