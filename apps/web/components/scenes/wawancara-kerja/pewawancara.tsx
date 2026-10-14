import {
  BingkaiTangan,
  CangkirSaji,
  JendelaDalam,
  LampuGantung,
  MapBerkas,
  MesinEspresso,
  PapanMenuMini,
  RakStoples,
} from './props'
import { JAM_WAWANCARA, type PosePewawancara } from './types'

const KULIT = '#e0a97e'
const KERUDUNG = '#f1e4cf'
const KERUDUNG_BAYANG = '#d8c4a0'
const BAJU = '#3f6f6a'
const BAJU_GELAP = '#2f5652'
const APRON = '#5a3a26'
const APRON_TUA = '#452a18'
const PAPAN = '#b47a45'

function PapanJalan({
  x,
  y,
  lebar,
  tinggi,
}: {
  x: number
  y: number
  lebar: number
  tinggi: number
}) {
  return (
    <g>
      <rect x={x} y={y} width={lebar} height={tinggi} rx="4" fill={PAPAN} />
      <rect x={x + 4} y={y + 8} width={lebar - 8} height={tinggi - 12} rx="2" fill="#fdfaf3" />
      <rect x={x + lebar / 2 - 9} y={y - 4} width="18" height="9" rx="2" fill="#8a8378" />
      <path
        d={`M${x + 10} ${y + 18} h${lebar - 20} M${x + 10} ${y + 26} h${lebar - 28} M${x + 10} ${y + 34} h${lebar - 24}`}
        stroke="#b0a591"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>
  )
}

export function Pewawancara({
  pose,
  className = '',
}: {
  pose: PosePewawancara
  className?: string
}) {
  const pegangPapan = pose === 'netral' || pose === 'lambai' || pose === 'tunjuk'
  return (
    <svg viewBox="0 0 320 330" className={className} aria-hidden>
      <g className="wk-nafas">
        {pose === 'sajikan' ? (
          <path
            d="M116 184 Q116 226 140 246"
            fill="none"
            stroke={BAJU}
            strokeWidth="17"
            strokeLinecap="round"
          />
        ) : pose === 'catat' ? (
          <path
            d="M116 184 Q104 226 132 240"
            fill="none"
            stroke={BAJU}
            strokeWidth="17"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M116 184 Q100 220 108 248"
            fill="none"
            stroke={BAJU}
            strokeWidth="17"
            strokeLinecap="round"
          />
        )}

        <path d="M112 178 Q112 148 160 146 Q208 148 208 178 L216 330 L104 330 Z" fill={BAJU} />
        <path
          d="M112 178 Q112 148 160 146 Q208 148 208 178 L210 210 L110 210 Z"
          fill={BAJU_GELAP}
          opacity="0.35"
        />

        <path d="M128 172 L192 172 L204 330 L116 330 Z" fill={APRON} />
        <path d="M128 172 L192 172 L194 190 L126 190 Z" fill={APRON_TUA} />
        <rect x="138" y="244" width="44" height="34" rx="5" fill={APRON_TUA} />
        <rect x="170" y="196" width="28" height="13" rx="3" fill="#f5e9d7" />
        <rect x="173" y="200" width="22" height="2.4" rx="1.2" fill="#8a5a33" />
        <rect x="173" y="204" width="14" height="2" rx="1" fill="#b0a591" />

        <path d="M110 118 Q98 152 94 192 Q160 216 226 192 Q222 152 210 118 Z" fill={KERUDUNG} />
        <path
          d="M110 118 Q98 152 94 192 Q120 200 148 202 Q130 160 138 118 Z"
          fill={KERUDUNG_BAYANG}
          opacity="0.45"
        />

        <ellipse cx="160" cy="94" rx="52" ry="54" fill={KERUDUNG} />
        <path
          d="M118 70 Q160 44 202 70"
          stroke={KERUDUNG_BAYANG}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        <ellipse cx="160" cy="100" rx="34" ry="39" fill={KULIT} />

        <g className="wk-mata">
          <ellipse cx="146" cy="100" rx="3.6" ry="5" fill="#2b1a0e" />
          <ellipse cx="174" cy="100" rx="3.6" ry="5" fill="#2b1a0e" />
        </g>
        <g fill="none" stroke="#3b2a1a" strokeWidth="2.5">
          <circle cx="146" cy="100" r="10" />
          <circle cx="174" cy="100" r="10" />
          <path d="M156 100 h8" />
        </g>
        <path
          d="M138 86 q8 -5 16 -1 M166 85 q8 -4 16 1"
          stroke="#3b2a1a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M148 118 Q160 129 172 118"
          stroke="#a8623c"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="134" cy="112" r="6" fill="#e08a6a" opacity="0.35" />
        <circle cx="186" cy="112" r="6" fill="#e08a6a" opacity="0.35" />

        {pegangPapan ? (
          <g>
            <PapanJalan x={86} y={246} lebar={50} tinggi={62} />
            <circle cx="110" cy="252" r="10" fill={KULIT} />
          </g>
        ) : null}
        {pose === 'catat' ? (
          <g>
            <PapanJalan x={120} y={208} lebar={80} tinggi={62} />
            <circle cx="136" cy="243" r="10" fill={KULIT} />
          </g>
        ) : null}
        {pose === 'sajikan' ? <circle cx="144" cy="250" r="10" fill={KULIT} /> : null}

        {pose === 'lambai' ? (
          <g className="wk-lambai">
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
          <g className="wk-tunjuk-tangan">
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
        {pose === 'catat' ? (
          <g>
            <path
              d="M204 184 Q216 226 190 238"
              fill="none"
              stroke={BAJU}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <g className="wk-catat">
              <circle cx="184" cy="242" r="10" fill={KULIT} />
              <path
                d="M184 240 L170 224"
                stroke="#2b1a0e"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path d="M170 224 l-3 -4" stroke="#d9a521" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          </g>
        ) : null}
      </g>
    </svg>
  )
}

function LatarBar() {
  return (
    <div className="wk-ubin absolute inset-0 overflow-hidden" aria-hidden>
      <div className="wk-sinar pointer-events-none absolute -left-10 top-0 h-[75%] w-[42%] rotate-[16deg] rounded-full bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,246,220,1),transparent_72%)] blur-lg" />
      <JendelaDalam className="absolute left-[5%] top-[8%] w-[28%] max-w-32" />
      <RakStoples className="absolute right-[4%] top-[17%] w-[48%] max-w-56" />
      <PapanMenuMini className="absolute left-[6%] top-[50%] hidden w-[36%] max-w-36 -rotate-2 sm:block" />
      <BingkaiTangan className="absolute right-[12%] top-[48%] hidden w-[14%] max-w-16 rotate-2 md:block" />
      <LampuGantung className="absolute left-[42%] top-0 w-12 sm:w-14" />
      <LampuGantung className="absolute right-[8%] top-0 w-10 sm:w-12" />
    </div>
  )
}

function KonterBar({ pose, cangkir }: { pose: PosePewawancara; cangkir: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden>
      {cangkir ? (
        <CangkirSaji
          className={`absolute bottom-[74px] left-1/2 z-10 w-16 -translate-x-1/2 sm:bottom-[86px] ${
            pose === 'sajikan' ? 'wk-geser-cangkir' : ''
          }`}
        />
      ) : null}
      <MapBerkas className="absolute bottom-[70px] left-[2%] z-10 hidden w-[32%] max-w-40 md:block" />
      <MesinEspresso className="absolute bottom-14 right-[3%] w-[32%] max-w-52 sm:bottom-[72px]" />
      <div className="relative">
        <div className="wk-kayu h-5 w-full rounded-t-[4px] shadow-[0_-6px_18px_rgba(69,52,25,0.3)] sm:h-6" />
        <div className="wk-kayu-tua relative h-16 w-full sm:h-20">
          <p className="font-display absolute inset-x-0 top-2 text-center text-[10px] font-bold tracking-[0.35em] text-[#e0c9a6] sm:text-xs">
            KOPI LAKON
          </p>
          <p className="wk-font-kapur absolute inset-x-0 bottom-2 text-center text-xs text-[#c9a06a] sm:text-sm">
            wawancara barista · {JAM_WAWANCARA}
          </p>
        </div>
      </div>
    </div>
  )
}

export function PanggungPewawancara({
  pose,
  cangkir = false,
  className = '',
}: {
  pose: PosePewawancara
  cangkir?: boolean
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <LatarBar />
      <Pewawancara
        pose={pose}
        className="absolute bottom-10 left-1/2 w-[min(260px,72%)] -translate-x-1/2 sm:bottom-12 sm:w-[min(300px,76%)]"
      />
      <KonterBar pose={pose} cangkir={cangkir} />
    </div>
  )
}
