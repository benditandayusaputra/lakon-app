'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { compileSign, deriveAnchors, type CompilerRig } from '@lakon/sign-compiler'
import {
  ANCHORS,
  DIRECTIONS,
  EASINGS,
  FINGERS,
  PATH_PLANES,
  PATH_SHAPES,
  PHASE_NAMES,
  parseHandshape,
  parseSign,
  signSchema,
  type Handshape,
  type Sign,
  type SignPhase,
} from '@lakon/sign-schema'
import { CompiledAvatar, type Playback } from '@/components/compile-lab'
import { listSessions, type CollectFrame, type CollectSession } from '@/features/collect/store'
import { draftSignFromFrames, reverseFramesFromRecording } from '@/features/editor/reverse'
import { extractLandmarksFromVideo } from '@/features/editor/process-video'
import { HAND_CONNECTIONS } from '@/features/practice/overlay'

const clone = <T,>(value: T): T => structuredClone(value)

const inputClass = 'border-border-tegas rounded-md border px-2 py-1'

const sumDuration = (phases: SignPhase[]) =>
  phases.reduce((sum, phase) => sum + phase.duration + (phase.hold ?? 0), 0)

const drawReference = (canvas: HTMLCanvasElement, frames: CollectFrame[], fraction: number) => {
  const ctx = canvas.getContext('2d')
  if (!ctx || frames.length === 0) return
  const frame = frames[Math.min(frames.length - 1, Math.floor(fraction * frames.length))]!
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#111827'
  ctx.fillRect(0, 0, width, height)

  const scale = height * 1.6
  const half = frame.hands.length > 1
  frame.hands.forEach((hand, index) => {
    const centerX = half ? (index === 0 ? width * 0.3 : width * 0.7) : width / 2
    const centerY = height / 2
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (const [a, b] of HAND_CONNECTIONS) {
      const from = hand.world[a]
      const to = hand.world[b]
      if (!from || !to) continue
      ctx.moveTo(centerX - from.x * scale, centerY + from.y * scale)
      ctx.lineTo(centerX - to.x * scale, centerY + to.y * scale)
    }
    ctx.stroke()
  })
}

export function SignEditor() {
  const playbackRef = useRef<Playback>({ compiled: null, playing: true, speed: 1, time: 0 })
  const rigRef = useRef<CompilerRig | null>(null)
  const timeEl = useRef<HTMLSpanElement | null>(null)
  const sliderEl = useRef<HTMLInputElement | null>(null)
  const referenceCanvas = useRef<HTMLCanvasElement | null>(null)
  const referenceRef = useRef<CollectFrame[] | null>(null)

  const [signs, setSigns] = useState<Record<string, Sign>>({})
  const [handshapes, setHandshapes] = useState<Record<string, Handshape>>({})
  const [changedShapes, setChangedShapes] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState('')
  const [working, setWorking] = useState<Sign | null>(null)
  const [dirty, setDirty] = useState(false)
  const [editShapeId, setEditShapeId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [sessions, setSessions] = useState<CollectSession[]>([])
  const [referenceLabel, setReferenceLabel] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [draftSide, setDraftSide] = useState<'left' | 'right'>('right')
  const [draftId, setDraftId] = useState('draf-baru')

  useEffect(() => {
    fetch('/api/dev/content')
      .then((response) => response.json())
      .then((content: { signs: Record<string, unknown>; handshapes: Record<string, unknown> }) => {
        const parsedSigns: Record<string, Sign> = {}
        for (const [id, raw] of Object.entries(content.signs)) {
          try {
            parsedSigns[id] = parseSign(raw)
          } catch {
            setError(`isyarat ${id} tidak valid`)
          }
        }
        const parsedShapes: Record<string, Handshape> = {}
        for (const [id, raw] of Object.entries(content.handshapes)) {
          try {
            parsedShapes[id] = parseHandshape(raw)
          } catch {
            setError(`handshape ${id} tidak valid`)
          }
        }
        setSigns(parsedSigns)
        setHandshapes(parsedShapes)
        const first = Object.keys(parsedSigns)[0]
        if (first) setSelectedId(first)
      })
      .catch(() => setError('gagal memuat konten'))
    listSessions()
      .then(setSessions)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const sign = signs[selectedId]
    if (sign) {
      setWorking(clone(sign))
      setDirty(false)
      const firstShape = sign.phases[0]?.dominant.handshape
      if (firstShape) setEditShapeId(firstShape)
    }
  }, [selectedId, signs])

  useEffect(() => {
    if (!working) return
    const rig = rigRef.current
    if (!rig) return
    const handle = window.setTimeout(() => {
      try {
        const compiled = compileSign(working, Object.values(handshapes), rig)
        playbackRef.current.compiled = compiled
        if (playbackRef.current.time > compiled.duration) playbackRef.current.time = 0
        setDuration(compiled.duration)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    }, 150)
    return () => window.clearTimeout(handle)
  }, [working, handshapes])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const canvas = referenceCanvas.current
      const frames = referenceRef.current
      const compiled = playbackRef.current.compiled
      if (canvas && frames && compiled && compiled.duration > 0) {
        drawReference(canvas, frames, playbackRef.current.time / compiled.duration)
      }
    }, 66)
    return () => window.clearInterval(interval)
  }, [])

  const onRigReady = useCallback((rig: CompilerRig) => {
    rigRef.current = rig
    setWorking((current) => (current ? { ...current } : current))
  }, [])

  const updateWorking = (mutate: (draft: Sign) => void) => {
    setWorking((current) => {
      if (!current) return current
      const draft = clone(current)
      mutate(draft)
      draft.duration = sumDuration(draft.phases)
      return draft
    })
    setDirty(true)
  }

  const updateShape = (shapeId: string, mutate: (draft: Handshape) => void) => {
    setHandshapes((current) => {
      const shape = current[shapeId]
      if (!shape) return current
      const draft = clone(shape)
      mutate(draft)
      draft.source = 'authored'
      return { ...current, [shapeId]: draft }
    })
    setChangedShapes((current) => new Set(current).add(shapeId))
    setDirty(true)
  }

  const save = () => {
    if (!working) return
    const check = signSchema.safeParse(working)
    if (!check.success) {
      setError(
        check.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
      )
      return
    }
    const body = {
      signs: { [working.id]: working },
      handshapes: Object.fromEntries(
        [...changedShapes].map((id) => [id, handshapes[id]]).filter(([, shape]) => shape),
      ),
    }
    fetch('/api/dev/content', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((result: { ok: boolean; issues?: string[] }) => {
        if (!result.ok) {
          setError(result.issues?.join('; ') ?? 'gagal menyimpan')
          return
        }
        setSigns((current) => ({ ...current, [working.id]: clone(working) }))
        setChangedShapes(new Set())
        setDirty(false)
        setNotice(`tersimpan ke content/ (${new Date().toLocaleTimeString()})`)
      })
      .catch(() => setError('gagal menyimpan'))
  }

  const importVideo = (file: File) => {
    const rig = rigRef.current
    if (!rig) {
      setError('avatar belum siap, tunggu sebentar')
      return
    }
    setProcessing('memproses video...')
    setError(null)
    extractLandmarksFromVideo(file, (seconds) =>
      setProcessing(`memproses video... ${seconds.toFixed(1)} detik`),
    )
      .then((frames) => {
        const reverseFrames = reverseFramesFromRecording(frames, draftSide, rig)
        if (reverseFrames.length < 3) {
          setProcessing(null)
          setError('landmark terlalu sedikit, pastikan tangan dan bahu terlihat di video')
          return
        }
        const anchors = deriveAnchors(rig, draftSide)
        const draft = draftSignFromFrames({
          frames: reverseFrames,
          side: draftSide,
          shapes: Object.values(handshapes),
          anchors,
          shoulderWidth: rig.shoulderWidth,
          signId: draftId,
        })
        const parsed = parseSign(draft)
        referenceRef.current = frames
        setWorking(parsed)
        setSelectedId('')
        setDirty(true)
        setProcessing(null)
        setNotice(
          `draf "${draftId}" dibuat dari ${reverseFrames.length} frame, rapikan lalu simpan`,
        )
      })
      .catch((err: unknown) => {
        setProcessing(null)
        setError(err instanceof Error ? err.message : String(err))
      })
  }

  const pickReference = (sessionId: string) => {
    setReferenceLabel(sessionId)
    const session = sessions.find((candidate) => candidate.id === sessionId)
    referenceRef.current = session ? session.samples.flatMap((sample) => sample.frames) : null
  }

  const editShape = editShapeId ? handshapes[editShapeId] : undefined
  const signIds = Object.keys(signs)

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Editor isyarat</h1>
        <p className="max-w-prose text-sm">
          Sunting parameter isyarat dan bentuk tangan, lihat hasilnya langsung, simpan kembali ke
          content/. Bentuk isyarat BISINDO tetap harus divalidasi penanda Tuli sebelum approved.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span>Isyarat</span>
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className={inputClass}
          >
            {selectedId === '' ? <option value="">draf belum tersimpan</option> : null}
            {signIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() =>
            setPlaying((value) => {
              playbackRef.current.playing = !value
              return !value
            })
          }
          className="bg-primary hover:bg-primary-hover rounded-md px-4 py-2 text-white"
        >
          {playing ? 'Jeda' : 'Putar'}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!working || !dirty}
          className="bg-primary hover:bg-primary-hover rounded-md px-4 py-2 text-white disabled:opacity-50"
        >
          Simpan ke berkas
        </button>
        <p role="status" aria-live="polite">
          {error ? <span className="font-medium">{error}</span> : (processing ?? notice ?? '')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-3">
          <div className="aspect-4/3 relative w-full overflow-hidden rounded-lg bg-[#e8e6df]">
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

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Rekaman referensi</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <select
                value={referenceLabel}
                onChange={(event) => pickReference(event.target.value)}
                className={inputClass}
              >
                <option value="">tanpa referensi</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.label} · {session.contributor} · {session.samples.length} sampel
                  </option>
                ))}
              </select>
              <span>atau impor video:</span>
              <select
                value={draftSide}
                onChange={(event) => setDraftSide(event.target.value as 'left' | 'right')}
                className={inputClass}
              >
                <option value="right">tangan kanan</option>
                <option value="left">tangan kiri</option>
              </select>
              <input
                value={draftId}
                onChange={(event) =>
                  setDraftId(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                }
                className={`${inputClass} w-32`}
                aria-label="Id draf isyarat baru"
              />
              <input
                type="file"
                accept="video/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) importVideo(file)
                  event.target.value = ''
                }}
                className="text-sm"
                aria-label="Impor video rekaman penanda"
              />
            </div>
            <canvas
              ref={referenceCanvas}
              width={480}
              height={270}
              className="w-full max-w-md rounded-md"
            />
          </section>
        </div>

        <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto pr-2 text-sm">
          {working ? (
            <>
              <fieldset className="flex flex-col gap-2">
                <legend className="text-lg font-semibold">Isyarat: {working.id}</legend>
                <label className="flex items-center justify-between gap-2">
                  <span>Struktur</span>
                  <select
                    value={working.structure}
                    onChange={(event) =>
                      updateWorking((draft) => {
                        draft.structure = event.target.value as Sign['structure']
                      })
                    }
                    className={inputClass}
                  >
                    <option value="symmetric">symmetric</option>
                    <option value="dominant-only">dominant-only</option>
                    <option value="asymmetric">asymmetric</option>
                  </select>
                </label>
                <label className="flex items-center justify-between gap-2">
                  <span>Tangan dominan</span>
                  <select
                    value={working.dominance}
                    onChange={(event) =>
                      updateWorking((draft) => {
                        draft.dominance = event.target.value as Sign['dominance']
                      })
                    }
                    className={inputClass}
                  >
                    <option value="right">right</option>
                    <option value="left">left</option>
                  </select>
                </label>
                <p>
                  Durasi total:{' '}
                  <span className="font-mono tabular-nums">{working.duration} ms</span> · status
                  review: {working.review.status}
                </p>
              </fieldset>

              {working.phases.map((phase, index) => (
                <fieldset
                  key={index}
                  className="border-border-halus flex flex-col gap-2 rounded-md border p-3"
                >
                  <legend className="font-semibold">
                    Fase {index + 1}: {phase.name}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center justify-between gap-2">
                      <span>nama</span>
                      <select
                        value={phase.name}
                        onChange={(event) =>
                          updateWorking((draft) => {
                            draft.phases[index]!.name = event.target.value as SignPhase['name']
                          })
                        }
                        className={inputClass}
                      >
                        {PHASE_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center justify-between gap-2">
                      <span>easing</span>
                      <select
                        value={phase.easing}
                        onChange={(event) =>
                          updateWorking((draft) => {
                            draft.phases[index]!.easing = event.target.value as SignPhase['easing']
                          })
                        }
                        className={inputClass}
                      >
                        {EASINGS.map((easing) => (
                          <option key={easing} value={easing}>
                            {easing}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center justify-between gap-2">
                      <span>durasi (ms)</span>
                      <input
                        type="number"
                        min={50}
                        max={5000}
                        value={phase.duration}
                        onChange={(event) =>
                          updateWorking((draft) => {
                            draft.phases[index]!.duration = Number(event.target.value)
                          })
                        }
                        className={`${inputClass} w-24`}
                      />
                    </label>
                    <label className="flex items-center justify-between gap-2">
                      <span>hold (ms)</span>
                      <input
                        type="number"
                        min={0}
                        max={5000}
                        value={phase.hold ?? 0}
                        onChange={(event) =>
                          updateWorking((draft) => {
                            draft.phases[index]!.hold = Number(event.target.value) || undefined
                          })
                        }
                        className={`${inputClass} w-24`}
                      />
                    </label>
                    <label className="flex items-center justify-between gap-2">
                      <span>lintasan</span>
                      <select
                        value={phase.path?.shape ?? ''}
                        onChange={(event) =>
                          updateWorking((draft) => {
                            const shape = event.target.value
                            draft.phases[index]!.path = shape
                              ? {
                                  shape: shape as NonNullable<SignPhase['path']>['shape'],
                                  curvature: phase.path?.curvature ?? 0.3,
                                  plane: phase.path?.plane ?? 'sagittal',
                                }
                              : undefined
                          })
                        }
                        className={inputClass}
                      >
                        <option value="">lurus (default)</option>
                        {PATH_SHAPES.map((shape) => (
                          <option key={shape} value={shape}>
                            {shape}
                          </option>
                        ))}
                      </select>
                    </label>
                    {phase.path ? (
                      <>
                        <label className="flex items-center justify-between gap-2">
                          <span>curvature</span>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={phase.path.curvature ?? 0.3}
                            onChange={(event) =>
                              updateWorking((draft) => {
                                draft.phases[index]!.path!.curvature = Number(event.target.value)
                              })
                            }
                          />
                        </label>
                        <label className="flex items-center justify-between gap-2">
                          <span>bidang</span>
                          <select
                            value={phase.path.plane ?? 'sagittal'}
                            onChange={(event) =>
                              updateWorking((draft) => {
                                draft.phases[index]!.path!.plane = event.target
                                  .value as NonNullable<SignPhase['path']>['plane']
                              })
                            }
                            className={inputClass}
                          >
                            {PATH_PLANES.map((plane) => (
                              <option key={plane} value={plane}>
                                {plane}
                              </option>
                            ))}
                          </select>
                        </label>
                      </>
                    ) : null}
                  </div>

                  {(['dominant', 'nonDominant'] as const).map((handKey) => {
                    const spec = phase[handKey]
                    if (!spec && handKey === 'nonDominant') {
                      return (
                        <label key={handKey} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() =>
                              updateWorking((draft) => {
                                draft.phases[index]!.nonDominant = clone(
                                  draft.phases[index]!.dominant,
                                )
                              })
                            }
                          />
                          <span>tambah spesifikasi tangan non-dominan</span>
                        </label>
                      )
                    }
                    if (!spec) return null
                    return (
                      <div
                        key={handKey}
                        className="border-border-halus flex flex-col gap-2 rounded border p-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{handKey}</span>
                          {handKey === 'nonDominant' ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateWorking((draft) => {
                                  draft.phases[index]!.nonDominant = undefined
                                })
                              }
                              className="border-border-tegas rounded border px-2"
                            >
                              hapus
                            </button>
                          ) : null}
                        </div>
                        <label className="flex items-center justify-between gap-2">
                          <span>handshape</span>
                          <select
                            value={spec.handshape}
                            onChange={(event) =>
                              updateWorking((draft) => {
                                draft.phases[index]![handKey]!.handshape = event.target.value
                              })
                            }
                            className={inputClass}
                          >
                            {Object.keys(handshapes).map((id) => (
                              <option key={id} value={id}>
                                {id}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex items-center justify-between gap-2">
                          <span>jangkar</span>
                          <select
                            value={spec.location.anchor}
                            onChange={(event) =>
                              updateWorking((draft) => {
                                draft.phases[index]![handKey]!.location.anchor = event.target
                                  .value as (typeof ANCHORS)[number]
                              })
                            }
                            className={inputClass}
                          >
                            {ANCHORS.map((anchor) => (
                              <option key={anchor} value={anchor}>
                                {anchor}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['x', 'y', 'z'] as const).map((axis, axisIndex) => (
                            <label key={axis} className="flex flex-col gap-1">
                              <span>
                                offset {axis}:{' '}
                                <span className="font-mono tabular-nums">
                                  {spec.location.offset[axisIndex]!.toFixed(2)}
                                </span>
                              </span>
                              <input
                                type="range"
                                min={-1.5}
                                max={1.5}
                                step={0.01}
                                value={spec.location.offset[axisIndex]}
                                onChange={(event) =>
                                  updateWorking((draft) => {
                                    draft.phases[index]![handKey]!.location.offset[axisIndex] =
                                      Number(event.target.value)
                                  })
                                }
                              />
                            </label>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center justify-between gap-2">
                            <span>telapak</span>
                            <select
                              value={spec.orientation.palm}
                              onChange={(event) =>
                                updateWorking((draft) => {
                                  draft.phases[index]![handKey]!.orientation.palm = event.target
                                    .value as (typeof DIRECTIONS)[number]
                                })
                              }
                              className={inputClass}
                            >
                              {DIRECTIONS.map((direction) => (
                                <option key={direction} value={direction}>
                                  {direction}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="flex items-center justify-between gap-2">
                            <span>jari</span>
                            <select
                              value={spec.orientation.fingers}
                              onChange={(event) =>
                                updateWorking((draft) => {
                                  draft.phases[index]![handKey]!.orientation.fingers = event.target
                                    .value as (typeof DIRECTIONS)[number]
                                })
                              }
                              className={inputClass}
                            >
                              {DIRECTIONS.map((direction) => (
                                <option key={direction} value={direction}>
                                  {direction}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    )
                  })}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateWorking((draft) => {
                          draft.phases.splice(index + 1, 0, clone(draft.phases[index]!))
                        })
                      }
                      className="border-border-tegas rounded border px-2 py-1"
                    >
                      duplikat fase
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateWorking((draft) => {
                          if (draft.phases.length > 1) draft.phases.splice(index, 1)
                        })
                      }
                      disabled={working.phases.length <= 1}
                      className="border-border-tegas rounded border px-2 py-1 disabled:opacity-50"
                    >
                      hapus fase
                    </button>
                  </div>
                </fieldset>
              ))}

              <fieldset className="border-border-halus flex flex-col gap-2 rounded-md border p-3">
                <legend className="font-semibold">Sudut bentuk tangan</legend>
                <label className="flex items-center justify-between gap-2">
                  <span>handshape</span>
                  <select
                    value={editShapeId}
                    onChange={(event) => setEditShapeId(event.target.value)}
                    className={inputClass}
                  >
                    {Object.keys(handshapes).map((id) => (
                      <option key={id} value={id}>
                        {id}
                        {changedShapes.has(id) ? ' *' : ''}
                      </option>
                    ))}
                  </select>
                </label>
                {editShape
                  ? FINGERS.map((finger) => {
                      const params = editShape.fingers[finger]
                      return (
                        <div key={finger} className="flex flex-col gap-1">
                          <span className="font-medium">{finger}</span>
                          <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2].map((joint) => (
                              <label key={joint} className="flex flex-col">
                                <span className="font-mono tabular-nums">
                                  {['pangkal', 'tengah', 'ujung'][joint]}{' '}
                                  {params.flex[joint as 0 | 1 | 2].toFixed(0)}°
                                </span>
                                <input
                                  type="range"
                                  min={0}
                                  max={joint === 0 ? 90 : joint === 1 ? 110 : 80}
                                  step={1}
                                  value={params.flex[joint as 0 | 1 | 2]}
                                  onChange={(event) =>
                                    updateShape(editShapeId, (draft) => {
                                      draft.fingers[finger].flex[joint as 0 | 1 | 2] = Number(
                                        event.target.value,
                                      )
                                    })
                                  }
                                />
                              </label>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="flex flex-col">
                              <span className="font-mono tabular-nums">
                                abduct {params.abduct.toFixed(0)}°
                              </span>
                              <input
                                type="range"
                                min={0}
                                max={finger === 'thumb' ? 60 : 25}
                                step={1}
                                value={params.abduct}
                                onChange={(event) =>
                                  updateShape(editShapeId, (draft) => {
                                    draft.fingers[finger].abduct = Number(event.target.value)
                                  })
                                }
                              />
                            </label>
                            {finger === 'thumb' ? (
                              <label className="flex flex-col">
                                <span className="font-mono tabular-nums">
                                  oppose {editShape.fingers.thumb.oppose.toFixed(0)}°
                                </span>
                                <input
                                  type="range"
                                  min={0}
                                  max={90}
                                  step={1}
                                  value={editShape.fingers.thumb.oppose}
                                  onChange={(event) =>
                                    updateShape(editShapeId, (draft) => {
                                      draft.fingers.thumb.oppose = Number(event.target.value)
                                    })
                                  }
                                />
                              </label>
                            ) : null}
                          </div>
                        </div>
                      )
                    })
                  : null}
              </fieldset>
            </>
          ) : (
            <p>Pilih isyarat atau impor video untuk mulai.</p>
          )}
        </div>
      </div>
    </main>
  )
}
