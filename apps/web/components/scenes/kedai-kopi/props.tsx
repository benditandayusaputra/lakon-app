import { Sparkles } from 'lucide-react'
import { MENU_PAJANGAN } from './types'

export function Uap({ className = '', warna = '#f5e9d7' }: { className?: string; warna?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={`kk-uap ${className}`} aria-hidden>
      <path
        d="M18 52 C14 44 24 40 20 32 C17 26 22 22 22 16"
        fill="none"
        stroke={warna}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 54 C28 45 38 41 34 32 C31 26 36 21 36 14"
        fill="none"
        stroke={warna}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M46 52 C42 44 52 40 48 32 C45 26 50 22 50 16"
        fill="none"
        stroke={warna}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LampuGantung({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 130" className={className} aria-hidden>
      <line x1="40" y1="0" x2="40" y2="52" stroke="#2b1a0e" strokeWidth="3" />
      <path d="M16 78 Q16 52 40 52 Q64 52 64 78 Z" fill="#7a4d2a" />
      <path d="M20 76 Q22 58 40 56 Q58 58 60 76 Z" fill="#8a5a33" />
      <circle cx="40" cy="84" r="9" fill="#ffce8a" className="kk-lampu-nyala" />
      <circle cx="40" cy="86" r="22" fill="rgba(255,206,138,0.22)" className="kk-lampu-nyala" />
    </svg>
  )
}

export function LampuTali({ className = '' }: { className?: string }) {
  const titik = [6, 17, 28, 39, 50, 61, 72, 83, 94]
  return (
    <svg viewBox="0 0 100 16" preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M0 3 Q50 14 100 3" fill="none" stroke="#2b1a0e" strokeWidth="0.8" />
      {titik.map((x, i) => {
        const t = x / 100
        const y = 3 + 22 * t * (1 - t)
        return (
          <circle
            key={x}
            cx={x}
            cy={y + 2.4}
            r="1.7"
            fill={i % 2 === 0 ? '#ffce8a' : '#f0a04b'}
            className="kk-lampu-nyala"
            style={{ animationDelay: `${(i % 4) * 0.5}s` }}
          />
        )
      })}
    </svg>
  )
}

export function TanamanGantung({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 110" className={className} aria-hidden>
      <line x1="40" y1="0" x2="40" y2="26" stroke="#2b1a0e" strokeWidth="2" />
      <path d="M22 26 H58 L54 48 H26 Z" fill="#a8582f" />
      <path d="M22 26 H58 L57 32 H23 Z" fill="rgba(0,0,0,0.18)" />
      <g className="kk-daun-goyang">
        {[
          'M28 46 C20 62 24 78 18 92',
          'M36 48 C34 66 40 80 34 100',
          'M46 48 C50 66 44 82 50 98',
          'M54 46 C62 60 58 76 64 88',
        ].map((d) => (
          <path key={d} d={d} fill="none" stroke="#4f7a44" strokeWidth="4" strokeLinecap="round" />
        ))}
      </g>
      <ellipse cx="40" cy="28" rx="16" ry="7" fill="#5d8a4f" />
    </svg>
  )
}

export function TanamanPot({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 120" className={className} aria-hidden>
      <g className="kk-daun-goyang">
        <path d="M45 78 C20 66 16 34 30 14 C40 34 44 56 45 78" fill="#4f7a44" />
        <path d="M45 78 C70 66 74 34 60 14 C50 34 46 56 45 78" fill="#5d8a4f" />
        <path d="M45 80 C42 56 44 30 45 8" stroke="#3d5c36" strokeWidth="3.5" fill="none" />
      </g>
      <path d="M24 78 H66 L60 114 H30 Z" fill="#a8582f" />
      <path d="M24 78 H66 L64.5 87 H25.5 Z" fill="#8a4526" />
      <ellipse cx="45" cy="116" rx="26" ry="4" fill="rgba(0,0,0,0.25)" />
    </svg>
  )
}

export function PapanMenuKapur({
  judul = 'MENU HARI INI',
  className = '',
}: {
  judul?: string
  className?: string
}) {
  return (
    <div className={`kk-papan-kapur rounded-xl p-4 ${className}`} aria-hidden>
      <p className="kk-font-kapur text-center text-xl tracking-wide text-[#ece7d6]">{judul}</p>
      <div className="mx-auto mt-1 h-px w-16 bg-[#ece7d6]/50" />
      <ul className="kk-font-kapur mt-2 space-y-0.5 text-lg leading-snug text-[#d9d3bd]">
        {MENU_PAJANGAN.map(([nama, harga]) => (
          <li key={nama} className="flex items-baseline gap-2">
            <span>{nama}</span>
            <span className="min-w-4 flex-1 border-b border-dotted border-[#d9d3bd]/40" />
            <span className="text-[#ffce8a]">{harga}</span>
          </li>
        ))}
      </ul>
      <p className="kk-font-kapur mt-2 text-center text-base text-[#a8c79a]">
        <Sparkles aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" /> ramah
        bahasa isyarat{' '}
        <Sparkles aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
      </p>
    </div>
  )
}

export function ArtMinuman({ jenis, className = '' }: { jenis: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden>
      {jenis === 'Teh' ? (
        <g>
          <path d="M34 34 H86 L80 94 Q60 100 40 94 Z" fill="#f3e5cf" />
          <path d="M38 44 H82 L78 88 Q60 93 42 88 Z" fill="#c98a3b" />
          <path
            d="M86 44 Q102 48 98 62 Q94 74 80 72"
            fill="none"
            stroke="#f3e5cf"
            strokeWidth="7"
          />
          <ellipse cx="60" cy="44" rx="22" ry="5" fill="#e3b26a" />
          <path d="M60 20 Q66 26 60 34 Q54 26 60 20" fill="#5d8a4f" />
        </g>
      ) : jenis === 'Cokelat' ? (
        <g>
          <path d="M30 38 H90 L84 92 Q60 100 36 92 Z" fill="#8a5a33" />
          <path d="M34 46 H86 L82 86 Q60 93 38 86 Z" fill="#4a2e1e" />
          <ellipse cx="60" cy="46" rx="24" ry="6" fill="#6b4226" />
          <ellipse cx="60" cy="44" rx="20" ry="5" fill="#e8d3b8" />
          <circle cx="52" cy="43" r="3" fill="#4a2e1e" />
          <circle cx="66" cy="45" r="2.5" fill="#4a2e1e" />
        </g>
      ) : (
        <g>
          <path d="M30 40 H88 L83 90 Q59 98 35 90 Z" fill="#fdfbf3" />
          <path
            d="M88 48 Q104 52 100 66 Q96 78 82 76"
            fill="none"
            stroke="#fdfbf3"
            strokeWidth="7"
          />
          <ellipse cx="59" cy="46" rx="23" ry="6" fill="#e8d3b8" />
          <ellipse cx="59" cy="45" rx="19" ry="4.5" fill="#6b4226" />
          <path d="M50 52 Q59 60 54 70" stroke="#e8d3b8" strokeWidth="2.5" fill="none" />
          <path d="M66 52 Q60 60 66 68" stroke="#c98a3b" strokeWidth="2.5" fill="none" />
        </g>
      )}
      <g transform="translate(30 -14)">
        <Uap warna="#c9b695" className="h-10 w-10" />
      </g>
      <ellipse cx="60" cy="98" rx="34" ry="5" fill="rgba(43,26,14,0.15)" />
    </svg>
  )
}

export function CangkirSaji({ className = '' }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Uap className="mx-auto h-12 w-12" />
      <svg viewBox="0 0 80 42" className="w-full">
        <ellipse cx="38" cy="36" rx="30" ry="5" fill="#e8d3b8" />
        <path d="M14 6 H62 L58 30 Q38 36 18 30 Z" fill="#fdfbf3" />
        <path d="M62 10 Q76 13 72 24 Q69 31 58 28" fill="none" stroke="#fdfbf3" strokeWidth="5" />
        <path d="M18 12 H58" stroke="#e0b98a" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function MesinEspresso({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 170" className={className} aria-hidden>
      <rect x="20" y="60" width="160" height="70" rx="10" fill="#3a2a20" />
      <rect x="30" y="40" width="140" height="26" rx="8" fill="#57433a" />
      <rect x="40" y="46" width="60" height="12" rx="3" fill="#2b1a0e" />
      <rect x="132" y="30" width="26" height="14" rx="3" fill="#57433a" />
      <circle cx="150" cy="70" r="6" fill="#c9b695" />
      <circle cx="150" cy="70" r="2.5" fill="#2b1a0e" />
      <rect x="52" y="96" width="14" height="30" rx="4" fill="#8a8378" />
      <rect x="120" y="96" width="14" height="30" rx="4" fill="#8a8378" />
      <rect x="40" y="126" width="120" height="10" rx="4" fill="#241811" />
      <circle cx="100" cy="80" r="7" fill="#ffce8a" className="kk-lampu-nyala" />
      <rect x="44" y="130" width="30" height="18" rx="3" fill="#f5e9d7" />
      <rect x="126" y="130" width="30" height="18" rx="3" fill="#f5e9d7" />
      <g transform="translate(30 24)">
        <Uap warna="#cbb9a0" className="h-9 w-9" />
      </g>
    </svg>
  )
}

export function EtalaseKue({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 150" className={className} aria-hidden>
      <rect x="8" y="18" width="204" height="112" rx="10" fill="#57392a" />
      <rect x="16" y="26" width="188" height="72" rx="7" fill="#f8efdf" opacity="0.16" />
      <rect
        x="16"
        y="26"
        width="188"
        height="72"
        rx="7"
        fill="none"
        stroke="#c9b695"
        strokeWidth="2.5"
        opacity="0.5"
      />
      <line x1="16" y1="62" x2="204" y2="62" stroke="#c9b695" strokeWidth="2.5" opacity="0.5" />
      <path d="M34 56 q4 -18 20 -14 q16 4 10 16 q-4 8 -16 6 q-12 -2 -14 -8" fill="#d99b52" />
      <path
        d="M40 50 q8 -8 18 -2"
        stroke="#a8632c"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M84 58 h30 l-4 -18 h-22 Z" fill="#8a5a33" />
      <rect x="84" y="40" width="30" height="6" rx="2" fill="#e8d3b8" />
      <circle cx="99" cy="37" r="3.5" fill="#c1443c" />
      <path d="M138 58 h34 v-6 q0 -12 -17 -12 q-17 0 -17 12 Z" fill="#f0d9b8" />
      <path d="M138 52 h34" stroke="#c98a3b" strokeWidth="2.5" />
      <path d="M34 92 h24 v-16 h-24 Z" fill="#a8582f" />
      <path d="M74 92 h28 l-4 -14 h-20 Z" fill="#d99b52" />
      <path d="M120 92 h30 v-8 q0 -8 -15 -8 q-15 0 -15 8 Z" fill="#e8c79b" />
      <rect x="8" y="98" width="204" height="32" rx="6" fill="#452817" />
      <rect x="26" y="106" width="56" height="14" rx="3" fill="#26301f" />
      <text
        x="54"
        y="117"
        textAnchor="middle"
        fontSize="10"
        fill="#d9d3bd"
        fontFamily="var(--font-kapur), cursive"
      >
        kue segar
      </text>
      <ellipse cx="110" cy="138" rx="92" ry="5" fill="rgba(0,0,0,0.28)" />
    </svg>
  )
}

export function StoplesKopi({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 60" className={className} aria-hidden>
      <rect x="0" y="52" width="220" height="6" rx="2" fill="#6b4226" />
      <rect x="10" y="14" width="26" height="38" rx="4" fill="#c9b695" />
      <rect x="10" y="14" width="26" height="13" rx="4" fill="#8a5a33" />
      <rect x="15" y="6" width="16" height="8" rx="2" fill="#6b4226" />
      <rect x="46" y="20" width="24" height="32" rx="4" fill="#a8c79a" opacity="0.9" />
      <rect x="46" y="36" width="24" height="16" rx="4" fill="#5d8a4f" />
      <path d="M86 52 q-6 -16 7 -23 q7 -4 13 0 q13 7 7 23 Z" fill="#4f7a44" />
      <rect x="90" y="46" width="26" height="8" rx="2" fill="#a8582f" />
      <rect x="126" y="16" width="22" height="36" rx="3" fill="#8a5a33" />
      <ellipse cx="137" cy="16" rx="11" ry="3.5" fill="#57392a" />
      <circle cx="132" cy="30" r="2" fill="#3d2716" />
      <circle cx="140" cy="36" r="2" fill="#3d2716" />
      <circle cx="135" cy="44" r="2" fill="#3d2716" />
      <path d="M160 24 h34 v28 h-34 Z" fill="#f3e5cf" />
      <path d="M160 24 h34 v8 h-34 Z" fill="#c1443c" opacity="0.85" />
      <text
        x="177"
        y="45"
        textAnchor="middle"
        fontSize="9"
        fill="#6b4226"
        fontFamily="var(--font-kapur), cursive"
      >
        kopi
      </text>
      <path d="M202 52 q-4 -12 5 -17 q5 -3 9 0 q9 5 5 17 Z" fill="#5d8a4f" />
    </svg>
  )
}

export function BingkaiTangan({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 84" className={className} aria-hidden>
      <rect x="2" y="2" width="66" height="80" rx="5" fill="#7a4d2a" />
      <rect x="8" y="8" width="54" height="68" rx="3" fill="#f3e5cf" />
      <path
        d="M35 62 V40 M27 46 V32 q0 -4 4 -4 q4 0 4 4 v10 M35 42 V26 q0 -4 4 -4 q4 0 4 4 v16 M43 44 V32 q0 -4 4 -4 q3.5 0 3.5 4 v16 q0 14 -8 18 h-8 q-9 -6 -9 -20"
        fill="none"
        stroke="#b4632c"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="35"
        y="74"
        textAnchor="middle"
        fontSize="7"
        fill="#8a5f10"
        fontFamily="var(--font-kapur), cursive"
      >
        salam isyarat
      </text>
    </svg>
  )
}

export function Sepeda({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 120" className={className} aria-hidden>
      <circle cx="40" cy="86" r="26" fill="none" stroke="#241811" strokeWidth="5" />
      <circle cx="138" cy="86" r="26" fill="none" stroke="#241811" strokeWidth="5" />
      <circle cx="40" cy="86" r="4" fill="#241811" />
      <circle cx="138" cy="86" r="4" fill="#241811" />
      <path
        d="M40 86 L74 46 H114 M40 86 L88 86 L74 46 M88 86 L114 46 M114 46 L138 86"
        fill="none"
        stroke="#8a4a30"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M108 42 h16 M70 40 q-8 -4 -12 2"
        stroke="#241811"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M84 44 h14 l-2 -8 h-10 Z" fill="#241811" />
      <rect x="118" y="52" width="22" height="16" rx="3" fill="#c9b695" />
      <path d="M122 52 v-6 q7 -4 14 0 v6" stroke="#5d8a4f" strokeWidth="4" fill="none" />
    </svg>
  )
}

export function LoncengPintu({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 44" className={`kk-goyang ${className}`} aria-hidden>
      <line x1="20" y1="0" x2="20" y2="8" stroke="#2b1a0e" strokeWidth="3" />
      <path d="M8 30 Q8 12 20 12 Q32 12 32 30 Z" fill="#d9a521" />
      <path d="M6 30 H34 V34 H6 Z" fill="#b8891b" />
      <circle cx="20" cy="38" r="4" fill="#8a5f10" />
    </svg>
  )
}

const QRIS_SEL: boolean[] = (() => {
  let benih = 7
  const sel: boolean[] = []
  for (let i = 0; i < 441; i += 1) {
    benih = (benih * 48271) % 2147483647
    sel.push(benih % 5 < 2)
  }
  return sel
})()

export function KartuQris({ className = '' }: { className?: string }) {
  const ukuran = 21
  return (
    <div className={`rounded-xl bg-white p-3 shadow-lg ${className}`} aria-hidden>
      <p className="text-center text-[10px] font-black tracking-widest text-[#e0242a]">
        QRIS <span className="text-teks font-normal">· KOPI LAKON</span>
      </p>
      <svg viewBox="0 0 21 21" className="mx-auto mt-1.5 aspect-square w-full max-w-36">
        {QRIS_SEL.map((isi, i) => {
          const x = i % ukuran
          const y = Math.floor(i / ukuran)
          const dalamPenanda = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
          if (dalamPenanda || !isi) return null
          return <rect key={i} x={x} y={y} width="1" height="1" fill="#1a1a1a" />
        })}
        {(
          [
            [0, 0],
            [14, 0],
            [0, 14],
          ] as const
        ).map(([px, py]) => (
          <g key={`${px}-${py}`}>
            <rect x={px} y={py} width="7" height="7" fill="#1a1a1a" />
            <rect x={px + 1} y={py + 1} width="5" height="5" fill="#ffffff" />
            <rect x={px + 2} y={py + 2} width="3" height="3" fill="#1a1a1a" />
          </g>
        ))}
      </svg>
      <p className="text-teks-sekunder mt-1.5 text-center text-[10px]">Pindai untuk membayar</p>
    </div>
  )
}
