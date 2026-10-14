import type { Metadata } from 'next'
import { MirrorLab } from '@/components/mirror-lab'

export const metadata: Metadata = {
  title: 'Mode cermin | Lakon',
}

export default function MirrorPage() {
  return <MirrorLab />
}
