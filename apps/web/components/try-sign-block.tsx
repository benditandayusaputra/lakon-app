'use client'

import { useEffect, useMemo } from 'react'
import { compileSign } from '@lakon/sign-compiler'
import { SEED_SAN_RIG } from '@/features/avatar/seed-san-rig'
import { useContent } from '@/features/content/use-content'
import { PracticeBlock } from '@/components/practice-block'
import { lepasKamera } from '@/features/practice/capture'

export default function TrySignBlock({
  lang,
  missingText,
  loadingText,
}: {
  lang: 'id' | 'en'
  missingText: string
  loadingText: string
}) {
  const { content } = useContent()
  useEffect(() => lepasKamera, [])

  const trySign = useMemo(() => {
    if (!content) return null
    const sign = content.signs.halo ?? Object.values(content.signs)[0]
    if (!sign) return null
    try {
      return { sign, compiled: compileSign(sign, content.handshapes, SEED_SAN_RIG) }
    } catch {
      return null
    }
  }, [content])

  if (!trySign) {
    return <p className="text-teks-sekunder max-w-prose">{content ? missingText : loadingText}</p>
  }
  return (
    <PracticeBlock
      compiled={trySign.compiled}
      sign={trySign.sign}
      signLabel={trySign.sign.gloss[lang]}
      peragaAwal
      sejajar
      kontrolPutar={false}
    />
  )
}
