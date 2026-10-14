import { describe, expect, it } from 'vitest'
import { gantiMode, KAMERA_SUDUT, sudutTersedia, sumberSudut } from './peraga'

describe('peraga', () => {
  it('tanpa video: semua sudut dilayani peraga 3D', () => {
    expect(sumberSudut(undefined, 'kanan')).toBeUndefined()
    expect(sudutTersedia(undefined, 'kanan')).toBe(true)
    expect(sudutTersedia(undefined, 'kiri')).toBe(true)
  })

  it('video lengkap: tiap sudut punya berkasnya sendiri', () => {
    const video = { depan: '/d.mp4', kanan: '/ka.mp4', kiri: '/ki.mp4' }
    expect(sumberSudut(video, 'kiri')).toBe('/ki.mp4')
    expect(sudutTersedia(video, 'kiri')).toBe(true)
  })

  it('video sebagian: sudut yang kosong jatuh ke depan dan tombolnya mati', () => {
    const video = { depan: '/d.mp4' }
    expect(sumberSudut(video, 'kiri')).toBe('/d.mp4')
    expect(sudutTersedia(video, 'kiri')).toBe(false)
    expect(sudutTersedia(video, 'depan')).toBe(true)
  })

  it('kamera kanan dan kiri saling cermin di sumbu x', () => {
    expect(KAMERA_SUDUT.kanan[0]).toBe(-KAMERA_SUDUT.kiri[0])
    expect(KAMERA_SUDUT.depan[0]).toBe(0)
  })

  it('kembali ke manusia memakai sudut yang ada videonya', () => {
    const video = { depan: '/d.mp4', kiri: '/ki.mp4' }
    expect(gantiMode(video, 'manusia', 'kanan')).toEqual({ mode: 'manusia', sudut: 'depan' })
    expect(gantiMode(video, 'manusia', 'kiri')).toEqual({ mode: 'manusia', sudut: 'kiri' })
    expect(gantiMode(undefined, 'manusia', 'kiri')).toEqual({ mode: '3d', sudut: 'kiri' })
  })
})
