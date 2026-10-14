import { Briefcase, Bus, Coffee, HeartPulse, Siren, type LucideIcon } from 'lucide-react'

export const SCENE_ICONS: Record<string, LucideIcon> = {
  'kedai-kopi': Coffee,
  puskesmas: HeartPulse,
  transportasi: Bus,
  'wawancara-kerja': Briefcase,
  darurat: Siren,
}

export const scenarioSignIds = (scenario: {
  vocab: string[]
  nodes: {
    task?: { deaf: { type: string; sign?: string }; service: { type: string; sign?: string } }
  }[]
}) =>
  new Set([
    ...scenario.vocab,
    ...scenario.nodes.flatMap((node) =>
      node.task
        ? [node.task.deaf, node.task.service].flatMap((task) =>
            task.type === 'point' || !task.sign ? [] : [task.sign],
          )
        : [],
    ),
  ])
