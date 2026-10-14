import { Hand, Star } from 'lucide-react'
import type { CSSProperties } from 'react'
import { MENU_PAJANGAN } from './types'

export function Uap({ className = '', warna = '#c9b695' }: { className?: string; warna?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={`wk-uap ${className}`} aria-hidden>
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
      <line x1="40" y1="0" x2="40" y2="50" stroke="#5a3a26" strokeWidth="3" />
      <rect x="34" y="44" width="12" height="8" rx="2" fill="#8a5a33" />
      <path d="M14 84 Q14 52 40 52 Q66 52 66 84 Z" fill="#c9955c" />
      <path d="M18 82 Q20 58 40 56 Q60 58 62 82 Z" fill="#dba86c" />
      <circle cx="40" cy="90" r="9" fill="#fff1c2" className="wk-lampu-nyala" />
      <circle cx="40" cy="92" r="22" fill="rgba(255,241,194,0.32)" className="wk-lampu-nyala" />
    </svg>
  )
}

export function TanamanGantung({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 110" className={className} aria-hidden>
      <line x1="40" y1="0" x2="40" y2="26" stroke="#5a3a26" strokeWidth="2" />
      <path d="M22 26 H58 L54 48 H26 Z" fill="#b4632c" />
      <path d="M22 26 H58 L57 32 H23 Z" fill="rgba(0,0,0,0.18)" />
      <g className="wk-daun-goyang">
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
      <g className="wk-daun-goyang">
        <path d="M45 78 C20 66 16 34 30 14 C40 34 44 56 45 78" fill="#4f7a44" />
        <path d="M45 78 C70 66 74 34 60 14 C50 34 46 56 45 78" fill="#5d8a4f" />
        <path d="M45 80 C42 56 44 30 45 8" stroke="#3d5c36" strokeWidth="3.5" fill="none" />
      </g>
      <path d="M24 78 H66 L60 114 H30 Z" fill="#b4632c" />
      <path d="M24 78 H66 L64.5 87 H25.5 Z" fill="#8a4526" />
      <ellipse cx="45" cy="116" rx="26" ry="4" fill="rgba(69,52,25,0.22)" />
    </svg>
  )
}

export function Matahari({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block rounded-full bg-[#fff4cf] shadow-[0_0_90px_34px_rgba(255,236,170,0.6)] ${className}`}
    />
  )
}

export function AwanPagi({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 140 60" className={className} style={style} aria-hidden>
      <ellipse cx="46" cy="40" rx="34" ry="16" fill="#ffffff" opacity="0.92" />
      <ellipse cx="78" cy="30" rx="28" ry="18" fill="#ffffff" opacity="0.88" />
      <ellipse cx="104" cy="42" rx="26" ry="13" fill="#ffffff" opacity="0.92" />
    </svg>
  )
}

export function BurungPagi({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg viewBox="0 0 120 40" className={className} style={style} aria-hidden>
      <path
        d="M6 22 q8 -10 16 0 M28 12 q8 -10 16 0 M54 20 q7 -9 14 0 M84 10 q8 -10 16 0"
        stroke="#46536a"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PapanMenuKapur({
  judul = 'MENU PAGI',
  className = '',
}: {
  judul?: string
  className?: string
}) {
  return (
    <div className={`wk-papan-kapur rounded-xl p-4 ${className}`} aria-hidden>
      <p className="wk-font-kapur text-center text-xl tracking-wide text-[#ece7d6]">{judul}</p>
      <div className="mx-auto mt-1 h-px w-16 bg-[#ece7d6]/50" />
      <ul className="wk-font-kapur mt-2 space-y-0.5 text-lg leading-snug text-[#d9d3bd]">
        {MENU_PAJANGAN.map(({ nama, harga, favorit }) => (
          <li key={nama} className="flex items-baseline gap-2">
            <span>
              {nama}
              {favorit ? (
                <Star
                  aria-hidden
                  className="ml-1 inline-block h-[1em] w-[1em] fill-current align-text-bottom text-[#ffce8a]"
                />
              ) : null}
            </span>
            <span className="min-w-4 flex-1 border-b border-dotted border-[#d9d3bd]/40" />
            <span className="text-[#ffce8a]">{harga}</span>
          </li>
        ))}
      </ul>
      <p className="wk-font-kapur mt-2 text-center text-base text-[#a8c79a]">
        <Star
          aria-hidden
          className="inline-block h-[1em] w-[1em] fill-current align-text-bottom text-[#ffce8a]"
        />{' '}
        paling laris · ramah isyarat
      </p>
    </div>
  )
}

export function PapanMenuMini({ className = '' }: { className?: string }) {
  return (
    <div className={`wk-papan-kapur rounded-md p-1.5 ${className}`} aria-hidden>
      <p className="wk-font-kapur text-center text-[10px] leading-none text-[#ece7d6] sm:text-xs">
        MENU
      </p>
      <ul className="wk-font-kapur mt-1 space-y-px text-[8px] leading-tight text-[#d9d3bd] sm:text-[9px]">
        {MENU_PAJANGAN.slice(0, 3).map(({ nama, harga, favorit }) => (
          <li key={nama} className="flex justify-between gap-1">
            <span className="truncate">
              {nama}
              {favorit ? (
                <Star
                  aria-hidden
                  className="ml-0.5 inline-block h-[1em] w-[1em] fill-current align-text-bottom text-[#ffce8a]"
                />
              ) : null}
            </span>
            <span className="text-[#ffce8a]">{harga}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ArtMinuman({ jenis, className = '' }: { jenis: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden>
      {jenis === 'Teh Melati' ? (
        <g>
          <path
            d="M34 34 H86 L80 94 Q60 100 40 94 Z"
            fill="#f3e5cf"
            stroke="#d9c6a5"
            strokeWidth="2"
          />
          <path d="M38 44 H82 L78 88 Q60 93 42 88 Z" fill="#d9a24a" />
          <path
            d="M86 44 Q102 48 98 62 Q94 74 80 72"
            fill="none"
            stroke="#f3e5cf"
            strokeWidth="7"
          />
          <ellipse cx="60" cy="44" rx="22" ry="5" fill="#e8b96a" />
          <g fill="#fdfbf3">
            {[0, 72, 144, 216, 288].map((sudut) => (
              <ellipse
                key={sudut}
                cx="60"
                cy="38"
                rx="4"
                ry="6.5"
                transform={`rotate(${sudut} 60 40)`}
              />
            ))}
          </g>
          <circle cx="60" cy="40" r="2.6" fill="#e8b96a" />
        </g>
      ) : jenis === 'Cokelat Panas' ? (
        <g>
          <path d="M30 38 H90 L84 92 Q60 100 36 92 Z" fill="#8a5a33" />
          <path
            d="M90 46 Q106 50 102 64 Q98 76 84 74"
            fill="none"
            stroke="#8a5a33"
            strokeWidth="7"
          />
          <ellipse cx="60" cy="42" rx="26" ry="7" fill="#4a2e1e" />
          <path
            d="M42 42 q6 -12 16 -4 q6 -10 16 -2 q6 6 -2 10 h-24 q-8 -2 -6 -4 Z"
            fill="#fdfbf3"
          />
          <rect x="50" y="33" width="6" height="6" rx="1.5" fill="#fdfbf3" />
          <rect x="62" y="31" width="6" height="6" rx="1.5" fill="#fdfbf3" />
        </g>
      ) : (
        <g>
          <path
            d="M88 48 Q104 52 100 66 Q96 78 82 76"
            fill="none"
            stroke="#d9c6a5"
            strokeWidth="10"
          />
          <path
            d="M88 48 Q104 52 100 66 Q96 78 82 76"
            fill="none"
            stroke="#fdfbf3"
            strokeWidth="6"
          />
          <path
            d="M30 40 H88 L83 90 Q59 98 35 90 Z"
            fill="#fdfbf3"
            stroke="#d9c6a5"
            strokeWidth="2"
          />
          <path d="M33 62 H85" stroke="#b4632c" strokeWidth="5" />
          <ellipse cx="59" cy="46" rx="23" ry="6" fill="#e8d3b8" />
          <ellipse cx="59" cy="45" rx="19" ry="4.5" fill="#6b4226" />
          <path
            d="M59 44 c-2 -3 -6 -2 -6 1 c0 2.5 3.5 4 6 6.5 c2.5 -2.5 6 -4 6 -6.5 c0 -3 -4 -4 -6 -1 Z"
            fill="#e8d3b8"
          />
        </g>
      )}
      <g transform="translate(30 -14)">
        <Uap className="h-10 w-10" />
      </g>
      <ellipse cx="60" cy="98" rx="34" ry="5" fill="rgba(69,52,25,0.15)" />
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
        <path d="M18 14 H58" stroke="#b4632c" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function MesinEspresso({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 170" className={className} aria-hidden>
      <rect x="20" y="60" width="160" height="70" rx="10" fill="#4a3a30" />
      <rect x="30" y="40" width="140" height="26" rx="8" fill="#b8b2a6" />
      <rect x="40" y="46" width="60" height="12" rx="3" fill="#2b1a0e" />
      <rect x="132" y="30" width="26" height="14" rx="3" fill="#b8b2a6" />
      <circle cx="150" cy="70" r="6" fill="#e8dcc7" />
      <circle cx="150" cy="70" r="2.5" fill="#2b1a0e" />
      <rect x="52" y="96" width="14" height="30" rx="4" fill="#9a948a" />
      <rect x="120" y="96" width="14" height="30" rx="4" fill="#9a948a" />
      <rect x="40" y="126" width="120" height="10" rx="4" fill="#2b1a0e" />
      <circle cx="100" cy="80" r="7" fill="#7dbb8f" className="wk-lampu-nyala" />
      <rect x="44" y="130" width="30" height="18" rx="3" fill="#fdfbf3" />
      <rect x="126" y="130" width="30" height="18" rx="3" fill="#fdfbf3" />
      <g transform="translate(30 24)">
        <Uap warna="#cbb9a0" className="h-9 w-9" />
      </g>
    </svg>
  )
}

export function RakStoples({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 64" className={className} aria-hidden>
      <rect x="0" y="54" width="220" height="7" rx="2" fill="#a8784a" />
      <rect x="0" y="61" width="220" height="3" fill="#6b4226" opacity="0.5" />
      <rect x="10" y="16" width="26" height="38" rx="4" fill="#e8dcc7" opacity="0.9" />
      <rect x="10" y="30" width="26" height="24" rx="4" fill="#6b4226" />
      <rect x="15" y="8" width="16" height="8" rx="2" fill="#8a5a33" />
      <rect x="46" y="22" width="24" height="32" rx="4" fill="#e8dcc7" opacity="0.9" />
      <rect x="46" y="38" width="24" height="16" rx="4" fill="#d9a24a" />
      <path d="M86 54 q-6 -16 7 -23 q7 -4 13 0 q13 7 7 23 Z" fill="#5d8a4f" />
      <rect x="90" y="48" width="26" height="8" rx="2" fill="#b4632c" />
      <rect x="126" y="34" width="20" height="20" rx="3" fill="#fdfbf3" />
      <rect x="128" y="14" width="20" height="20" rx="3" fill="#fdfbf3" />
      <path d="M148 20 q8 2 6 8 h-6" fill="none" stroke="#fdfbf3" strokeWidth="3" />
      <path d="M146 40 q8 2 6 8 h-6" fill="none" stroke="#fdfbf3" strokeWidth="3" />
      <path d="M160 24 h34 v30 h-34 Z" fill="#8a5a33" />
      <path d="M160 24 h34 v8 h-34 Z" fill="#b4632c" />
      <text
        x="177"
        y="46"
        textAnchor="middle"
        fontSize="9"
        fill="#f7ecd8"
        fontFamily="var(--font-kapur), cursive"
      >
        kopi
      </text>
      <path d="M202 54 q-4 -12 5 -17 q5 -3 9 0 q9 5 5 17 Z" fill="#5d8a4f" />
    </svg>
  )
}

export function BingkaiTangan({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 84" className={className} aria-hidden>
      <rect x="2" y="2" width="66" height="80" rx="5" fill="#c9955c" />
      <rect x="8" y="8" width="54" height="68" rx="3" fill="#fdf9f0" />
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

export function JendelaDalam({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden>
      <rect x="4" y="4" width="112" height="142" rx="6" fill="#8a5a33" />
      <rect x="12" y="12" width="96" height="126" rx="3" fill="#bfe0f2" />
      <rect x="12" y="12" width="96" height="60" fill="#a9d4ec" />
      <circle cx="86" cy="36" r="12" fill="#fff4cf" />
      <ellipse cx="40" cy="48" rx="18" ry="7" fill="#ffffff" opacity="0.9" />
      <rect x="12" y="96" width="96" height="42" fill="#cfe1c9" />
      <path d="M12 100 q20 -14 40 0 q20 -14 44 0 v38 h-84 Z" fill="#9dbf8f" />
      <rect x="58" y="12" width="4" height="126" fill="#8a5a33" />
      <rect x="12" y="72" width="96" height="4" fill="#8a5a33" />
    </svg>
  )
}

export function MapBerkas({
  className = '',
  sorot = false,
}: {
  className?: string
  sorot?: boolean
}) {
  return (
    <svg viewBox="0 0 260 180" className={className} aria-hidden>
      <path d="M6 30 h44 l8 -12 h-44 Z" fill="#d9b163" />
      <rect x="6" y="24" width="124" height="148" rx="8" fill="#e6c27c" />
      <rect x="130" y="24" width="124" height="148" rx="8" fill="#efd08f" />
      <rect
        x="24"
        y="44"
        width="42"
        height="50"
        rx="3"
        fill="#f7ecd8"
        stroke="#c9b695"
        strokeWidth="2"
      />
      <circle cx="45" cy="62" r="9" fill="#b0a591" />
      <path d="M30 92 q15 -18 30 0 Z" fill="#b0a591" />
      <path
        d="M76 52 h40 M76 62 h34 M76 72 h40 M76 82 h28"
        stroke="#b0a591"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 118 h92 M24 130 h80 M24 142 h92 M24 154 h60"
        stroke="#c9b695"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="98"
        y="12"
        width="16"
        height="28"
        rx="7"
        fill="none"
        stroke="#8a8378"
        strokeWidth="3"
      />
      <rect
        x="140"
        y="34"
        width="104"
        height="130"
        rx="3"
        fill="#fdfaf3"
        stroke="#d9cbb0"
        strokeWidth="2"
      />
      <text x="150" y="52" fontSize="11" fontWeight="700" fill="#453419">
        CV · Pelamar
      </text>
      <path d="M150 58 h84" stroke="#d9cbb0" strokeWidth="1.5" />
      <text x="150" y="70" fontSize="7" fill="#8a6a45">
        NAMA
      </text>
      <path d="M150 76 h60" stroke="#b0a591" strokeWidth="3" strokeLinecap="round" />
      <rect
        x="146"
        y="84"
        width="92"
        height="34"
        rx="4"
        fill="#ffe08a"
        opacity={sorot ? undefined : 0.45}
        className={sorot ? 'wk-sorot-berkas' : undefined}
      />
      <text x="150" y="95" fontSize="7" fontWeight="700" fill="#8a5f10">
        PENGALAMAN
      </text>
      <path d="M150 102 h70 M150 110 h56" stroke="#8a6a45" strokeWidth="3" strokeLinecap="round" />
      {sorot ? <path d="M240 96 l-8 5 l8 5 Z" fill="#b4632c" /> : null}
      <text x="150" y="130" fontSize="7" fill="#8a6a45">
        KEAHLIAN
      </text>
      <path
        d="M150 137 h64 M150 145 h48 M150 153 h58"
        stroke="#b0a591"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PosterLowongan({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative rounded-sm bg-[#fdf6e3] p-2 text-center shadow-md ${className}`}
      aria-hidden
    >
      <span className="absolute -top-1 left-1/2 h-2.5 w-8 -translate-x-1/2 rotate-2 bg-[#d9c8a5]/80" />
      <p className="font-display text-[11px] font-black tracking-[0.2em] text-[#b4632c] sm:text-sm">
        DICARI
      </p>
      <p className="font-display text-base font-black leading-none text-[#453419] sm:text-xl">
        BARISTA
      </p>
      <p className="text-teks-sekunder mt-1 hidden whitespace-nowrap text-[8px] leading-tight sm:block">
        wawancara hari ini · 09.00
      </p>
      <p className="wk-font-kapur mt-0.5 text-[10px] leading-none text-[#5e8a63] sm:text-xs">
        ramah isyarat{' '}
        <Hand aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
      </p>
    </div>
  )
}

export function GantunganPintu({ className = '', teks }: { className?: string; teks: string }) {
  return (
    <div className={`wk-goyang ${className}`} aria-hidden>
      <svg viewBox="0 0 60 14" className="mx-auto block w-8">
        <path d="M18 0 v12 M42 0 v12" stroke="#5a3a26" strokeWidth="2" />
      </svg>
      <div className="rounded-md border-2 border-[#6b4226] bg-[#fdf6e3] px-1.5 py-1 text-center shadow-md">
        <p className="wk-font-kapur text-[10px] leading-tight text-[#453419] sm:text-xs">{teks}</p>
      </div>
    </div>
  )
}

export function LoncengPintu({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 44" className={`wk-goyang ${className}`} aria-hidden>
      <line x1="20" y1="0" x2="20" y2="8" stroke="#5a3a26" strokeWidth="3" />
      <path d="M8 30 Q8 12 20 12 Q32 12 32 30 Z" fill="#d9a521" />
      <path d="M6 30 H34 V34 H6 Z" fill="#b8891b" />
      <circle cx="20" cy="38" r="4" fill="#8a5f10" />
    </svg>
  )
}

export function Sepeda({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 120" className={className} aria-hidden>
      <circle cx="40" cy="86" r="26" fill="none" stroke="#3b2a1a" strokeWidth="5" />
      <circle cx="138" cy="86" r="26" fill="none" stroke="#3b2a1a" strokeWidth="5" />
      <circle cx="40" cy="86" r="4" fill="#3b2a1a" />
      <circle cx="138" cy="86" r="4" fill="#3b2a1a" />
      <path
        d="M40 86 L74 46 H114 M40 86 L88 86 L74 46 M88 86 L114 46 M114 46 L138 86"
        fill="none"
        stroke="#5e8a63"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M108 42 h16 M70 40 q-8 -4 -12 2"
        stroke="#3b2a1a"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M84 44 h14 l-2 -8 h-10 Z" fill="#3b2a1a" />
      <rect x="118" y="52" width="22" height="16" rx="3" fill="#c9b695" />
      <circle cx="124" cy="50" r="3.5" fill="#e0955a" />
      <circle cx="132" cy="48" r="3.5" fill="#d9a521" />
      <path d="M122 52 v-6 q7 -4 14 0 v6" stroke="#5d8a4f" strokeWidth="3" fill="none" />
    </svg>
  )
}
