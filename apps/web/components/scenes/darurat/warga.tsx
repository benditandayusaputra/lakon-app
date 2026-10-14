import {
  JamDinding,
  KotakP3K,
  PapanNomorDarurat,
  PetaLingkungan,
  RadioHT,
  TeleponMeja,
} from './props'
import type { PoseWarga } from './types'

const KULIT = '#d9a07a'
const RAMBUT = '#2a1d16'
const BAJU = '#7fb0d6'
const BAJU_GELAP = '#5f92ba'
const ROMPI = '#f2a93b'
const ROMPI_TUA = '#d98f22'
const REFLEKTIF = '#f6f2ea'
const TOPI = '#33465a'

function Lengan({ d, className = '' }: { d: string; className?: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={BAJU}
      strokeWidth="17"
      strokeLinecap="round"
      className={className}
    />
  )
}

export function Warga({ pose, className = '' }: { pose: PoseWarga; className?: string }) {
  return (
    <svg viewBox="0 0 320 330" className={className} aria-hidden>
      <g className="kk-nafas">
        {pose === 'telepon' ? (
          <g>
            <Lengan d="M116 184 Q86 208 96 252" />
            <g transform="translate(96 252)">
              <circle r="11" fill={KULIT} />
              <path
                d="M-9 -4 l-2 -12 M-3 -8 l0 -14 M4 -8 l2 -14 M10 -4 l5 -11"
                stroke={KULIT}
                strokeWidth="5"
                strokeLinecap="round"
              />
            </g>
          </g>
        ) : pose === 'tenang' ? (
          <g>
            <Lengan d="M116 184 Q98 226 108 262" />
            <circle cx="110" cy="270" r="10" fill={KULIT} />
          </g>
        ) : (
          <g>
            <Lengan d="M116 184 Q102 232 110 270" />
            <circle cx="110" cy="277" r="10" fill={KULIT} />
          </g>
        )}

        <path d="M112 178 Q112 148 160 146 Q208 148 208 178 L216 330 L104 330 Z" fill={BAJU} />
        <path
          d="M112 178 Q112 148 160 146 Q208 148 208 178 L210 210 L110 210 Z"
          fill={BAJU_GELAP}
          opacity="0.35"
        />
        <path d="M124 160 L150 150 L150 330 L112 330 Z" fill={ROMPI} />
        <path d="M196 160 L170 150 L170 330 L208 330 Z" fill={ROMPI} />
        <path d="M124 160 L150 150 L150 170 L126 178 Z" fill={ROMPI_TUA} />
        <path d="M196 160 L170 150 L170 170 L194 178 Z" fill={ROMPI_TUA} />
        <rect x="112" y="232" width="38" height="9" fill={REFLEKTIF} opacity="0.9" />
        <rect x="170" y="232" width="38" height="9" fill={REFLEKTIF} opacity="0.9" />
        <rect x="112" y="252" width="38" height="5" fill={REFLEKTIF} opacity="0.6" />
        <rect x="170" y="252" width="38" height="5" fill={REFLEKTIF} opacity="0.6" />
        <rect x="118" y="196" width="26" height="14" rx="3" fill="#ffffff" />
        <text x="131" y="206" textAnchor="middle" fontSize="8" fontWeight="800" fill={TOPI}>
          POS
        </text>
        <circle cx="184" cy="203" r="7" fill="#ffffff" />
        <path
          d="M181 203 l2 2 l4 -5"
          stroke="#3e8e5e"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        <rect x="149" y="120" width="22" height="26" rx="8" fill={KULIT} />
        <path d="M149 132 q11 8 22 0 v6 q-11 8 -22 0 Z" fill="rgba(0,0,0,0.08)" />

        <circle cx="160" cy="92" r="46" fill={KULIT} />
        <path d="M114 92 a46 46 0 0 1 92 0 l0 -10 q-10 -30 -46 -30 q-36 0 -46 30 Z" fill={RAMBUT} />
        <path d="M108 78 Q112 46 160 44 Q208 46 212 78 Z" fill={TOPI} />
        <rect x="104" y="74" width="112" height="10" rx="4" fill={TOPI} />
        <rect x="104" y="80" width="112" height="3" fill={ROMPI} />
        <path d="M200 80 h30 q6 0 6 6 v2 h-36 Z" fill={TOPI} />
        <circle cx="112" cy="98" r="7" fill={KULIT} />
        <circle cx="208" cy="98" r="7" fill={KULIT} />

        <g className="kk-mata">
          <ellipse cx="143" cy="96" rx="4" ry="5.5" fill={RAMBUT} />
          <ellipse cx="177" cy="96" rx="4" ry="5.5" fill={RAMBUT} />
        </g>
        <path
          d={
            pose === 'tenang'
              ? 'M136 86 q7 -3 14 0 M170 86 q7 -3 14 0'
              : 'M136 84 q7 -5 14 -1 M170 83 q7 -4 14 1'
          }
          stroke={RAMBUT}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={
            pose === 'tenang' || pose === 'lambai'
              ? 'M146 112 Q160 126 174 112'
              : 'M148 114 Q160 120 172 114'
          }
          stroke="#a8623c"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="132" cy="108" r="6" fill="#e08a6a" opacity="0.3" />
        <circle cx="188" cy="108" r="6" fill="#e08a6a" opacity="0.3" />

        {pose === 'lambai' ? (
          <g className="kk-lambai">
            <Lengan d="M206 186 Q238 166 248 132 Q252 112 244 92" />
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
            <Lengan d="M206 186 Q248 194 278 186" />
            <circle cx="284" cy="184" r="10" fill={KULIT} />
            <path d="M290 182 l14 -3" stroke={KULIT} strokeWidth="7" strokeLinecap="round" />
          </g>
        ) : null}
        {pose === 'netral' ? (
          <g>
            <Lengan d="M204 184 Q218 232 210 270" />
            <circle cx="210" cy="277" r="10" fill={KULIT} />
          </g>
        ) : null}
        {pose === 'telepon' ? (
          <g>
            <Lengan d="M204 184 Q250 178 218 126" />
            <g transform="translate(210 104) rotate(-24) scale(0.5) translate(-30 -50)">
              <path
                d="M22 8 Q8 8 8 22 L14 34 Q18 40 26 38 L30 34 Q28 50 30 66 L26 62 Q18 60 14 66 L8 78 Q8 92 22 92 Q34 92 44 76 Q54 56 52 44 Q54 24 44 16 Q34 8 22 8 Z"
                fill="#2b3a48"
              />
            </g>
            <circle cx="216" cy="122" r="11" fill={KULIT} />
          </g>
        ) : null}
        {pose === 'tenang' ? (
          <g className="dr-jempol">
            <Lengan d="M204 184 Q240 196 246 150" />
            <g transform="translate(246 142)">
              <rect x="-10" y="-6" width="20" height="18" rx="6" fill={KULIT} />
              <path d="M-4 -6 Q-6 -24 4 -22 Q8 -20 6 -6" fill={KULIT} />
            </g>
          </g>
        ) : null}
      </g>
    </svg>
  )
}

function LatarPos() {
  return (
    <div className="dr-dinding absolute inset-0 overflow-hidden" aria-hidden>
      <PapanNomorDarurat
        kompak
        className="absolute left-[4%] top-[8%] w-[44%] max-w-44 -rotate-1"
      />
      <JamDinding className="absolute right-[5%] top-[7%] w-11 sm:w-12" />
      <KotakP3K className="absolute right-[6%] top-[36%] w-16 sm:w-20" />
      <PetaLingkungan
        ringkas
        judul="PETA RW 05"
        className="absolute left-[52%] top-[11%] hidden w-[26%] max-w-32 rotate-1 md:block"
      />
      <div className="absolute inset-x-0 top-[62%] h-1.5 bg-[#33465a]/25" />
    </div>
  )
}

function MejaPos({ pose }: { pose: PoseWarga }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden>
      <TeleponMeja
        diangkat={pose === 'telepon'}
        className="absolute bottom-[72px] left-[5%] z-10 w-24 sm:bottom-[84px] sm:w-28"
      />
      <RadioHT className="absolute bottom-[70px] right-[9%] z-10 w-7 sm:bottom-[82px] sm:w-9" />
      <div className="absolute bottom-[70px] right-[20%] z-10 hidden w-14 sm:bottom-[82px] sm:block">
        <svg viewBox="0 0 60 44">
          <rect x="4" y="8" width="52" height="34" rx="3" fill="#dfe6ec" />
          <rect x="22" y="2" width="16" height="10" rx="2" fill="#33465a" />
          <path
            d="M12 20 h36 M12 27 h30 M12 34 h22"
            stroke="#8fa3b5"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="relative">
        <div className="h-5 w-full rounded-t-[4px] bg-[#dfe6ec] shadow-[0_-6px_18px_rgba(31,45,58,0.25)] sm:h-6" />
        <div className="dr-meja relative h-16 w-full sm:h-20">
          <div className="absolute inset-x-0 top-2 flex items-center justify-center">
            <p className="font-display text-[10px] font-bold tracking-[0.35em] text-[#ffd98a] sm:text-xs">
              POS SIAGA WARGA · RW 05
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1.5 opacity-70">
            <span className="h-px w-8 bg-[#ffd98a]/50" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#f2a93b]" />
            <span className="h-px w-8 bg-[#ffd98a]/50" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PanggungWarga({ pose, className = '' }: { pose: PoseWarga; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <LatarPos />
      <Warga
        pose={pose}
        className="absolute bottom-10 left-1/2 w-[min(230px,64%)] -translate-x-1/2 sm:bottom-12 sm:w-[min(300px,76%)]"
      />
      <MejaPos pose={pose} />
    </div>
  )
}
