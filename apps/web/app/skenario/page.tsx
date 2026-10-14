import type { Metadata } from 'next'
import { ScenarioPicker } from '@/components/scenario-picker'

export const metadata: Metadata = { title: 'Pilih skenario | Lakon' }

export default function ScenarioPage() {
  return <ScenarioPicker />
}
