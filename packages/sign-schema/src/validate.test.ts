import { describe, expect, it } from 'vitest'
import { unapprovedSigns, validateContent, type ContentSet } from './index'

const review = { status: 'draft', validatedBy: null, role: null, date: null }

const handshape = (id: string) => ({
  id,
  label: { id: 'uji', en: 'test' },
  localName: null,
  dialect: 'bisindo-jakarta',
  fingers: {
    thumb: { flex: [10, 5, 0], abduct: 5, oppose: 0 },
    index: { flex: [0, 0, 0], abduct: 0 },
    middle: { flex: [0, 0, 0], abduct: 0 },
    ring: { flex: [0, 0, 0], abduct: 0 },
    pinky: { flex: [0, 0, 0], abduct: 0 },
  },
  usedIn: [],
  notes: null,
  source: 'candidate',
  review,
})

const sign = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  gloss: { id: 'uji', en: 'test' },
  dialect: 'bisindo-jakarta',
  structure: 'dominant-only',
  dominance: 'right',
  duration: 800,
  recognitionMode: true,
  phases: [
    {
      name: 'onset',
      duration: 300,
      easing: 'ease-out',
      dominant: {
        handshape: 'b-flat',
        location: { anchor: 'dagu', offset: [0, 0, 0.1] },
        orientation: { palm: 'in', fingers: 'up' },
      },
    },
    {
      name: 'stroke',
      duration: 500,
      dominant: {
        handshape: 'b-flat',
        location: { anchor: 'ruang-netral', offset: [0.05, -0.1, 0.2] },
        orientation: { palm: 'up', fingers: 'forward' },
      },
    },
  ],
  contact: null,
  nonManual: { brow: null, mouth: null, head: null, gaze: null },
  review,
  ...overrides,
})

const scenario = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  title: { id: 'Uji', en: 'Test' },
  sdg: [10],
  vocab: [],
  estimatedMinutes: 10,
  nodes: [
    {
      id: 'mulai',
      actor: 'petugas',
      line: { id: 'Halo.' },
      task: {
        deaf: { type: 'produce', sign: 'halo' },
        service: { type: 'receptive', sign: 'halo', options: ['halo', 'maaf'] },
      },
      next: 'akhir',
      onFail: 'perbaikan',
    },
    {
      id: 'perbaikan',
      actor: 'petugas',
      line: { id: 'Ulangi.' },
      hint: 'Coba lagi.',
      next: 'mulai',
    },
    { id: 'akhir', actor: 'petugas', line: { id: 'Selesai.' }, next: null },
  ],
  ...overrides,
})

const content = (overrides: Partial<ContentSet> = {}): ContentSet => ({
  handshapes: { 'b-flat': handshape('b-flat') },
  signs: { halo: sign('halo') },
  scenarios: { uji: scenario('uji') },
  ...overrides,
})

describe('validateContent', () => {
  it('konten sehat lolos tanpa isu', () => {
    expect(validateContent(content())).toEqual([])
  })

  it('menunjuk berkas dan field saat skema tidak cocok', () => {
    const broken = handshape('b-flat')
    broken.fingers.index.flex = [0, 200, 0]
    const issues = validateContent(content({ handshapes: { 'b-flat': broken } }))
    expect(issues.some((i) => i.file === 'content/handshapes/b-flat.json')).toBe(true)
    expect(issues.some((i) => i.path.includes('fingers.index.flex'))).toBe(true)
  })

  it('menolak id yang tidak sama dengan nama berkas', () => {
    const issues = validateContent(content({ handshapes: { lain: handshape('b-flat') } }))
    expect(issues.some((i) => i.path === 'id' && i.message.includes('b-flat'))).toBe(true)
  })

  it('menolak referensi handshape yang tidak ada berkasnya', () => {
    const issues = validateContent(content({ handshapes: {} }))
    expect(
      issues.some(
        (i) =>
          i.file === 'content/signs/halo.json' &&
          i.path === 'phases.0.dominant.handshape' &&
          i.message.includes('b-flat'),
      ),
    ).toBe(true)
  })

  it('menolak duration yang tidak sama dengan jumlah fase', () => {
    const issues = validateContent(content({ signs: { halo: sign('halo', { duration: 999 }) } }))
    expect(issues.some((i) => i.path === 'duration')).toBe(true)
  })

  it('menolak vocab yang tidak ada berkas isyaratnya', () => {
    const issues = validateContent(
      content({ scenarios: { uji: scenario('uji', { vocab: ['tidak-ada'] }) } }),
    )
    expect(issues.some((i) => i.path === 'vocab' && i.message.includes('tidak-ada'))).toBe(true)
  })

  it('menolak simpul dengan next atau onFail yang menunjuk simpul tidak ada', () => {
    const bad = scenario('uji')
    bad.nodes[0]!.next = 'hilang'
    bad.nodes[0]!.onFail = 'juga-hilang'
    const issues = validateContent(content({ scenarios: { uji: bad } }))
    expect(issues.some((i) => i.path === 'nodes.0.next' && i.message.includes('hilang'))).toBe(true)
    expect(issues.some((i) => i.path === 'nodes.0.onFail')).toBe(true)
  })

  it('menolak pilihan reseptif tanpa jawaban benar', () => {
    const bad = scenario('uji')
    bad.nodes[0]!.task!.service.options = ['maaf', 'tolong']
    const issues = validateContent(content({ scenarios: { uji: bad } }))
    expect(issues.some((i) => i.path === 'nodes.0.task.service.options')).toBe(true)
  })

  it('menolak task sign di luar vocab saat vocab terisi', () => {
    const bad = scenario('uji', { vocab: ['halo'] })
    bad.nodes[0]!.task!.deaf.sign = 'kopi'
    const issues = validateContent(content({ scenarios: { uji: bad } }))
    expect(issues.some((i) => i.path === 'nodes.0.task.deaf.sign')).toBe(true)
  })

  it('menolak sudut di luar rentang wajar', () => {
    const broken = handshape('b-flat')
    broken.fingers.thumb.oppose = 120
    const issues = validateContent(content({ handshapes: { 'b-flat': broken } }))
    expect(issues.some((i) => i.path.includes('fingers.thumb.oppose'))).toBe(true)
  })
})

describe('unapprovedSigns', () => {
  it('menandai isyarat yang belum approved', () => {
    const issues = unapprovedSigns({ halo: sign('halo') })
    expect(issues).toHaveLength(1)
    expect(issues[0]!.path).toBe('review.status')
  })

  it('kosong bila semua approved', () => {
    const approved = sign('halo', {
      review: { status: 'approved', validatedBy: 'A', role: 'penanda-tuli', date: '2026-01-01' },
    })
    expect(unapprovedSigns({ halo: approved })).toEqual([])
  })
})
