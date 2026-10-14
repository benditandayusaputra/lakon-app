import { ArrowLeft, ArrowRight } from 'lucide-react'
import { HALTE_RUTE, TUJUAN } from './types'

const BIRU = '#33608c'
const BIRU_TUA = '#1c3a55'
const KUNING = '#f2b23e'

export function AwanPutih({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg viewBox="0 0 140 60" className={className} style={style} aria-hidden>
      <ellipse cx="46" cy="40" rx="34" ry="16" fill="#ffffff" opacity="0.92" />
      <ellipse cx="78" cy="30" rx="28" ry="18" fill="#ffffff" opacity="0.88" />
      <ellipse cx="104" cy="42" rx="26" ry="13" fill="#ffffff" opacity="0.92" />
    </svg>
  )
}

export function Matahari({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block rounded-full bg-[#fff3c9] shadow-[0_0_80px_30px_rgba(255,236,170,0.55)] ${className}`}
    />
  )
}

export function BusKota({
  className = '',
  datang = false,
}: {
  className?: string
  datang?: boolean
}) {
  return (
    <svg
      viewBox="0 0 360 150"
      className={`${datang ? 'tp-bus-datang' : ''} ${className}`}
      aria-hidden
    >
      <rect x="10" y="18" width="336" height="96" rx="14" fill="#f4f8fb" />
      <rect x="10" y="18" width="336" height="30" rx="14" fill={BIRU} />
      <rect x="10" y="84" width="336" height="14" fill={BIRU} />
      <rect x="24" y="24" width="90" height="18" rx="4" fill={BIRU_TUA} />
      <text
        x="69"
        y="37"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="#ffe9b8"
        fontFamily="monospace"
      >
        K1 · {TUJUAN.toUpperCase()}
      </text>
      {[132, 186, 240].map((x) => (
        <rect key={x} x={x} y="52" width="44" height="28" rx="5" fill="#bcd9ee" />
      ))}
      <rect x="294" y="50" width="40" height="52" rx="5" fill="#a8cbe4" />
      <path d="M314 50 v52" stroke="#7ba3c4" strokeWidth="2.5" />
      <rect x="24" y="52" width="96" height="28" rx="5" fill="#bcd9ee" />
      <circle cx="76" cy="116" r="19" fill="#2b2f34" />
      <circle cx="76" cy="116" r="9" fill="#8a8f96" />
      <circle cx="284" cy="116" r="19" fill="#2b2f34" />
      <circle cx="284" cy="116" r="9" fill="#8a8f96" />
      <rect x="336" y="60" width="10" height="16" rx="3" fill="#ffd28a" />
      <ellipse cx="180" cy="138" rx="160" ry="6" fill="rgba(28,58,85,0.18)" />
    </svg>
  )
}

export function TiangRambu({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 190" className={className} aria-hidden>
      <rect x="32" y="34" width="6" height="150" rx="3" fill="#5c6166" />
      <circle cx="35" cy="26" r="24" fill={BIRU} />
      <circle cx="35" cy="26" r="20" fill="#f4f8fb" />
      <path d="M22 30 h26 v-9 a5 5 0 0 0 -5 -5 h-16 a5 5 0 0 0 -5 5 Z" fill={BIRU_TUA} />
      <rect x="24" y="18" width="9" height="5" rx="1.5" fill="#bcd9ee" />
      <rect x="37" y="18" width="9" height="5" rx="1.5" fill="#bcd9ee" />
      <circle cx="27" cy="32" r="2.5" fill="#2b2f34" />
      <circle cx="43" cy="32" r="2.5" fill="#2b2f34" />
      <rect x="12" y="56" width="46" height="14" rx="3" fill={KUNING} />
      <text x="35" y="66" textAnchor="middle" fontSize="8" fontWeight="700" fill={BIRU_TUA}>
        HALTE
      </text>
      <ellipse cx="35" cy="186" rx="16" ry="3.5" fill="rgba(28,58,85,0.2)" />
    </svg>
  )
}

export function PetaRute({
  tandaiIndex,
  className = '',
  judul = 'PETA RUTE · KORIDOR 1',
}: {
  tandaiIndex?: number
  className?: string
  judul?: string
}) {
  return (
    <div
      className={`rounded-xl border-4 border-[#1c3a55] bg-[#f4f8fb] p-3 shadow-lg ${className}`}
      aria-hidden
    >
      <p className="text-center text-[10px] font-black tracking-[0.2em] text-[#1c3a55]">{judul}</p>
      <svg viewBox="0 0 240 86" className="mt-1 w-full">
        <path d="M28 34 H212" stroke={BIRU} strokeWidth="7" strokeLinecap="round" />
        {HALTE_RUTE.map((halte, index) => {
          const x = 28 + index * 46
          const aktif = index === tandaiIndex
          return (
            <g key={halte.kode}>
              <circle
                cx={x}
                cy="34"
                r={aktif ? 9 : 6.5}
                fill={aktif ? KUNING : '#f4f8fb'}
                stroke={BIRU_TUA}
                strokeWidth="3"
              />
              {aktif ? <circle cx={x} cy="34" r="3.5" fill={BIRU_TUA} /> : null}
              <text
                x={x}
                y="14"
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill={BIRU_TUA}
                fontFamily="monospace"
              >
                {halte.kode}
              </text>
              <text
                x={index === 0 ? x - 24 : index === HALTE_RUTE.length - 1 ? x + 24 : x}
                y={index % 2 === 0 ? 56 : 72}
                textAnchor={
                  index === 0 ? 'start' : index === HALTE_RUTE.length - 1 ? 'end' : 'middle'
                }
                fontSize="9.5"
                fontWeight={aktif ? 800 : 600}
                fill={aktif ? '#8a5f10' : '#41546b'}
              >
                {halte.nama}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function AlatTap({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden>
      <rect x="30" y="14" width="60" height="86" rx="10" fill={BIRU_TUA} />
      <rect x="38" y="24" width="44" height="26" rx="4" fill="#0d1f2e" />
      <text
        x="60"
        y="41"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#7fd4ff"
        fontFamily="monospace"
      >
        TAP
      </text>
      <rect x="38" y="58" width="44" height="34" rx="5" fill={BIRU} />
      <path
        d="M49 75 a11 11 0 0 1 22 0 M53 75 a7 7 0 0 1 14 0 M57 75 a3 3 0 0 1 6 0"
        stroke="#cfe9ff"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="46" y="100" width="28" height="34" rx="4" fill="#5c6166" />
      <g className="tp-kartu-tap">
        <rect
          x="66"
          y="44"
          width="48"
          height="32"
          rx="5"
          fill={KUNING}
          transform="rotate(-18 90 60)"
        />
        <rect
          x="72"
          y="52"
          width="18"
          height="10"
          rx="2"
          fill="#c98f1e"
          transform="rotate(-18 90 60)"
        />
      </g>
      <ellipse cx="60" cy="142" rx="30" ry="4" fill="rgba(28,58,85,0.2)" />
    </svg>
  )
}

export function BangkuTunggu({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 90" className={className} aria-hidden>
      <rect x="10" y="30" width="200" height="12" rx="5" fill={BIRU} />
      <rect x="10" y="14" width="200" height="9" rx="4" fill={BIRU} opacity="0.85" />
      <rect x="24" y="42" width="8" height="42" rx="3" fill="#5c6166" />
      <rect x="188" y="42" width="8" height="42" rx="3" fill="#5c6166" />
      <rect x="104" y="42" width="8" height="42" rx="3" fill="#5c6166" />
      <ellipse cx="110" cy="86" rx="96" ry="4" fill="rgba(28,58,85,0.15)" />
    </svg>
  )
}

export function PapanLed({ teks, className = '' }: { teks: string; className?: string }) {
  return (
    <div
      className={`tp-led flex items-center gap-2 rounded-lg border-2 border-[#0d1f2e] px-3 py-1.5 ${className}`}
      aria-hidden
    >
      <span className="pk-led-kedip h-2 w-2 shrink-0 rounded-full bg-[#7fd4ff]" />
      <p className="truncate font-mono text-[11px] font-bold tracking-[0.12em] text-[#7fd4ff]">
        {teks}
      </p>
    </div>
  )
}

export function RambuGantung({
  teks,
  arah = 'kanan',
  className = '',
}: {
  teks: string
  arah?: 'kiri' | 'kanan'
  className?: string
}) {
  return (
    <div className={className} aria-hidden>
      <div className="mx-auto flex w-fit gap-6">
        <span className="h-4 w-1 bg-[#5c6166]" />
        <span className="h-4 w-1 bg-[#5c6166]" />
      </div>
      <div className="flex items-center gap-2 rounded-md bg-[#1c3a55] px-3 py-1.5 shadow-md">
        {arah === 'kiri' ? <ArrowLeft aria-hidden className="h-4 w-4 text-[#ffd28a]" /> : null}
        <span className="text-xs font-bold tracking-wider text-[#f4f8fb]">{teks}</span>
        {arah === 'kanan' ? <ArrowRight aria-hidden className="h-4 w-4 text-[#ffd28a]" /> : null}
      </div>
    </div>
  )
}

export function JariAngka({ jumlah, className = '' }: { jumlah: 1 | 2 | 3; className?: string }) {
  const jariX = [48, 65, 82]
  return (
    <svg viewBox="0 0 130 120" className={className} aria-hidden>
      <rect x="40" y="54" width="52" height="46" rx="17" fill="#eab68c" />
      <rect x="52" y="94" width="30" height="20" rx="8" fill="#eab68c" />
      {jariX.slice(0, jumlah).map((x, i) => (
        <rect
          key={x}
          x={x - 7}
          y={i === 1 ? 14 : 20}
          width="14"
          height="52"
          rx="7"
          fill="#eab68c"
        />
      ))}
      {jariX.slice(jumlah).map((x) => (
        <rect key={x} x={x - 7} y="46" width="14" height="18" rx="7" fill="#d9a06f" />
      ))}
      <rect
        x="26"
        y="60"
        width="14"
        height="32"
        rx="7"
        fill="#eab68c"
        transform="rotate(24 33 76)"
      />
      <path d="M46 92 h38" stroke="#d9a06f" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}
