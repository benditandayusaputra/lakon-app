'use client'

import { useEffect, useState } from 'react'
import { Briefcase, Bus, Coffee, HeartPulse, PersonStanding, Siren } from 'lucide-react'

const JALAN =
  'M -60 150 C 60 150 110 128 170 128 S 380 142 470 142 S 680 108 760 108 S 960 128 1050 128 S 1250 84 1330 84 S 1460 70 1520 66'

const PIN = [
  { Icon: Coffee, x: 170, y: 128 },
  { Icon: HeartPulse, x: 470, y: 142 },
  { Icon: Bus, x: 760, y: 108 },
  { Icon: Briefcase, x: 1050, y: 128 },
  { Icon: Siren, x: 1330, y: 84 },
] as const

export function HeroLatar({ ringkas = false }: { ringkas?: boolean }) {
  const [gerak, setGerak] = useState(false)
  useEffect(() => {
    setGerak(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-grid absolute inset-0" />
      <span className="hero-orb bg-primary/35 absolute -top-32 left-1/2 h-[30rem] w-[44rem] -translate-x-1/2 rounded-full blur-3xl" />
      <span
        className="hero-orb bg-sorot/10 absolute -right-24 bottom-10 h-72 w-72 rounded-full blur-3xl"
        style={{ animationDelay: '-9s' }}
      />

      <svg
        className="absolute inset-x-0 bottom-0 h-36 w-full sm:h-44"
        viewBox="0 0 1440 180"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d={JALAN}
          fill="none"
          stroke="var(--color-panggung-lantai)"
          strokeWidth={24}
          strokeLinecap="round"
        />
        <path
          d={JALAN}
          fill="none"
          stroke="var(--color-sorot)"
          strokeOpacity={0.7}
          strokeWidth={2.5}
          strokeDasharray="14 14"
          strokeLinecap="round"
          className={gerak ? 'hero-jalan' : undefined}
        />
        {ringkas
          ? null
          : PIN.map(({ Icon, x, y }) => (
              <g key={x} transform={`translate(${x} ${y - 30})`}>
                <path d="M -7 12 L 0 24 L 7 12 Z" fill="#ffffff" />
                <circle r={18} fill="var(--color-primary)" stroke="#ffffff" strokeWidth={3} />
                <Icon x={-9} y={-9} size={18} color="#ffffff" strokeWidth={2.25} />
              </g>
            ))}
        {gerak ? (
          <g>
            <animateMotion dur="22s" repeatCount="indefinite" path={JALAN} calcMode="linear" />
            <circle
              r={15}
              fill="var(--color-panggung)"
              stroke="var(--color-sorot)"
              strokeWidth={2.5}
            />
            <PersonStanding
              x={-10}
              y={-10}
              size={20}
              color="var(--color-sorot)"
              strokeWidth={2.25}
            />
          </g>
        ) : null}
      </svg>
    </div>
  )
}
