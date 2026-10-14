'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  compileSign,
  sampleCompiled,
  type CompiledSign,
  type CompilerRig,
} from '@lakon/sign-compiler'
import { parseHandshape, parseSign, type Handshape, type Sign } from '@lakon/sign-schema'
import { extractCompilerRig } from '@/features/avatar/compiler-rig'
import { applyCompiledFrame } from '@/features/avatar/player'
import { disposeAvatar, loadAvatar, type AvatarRig } from '@/features/avatar/vrm'

export type Playback = {
  compiled: CompiledSign | null
  playing: boolean
  speed: number
  time: number
}

export function CompiledAvatar({
  playbackRef,
  timeEl,
  sliderEl,
  sudut,
  onRigReady,
  onRigError,
}: {
  playbackRef: RefObject<Playback>
  timeEl: RefObject<HTMLSpanElement | null>
  sliderEl: RefObject<HTMLInputElement | null>
  sudut?: readonly [number, number, number]
  onRigReady: (rig: CompilerRig) => void
  onRigError: (message: string) => void
}) {
  const [avatar, setAvatar] = useState<AvatarRig | null>(null)
  const { camera, gl } = useThree()
  const controlsRef = useRef<OrbitControls | null>(null)

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.target.set(0, 1.25, 0)
    controls.update()
    controlsRef.current = controls
    return () => {
      controlsRef.current = null
      controls.dispose()
    }
  }, [camera, gl])

  useEffect(() => {
    if (!sudut) return
    camera.position.set(sudut[0], sudut[1], sudut[2])
    const controls = controlsRef.current
    if (controls) controls.update()
    else camera.lookAt(0, 1.25, 0)
  }, [camera, sudut])

  useEffect(() => {
    let cancelled = false
    let loaded: AvatarRig | null = null
    loadAvatar()
      .then((rig) => {
        if (cancelled) {
          disposeAvatar(rig)
          return
        }
        loaded = rig
        setAvatar(rig)
        onRigReady(extractCompilerRig(rig))
      })
      .catch((err: unknown) => {
        if (!cancelled) onRigError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
      if (loaded) disposeAvatar(loaded)
    }
  }, [onRigReady, onRigError])

  useFrame((_, delta) => {
    if (!avatar) return
    const playback = playbackRef.current
    const compiled = playback.compiled
    if (compiled) {
      if (playback.playing) {
        playback.time += delta * 1000 * playback.speed
        if (playback.time > compiled.duration + 700) playback.time = 0
      }
      const shownTime = Math.min(playback.time, compiled.duration)
      applyCompiledFrame(avatar, sampleCompiled(compiled, playback.time))
      if (timeEl.current) {
        timeEl.current.textContent = `${Math.round(shownTime)} / ${compiled.duration} ms`
      }
      if (sliderEl.current && document.activeElement !== sliderEl.current) {
        sliderEl.current.value = String(Math.round(shownTime))
      }
    }
    avatar.vrm.update(delta)
  })

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[0.5, 2, 2]} intensity={1.4} />
      {avatar ? <primitive object={avatar.vrm.scene} /> : null}
    </>
  )
}

export function CompileLab() {
  const playbackRef = useRef<Playback>({ compiled: null, playing: true, speed: 1, time: 0 })
  const rigRef = useRef<CompilerRig | null>(null)
  const timeEl = useRef<HTMLSpanElement | null>(null)
  const sliderEl = useRef<HTMLInputElement | null>(null)

  const [signs, setSigns] = useState<Record<string, Sign>>({})
  const [handshapes, setHandshapes] = useState<Handshape[]>([])
  const [selected, setSelected] = useState('')
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [mirror, setMirror] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    fetch('/api/dev/content')
      .then((response) => response.json())
      .then((content: { signs: Record<string, unknown>; handshapes: Record<string, unknown> }) => {
        const parsedSigns: Record<string, Sign> = {}
        for (const [id, raw] of Object.entries(content.signs)) {
          try {
            parsedSigns[id] = parseSign(raw)
          } catch {
            setError(`isyarat ${id} tidak valid, jalankan pnpm check:content`)
          }
        }
        setSigns(parsedSigns)
        const shapes: Handshape[] = []
        for (const raw of Object.values(content.handshapes)) {
          try {
            shapes.push(parseHandshape(raw))
          } catch {
            setError('ada handshape tidak valid, jalankan pnpm check:content')
          }
        }
        setHandshapes(shapes)
        const first = Object.keys(parsedSigns)[0]
        if (first) setSelected(first)
      })
      .catch(() => setError('gagal memuat konten'))
  }, [])

  const recompile = useCallback(
    (signId: string) => {
      const rig = rigRef.current
      const sign = signs[signId]
      if (!rig || !sign) return
      try {
        const compiled = compileSign(sign, handshapes, rig)
        playbackRef.current.compiled = compiled
        playbackRef.current.time = 0
        setDuration(compiled.duration)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    },
    [signs, handshapes],
  )

  useEffect(() => {
    if (selected) recompile(selected)
  }, [selected, recompile])

  const onRigReady = useCallback(
    (rig: CompilerRig) => {
      rigRef.current = rig
      if (selected) recompile(selected)
    },
    [selected, recompile],
  )

  useEffect(() => {
    playbackRef.current.playing = playing
    playbackRef.current.speed = speed
  }, [playing, speed])

  const stepFrame = (direction: 1 | -1) => {
    const compiled = playbackRef.current.compiled
    if (!compiled) return
    setPlaying(false)
    playbackRef.current.playing = false
    const step = 1000 / compiled.fps
    playbackRef.current.time = Math.min(
      compiled.duration,
      Math.max(0, playbackRef.current.time + direction * step),
    )
  }

  const signIds = Object.keys(signs)

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Pratinjau kompilasi</h1>
        <p className="max-w-prose text-sm">
          Pilih berkas isyarat dari content/signs, lihat avatar memperagakan hasil kompilasinya.
          Seret dengan tetikus untuk memutar kamera.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span>Isyarat</span>
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="border-border-tegas rounded-md border px-2 py-1"
          >
            {signIds.length === 0 ? <option value="">tidak ada berkas</option> : null}
            {signIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          className="bg-primary hover:bg-primary-hover focus-visible:outline-primary rounded-md px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {playing ? 'Jeda' : 'Putar'}
        </button>
        <button
          type="button"
          onClick={() => stepFrame(-1)}
          className="border-border-tegas rounded-md border px-3 py-2"
        >
          − frame
        </button>
        <button
          type="button"
          onClick={() => stepFrame(1)}
          className="border-border-tegas rounded-md border px-3 py-2"
        >
          + frame
        </button>
        <label className="flex items-center gap-2 text-sm">
          <span>Kecepatan</span>
          <select
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="border-border-tegas rounded-md border px-2 py-1"
          >
            <option value={1}>1×</option>
            <option value={0.5}>0.5×</option>
            <option value={0.25}>0.25×</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mirror}
            onChange={(event) => setMirror(event.target.checked)}
          />
          <span>Mode cermin</span>
        </label>
      </div>

      {error ? (
        <p role="alert" className="border-border-tegas rounded-md border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className={`aspect-4/3 relative w-full overflow-hidden rounded-lg bg-[#e8e6df]`}>
        <div className={`h-full w-full ${mirror ? '-scale-x-100' : ''}`}>
          <Canvas camera={{ fov: 35, position: [0, 1.3, 2.2] }}>
            <CompiledAvatar
              playbackRef={playbackRef}
              timeEl={timeEl}
              sliderEl={sliderEl}
              onRigReady={onRigReady}
              onRigError={setError}
            />
          </Canvas>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <input
          ref={sliderEl}
          type="range"
          min={0}
          max={Math.max(duration, 1)}
          step={1}
          defaultValue={0}
          onInput={(event) => {
            setPlaying(false)
            playbackRef.current.playing = false
            playbackRef.current.time = Number((event.target as HTMLInputElement).value)
          }}
          className="flex-1"
          aria-label="Posisi waktu animasi"
        />
        <span ref={timeEl} className="font-mono tabular-nums">
          -
        </span>
      </div>
    </main>
  )
}
