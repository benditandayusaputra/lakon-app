export const SUDUT_PERAGA = ['depan', 'kanan', 'kiri'] as const

export type SudutPeraga = (typeof SUDUT_PERAGA)[number]

export type VideoPeraga = Partial<Record<SudutPeraga, string>> | undefined

export type ModePeraga = 'manusia' | '3d'

export const KAMERA_SUDUT: Record<SudutPeraga, readonly [number, number, number]> = {
  depan: [0, 1.35, 1.7],
  kanan: [1.45, 1.35, 0.95],
  kiri: [-1.45, 1.35, 0.95],
}

export const sumberSudut = (video: VideoPeraga, sudut: SudutPeraga): string | undefined =>
  video ? (video[sudut] ?? video.depan) : undefined

export const sudutTersedia = (video: VideoPeraga, sudut: SudutPeraga): boolean =>
  video ? Boolean(video[sudut]) : true

export const gantiMode = (video: VideoPeraga, mode: ModePeraga, sudut: SudutPeraga) =>
  mode === 'manusia' && video
    ? { mode, sudut: video[sudut] ? sudut : ('depan' as const) }
    : { mode: '3d' as const, sudut }
