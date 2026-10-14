export type ScenarioPalette = {
  accent: string
  tint: string
  deep: string
  ambient: string
  kelas: string
}

export const SCENARIO_PALETTES: Record<string, ScenarioPalette> = {
  'kedai-kopi': {
    accent: '#b4632c',
    tint: '#f7eadb',
    deep: '#53300f',
    ambient: '#c89b6e',
    kelas: 'palet-kedai-kopi',
  },
  puskesmas: {
    accent: '#3e7d5e',
    tint: '#e7f2ea',
    deep: '#1d442f',
    ambient: '#9dbfa9',
    kelas: 'palet-puskesmas',
  },
  transportasi: {
    accent: '#33608c',
    tint: '#e4edf5',
    deep: '#1c3a55',
    ambient: '#8fa9c0',
    kelas: 'palet-transportasi',
  },
  'wawancara-kerja': {
    accent: '#8a6a45',
    tint: '#f4ede2',
    deep: '#453419',
    ambient: '#c9b695',
    kelas: 'palet-wawancara-kerja',
  },
  darurat: {
    accent: '#5b7285',
    tint: '#e9eef2',
    deep: '#2c3a47',
    ambient: '#a6b4c0',
    kelas: 'palet-darurat',
  },
}

export const DEFAULT_PALETTE: ScenarioPalette = {
  accent: '#46536a',
  tint: '#eaf0f7',
  deep: '#142033',
  ambient: '#b9c6d6',
  kelas: '',
}

export const paletteFor = (scenarioId: string): ScenarioPalette =>
  SCENARIO_PALETTES[scenarioId] ?? DEFAULT_PALETTE

export const SCENARIO_ORDER = [
  'kedai-kopi',
  'puskesmas',
  'transportasi',
  'wawancara-kerja',
  'darurat',
] as const

export const scenarioRank = (scenarioId: string): number => {
  const index = SCENARIO_ORDER.indexOf(scenarioId as (typeof SCENARIO_ORDER)[number])
  return index === -1 ? SCENARIO_ORDER.length : index
}

export type MoodStage = 1 | 2 | 3

export const MOOD_STAGE_CLASS: Record<MoodStage, string> = {
  1: 'suasana-tahap-1',
  2: 'suasana-tahap-2',
  3: 'suasana-tahap-3',
}

export const HAND_SAFE_ZONE = { left: 0.18, right: 0.82, top: 0.2, bottom: 0.78 }

export const OVERLAY_SPEC = {
  handLineColor: 'rgba(255, 255, 255, 0.85)',
  handLineWidth: 3,
  jointColor: 'rgba(90, 130, 220, 0.95)',
  jointRadius: 3.5,
  highlightColor: '#d9a521',
  highlightRadius: 7,
}
