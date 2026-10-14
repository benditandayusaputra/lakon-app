import type { ReactNode } from 'react'
import { MOOD_STAGE_CLASS, type MoodStage } from '@/features/ui/tokens'

export function SceneBackdrop({
  paletteClass,
  stage,
  showProps = true,
  quietZone = false,
  className = '',
  children,
}: {
  paletteClass: string
  stage: MoodStage
  showProps?: boolean
  quietZone?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={`${paletteClass} ${MOOD_STAGE_CLASS[stage]} relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden
        className="latar-suasana absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, var(--skenario-tint) 0%, var(--skenario-ambient) 78%, var(--skenario-deep) 140%)',
        }}
      >
        {showProps && stage !== 2 ? (
          <>
            <div
              className="absolute right-[4%] top-[6%] h-[14%] w-[22%] rounded-md opacity-70"
              style={{ backgroundColor: 'var(--skenario-deep)' }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-[12%] opacity-80"
              style={{ backgroundColor: 'var(--skenario-accent)' }}
            />
          </>
        ) : null}
        {showProps && stage === 2 ? (
          <div
            className="absolute bottom-0 left-0 right-0 h-[8%] opacity-30"
            style={{ backgroundColor: 'var(--skenario-deep)' }}
          />
        ) : null}
      </div>
      <div aria-hidden className="penimpa-suasana absolute inset-0" />
      {quietZone ? <div aria-hidden className="zona-tenang-gradasi absolute inset-0" /> : null}
      <div className="relative h-full w-full">{children}</div>
    </div>
  )
}
