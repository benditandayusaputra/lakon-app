import type { Metadata } from 'next'
import { CompileLab } from '@/components/compile-lab'

export const metadata: Metadata = {
  title: 'Pratinjau kompilasi | Lakon',
}

export default function CompilePage() {
  return <CompileLab />
}
