import { Quaternion, Vector3 } from 'three'
import { frameFeatures, POSE, type FrameInput } from '@lakon/cv-core'
import {
  FINGERS,
  type Anchor,
  type Finger,
  type HandSpec,
  type Handshape,
  type Sign,
  type SignPath,
  type SignPhase,
} from '@lakon/sign-schema'
import {
  FINGER_HINGE_AXIS,
  MCP_FAN_AXIS,
  frameFromForwardNormal,
  toRad,
  twistAbout,
  type Side,
} from './geometry'
import { deriveAnchors, type CompilerRig, type QuatTuple, type Vec3Tuple } from './rig'

export const COMPILE_FPS = 30

export const ABDUCT_DIRECTION: Record<Exclude<Finger, 'thumb'>, number> = {
  index: 1,
  middle: 0.25,
  ring: -0.75,
  pinky: -1,
}

export const RELAXED_FINGERS = {
  thumb: { flex: [10, 15, 5] as [number, number, number], abduct: 15, oppose: 10 },
  index: { flex: [15, 20, 10] as [number, number, number], abduct: 4, oppose: 0 },
  middle: { flex: [15, 20, 10] as [number, number, number], abduct: 0, oppose: 0 },
  ring: { flex: [15, 20, 10] as [number, number, number], abduct: 4, oppose: 0 },
  pinky: { flex: [15, 20, 10] as [number, number, number], abduct: 8, oppose: 0 },
}

const PASSIVE_ALIAS: Record<string, { anchor: Anchor; offset: Vec3Tuple }> = {
  bibir: { anchor: 'dagu', offset: [0, 0.1, 0.06] },
  mulut: { anchor: 'dagu', offset: [0, 0.1, 0.06] },
  'bawah-mata': { anchor: 'mata', offset: [0, -0.08, 0.06] },
  'dada-kiri': { anchor: 'dada', offset: [0.18, 0.05, 0.04] },
  'dada-kanan': { anchor: 'dada', offset: [-0.18, 0.05, 0.04] },
  kepala: { anchor: 'dahi', offset: [0, 0.2, -0.15] },
}

const HAND_PART_TIPS: Record<string, Finger> = {
  'thumb-tip': 'thumb',
  'index-tip': 'index',
  'middle-tip': 'middle',
  'ring-tip': 'ring',
  'pinky-tip': 'pinky',
  'ujung-jempol': 'thumb',
  'ujung-telunjuk': 'index',
  'ujung-jari': 'middle',
}

export type CompiledHandFrame = {
  wristPos: Vec3Tuple
  upperArm: QuatTuple
  lowerArm: QuatTuple
  hand: QuatTuple
  fingers: Record<Finger, [QuatTuple, QuatTuple, QuatTuple]>
}

export type CompiledFrame = {
  t: number
  hands: Record<Side, CompiledHandFrame>
}

export type CompiledSign = {
  id: string
  duration: number
  fps: number
  frames: CompiledFrame[]
  reference: Float32Array[]
  phaseByFrame: number[]
}

type FingerParams = Record<
  Finger,
  { flex: [number, number, number]; abduct: number; oppose: number }
>

type HandTarget = {
  wristPos: Vector3
  wristQuat: Quaternion
  fingers: FingerParams
}

const vec = (t: Vec3Tuple) => new Vector3(t[0], t[1], t[2])
const tup = (v: Vector3): Vec3Tuple => [v.x, v.y, v.z]
const qtup = (q: Quaternion): QuatTuple => [q.x, q.y, q.z, q.w]

const otherSide = (side: Side): Side => (side === 'left' ? 'right' : 'left')

const lateralSign = (side: Side) => (side === 'right' ? -1 : 1)

export const directionVector = (word: string, side: Side): Vector3 => {
  switch (word) {
    case 'up':
      return new Vector3(0, 1, 0)
    case 'down':
      return new Vector3(0, -1, 0)
    case 'forward':
      return new Vector3(0, 0, 1)
    case 'back':
      return new Vector3(0, 0, -1)
    case 'in':
      return new Vector3(-lateralSign(side), 0, 0)
    default:
      return new Vector3(lateralSign(side), 0, 0)
  }
}

export const easingValue = (easing: SignPhase['easing'], t: number): number => {
  switch (easing) {
    case 'linear':
      return t
    case 'ease-in':
      return t * t * t
    case 'ease-out':
      return 1 - Math.pow(1 - t, 3)
    default:
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
}

const PLANE_NORMALS = {
  sagittal: new Vector3(1, 0, 0),
  frontal: new Vector3(0, 0, 1),
  horizontal: new Vector3(0, 1, 0),
}

export const evalPath = (
  path: SignPath | undefined,
  from: Vector3,
  to: Vector3,
  u: number,
  shoulderWidth: number,
): Vector3 => {
  const base = from.clone().lerp(to, u)
  if (!path || path.shape === 'lurus') return base

  const chord = to.clone().sub(from)
  const span = Math.max(chord.length(), 0.15 * shoulderWidth)
  const planeNormal = PLANE_NORMALS[path.plane ?? 'sagittal']
  let bulgeDir = new Vector3().crossVectors(planeNormal, chord)
  if (bulgeDir.lengthSq() < 1e-8) bulgeDir = new Vector3(0, 1, 0)
  bulgeDir.normalize()
  const amplitude = (path.curvature ?? 0.3) * span
  const repeat = path.repeat ?? 1

  switch (path.shape) {
    case 'busur':
      return base.add(bulgeDir.multiplyScalar(amplitude * 4 * u * (1 - u)))
    case 'lingkaran': {
      const angle = 2 * Math.PI * repeat * u
      const radial = bulgeDir.clone().multiplyScalar((amplitude / 2) * (1 - Math.cos(angle)))
      const tangent = new Vector3()
        .crossVectors(planeNormal, bulgeDir)
        .normalize()
        .multiplyScalar((amplitude / 2) * Math.sin(angle))
      return base.add(radial).add(tangent)
    }
    case 'zigzag': {
      const cycles = repeat * 3
      const phase = u * cycles
      const tri = 1 - Math.abs((phase % 1) * 2 - 1)
      const fade = Math.sin(Math.PI * u)
      return base.add(bulgeDir.multiplyScalar(amplitude * 0.5 * tri * fade))
    }
    default: {
      const wave = Math.sin(2 * Math.PI * repeat * u) * Math.sin(Math.PI * u)
      return base.add(bulgeDir.multiplyScalar(amplitude * 0.5 * wave))
    }
  }
}

export const handshapeQuats = (
  side: Side,
  fingers: FingerParams,
  thumbHingeAxis: Vector3,
  thumbRestDir: Vector3,
): Record<Finger, [Quaternion, Quaternion, Quaternion]> => {
  const hinge = FINGER_HINGE_AXIS[side]
  const sideSign = side === 'right' ? 1 : -1
  const out = {} as Record<Finger, [Quaternion, Quaternion, Quaternion]>

  for (const finger of FINGERS) {
    const params = fingers[finger]
    if (finger === 'thumb') {
      const oppose = new Quaternion().setFromAxisAngle(
        thumbRestDir,
        sideSign * toRad(params.oppose),
      )
      const fan = new Quaternion().setFromAxisAngle(MCP_FAN_AXIS, sideSign * toRad(params.abduct))
      const metacarpal = fan
        .multiply(oppose)
        .multiply(new Quaternion().setFromAxisAngle(thumbHingeAxis, toRad(params.flex[0])))
      out[finger] = [
        metacarpal,
        new Quaternion().setFromAxisAngle(thumbHingeAxis, toRad(params.flex[1])),
        new Quaternion().setFromAxisAngle(thumbHingeAxis, toRad(params.flex[2])),
      ]
      continue
    }

    const fanAngle = sideSign * ABDUCT_DIRECTION[finger] * toRad(params.abduct)
    const mcp = new Quaternion()
      .setFromAxisAngle(MCP_FAN_AXIS, fanAngle)
      .multiply(new Quaternion().setFromAxisAngle(hinge, toRad(params.flex[0])))
    out[finger] = [
      mcp,
      new Quaternion().setFromAxisAngle(hinge, toRad(params.flex[1])),
      new Quaternion().setFromAxisAngle(hinge, toRad(params.flex[2])),
    ]
  }
  return out
}

export const orientationQuat = (
  side: Side,
  orientation: HandSpec['orientation'],
  restFrame: Quaternion,
): Quaternion => {
  const forward = directionVector(orientation.fingers, side)
  let normal = directionVector(orientation.palm, side)
  if (Math.abs(forward.dot(normal)) > 0.99) {
    normal = Math.abs(forward.y) > 0.9 ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0)
  }
  normal.addScaledVector(forward, -forward.dot(normal)).normalize()
  return frameFromForwardNormal(forward, normal).multiply(restFrame.clone().invert())
}

export const solveArm = (
  rig: CompilerRig,
  side: Side,
  target: Vector3,
  wristWorldQuat: Quaternion,
): { upperArm: Quaternion; lowerArm: Quaternion; hand: Quaternion } => {
  const hand = rig.hands[side]
  const shoulder = vec(hand.shoulder)
  const l1 = hand.upperArmLength
  const l2 = hand.lowerArmLength

  const toTarget = target.clone().sub(shoulder)
  const dist = Math.min(Math.max(toTarget.length(), Math.abs(l1 - l2) + 1e-4), l1 + l2 - 1e-4)
  const dir = toTarget.lengthSq() > 1e-10 ? toTarget.normalize() : new Vector3(0, -1, 0)

  const pole = new Vector3(lateralSign(side) * 0.4, -1, -0.25).normalize()
  let planeNormal = new Vector3().crossVectors(dir, pole)
  if (planeNormal.lengthSq() < 1e-8) planeNormal = new Vector3(0, 0, -1)
  planeNormal.normalize()
  const bend = new Vector3().crossVectors(planeNormal, dir).normalize()

  const a = (l1 * l1 + dist * dist - l2 * l2) / (2 * dist)
  const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0))
  const elbow = shoulder.clone().addScaledVector(dir, a).addScaledVector(bend, h)
  const wrist = shoulder.clone().addScaledVector(dir, dist)

  const upperArm = new Quaternion().setFromUnitVectors(
    vec(hand.upperArmRestDir),
    elbow.clone().sub(shoulder).normalize(),
  )
  const accum = upperArm.clone()
  const lowerDirLocal = wrist.clone().sub(elbow).normalize().applyQuaternion(accum.clone().invert())
  const lowerArm = new Quaternion().setFromUnitVectors(vec(hand.lowerArmRestDir), lowerDirLocal)
  accum.multiply(lowerArm)

  const twistAxis = vec(hand.lowerArmRestDir)
  const handFull = accum.clone().invert().multiply(wristWorldQuat)
  const { twist } = twistAbout(handFull, twistAxis)
  const forearmTwist = new Quaternion().slerp(twist, 0.7)
  const lowerWithTwist = lowerArm.clone().multiply(forearmTwist)
  const accumTwisted = upperArm.clone().multiply(lowerWithTwist)
  const handLocal = accumTwisted.clone().invert().multiply(wristWorldQuat)

  return { upperArm, lowerArm: lowerWithTwist, hand: handLocal }
}

export const fkHandLandmarks = (
  rig: CompilerRig,
  side: Side,
  wristPos: Vector3,
  wristWorldQuat: Quaternion,
  fingerQuats: Record<Finger, [Quaternion, Quaternion, Quaternion]>,
): Vector3[] => {
  const hand = rig.hands[side]
  const landmarks: Vector3[] = [wristPos.clone()]

  for (const finger of FINGERS) {
    const offsets = hand.fingers[finger]
    const quats = fingerQuats[finger]
    let position = wristPos.clone().add(vec(offsets[0]!).applyQuaternion(wristWorldQuat))
    let accum = wristWorldQuat.clone().multiply(quats[0]!)
    landmarks.push(position.clone())
    for (let joint = 1; joint <= 3; joint++) {
      position = position.add(vec(offsets[joint]!).applyQuaternion(accum))
      landmarks.push(position.clone())
      if (joint < 3) accum = accum.multiply(quats[joint]!)
    }
  }
  return landmarks
}

const handPartPoint = (
  rig: CompilerRig,
  side: Side,
  part: string,
  landmarks: Vector3[],
): Vector3 => {
  const stripped = part.replace(/^nondominant-/, '').replace(/^dominant-/, '')
  const tipFinger = HAND_PART_TIPS[stripped]
  if (tipFinger) {
    const index = FINGERS.indexOf(tipFinger)
    return landmarks[1 + index * 4 + 3]!.clone()
  }
  if (stripped === 'wrist') return landmarks[0]!.clone()
  const palm = landmarks[0]!.clone().add(landmarks[9]!).multiplyScalar(0.5)
  return palm
}

const restTarget = (rig: CompilerRig, side: Side): HandTarget => {
  const hand = rig.hands[side]
  const shoulder = vec(hand.shoulder)
  const reach = (hand.upperArmLength + hand.lowerArmLength) * 0.965
  const s = rig.shoulderWidth
  const wristPos = shoulder.clone().add(new Vector3(lateralSign(side) * 0.14 * s, -reach, 0.12 * s))
  const wristQuat = orientationQuat(
    side,
    { palm: 'in', fingers: 'down' },
    new Quaternion().fromArray(hand.restFrame),
  )
  return { wristPos, wristQuat, fingers: structuredClone(RELAXED_FINGERS) as FingerParams }
}

const fingersFromHandshape = (shape: Handshape): FingerParams => {
  const params = {} as FingerParams
  for (const finger of FINGERS) {
    const spec = shape.fingers[finger]
    params[finger] = {
      flex: [...spec.flex] as [number, number, number],
      abduct: spec.abduct ?? 0,
      oppose: finger === 'thumb' ? ((spec as { oppose?: number }).oppose ?? 0) : 0,
    }
  }
  return params
}

const lerpFingers = (a: FingerParams, b: FingerParams, u: number): FingerParams => {
  const out = {} as FingerParams
  for (const finger of FINGERS) {
    out[finger] = {
      flex: [
        a[finger].flex[0] + (b[finger].flex[0] - a[finger].flex[0]) * u,
        a[finger].flex[1] + (b[finger].flex[1] - a[finger].flex[1]) * u,
        a[finger].flex[2] + (b[finger].flex[2] - a[finger].flex[2]) * u,
      ],
      abduct: a[finger].abduct + (b[finger].abduct - a[finger].abduct) * u,
      oppose: a[finger].oppose + (b[finger].oppose - a[finger].oppose) * u,
    }
  }
  return out
}

const resolveHandSpec = (
  rig: CompilerRig,
  side: Side,
  dominance: Side,
  anchors: Record<Anchor, Vec3Tuple>,
  spec: HandSpec,
  shapes: Map<string, Handshape>,
): HandTarget => {
  const shape = shapes.get(spec.handshape)
  if (!shape) throw new Error(`handshape not found: ${spec.handshape}`)

  const base = anchors[spec.location.anchor]
  const mirrored = side !== dominance
  const anchorPos = new Vector3(mirrored ? -base[0] : base[0], base[1], base[2])
  const s = rig.shoulderWidth
  const wristPos = anchorPos.add(
    new Vector3(
      spec.location.offset[0] * s * lateralSign(side),
      spec.location.offset[1] * s,
      spec.location.offset[2] * s,
    ),
  )

  const wristQuat = orientationQuat(
    side,
    spec.orientation,
    new Quaternion().fromArray(rig.hands[side].restFrame),
  )

  return { wristPos, wristQuat, fingers: fingersFromHandshape(shape) }
}

type Segment = {
  start: number
  moveDuration: number
  holdDuration: number
  from: HandTarget
  to: HandTarget
  easing: SignPhase['easing']
  path: SignPath | undefined
}

const buildSegments = (phases: SignPhase[], targets: HandTarget[], rest: HandTarget): Segment[] => {
  const segments: Segment[] = []
  let clock = 0
  phases.forEach((phase, index) => {
    segments.push({
      start: clock,
      moveDuration: phase.duration,
      holdDuration: phase.hold ?? 0,
      from: index === 0 ? rest : targets[index - 1]!,
      to: targets[index]!,
      easing: phase.easing,
      path: phase.path,
    })
    clock += phase.duration + (phase.hold ?? 0)
  })
  return segments
}

const sampleSegments = (
  segments: Segment[],
  t: number,
  shoulderWidth: number,
): {
  wristPos: Vector3
  wristQuat: Quaternion
  fingers: FingerParams
  segmentIndex: number
  eased: number
} => {
  let segment = segments[segments.length - 1]!
  for (const candidate of segments) {
    if (t < candidate.start + candidate.moveDuration + candidate.holdDuration) {
      segment = candidate
      break
    }
  }
  const local = t - segment.start
  const u = segment.moveDuration <= 0 ? 1 : Math.min(1, Math.max(0, local / segment.moveDuration))
  const eased = easingValue(segment.easing, u)

  let wristQuat = segment.from.wristQuat.clone().slerp(segment.to.wristQuat, eased)
  const tilt = segment.path?.tilt ?? 0
  if (tilt > 0 && segment.path) {
    const repeat = segment.path.repeat ?? 1
    const angle = toRad(tilt) * Math.sin(2 * Math.PI * repeat * eased) * Math.sin(Math.PI * eased)
    const axis = PLANE_NORMALS[segment.path.plane ?? 'sagittal']
    wristQuat = new Quaternion().setFromAxisAngle(axis, angle).multiply(wristQuat)
  }

  return {
    wristPos: evalPath(
      segment.path,
      segment.from.wristPos,
      segment.to.wristPos,
      eased,
      shoulderWidth,
    ),
    wristQuat,
    fingers: lerpFingers(segment.from.fingers, segment.to.fingers, eased),
    segmentIndex: segments.indexOf(segment),
    eased,
  }
}

const isHandPart = (part: string) =>
  /^(nondominant-|dominant-)?(wrist|palm|thumb-tip|index-tip|middle-tip|ring-tip|pinky-tip)$/.test(
    part,
  )

const rencanaKontak = (
  sign: Sign,
  anchors: Record<Anchor, Vec3Tuple>,
  shoulderWidth: number,
): { titik: Vector3 | null; bobot: (segmentIndex: number, eased: number) => number } | null => {
  const contact = sign.contact
  if (!contact) return null
  const part = contact.passivePart
  let titik: Vector3 | null = null
  let anchorPasif: Anchor | null = null
  if (part in anchors) {
    anchorPasif = part as Anchor
    titik = vec(anchors[anchorPasif])
  } else if (PASSIVE_ALIAS[part]) {
    const alias = PASSIVE_ALIAS[part]!
    anchorPasif = alias.anchor
    titik = vec(anchors[alias.anchor]).add(
      new Vector3(
        alias.offset[0] * shoulderWidth,
        alias.offset[1] * shoulderWidth,
        alias.offset[2] * shoulderWidth,
      ),
    )
  } else if (!isHandPart(part)) {
    return null
  }
  const berlaku = sign.phases.map((phase) =>
    anchorPasif
      ? phase.dominant.location.anchor === anchorPasif
      : phase.name === 'stroke' || phase.name === 'hold',
  )
  if (!berlaku.some(Boolean)) return null
  return {
    titik,
    bobot: (segmentIndex, eased) => {
      const kini = berlaku[segmentIndex] ?? false
      const sebelum = segmentIndex > 0 ? (berlaku[segmentIndex - 1] ?? false) : false
      if (kini) return sebelum ? 1 : eased
      return sebelum ? 1 - eased : 0
    },
  }
}

export const compileSign = (
  sign: Sign,
  handshapes: readonly Handshape[],
  rig: CompilerRig,
  fps: number = COMPILE_FPS,
): CompiledSign => {
  const shapes = new Map(handshapes.map((shape) => [shape.id, shape]))
  const dominance: Side = sign.dominance
  const nonDom = otherSide(dominance)
  const anchors = deriveAnchors(rig, dominance)

  const domTargets = sign.phases.map((phase) =>
    resolveHandSpec(rig, dominance, dominance, anchors, phase.dominant, shapes),
  )
  const domRest = restTarget(rig, dominance)
  const domSegments = buildSegments(sign.phases, domTargets, domRest)

  const nonDomRest = restTarget(rig, nonDom)
  let nonDomStatic: HandTarget | null = null
  if (sign.structure === 'asymmetric') {
    const baseSpec = sign.phases.find((phase) => phase.nonDominant)?.nonDominant
    nonDomStatic = baseSpec
      ? resolveHandSpec(rig, nonDom, dominance, anchors, baseSpec, shapes)
      : nonDomRest
  } else if (sign.structure === 'dominant-only') {
    nonDomStatic = nonDomRest
  }

  const totalDuration = sign.phases.reduce(
    (sum, phase) => sum + phase.duration + (phase.hold ?? 0),
    0,
  )
  const step = 1000 / fps
  const times: number[] = []
  for (let t = 0; t < totalDuration; t += step) times.push(t)
  times.push(totalDuration)

  const frames: CompiledFrame[] = []
  const reference: Float32Array[] = []
  const phaseByFrame: number[] = []
  const nonDomMoves = sign.structure === 'symmetric'
  const referenceSides: Side[] =
    sign.structure === 'dominant-only' ? [dominance] : ['left', 'right']

  const phaseStarts: number[] = []
  {
    let clock = 0
    for (const phase of sign.phases) {
      phaseStarts.push(clock)
      clock += phase.duration + (phase.hold ?? 0)
    }
  }
  const phaseIndexAt = (t: number) => {
    let index = 0
    for (let i = 0; i < phaseStarts.length; i++) {
      if (t >= phaseStarts[i]!) index = i
    }
    return index
  }

  const kontak = sign.contact ? rencanaKontak(sign, anchors, rig.shoulderWidth) : null

  const shoulderLeft = vec(rig.hands.left.shoulder)
  const shoulderRight = vec(rig.hands.right.shoulder)
  const mpPose: { x: number; y: number; z: number }[] = Array.from({ length: 33 }, () => ({
    x: 0,
    y: 0,
    z: 0,
  }))
  // Putar 180 derajat pada sumbu x: avatar menghadap +z, MediaPipe y ke bawah dan z menjauhi kamera.
  const pointToMp = (point: Vector3) => ({ x: point.x, y: -point.y, z: -point.z })
  mpPose[POSE.leftShoulder] = pointToMp(shoulderLeft)
  mpPose[POSE.rightShoulder] = pointToMp(shoulderRight)

  const toMp = (landmarks: Vector3[]) => landmarks.map(pointToMp)

  for (const t of times) {
    const dom = sampleSegments(domSegments, t, rig.shoulderWidth)

    let nonDomSample: { wristPos: Vector3; wristQuat: Quaternion; fingers: FingerParams }
    if (nonDomMoves) {
      nonDomSample = {
        wristPos: new Vector3(-dom.wristPos.x, dom.wristPos.y, dom.wristPos.z),
        wristQuat: mirrorQuatX(dom.wristQuat),
        fingers: dom.fingers,
      }
    } else {
      nonDomSample = {
        wristPos: nonDomStatic!.wristPos.clone(),
        wristQuat: nonDomStatic!.wristQuat.clone(),
        fingers: nonDomStatic!.fingers,
      }
    }

    const handFrames = {} as Record<Side, CompiledHandFrame>
    const landmarksBySide = {} as Record<Side, Vector3[]>

    const samples: [Side, { wristPos: Vector3; wristQuat: Quaternion; fingers: FingerParams }][] = [
      [dominance, dom],
      [nonDom, nonDomSample],
    ]

    let domLandmarks: Vector3[] | null = null
    for (const [side, sample] of samples) {
      const handRig = rig.hands[side]
      const fingerQuats = handshapeQuats(
        side,
        sample.fingers,
        vec(handRig.thumbHingeAxis),
        vec(handRig.fingers.thumb[0]).normalize(),
      )
      const landmarks = fkHandLandmarks(rig, side, sample.wristPos, sample.wristQuat, fingerQuats)
      landmarksBySide[side] = landmarks
      if (side === dominance) domLandmarks = landmarks
    }

    if (sign.contact && domLandmarks && kontak) {
      const bobot = kontak.bobot(dom.segmentIndex, dom.eased)
      if (bobot > 0) {
        const active = handPartPoint(rig, dominance, sign.contact.activePart, domLandmarks)
        const passive = kontak.titik
          ? kontak.titik.clone()
          : handPartPoint(rig, nonDom, sign.contact.passivePart, landmarksBySide[nonDom])
        const delta = passive.sub(active).multiplyScalar(bobot)
        dom.wristPos.add(delta)
        landmarksBySide[dominance] = landmarksBySide[dominance].map((point) =>
          point.clone().add(delta),
        )
      }
    }

    for (const [side, sample] of samples) {
      const handRig = rig.hands[side]
      const fingerQuats = handshapeQuats(
        side,
        sample.fingers,
        vec(handRig.thumbHingeAxis),
        vec(handRig.fingers.thumb[0]).normalize(),
      )
      const arm = solveArm(rig, side, sample.wristPos, sample.wristQuat)
      handFrames[side] = {
        wristPos: tup(sample.wristPos),
        upperArm: qtup(arm.upperArm),
        lowerArm: qtup(arm.lowerArm),
        hand: qtup(arm.hand),
        fingers: {
          thumb: [
            qtup(fingerQuats.thumb[0]),
            qtup(fingerQuats.thumb[1]),
            qtup(fingerQuats.thumb[2]),
          ],
          index: [
            qtup(fingerQuats.index[0]),
            qtup(fingerQuats.index[1]),
            qtup(fingerQuats.index[2]),
          ],
          middle: [
            qtup(fingerQuats.middle[0]),
            qtup(fingerQuats.middle[1]),
            qtup(fingerQuats.middle[2]),
          ],
          ring: [qtup(fingerQuats.ring[0]), qtup(fingerQuats.ring[1]), qtup(fingerQuats.ring[2])],
          pinky: [
            qtup(fingerQuats.pinky[0]),
            qtup(fingerQuats.pinky[1]),
            qtup(fingerQuats.pinky[2]),
          ],
        },
      }
    }

    const framePose = mpPose.map((point) => ({ ...point }))
    framePose[POSE.leftWrist] = pointToMp(landmarksBySide.left[0]!)
    framePose[POSE.rightWrist] = pointToMp(landmarksBySide.right[0]!)

    const frameInput: FrameInput = {
      hands: referenceSides.map((side) => ({
        handedness: side === 'left' ? ('Left' as const) : ('Right' as const),
        world: toMp(landmarksBySide[side]),
      })),
      pose: framePose,
    }
    reference.push(frameFeatures(frameInput))
    phaseByFrame.push(phaseIndexAt(t))

    frames.push({ t, hands: handFrames })
  }

  return { id: sign.id, duration: totalDuration, fps, frames, reference, phaseByFrame }
}

const mirrorQuatX = (q: Quaternion) => new Quaternion(q.x, -q.y, -q.z, q.w)

export const sampleCompiled = (compiled: CompiledSign, tMs: number): CompiledFrame => {
  const clamped = Math.min(Math.max(tMs, 0), compiled.duration)
  const step = 1000 / compiled.fps
  const index = Math.min(Math.floor(clamped / step), compiled.frames.length - 1)
  const next = Math.min(index + 1, compiled.frames.length - 1)
  const a = compiled.frames[index]!
  const b = compiled.frames[next]!
  if (index === next) return a
  const span = b.t - a.t
  const u = span > 0 ? (clamped - a.t) / span : 0

  const lerpQuat = (qa: QuatTuple, qb: QuatTuple): QuatTuple =>
    qtup(new Quaternion().fromArray(qa).slerp(new Quaternion().fromArray(qb), u))
  const lerpVec = (va: Vec3Tuple, vb: Vec3Tuple): Vec3Tuple => [
    va[0] + (vb[0] - va[0]) * u,
    va[1] + (vb[1] - va[1]) * u,
    va[2] + (vb[2] - va[2]) * u,
  ]

  const hands = {} as Record<Side, CompiledHandFrame>
  for (const side of ['left', 'right'] as Side[]) {
    const ha = a.hands[side]
    const hb = b.hands[side]
    hands[side] = {
      wristPos: lerpVec(ha.wristPos, hb.wristPos),
      upperArm: lerpQuat(ha.upperArm, hb.upperArm),
      lowerArm: lerpQuat(ha.lowerArm, hb.lowerArm),
      hand: lerpQuat(ha.hand, hb.hand),
      fingers: {
        thumb: [0, 1, 2].map((j) => lerpQuat(ha.fingers.thumb[j]!, hb.fingers.thumb[j]!)) as [
          QuatTuple,
          QuatTuple,
          QuatTuple,
        ],
        index: [0, 1, 2].map((j) => lerpQuat(ha.fingers.index[j]!, hb.fingers.index[j]!)) as [
          QuatTuple,
          QuatTuple,
          QuatTuple,
        ],
        middle: [0, 1, 2].map((j) => lerpQuat(ha.fingers.middle[j]!, hb.fingers.middle[j]!)) as [
          QuatTuple,
          QuatTuple,
          QuatTuple,
        ],
        ring: [0, 1, 2].map((j) => lerpQuat(ha.fingers.ring[j]!, hb.fingers.ring[j]!)) as [
          QuatTuple,
          QuatTuple,
          QuatTuple,
        ],
        pinky: [0, 1, 2].map((j) => lerpQuat(ha.fingers.pinky[j]!, hb.fingers.pinky[j]!)) as [
          QuatTuple,
          QuatTuple,
          QuatTuple,
        ],
      },
    }
  }
  return { t: clamped, hands }
}
