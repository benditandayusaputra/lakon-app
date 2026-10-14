'use client'

import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { SkeletonHelper } from 'three'
import {
  createLandmarkFilter,
  DEFAULT_ONE_EURO,
  type LandmarkFilter,
} from '@/features/avatar/one-euro'
import { FINGER_NAMES, solveHand, type JointReadout, type Side } from '@/features/avatar/solver'
import { disposeAvatar, loadAvatar, type AvatarRig } from '@/features/avatar/vrm'
import { createPipeline, type Pipeline, type PipelineState } from '@/features/practice/pipeline'
import type { HandObservation, PoseObservation } from '@/features/practice/protocol'

type MirrorSettings = {
  smoothing: boolean
  clamp: boolean
  swapSides: boolean
  minCutoff: number
  beta: number
}

type LatestLandmarks = {
  hands: HandObservation[]
  pose: PoseObservation | null
  timestamp: number
  receivedAt: number
}

type Readouts = Partial<Record<Side, JointReadout | null>>

const STATUS_TEXT: Record<PipelineState['status'], string> = {
  idle: 'Berhenti. Tekan mulai untuk menyalakan cermin.',
  starting: 'Menyiapkan kamera dan memuat model MediaPipe.',
  running: 'Berjalan.',
  denied: 'Izin kamera ditolak. Beri izin lewat pengaturan situs, lalu tekan mulai lagi.',
  'no-camera': 'Kamera tidak ditemukan. Sambungkan kamera lalu tekan mulai lagi.',
  unsupported: 'Peramban ini tidak mendukung pengambilan frame yang dibutuhkan.',
  error: 'Terjadi galat.',
}

const FINGER_LABELS: Record<(typeof FINGER_NAMES)[number], string> = {
  thumb: 'jempol',
  index: 'telunjuk',
  middle: 'tengah',
  ring: 'manis',
  little: 'kelingking',
}

const formatReadout = (readouts: Readouts): string => {
  const sides: { side: Side; label: string }[] = [
    { side: 'left', label: 'kiri avatar' },
    { side: 'right', label: 'kanan avatar' },
  ]
  return sides
    .map(({ side, label }) => {
      const readout = readouts[side]
      if (!readout) return `${label}: tangan tidak terdeteksi`
      const fingers = FINGER_NAMES.map((name) => {
        const [a, b, c] = readout.fingers[name]
        return `  ${FINGER_LABELS[name].padEnd(10)} ${a.toFixed(0).padStart(4)}° ${b
          .toFixed(0)
          .padStart(4)}° ${c.toFixed(0).padStart(4)}°`
      }).join('\n')
      return `${label} (putar pergelangan ${readout.wristTwistDeg.toFixed(0)}°)\n${fingers}`
    })
    .join('\n\n')
}

function AvatarView({
  landmarksRef,
  settingsRef,
  readoutsRef,
  showSkeleton,
  onRigError,
}: {
  landmarksRef: MutableRefObject<LatestLandmarks | null>
  settingsRef: MutableRefObject<MirrorSettings>
  readoutsRef: MutableRefObject<Readouts>
  showSkeleton: boolean
  onRigError: (message: string) => void
}) {
  const [rig, setRig] = useState<AvatarRig | null>(null)
  const [skeleton, setSkeleton] = useState<SkeletonHelper | null>(null)
  const filtersRef = useRef<{ hands: LandmarkFilter; pose: LandmarkFilter } | null>(null)
  const lastSolvedRef = useRef(-1)
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    camera.lookAt(0, 1.3, 0)
  }, [camera])

  useEffect(() => {
    let cancelled = false
    let loaded: AvatarRig | null = null
    loadAvatar()
      .then((avatar) => {
        if (cancelled) {
          disposeAvatar(avatar)
          return
        }
        loaded = avatar
        setRig(avatar)
        setSkeleton(new SkeletonHelper(avatar.vrm.scene))
      })
      .catch((err: unknown) => {
        if (!cancelled) onRigError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
      if (loaded) disposeAvatar(loaded)
    }
  }, [onRigError])

  useFrame((_, delta) => {
    if (!rig) return
    const latest = landmarksRef.current
    const settings = settingsRef.current

    if (latest && latest.timestamp !== lastSolvedRef.current) {
      lastSolvedRef.current = latest.timestamp
      filtersRef.current ??= {
        hands: createLandmarkFilter(),
        pose: createLandmarkFilter(),
      }
      const filters = filtersRef.current
      filters.hands.setParams({ minCutoff: settings.minCutoff, beta: settings.beta })
      filters.pose.setParams({ minCutoff: settings.minCutoff, beta: settings.beta })

      const pose = latest.pose
        ? settings.smoothing
          ? filters.pose.filter(latest.pose.world, latest.timestamp, 'pose')
          : latest.pose.world
        : null

      for (const side of ['left', 'right'] as Side[]) {
        const label = settings.swapSides
          ? side === 'left'
            ? 'Right'
            : 'Left'
          : side === 'left'
            ? 'Left'
            : 'Right'
        const observation = latest.hands.find((hand) => hand.handedness === label)
        const world = observation
          ? settings.smoothing
            ? filters.hands.filter(observation.world, latest.timestamp, side)
            : observation.world
          : null
        const readout = solveHand(rig[side], world, pose, {
          clampEnabled: settings.clamp,
          swapSides: settings.swapSides,
        })
        readoutsRef.current[side] = readout
      }
    }

    rig.vrm.update(delta)
  })

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[0.5, 2, 2]} intensity={1.4} />
      {rig ? <primitive object={rig.vrm.scene} /> : null}
      {rig && skeleton && showSkeleton ? <primitive object={skeleton} /> : null}
    </>
  )
}

export function MirrorLab() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pipelineRef = useRef<Pipeline | null>(null)
  const landmarksRef = useRef<LatestLandmarks | null>(null)
  const readoutsRef = useRef<Readouts>({})
  const readoutElRef = useRef<HTMLPreElement>(null)

  const [state, setState] = useState<PipelineState>({ status: 'idle' })
  const [rigError, setRigError] = useState<string | null>(null)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [smoothing, setSmoothing] = useState(true)
  const [clamp, setClamp] = useState(true)
  const [swapSides, setSwapSides] = useState(false)
  const [minCutoff, setMinCutoff] = useState(DEFAULT_ONE_EURO.minCutoff)
  const [beta, setBeta] = useState(DEFAULT_ONE_EURO.beta)

  const settingsRef = useRef<MirrorSettings>({
    smoothing,
    clamp,
    swapSides,
    minCutoff,
    beta,
  })
  settingsRef.current = { smoothing, clamp, swapSides, minCutoff, beta }

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const pipeline = createPipeline({
      video,
      canvas,
      onState: setState,
      onLandmarks: (hands, pose, timestamp) => {
        landmarksRef.current = { hands, pose, timestamp, receivedAt: performance.now() }
      },
    })
    pipelineRef.current = pipeline

    const interval = window.setInterval(() => {
      const el = readoutElRef.current
      if (el) el.textContent = formatReadout(readoutsRef.current)
    }, 200)

    return () => {
      window.clearInterval(interval)
      pipeline.stop()
      pipelineRef.current = null
    }
  }, [])

  const busy = state.status === 'starting'
  const running = state.status === 'running'

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Mode cermin</h1>
        <p className="max-w-prose text-sm">
          Avatar meniru gerakan tanganmu secara langsung. Webcam di kiri, avatar di kanan. Halaman
          ini untuk memverifikasi penyelesai rotasi.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void pipelineRef.current?.start()}
          disabled={busy || running}
          className="bg-primary hover:bg-primary-hover focus-visible:outline-primary rounded-md px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
        >
          Mulai
        </button>
        <button
          type="button"
          onClick={() => pipelineRef.current?.stop()}
          disabled={!running && !busy}
          className="border-border-tegas focus-visible:outline-primary rounded-md border px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
        >
          Berhenti
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          <span className="font-medium">{state.status}</span>
          <span> — {state.message ?? STATUS_TEXT[state.status]}</span>
        </p>
      </div>

      {rigError ? (
        <p role="alert" className="border-border-tegas rounded-md border px-4 py-3 text-sm">
          Avatar gagal dimuat: {rigError}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="aspect-4/3 bg-teks relative w-full overflow-hidden rounded-lg">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
        </div>
        <div className="aspect-4/3 relative w-full overflow-hidden rounded-lg bg-[#e8e6df]">
          <Canvas camera={{ fov: 35, position: [0, 1.3, 2.4] }}>
            <AvatarView
              landmarksRef={landmarksRef}
              settingsRef={settingsRef}
              readoutsRef={readoutsRef}
              showSkeleton={showSkeleton}
              onRigError={setRigError}
            />
          </Canvas>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <fieldset className="flex flex-col gap-3">
          <legend className="text-lg font-semibold">Kontrol diagnostik</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showSkeleton}
              onChange={(event) => setShowSkeleton(event.target.checked)}
            />
            <span>Tampilkan rangka</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={smoothing}
              onChange={(event) => setSmoothing(event.target.checked)}
            />
            <span>Penghalusan One Euro</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={clamp}
              onChange={(event) => setClamp(event.target.checked)}
            />
            <span>Penjepitan anatomis</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={swapSides}
              onChange={(event) => setSwapSides(event.target.checked)}
            />
            <span>Tukar sisi kiri-kanan</span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>
              minCutoff: <span className="font-mono tabular-nums">{minCutoff.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.05}
              value={minCutoff}
              onChange={(event) => setMinCutoff(Number(event.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>
              beta: <span className="font-mono tabular-nums">{beta.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={beta}
              onChange={(event) => setBeta(Number(event.target.value))}
            />
          </label>
        </fieldset>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Sudut sendi (pangkal / tengah / ujung)</h2>
          <pre
            ref={readoutElRef}
            className="border-border-halus min-h-52 rounded-md border p-3 font-mono text-xs leading-relaxed"
          >
            menunggu data
          </pre>
        </section>
      </section>
    </main>
  )
}
