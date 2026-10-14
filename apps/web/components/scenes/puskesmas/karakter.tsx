'use client'

export type PoseMedis = 'netral' | 'lambai' | 'tunjuk' | 'periksa'
export type PeranMedis = 'perawat' | 'dokter' | 'apoteker'

const KULIT = '#e8b48a'
const RAMBUT = '#2e2018'
const MINT = '#79b393'
const MINT_TUA = '#4f8a68'
const HIJAU = '#2f7d52'
const PUTIH = '#f7faf7'
const PUTIH_BAYANG = '#dde8dd'

function Lengan({ pose, warna }: { pose: PoseMedis; warna: string }) {
  return (
    <>
      {pose === 'periksa' ? (
        <g>
          <path
            d="M116 184 Q116 226 142 244"
            fill="none"
            stroke={warna}
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
            stroke={warna}
            strokeWidth="17"
            strokeLinecap="round"
          />
          <circle cx="110" cy="277" r="10" fill={KULIT} />
        </g>
      )}
      {pose === 'lambai' ? (
        <g className="kk-lambai">
          <path
            d="M206 186 Q238 166 248 132 Q252 112 244 92"
            fill="none"
            stroke={warna}
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
        <g>
          <path
            d="M206 186 Q248 194 278 186"
            fill="none"
            stroke={warna}
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
            stroke={warna}
            strokeWidth="17"
            strokeLinecap="round"
          />
          <circle cx="210" cy="277" r="10" fill={KULIT} />
        </g>
      ) : null}
      {pose === 'periksa' ? (
        <g>
          <path
            d="M204 184 Q204 226 178 244"
            fill="none"
            stroke={warna}
            strokeWidth="17"
            strokeLinecap="round"
          />
          <circle cx="174" cy="248" r="10" fill={KULIT} />
        </g>
      ) : null}
    </>
  )
}

function Wajah() {
  return (
    <>
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
      <circle cx="132" cy="106" r="6" fill="#e08a6a" opacity="0.3" />
      <circle cx="188" cy="106" r="6" fill="#e08a6a" opacity="0.3" />
    </>
  )
}

export function KarakterMedis({
  peran,
  pose,
  className = '',
}: {
  peran: PeranMedis
  pose: PoseMedis
  className?: string
}) {
  const warnaLengan = peran === 'apoteker' ? MINT_TUA : PUTIH
  return (
    <svg viewBox="0 0 320 330" className={className} aria-hidden>
      <g className="kk-nafas">
        {pose === 'periksa' ? null : (
          <g>
            <path
              d="M116 184 Q102 232 110 270"
              fill="none"
              stroke={warnaLengan}
              strokeWidth="17"
              strokeLinecap="round"
            />
            <circle cx="110" cy="277" r="10" fill={KULIT} />
          </g>
        )}

        <path
          d="M112 178 Q112 148 160 146 Q208 148 208 178 L216 330 L104 330 Z"
          fill={peran === 'apoteker' ? MINT_TUA : PUTIH}
        />
        {peran === 'dokter' ? (
          <g>
            <path d="M148 150 L160 176 L172 150 L166 148 L160 158 L154 148 Z" fill={HIJAU} />
            <path d="M132 152 L148 330 L120 330 L112 180 Q112 154 132 152 Z" fill={PUTIH_BAYANG} />
            <path d="M188 152 L172 330 L200 330 L208 180 Q208 154 188 152 Z" fill={PUTIH_BAYANG} />
            <path
              d="M138 152 Q140 190 150 330 M182 152 Q180 190 170 330"
              stroke="#c2d1c2"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M142 156 Q160 210 150 246"
              fill="none"
              stroke="#3a4a42"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M178 156 Q170 196 168 224"
              fill="none"
              stroke="#3a4a42"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="151" cy="252" r="9" fill="#8a95a0" />
            <circle cx="151" cy="252" r="5" fill="#5c6670" />
            <rect
              x="186"
              y="200"
              width="20"
              height="26"
              rx="3"
              fill={PUTIH}
              stroke="#c2d1c2"
              strokeWidth="2"
            />
            <rect x="189" y="205" width="14" height="4" rx="2" fill={HIJAU} />
            <rect x="189" y="212" width="14" height="2.5" rx="1" fill="#b0bcb0" />
            <rect x="189" y="217" width="10" height="2.5" rx="1" fill="#b0bcb0" />
          </g>
        ) : null}
        {peran === 'perawat' ? (
          <g>
            <path d="M128 168 L192 168 L200 330 L120 330 Z" fill="#eef5ee" />
            <path d="M128 168 L192 168 L193 186 L127 186 Z" fill={MINT} />
            <rect x="138" y="238" width="20" height="24" rx="4" fill={MINT} opacity="0.6" />
            <rect x="164" y="238" width="20" height="24" rx="4" fill={MINT} opacity="0.6" />
            <g transform="translate(150 200)">
              <rect x="0" y="4" width="20" height="5" rx="2" fill={HIJAU} />
              <rect x="7.5" y="-3.5" width="5" height="20" rx="2" fill={HIJAU} />
            </g>
            <rect
              x="174"
              y="198"
              width="24"
              height="11"
              rx="3"
              fill={PUTIH}
              stroke={MINT_TUA}
              strokeWidth="1.5"
            />
            <rect x="177" y="202" width="18" height="2.4" rx="1.2" fill={MINT_TUA} />
          </g>
        ) : null}
        {peran === 'apoteker' ? (
          <g>
            <path d="M146 148 L160 170 L174 148 L166 146 L160 156 L154 146 Z" fill="#e8f2e8" />
            <rect x="138" y="238" width="44" height="30" rx="5" fill="#3d6e52" />
            <rect x="150" y="230" width="5" height="16" rx="2" fill="#e8f2e8" />
            <rect x="172" y="196" width="26" height="12" rx="3" fill={PUTIH} />
            <rect x="175" y="200" width="20" height="2.4" rx="1.2" fill={MINT_TUA} />
          </g>
        ) : null}

        <rect x="149" y="120" width="22" height="26" rx="8" fill={KULIT} />
        <path d="M149 132 q11 8 22 0 v6 q-11 8 -22 0 Z" fill="rgba(0,0,0,0.08)" />

        <circle cx="160" cy="92" r="46" fill={KULIT} />
        {peran === 'perawat' ? (
          <g>
            <path
              d="M160 38 q-52 4 -50 62 q-1 26 -14 34 q26 12 34 -4 l0 -22 a46 46 0 0 1 60 -56 Z"
              fill={MINT}
            />
            <path
              d="M160 38 q52 4 50 62 q1 26 14 34 q-26 12 -34 -4 l0 -22 a46 46 0 0 0 -60 -56 Z"
              fill={MINT}
            />
            <path
              d="M114 86 a46 46 0 0 1 92 0 l0 -10 q-14 -34 -46 -34 q-32 0 -46 34 Z"
              fill={MINT_TUA}
            />
            <path d="M150 130 q10 10 20 0 l6 22 q-16 10 -32 0 Z" fill={MINT} />
          </g>
        ) : (
          <g>
            <path
              d="M114 92 a46 46 0 0 1 92 0 l0 -14 q-14 -34 -46 -34 q-32 0 -46 34 Z"
              fill={RAMBUT}
            />
            <path
              d="M114 92 q-4 -28 14 -40"
              fill="none"
              stroke={RAMBUT}
              strokeWidth="10"
              strokeLinecap="round"
            />
            <circle cx="112" cy="96" r="7" fill={KULIT} />
            <circle cx="208" cy="96" r="7" fill={KULIT} />
          </g>
        )}
        {peran === 'dokter' ? (
          <g>
            <circle cx="143" cy="94" r="11" fill="none" stroke="#3a4a42" strokeWidth="2.5" />
            <circle cx="177" cy="94" r="11" fill="none" stroke="#3a4a42" strokeWidth="2.5" />
            <path d="M154 92 h12" stroke="#3a4a42" strokeWidth="2.5" />
          </g>
        ) : null}
        <Wajah />

        <Lengan pose={pose} warna={warnaLengan} />
        {pose === 'periksa' && peran === 'dokter' ? (
          <g>
            <circle cx="160" cy="252" r="11" fill="#8a95a0" />
            <circle cx="160" cy="252" r="6" fill="#5c6670" />
          </g>
        ) : null}
      </g>
    </svg>
  )
}

export function PosterKesehatan({
  varian,
  className = '',
}: {
  varian: 'cuci-tangan' | 'gizi' | 'mata'
  className?: string
}) {
  return (
    <div
      className={`rounded-sm border-2 border-[#c4dcca] bg-white p-1.5 shadow-sm ${className}`}
      aria-hidden
    >
      {varian === 'cuci-tangan' ? (
        <svg viewBox="0 0 60 74" className="w-full">
          <rect x="4" y="4" width="52" height="12" rx="2" fill="#2f7d52" />
          <path d="M22 32 q8 -10 16 0 q6 8 -2 14 q-12 8 -16 -2 q-3 -8 2 -12 Z" fill="#79b393" />
          <circle cx="20" cy="28" r="3" fill="#a8d8e8" />
          <circle cx="42" cy="24" r="2.5" fill="#a8d8e8" />
          <circle cx="38" cy="52" r="2" fill="#a8d8e8" />
          <rect x="8" y="60" width="44" height="3" rx="1.5" fill="#c4dcca" />
          <rect x="8" y="66" width="32" height="3" rx="1.5" fill="#c4dcca" />
        </svg>
      ) : varian === 'gizi' ? (
        <svg viewBox="0 0 60 74" className="w-full">
          <rect x="4" y="4" width="52" height="12" rx="2" fill="#b4632c" />
          <circle cx="30" cy="38" r="16" fill="#f3e5cf" />
          <path d="M30 38 L30 22 A16 16 0 0 1 44 30 Z" fill="#5d8a4f" />
          <path d="M30 38 L44 30 A16 16 0 0 1 40 50 Z" fill="#d9a521" />
          <path d="M30 38 L40 50 A16 16 0 0 1 16 44 Z" fill="#c26e3e" />
          <rect x="8" y="60" width="44" height="3" rx="1.5" fill="#e5dfd4" />
          <rect x="8" y="66" width="28" height="3" rx="1.5" fill="#e5dfd4" />
        </svg>
      ) : (
        <svg viewBox="0 0 60 74" className="w-full">
          <rect x="4" y="4" width="52" height="12" rx="2" fill="#33608c" />
          <text x="30" y="34" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2b2620">
            E
          </text>
          <text x="30" y="48" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2b2620">
            F P
          </text>
          <text x="30" y="60" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#5c554a">
            T O Z
          </text>
          <rect x="8" y="66" width="44" height="3" rx="1.5" fill="#dbe4ee" />
        </svg>
      )}
    </div>
  )
}

export function LayarAntrean({
  nomor,
  poli,
  milik,
  className = '',
}: {
  nomor: string
  poli: string
  milik?: string
  className?: string
}) {
  return (
    <div
      className={`pk-led rounded-xl border-4 border-[#1d442f] p-3 shadow-lg ${className}`}
      aria-hidden
    >
      <p className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-[#7dbb8f]">
        <span>Antrean</span>
        <Circle
          aria-hidden
          className="pk-led-kedip inline-block h-[0.6em] w-[0.6em] fill-current text-[#7ee787]"
        />
      </p>
      <p className="mt-1 whitespace-nowrap text-center font-mono text-3xl font-bold tracking-widest text-[#7ee787] drop-shadow-[0_0_10px_rgba(126,231,135,0.6)]">
        {nomor}
      </p>
      <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-[#b7f0c6]">
        {poli}
      </p>
      {milik ? (
        <p className="mt-2 border-t border-dashed border-[#2e4a36] pt-1.5 text-center font-mono text-xs text-[#7dbb8f]">
          Nomormu: <span className="pk-led-kedip font-bold text-[#ffd97a]">{milik}</span>
        </p>
      ) : null}
    </div>
  )
}

export function JamDinding({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <circle cx="30" cy="30" r="26" fill="#ffffff" stroke="#4f8a68" strokeWidth="4" />
      <circle cx="30" cy="30" r="2.5" fill="#2b2620" />
      <path d="M30 30 L30 14" stroke="#2b2620" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 30 L42 36" stroke="#2b2620" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function KursiTunggu({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 70" className={className} aria-hidden>
      <rect x="6" y="14" width="208" height="10" rx="5" fill="#8a95a0" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${10 + i * 52} 0)`}>
          <rect x="4" y="0" width="42" height="18" rx="6" fill="#aeb8c2" />
          <rect x="4" y="24" width="42" height="12" rx="5" fill="#aeb8c2" />
        </g>
      ))}
      <path
        d="M20 24 L14 66 M200 24 L206 66 M110 24 L110 66"
        stroke="#6b7680"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AmbulansParkir({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 90" className={className} aria-hidden>
      <path d="M12 62 L12 30 Q12 24 18 24 L110 24 L110 62 Z" fill="#f7faf7" />
      <path d="M110 34 L148 34 Q160 34 166 46 L172 58 L172 62 L110 62 Z" fill="#f7faf7" />
      <path d="M118 38 h28 l8 14 h-36 Z" fill="#a8d8e8" />
      <rect x="12" y="54" width="160" height="9" fill="#2f7d52" opacity="0.9" />
      <g transform="translate(52 32)">
        <rect x="0" y="6" width="18" height="5" rx="1.5" fill="#2f7d52" />
        <rect x="6.5" y="-0.5" width="5" height="18" rx="1.5" fill="#2f7d52" />
      </g>
      <text
        x="92"
        y="49"
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        letterSpacing="1"
        fill="#2f7d52"
      >
        AMBULANS
      </text>
      <rect x="24" y="16" width="20" height="8" rx="3" fill="#e8b45a" className="kk-lampu-nyala" />
      <circle cx="48" cy="66" r="11" fill="#2b2620" />
      <circle cx="48" cy="66" r="5" fill="#8a95a0" />
      <circle cx="140" cy="66" r="11" fill="#2b2620" />
      <circle cx="140" cy="66" r="5" fill="#8a95a0" />
    </svg>
  )
}
import { Circle } from 'lucide-react'
