import { describe, expect, it } from 'vitest'
import { POSE } from './features'
import { handsOfPose, primaryPerson, selectPrimaryPose, type Point2 } from './person'

const person = (cx: number, width: number): Point2[] => {
  const pose: Point2[] = Array.from({ length: 33 }, () => ({ x: cx, y: 0.5 }))
  pose[POSE.leftShoulder] = { x: cx + width / 2, y: 0.5 }
  pose[POSE.rightShoulder] = { x: cx - width / 2, y: 0.5 }
  pose[POSE.leftWrist] = { x: cx + width / 2, y: 0.8 }
  pose[POSE.rightWrist] = { x: cx - width / 2, y: 0.8 }
  return pose
}

const handAt = (x: number, y: number): Point2[] => Array.from({ length: 21 }, () => ({ x, y }))

describe('selectPrimaryPose', () => {
  it('memilih orang terdekat ke kamera', () => {
    const poses = [person(0.2, 0.1), person(0.6, 0.3)]
    expect(selectPrimaryPose(poses, 1, null)?.index).toBe(1)
  })

  it('tetap mengikuti orang yang sama walau orang lain lebih dekat', () => {
    const poses = [person(0.2, 0.2), person(0.7, 0.3)]
    expect(selectPrimaryPose(poses, 1, { x: 0.2, y: 0.5 })?.index).toBe(0)
  })

  it('berpindah ke orang terbesar bila orang sebelumnya hilang', () => {
    expect(selectPrimaryPose([person(0.7, 0.3)], 1, { x: 0.2, y: 0.5 })?.index).toBe(0)
  })

  it('mengembalikan null tanpa orang', () => {
    expect(selectPrimaryPose([], 1, null)).toBeNull()
  })
})

describe('handsOfPose', () => {
  const pose = person(0.5, 0.3)

  it('menerima tangan milik orang utama', () => {
    expect(handsOfPose(pose, [handAt(0.65, 0.8), handAt(0.35, 0.82)], 1)).toEqual([0, 1])
  })

  it('menolak tangan atau jari orang lain yang jauh dari pergelangan', () => {
    expect(handsOfPose(pose, [handAt(0.95, 0.2), handAt(0.66, 0.8)], 1)).toEqual([1])
  })

  it('paling banyak satu tangan per pergelangan', () => {
    expect(handsOfPose(pose, [handAt(0.66, 0.8), handAt(0.64, 0.82)], 1)).toEqual([0])
  })

  it('memperhitungkan rasio layar', () => {
    const kecil = person(0.5, 0.15)
    const tangan = [handAt(0.575, 0.95)]
    expect(handsOfPose(kecil, tangan, 1)).toEqual([])
    expect(handsOfPose(kecil, tangan, 16 / 9)).toEqual([0])
  })
})

describe('primaryPerson', () => {
  it('mengembalikan orang terdekat beserta tangannya saja', () => {
    const poses = [person(0.2, 0.1), person(0.6, 0.3)]
    const hands = [handAt(0.2, 0.8), handAt(0.76, 0.8)]
    expect(primaryPerson(poses, hands, 1, null)).toEqual({
      pose: 1,
      hands: [1],
      center: { x: 0.6, y: 0.5 },
    })
  })

  it('mengembalikan null tanpa orang', () => {
    expect(primaryPerson([], [handAt(0.5, 0.5)], 1, null)).toBeNull()
  })
})
