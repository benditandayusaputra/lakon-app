import { Check, Coffee, Hand } from 'lucide-react'

export const TEKS_ILUSTRASI = {
  id: {
    judulJendela: 'Lakon · Latihan',
    peraga: 'Peraga',
    kamera: 'Kamera kamu',
    tepat: 'Tepat',
    adegan: 'Adegan 1 · Kedai kopi',
    barista: 'Barista: Mau pesan apa?',
    pelanggan: 'KOPI SUSU, SATU',
  },
  en: {
    judulJendela: 'Lakon · Practice',
    peraga: 'Demo',
    kamera: 'Your camera',
    tepat: 'Correct',
    adegan: 'Scene 1 · Coffee shop',
    barista: 'Barista: What can I get you?',
    pelanggan: 'MILK COFFEE, ONE',
  },
}

type TeksIlustrasi = (typeof TEKS_ILUSTRASI)['id']

const JARI = [
  [432, 112],
  [443, 106],
  [454, 110],
  [462, 122],
] as const

export function HeroIlustrasi({ teks }: { teks: TeksIlustrasi }) {
  return (
    <svg aria-hidden viewBox="0 0 520 420" className="h-auto w-full drop-shadow-2xl">
      <rect
        x={10}
        y={10}
        width={500}
        height={400}
        rx={22}
        fill="#13243d"
        stroke="rgb(140 200 255 / 0.25)"
      />
      {[36, 54, 72].map((x) => (
        <circle key={x} cx={x} cy={30} r={5} fill="rgb(245 248 252 / 0.2)" />
      ))}
      <text x={260} y={35} textAnchor="middle" fontSize={12} fill="rgb(245 248 252 / 0.55)">
        {teks.judulJendela}
      </text>

      <rect x={30} y={52} width={220} height={210} rx={14} fill="#0d1b2e" />
      <text x={46} y={76} fontSize={12} fontWeight={700} fill="#8cc8ff">
        {teks.peraga}
      </text>
      <circle cx={140} cy={130} r={22} fill="#8cc8ff" />
      <path d="M 96 250 C 96 196 116 172 140 172 C 164 172 184 196 184 250 Z" fill="#2b6cb0" />
      <g className="ilustrasi-lambai">
        <line
          x1={170}
          y1={186}
          x2={200}
          y2={142}
          stroke="#2b6cb0"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <circle cx={203} cy={134} r={11} fill="#8cc8ff" />
        <path
          d="M 222 116 q 9 12 0 26 M 232 108 q 13 20 0 42"
          fill="none"
          stroke="#8cc8ff"
          strokeOpacity={0.6}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </g>

      <rect x={270} y={52} width={220} height={210} rx={14} fill="#0a1626" />
      <text x={286} y={76} fontSize={12} fontWeight={700} fill="#8cc8ff">
        {teks.kamera}
      </text>
      <circle cx={474} cy={72} r={4} fill="#8cc8ff" className="ilustrasi-rekam" />
      <path
        d="M 290 100 v -12 h 12 M 470 100 v -12 h -12 M 290 214 v 12 h 12 M 470 214 v 12 h -12"
        fill="none"
        stroke="rgb(245 248 252 / 0.45)"
        strokeWidth={2}
      />
      <circle cx={380} cy={130} r={22} fill="rgb(245 248 252 / 0.14)" />
      <path
        d="M 336 250 C 336 196 356 172 380 172 C 404 172 424 196 424 250 Z"
        fill="rgb(245 248 252 / 0.1)"
      />
      <line
        x1={410}
        y1={186}
        x2={436}
        y2={146}
        stroke="rgb(245 248 252 / 0.14)"
        strokeWidth={14}
        strokeLinecap="round"
      />
      <g stroke="#8cc8ff" strokeWidth={1.5}>
        <line x1={410} y1={186} x2={436} y2={146} />
        <line x1={436} y1={146} x2={442} y2={132} />
        {JARI.map(([x, y]) => (
          <line key={x} x1={442} y1={132} x2={x} y2={y} />
        ))}
      </g>
      <g fill="#8cc8ff">
        {[[410, 186], [436, 146], [442, 132], ...JARI].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={3.5} />
        ))}
      </g>
      <g className="ilustrasi-lencana">
        <rect x={290} y={232} width={100} height={26} rx={13} fill="#256b45" />
        <Check x={300} y={237} size={16} color="#ffffff" strokeWidth={3} />
        <text x={321} y={250} fontSize={13} fontWeight={700} fill="#ffffff">
          {teks.tepat}
        </text>
      </g>
      <rect x={400} y={242} width={72} height={6} rx={3} fill="rgb(245 248 252 / 0.18)" />
      <rect x={400} y={242} width={60} height={6} rx={3} fill="#8cc8ff" />

      <rect x={30} y={278} width={460} height={116} rx={14} fill="#0d1b2e" />
      <Coffee x={46} y={289} size={16} color="#d9a521" strokeWidth={2.25} />
      <text x={70} y={302} fontSize={12} fill="rgb(245 248 252 / 0.7)">
        {teks.adegan}
      </text>
      <rect x={46} y={314} width={250} height={30} rx={15} fill="rgb(245 248 252 / 0.1)" />
      <text x={62} y={334} fontSize={13} fill="#f5f8fc">
        {teks.barista}
      </text>
      <g className="ilustrasi-gelembung">
        <rect x={222} y={354} width={252} height={30} rx={15} fill="#2b6cb0" />
        <Hand x={236} y={361} size={16} color="#ffffff" strokeWidth={2.25} />
        <text x={260} y={374} fontSize={13} fontWeight={700} fill="#ffffff">
          {teks.pelanggan}
        </text>
      </g>
    </svg>
  )
}
