'use client'

import { useCallback, useEffect, useRef } from 'react'

export const useAsalZoom = (aktif: boolean) => {
  const ref = useRef<HTMLDivElement | null>(null)

  const ukur = useCallback(() => {
    const zona = ref.current
    if (!zona) return
    const pintu = zona.querySelector('[data-pintu]')
    if (!pintu) return
    const kotakZona = zona.getBoundingClientRect()
    const kotakPintu = pintu.getBoundingClientRect()
    if (kotakZona.width === 0 || kotakZona.height === 0) return
    const x = ((kotakPintu.left + kotakPintu.width / 2 - kotakZona.left) / kotakZona.width) * 100
    const y = ((kotakPintu.top + kotakPintu.height / 2 - kotakZona.top) / kotakZona.height) * 100
    zona.style.transformOrigin = `${x.toFixed(2)}% ${y.toFixed(2)}%`
  }, [])

  useEffect(() => {
    if (!aktif) return
    ukur()
    const timer = window.setTimeout(ukur, 300)
    window.addEventListener('resize', ukur)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', ukur)
    }
  }, [aktif, ukur])

  return ref
}
