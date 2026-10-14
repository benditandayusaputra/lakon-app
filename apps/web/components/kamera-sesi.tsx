'use client'

import { useEffect } from 'react'
import { lepasKamera } from '@/features/practice/capture'

export function KameraSesi() {
  useEffect(() => lepasKamera, [])
  return null
}
