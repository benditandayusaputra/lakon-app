'use client'

import { useEffect, useState } from 'react'
import {
  handshapeSchema,
  scenarioSchema,
  signSchema,
  type Handshape,
  type Scenario,
  type Sign,
} from '@lakon/sign-schema'

export type LoadedContent = {
  signs: Record<string, Sign>
  handshapes: Handshape[]
  scenarios: Record<string, Scenario>
}

let terakhirDimuat: LoadedContent | null = null

export const signTersimpan = (id: string): Sign | undefined => terakhirDimuat?.signs[id]

export const useContent = () => {
  const [content, setContent] = useState<LoadedContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/content')
      .then((response) => response.json())
      .then(
        (raw: {
          signs: Record<string, unknown>
          handshapes: Record<string, unknown>
          scenarios: Record<string, unknown>
        }) => {
          const signs: Record<string, Sign> = {}
          for (const [id, value] of Object.entries(raw.signs)) {
            const parsed = signSchema.safeParse(value)
            if (parsed.success) signs[id] = parsed.data
          }
          const handshapes: Handshape[] = []
          for (const value of Object.values(raw.handshapes)) {
            const parsed = handshapeSchema.safeParse(value)
            if (parsed.success) handshapes.push(parsed.data)
          }
          const scenarios: Record<string, Scenario> = {}
          for (const [id, value] of Object.entries(raw.scenarios)) {
            const parsed = scenarioSchema.safeParse(value)
            if (parsed.success) scenarios[id] = parsed.data
          }
          terakhirDimuat = { signs, handshapes, scenarios }
          setContent(terakhirDimuat)
        },
      )
      .catch(() => setError('Konten gagal dimuat. Muat ulang halaman.'))
  }, [])

  return { content, error }
}
