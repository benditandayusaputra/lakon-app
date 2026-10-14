export type Karakter = 'perempuan' | 'laki-laki' | 'robot'

const WARNA: Record<Karakter, { kulit: string; rambut: string; baju: string; celana: string }> = {
  perempuan: { kulit: '#f1c9a5', rambut: '#3b2418', baju: '#d95f7a', celana: '#7c4a9c' },
  'laki-laki': { kulit: '#e8b98f', rambut: '#1f1a17', baju: '#2f6fb5', celana: '#2b2e3a' },
  robot: { kulit: '#cfd6dd', rambut: '#8a94a3', baju: '#5b7285', celana: '#3a4553' },
}

export function Pejalan({
  karakter = 'robot',
  berjalan = false,
  hadap = 'kanan',
  x = 0,
  y = 0,
  skala = 1,
}: {
  karakter?: Karakter
  berjalan?: boolean
  hadap?: 'kiri' | 'kanan'
  x?: number
  y?: number
  skala?: number
}) {
  const w = WARNA[karakter]
  const flip = hadap === 'kiri' ? -1 : 1
  return (
    <g
      className={berjalan ? 'pejalan pejalan-jalan' : 'pejalan'}
      transform={`translate(${x} ${y}) scale(${flip * skala} ${skala})`}
    >
      <ellipse cx={0} cy={44} rx={16} ry={5} fill="rgb(0 0 0 / 0.28)" />
      <g className="pejalan-kaki-kiri">
        <rect x={-9} y={18} width={7} height={24} rx={3} fill={w.celana} />
        <rect
          x={-10}
          y={40}
          width={10}
          height={5}
          rx={2}
          fill={karakter === 'robot' ? '#9aa4b1' : '#2b2620'}
        />
      </g>
      <g className="pejalan-kaki-kanan">
        <rect x={2} y={18} width={7} height={24} rx={3} fill={w.celana} />
        <rect
          x={1}
          y={40}
          width={10}
          height={5}
          rx={2}
          fill={karakter === 'robot' ? '#9aa4b1' : '#2b2620'}
        />
      </g>
      {karakter === 'perempuan' ? <path d="M-12 20 L12 20 L15 34 L-15 34 Z" fill={w.baju} /> : null}
      <g className="pejalan-badan">
        <rect
          x={-10}
          y={-4}
          width={20}
          height={26}
          rx={karakter === 'robot' ? 4 : 8}
          fill={w.baju}
        />
        {karakter === 'robot' ? (
          <>
            <rect x={-6} y={2} width={12} height={5} rx={1.5} fill="#f2c94c" />
            <circle cx={0} cy={13} r={2.5} fill="#9aa4b1" />
          </>
        ) : null}
        <g className="pejalan-lengan-kiri">
          <rect
            x={-15}
            y={-2}
            width={6}
            height={20}
            rx={3}
            fill={karakter === 'robot' ? '#9aa4b1' : w.kulit}
          />
        </g>
        <g className="pejalan-lengan-kanan">
          <rect
            x={9}
            y={-2}
            width={6}
            height={20}
            rx={3}
            fill={karakter === 'robot' ? '#9aa4b1' : w.kulit}
          />
        </g>
        {karakter === 'robot' ? (
          <>
            <rect x={-9} y={-24} width={18} height={19} rx={5} fill={w.kulit} />
            <rect x={-6} y={-18} width={12} height={5} rx={2.5} fill="#1f6feb" />
            <rect x={-1.5} y={-30} width={3} height={7} rx={1.5} fill="#9aa4b1" />
            <circle cx={0} cy={-31} r={2.5} fill="#f2c94c" />
          </>
        ) : (
          <>
            <circle cx={0} cy={-13} r={10} fill={w.kulit} />
            {karakter === 'perempuan' ? (
              <>
                <path
                  d="M-10 -14 Q-11 -30 0 -27 Q11 -30 10 -14 Q6 -22 0 -22 Q-6 -22 -10 -14 Z"
                  fill={w.rambut}
                />
                <path d="M-10 -14 L-13 4 L-7 2 Z" fill={w.rambut} />
                <path d="M10 -14 L13 4 L7 2 Z" fill={w.rambut} />
              </>
            ) : (
              <path
                d="M-10 -14 Q-10 -27 0 -26 Q10 -27 10 -14 Q6 -20 0 -19 Q-6 -20 -10 -14 Z"
                fill={w.rambut}
              />
            )}
            <circle cx={3.5} cy={-12} r={1.4} fill="#2b2620" />
            <circle cx={-3.5} cy={-12} r={1.4} fill="#2b2620" />
            <path
              d="M-3 -8 Q0 -6 3 -8"
              stroke="#a5583f"
              strokeWidth={1.2}
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}
      </g>
    </g>
  )
}
