import {
  BingkaiTangan,
  CangkirSaji,
  EtalaseKue,
  LampuGantung,
  MesinEspresso,
  StoplesKopi,
  Uap,
} from './props'
import type { PoseBarista } from './types'

const KULIT = '#eab68c'
const RAMBUT = '#33221a'
const BAJU = '#d9a24a'
const BAJU_GELAP = '#b9832f'
const APRON = '#5a3a26'
const APRON_TUA = '#452a18'

export function Barista({ pose, className = '' }: { pose: PoseBarista; className?: string }) {
  return (
    <svg viewBox="0 0 320 330" className={className} aria-hidden>
      <g className="kk-nafas">
        {pose === 'sajikan' ? (
          <g>
            <path
              d="M116 184 Q116 226 140 246"
              fill="none"
              stroke={BAJU}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="144" cy="250" r="10" fill={KULIT} />
          </g>
        ) : (
          <g>
            <path
              d="M116 184 Q102 232 110 270"
              fill="none"
              stroke={BAJU}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="110" cy="277" r="10" fill={KULIT} />
          </g>
        )}

        <path d="M112 178 Q112 148 160 146 Q208 148 208 178 L216 330 L104 330 Z" fill={BAJU} />
        <path
          d="M112 178 Q112 148 160 146 Q208 148 208 178 L210 210 L110 210 Z"
          fill={BAJU_GELAP}
          opacity="0.35"
        />

        <path d="M128 168 L192 168 L204 330 L116 330 Z" fill={APRON} />
        <path d="M128 168 L192 168 L194 186 L126 186 Z" fill={APRON_TUA} />
        <path
          d="M140 168 L150 140 M180 168 L170 140"
          stroke={APRON_TUA}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="138" y="238" width="44" height="34" rx="5" fill={APRON_TUA} />
        <rect x="150" y="230" width="5" height="16" rx="2" fill="#e8d3b8" />
        <circle cx="160" cy="204" r="11" fill="#f5e9d7" />
        <path
          d="M156 200 q4 8 8 0 M158 206 q2 4 4 0"
          stroke="#6b4226"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="172" y="196" width="26" height="12" rx="3" fill="#f5e9d7" />
        <rect x="175" y="200" width="20" height="2.4" rx="1.2" fill="#8a5a33" />

        <rect x="149" y="120" width="22" height="26" rx="8" fill={KULIT} />
        <path d="M149 132 q11 8 22 0 v6 q-11 8 -22 0 Z" fill="rgba(0,0,0,0.08)" />

        <circle cx="160" cy="92" r="46" fill={KULIT} />
        <path d="M114 92 a46 46 0 0 1 92 0 l0 -14 q-14 -34 -46 -34 q-32 0 -46 34 Z" fill={RAMBUT} />
        <path
          d="M114 92 q-4 -28 14 -40"
          fill="none"
          stroke={RAMBUT}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx="207" cy="52" r="15" fill={RAMBUT} />
        <circle cx="112" cy="96" r="7" fill={KULIT} />
        <circle cx="208" cy="96" r="7" fill={KULIT} />

        <g className="kk-mata">
          <ellipse cx="143" cy="94" rx="4" ry="5.5" fill={RAMBUT} />
          <ellipse cx="177" cy="94" rx="4" ry="5.5" fill={RAMBUT} />
        </g>
        <path
          d="M136 82 q7 -5 14 -1 M170 81 q7 -4 14 1"
          stroke={RAMBUT}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M146 112 Q160 124 174 112"
          stroke="#a8623c"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="132" cy="106" r="6" fill="#e08a6a" opacity="0.35" />
        <circle cx="188" cy="106" r="6" fill="#e08a6a" opacity="0.35" />

        {pose === 'lambai' ? (
          <g className="kk-lambai">
            <path
              d="M206 186 Q238 166 248 132 Q252 112 244 92"
              fill="none"
              stroke={BAJU}
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
              stroke={BAJU}
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
              stroke={BAJU}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="210" cy="277" r="10" fill={KULIT} />
          </g>
        ) : null}
        {pose === 'sajikan' ? (
          <g>
            <path
              d="M204 184 Q204 226 180 246"
              fill="none"
              stroke={BAJU}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="176" cy="250" r="10" fill={KULIT} />
          </g>
        ) : null}
      </g>
    </svg>
  )
}

function LatarKonter() {
  return (
    <div className="kk-ubin absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute left-[4%] top-[20%] w-[44%]">
        <StoplesKopi className="w-full" />
      </div>
      <div className="absolute right-[7%] top-[13%] w-[22%] max-w-28 rotate-2 rounded-md border-4 border-[#7a4d2a] bg-[#26301f] p-1.5 shadow-lg">
        <svg viewBox="0 0 60 44" className="w-full">
          <path d="M12 30 H40 L37 40 H15 Z" fill="#ece7d6" opacity="0.85" />
          <path
            d="M40 32 q8 1 6 7 h-8"
            fill="none"
            stroke="#ece7d6"
            strokeWidth="2.5"
            opacity="0.85"
          />
          <path
            d="M20 24 q-3 -6 2 -9 M28 24 q-3 -7 2 -11 M36 25 q-3 -6 2 -9"
            fill="none"
            stroke="#ece7d6"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>
      <BingkaiTangan className="absolute left-[8%] top-[48%] hidden w-[15%] max-w-20 -rotate-2 sm:block" />
      <MesinEspresso className="absolute bottom-14 right-[3%] w-[34%] max-w-56 sm:bottom-[72px]" />
      <LampuGantung className="absolute left-[8%] top-0 w-14 sm:w-16" />
      <LampuGantung className="absolute right-[38%] top-0 w-12 sm:w-14" />
    </div>
  )
}

function KonterBar({ pose }: { pose: PoseBarista }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden>
      {pose === 'sajikan' ? (
        <CangkirSaji className="kk-geser-cangkir absolute bottom-[74px] left-1/2 z-10 w-16 -translate-x-1/2 sm:bottom-[86px]" />
      ) : null}
      <EtalaseKue className="absolute bottom-[70px] left-[2%] z-10 hidden w-[30%] max-w-44 sm:bottom-[82px] md:block" />
      <div className="absolute bottom-[72px] right-[6%] z-10 w-9 sm:bottom-[84px] sm:w-11">
        <svg viewBox="0 0 40 46" aria-hidden>
          <rect x="6" y="10" width="28" height="34" rx="4" fill="#c9b695" opacity="0.75" />
          <rect x="6" y="26" width="28" height="18" rx="4" fill="#8a5f10" opacity="0.6" />
          <rect x="10" y="4" width="20" height="8" rx="2" fill="#6b4226" />
          <text
            x="20"
            y="22"
            textAnchor="middle"
            fontSize="8"
            fill="#452817"
            fontFamily="var(--font-kapur), cursive"
          >
            tip
          </text>
        </svg>
      </div>
      <div className="relative">
        <div className="kk-kayu h-5 w-full rounded-t-[4px] shadow-[0_-6px_18px_rgba(0,0,0,0.35)] sm:h-6" />
        <div className="kk-kayu-gelap relative h-16 w-full sm:h-20">
          <div className="absolute inset-x-0 top-2 flex items-center justify-center">
            <p className="font-display text-[10px] font-bold tracking-[0.35em] text-[#c9a06a] sm:text-xs">
              KOPI LAKON
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5 opacity-60">
            <span className="h-px w-8 bg-[#c9a06a]/50" />
            <Uap warna="#c9a06a" className="h-4 w-4" />
            <span className="h-px w-8 bg-[#c9a06a]/50" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PanggungBarista({
  pose,
  className = '',
}: {
  pose: PoseBarista
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <LatarKonter />
      <Barista
        pose={pose}
        className="absolute bottom-10 left-1/2 w-[min(260px,72%)] -translate-x-1/2 sm:bottom-12 sm:w-[min(300px,76%)]"
      />
      <KonterBar pose={pose} />
    </div>
  )
}
