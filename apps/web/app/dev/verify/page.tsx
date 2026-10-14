import type { Metadata } from 'next'
import { VerifyLab } from '@/components/verify-lab'

export const metadata: Metadata = {
  title: 'Uji verifikasi | Lakon',
}

export default function VerifyPage() {
  return <VerifyLab />
}
