import type { Metadata } from 'next'
import { CollectLab } from '@/components/collect-lab'

export const metadata: Metadata = {
  title: 'Pengumpul data latih | Lakon',
}

export default function CollectPage() {
  return <CollectLab />
}
