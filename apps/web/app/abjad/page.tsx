import type { Metadata } from 'next'
import { AbjadBelajar } from '@/components/abjad-belajar'
import { arahDariParam, hurufDariParam } from '@/features/abjad/abjad'

export const metadata: Metadata = { title: 'Abjad BISINDO | Lakon' }

export default async function AbjadPage({
  searchParams,
}: {
  searchParams: Promise<{ huruf?: string; arah?: string }>
}) {
  const { huruf, arah } = await searchParams
  return <AbjadBelajar awal={hurufDariParam(huruf)} arahAwal={arahDariParam(arah)} />
}
