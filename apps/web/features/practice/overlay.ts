import {
  POSE_LEFT_SHOULDER,
  POSE_RIGHT_SHOULDER,
  type HandObservation,
  type PoseObservation,
} from './protocol'

export const HAND_CONNECTIONS: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
]

export type OverlayFrame = {
  hands: readonly HandObservation[]
  pose: PoseObservation | null
}

export type OverlayOptions = {
  mirrored?: boolean
  handColor?: string
  jointColor?: string
  shoulderColor?: string
}

export type OverlayHighlight = {
  side: 'Left' | 'Right'
  part: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky' | 'pergelangan' | 'telapak'
}

const HIGHLIGHT_LANDMARKS: Record<OverlayHighlight['part'], number[]> = {
  thumb: [3, 4],
  index: [6, 8],
  middle: [10, 12],
  ring: [14, 16],
  pinky: [18, 20],
  pergelangan: [0],
  telapak: [0, 5, 9, 13, 17],
}

export type Overlay = {
  resize: (cssWidth: number, cssHeight: number) => void
  draw: (frame: OverlayFrame) => void
  setHighlights: (highlights: readonly OverlayHighlight[]) => void
  clear: () => void
}

export const createOverlay = (canvas: HTMLCanvasElement, options: OverlayOptions = {}): Overlay => {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d tidak tersedia')

  const mirrored = options.mirrored ?? true
  const handColor = options.handColor ?? 'rgba(255, 255, 255, 0.85)'
  const jointColor = options.jointColor ?? 'rgba(90, 130, 220, 0.95)'
  const shoulderColor = options.shoulderColor ?? 'rgba(255, 255, 255, 0.55)'
  const highlightColor = '#d9a521'

  let width = 0
  let height = 0
  let highlights: readonly OverlayHighlight[] = []

  const resize = (cssWidth: number, cssHeight: number) => {
    const dpr = globalThis.devicePixelRatio || 1
    width = cssWidth
    height = cssHeight
    canvas.width = Math.round(cssWidth * dpr)
    canvas.height = Math.round(cssHeight * dpr)
    canvas.style.width = `${cssWidth}px`
    canvas.style.height = `${cssHeight}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const px = (x: number) => (mirrored ? (1 - x) * width : x * width)
  const py = (y: number) => y * height

  const clear = () => ctx.clearRect(0, 0, width, height)

  const draw = (frame: OverlayFrame) => {
    clear()

    const shoulders = frame.pose?.overlay
    if (shoulders) {
      ctx.fillStyle = shoulderColor
      for (const index of [POSE_LEFT_SHOULDER, POSE_RIGHT_SHOULDER]) {
        const point = shoulders[index]
        if (!point) continue
        ctx.beginPath()
        ctx.arc(px(point.x), py(point.y), 6, 0, Math.PI * 2)
        ctx.fill()
      }
      const left = shoulders[POSE_LEFT_SHOULDER]
      const right = shoulders[POSE_RIGHT_SHOULDER]
      if (left && right) {
        ctx.strokeStyle = shoulderColor
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(px(left.x), py(left.y))
        ctx.lineTo(px(right.x), py(right.y))
        ctx.stroke()
      }
    }

    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    for (const hand of frame.hands) {
      const points = hand.overlay
      ctx.strokeStyle = handColor
      ctx.beginPath()
      for (const [a, b] of HAND_CONNECTIONS) {
        const from = points[a]
        const to = points[b]
        if (!from || !to) continue
        ctx.moveTo(px(from.x), py(from.y))
        ctx.lineTo(px(to.x), py(to.y))
      }
      ctx.stroke()

      ctx.fillStyle = jointColor
      for (const point of points) {
        ctx.beginPath()
        ctx.arc(px(point.x), py(point.y), 3.5, 0, Math.PI * 2)
        ctx.fill()
      }

      const handHighlights = highlights.filter((h) => h.side === hand.handedness)
      if (handHighlights.length > 0) {
        ctx.strokeStyle = highlightColor
        ctx.lineWidth = 3
        for (const highlight of handHighlights) {
          for (const index of HIGHLIGHT_LANDMARKS[highlight.part]) {
            const point = points[index]
            if (!point) continue
            ctx.beginPath()
            ctx.arc(px(point.x), py(point.y), 7, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      }
    }
  }

  const setHighlights = (next: readonly OverlayHighlight[]) => {
    highlights = next
  }

  return { resize, draw, setHighlights, clear }
}
