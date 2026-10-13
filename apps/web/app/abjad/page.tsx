import type { Metadata } from 'next'
import { AbjadBelajar } from '@/components/abjad-belajar'
import { hurufDariParam } from '@/features/abjad/abjad'

export const metadata: Metadata = { title: 'Abjad BISINDO | Lakon' }

export default async function AbjadPage({
  searchParams,
}: {
  searchParams: Promise<{ huruf?: string }>
}) {
  const { huruf } = await searchParams
  return <AbjadBelajar awal={hurufDariParam(huruf)} />
}
