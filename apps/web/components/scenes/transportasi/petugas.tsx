import { AlatTap, PapanLed, PetaRute } from './props'
import type { PosePetugas } from './types'

const KULIT = '#e8b088'
const RAMBUT = '#26201c'
const SERAGAM = '#33608c'
const SERAGAM_TUA = '#26496b'
const TOPI = '#1c3a55'

export function Petugas({ pose, className = '' }: { pose: PosePetugas; className?: string }) {
  return (
    <svg viewBox="0 0 320 330" className={className} aria-hidden>
      <g className="kk-nafas">
        {pose === 'serahkan' ? (
          <g>
            <path
              d="M116 184 Q116 224 142 244"
              fill="none"
              stroke={SERAGAM}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="146" cy="248" r="10" fill={KULIT} />
          </g>
        ) : (
          <g>
            <path
              d="M116 184 Q102 232 110 270"
              fill="none"
              stroke={SERAGAM}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="110" cy="277" r="10" fill={KULIT} />
          </g>
        )}

        <path d="M112 178 Q112 148 160 146 Q208 148 208 178 L216 330 L104 330 Z" fill={SERAGAM} />
        <path
          d="M112 178 Q112 148 160 146 Q208 148 208 178 L210 200 L110 200 Z"
          fill={SERAGAM_TUA}
          opacity="0.5"
        />
        <path d="M160 150 L146 168 L160 214 L174 168 Z" fill="#f4f8fb" />
        <path d="M160 168 l-5 8 5 30 5 -30 Z" fill={TOPI} />
        <rect x="120" y="196" width="26" height="16" rx="2" fill="#f4f8fb" />
        <rect x="123" y="200" width="20" height="2.5" rx="1" fill={SERAGAM_TUA} />
        <rect x="123" y="205" width="14" height="2.5" rx="1" fill="#8fa9c0" />
        <rect x="176" y="196" width="22" height="9" rx="2" fill="#ffd28a" />

        <rect x="149" y="120" width="22" height="26" rx="8" fill={KULIT} />
        <path d="M149 132 q11 8 22 0 v6 q-11 8 -22 0 Z" fill="rgba(0,0,0,0.08)" />

        <circle cx="160" cy="92" r="46" fill={KULIT} />
        <path d="M116 84 a46 46 0 0 1 88 0 Z" fill={RAMBUT} />
        <path d="M108 78 Q160 40 212 78 L206 60 Q160 30 114 60 Z" fill={TOPI} />
        <path d="M104 78 Q160 58 216 78 L212 88 Q160 68 108 88 Z" fill={TOPI} />
        <rect x="146" y="60" width="28" height="10" rx="3" fill="#ffd28a" />
        <circle cx="112" cy="96" r="7" fill={KULIT} />
        <circle cx="208" cy="96" r="7" fill={KULIT} />

        <g className="kk-mata">
          <ellipse cx="143" cy="96" rx="4" ry="5.5" fill={RAMBUT} />
          <ellipse cx="177" cy="96" rx="4" ry="5.5" fill={RAMBUT} />
        </g>
        <path
          d="M136 85 q7 -5 14 -1 M170 84 q7 -4 14 1"
          stroke={RAMBUT}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M146 114 Q160 126 174 114"
          stroke="#a8623c"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {pose === 'lambai' ? (
          <g className="kk-lambai">
            <path
              d="M206 186 Q238 166 248 132 Q252 112 244 92"
              fill="none"
              stroke={SERAGAM}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="243" cy="84" r="11" fill={KULIT} />
            <path
              d="M236 76 l-3 -8 M243 73 l0 -9 M250 76 l3 -8"
              stroke={KULIT}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        ) : null}
        {pose === 'tunjuk' ? (
          <g className="kk-tunjuk-tangan">
            <path
              d="M206 186 Q248 194 278 186"
              fill="none"
              stroke={SERAGAM}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="284" cy="184" r="10" fill={KULIT} />
            <path d="M290 182 l14 -3" stroke={KULIT} strokeWidth="7" strokeLinecap="round" />
          </g>
        ) : null}
        {pose === 'netral' ? (
          <g>
            <path
              d="M204 184 Q218 232 210 270"
              fill="none"
              stroke={SERAGAM}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="210" cy="277" r="10" fill={KULIT} />
          </g>
        ) : null}
        {pose === 'serahkan' ? (
          <g>
            <path
              d="M204 184 Q204 224 178 244"
              fill="none"
              stroke={SERAGAM}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="174" cy="248" r="10" fill={KULIT} />
            <rect
              x="138"
              y="234"
              width="46"
              height="22"
              rx="3"
              fill="#fdf6e3"
              stroke="#c9b695"
              strokeWidth="2"
            />
            <path
              d="M146 240 h20 M146 246 h28"
              stroke="#8fa9c0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        ) : null}
      </g>
    </svg>
  )
}

function LatarLoket() {
  return (
    <div className="tp-dinding absolute inset-0 overflow-hidden" aria-hidden>
      <PetaRute
        tandaiIndex={2}
        className="absolute left-[4%] top-[8%] w-[46%] max-w-64 -rotate-1"
      />
      <div className="absolute right-[5%] top-[9%] w-[36%] max-w-44">
        <svg viewBox="0 0 90 90" className="mx-auto w-16">
          <circle cx="45" cy="45" r="40" fill="#f4f8fb" stroke="#1c3a55" strokeWidth="5" />
          <path
            d="M45 45 V20 M45 45 L62 52"
            stroke="#1c3a55"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="45" cy="45" r="3.5" fill="#1c3a55" />
        </svg>
        <PapanLed teks="K1 · 5 MNT" className="mt-2" />
      </div>
      <svg
        viewBox="0 0 80 46"
        className="absolute left-[8%] top-[58%] hidden w-[16%] max-w-24 sm:block"
      >
        <rect x="2" y="2" width="76" height="42" rx="5" fill="#1c3a55" />
        <path
          d="M14 30 V16 q0 -3 3 -3 q3 0 3 3 v6 M23 30 V12 q0 -3 3 -3 q3 0 3 3 v10 M32 30 V15 q0 -3 3 -3 q3 0 3 3 v8"
          stroke="#7fd4ff"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <text x="56" y="26" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffd28a">
          RAMAH
        </text>
        <text x="56" y="37" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffd28a">
          ISYARAT
        </text>
      </svg>
    </div>
  )
}

function KonterLoket({ pose }: { pose: PosePetugas }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden>
      <div
        aria-hidden
        className="tp-kaca absolute inset-x-0 bottom-[76px] top-[-60vh] sm:bottom-[90px]"
      >
        <span className="absolute inset-y-0 left-[12%] w-1 bg-white/35" />
        <span className="absolute inset-y-0 right-[18%] w-0.5 bg-white/25" />
        <span className="absolute bottom-[46%] left-1/2 h-14 w-14 -translate-x-1/2 rounded-full border-4 border-[#8fb4d8]/60">
          <span className="absolute inset-2 rounded-full border-2 border-[#8fb4d8]/40" />
        </span>
      </div>
      {pose === 'serahkan' ? (
        <div className="tp-geser-tiket absolute bottom-[80px] left-1/2 z-10 w-20 sm:bottom-[94px]">
          <svg viewBox="0 0 90 44" className="w-full">
            <rect
              x="4"
              y="8"
              width="82"
              height="30"
              rx="4"
              fill="#fdf6e3"
              stroke="#c9b695"
              strokeWidth="2.5"
            />
            <path
              d="M14 17 h30 M14 24 h40 M14 31 h22"
              stroke="#8fa9c0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx="72"
              cy="24"
              r="8"
              fill="none"
              stroke="#33608c"
              strokeWidth="2"
              opacity="0.7"
            />
          </svg>
        </div>
      ) : null}
      <AlatTap className="absolute bottom-[70px] right-[6%] z-10 w-16 sm:bottom-[84px] sm:w-20" />
      <div className="absolute bottom-[72px] left-[4%] z-10 hidden w-[36%] max-w-44 md:block">
        <PapanLed teks="LOKET 1" />
      </div>
      <div className="relative">
        <div className="h-5 w-full rounded-t-[4px] bg-[#41546b] shadow-[0_-6px_18px_rgba(13,31,46,0.35)] sm:h-6" />
        <div className="relative h-16 w-full bg-[#1c3a55] sm:h-20">
          <div className="absolute inset-x-0 top-2 flex items-center justify-center">
            <p className="font-display text-[10px] font-bold tracking-[0.35em] text-[#8fb4d8] sm:text-xs">
              LOKET · HALTE LAKON
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-2 bg-[#f2b23e]" />
        </div>
      </div>
    </div>
  )
}

export function PanggungLoket({ pose, className = '' }: { pose: PosePetugas; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <LatarLoket />
      <Petugas
        pose={pose}
        className="absolute bottom-10 left-1/2 w-[min(260px,72%)] -translate-x-1/2 sm:bottom-12 sm:w-[min(300px,76%)]"
      />
      <KonterLoket pose={pose} />
    </div>
  )
}
