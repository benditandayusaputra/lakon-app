import { z } from 'zod'

export const FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const
export type Finger = (typeof FINGERS)[number]

export const ANCHORS = [
  'dahi',
  'pelipis',
  'mata',
  'hidung',
  'pipi',
  'dagu',
  'telinga',
  'leher',
  'bahu',
  'dada',
  'ulu-hati',
  'perut',
  'lengan-atas',
  'lengan-bawah',
  'telapak-nondominan',
  'punggung-tangan-nondominan',
  'ruang-netral',
] as const
export type Anchor = (typeof ANCHORS)[number]

export const PATH_SHAPES = ['lurus', 'busur', 'lingkaran', 'zigzag', 'gelombang'] as const
export const PATH_PLANES = ['sagittal', 'frontal', 'horizontal'] as const
export const CONTACT_TYPES = ['touch', 'hold', 'brush', 'tap'] as const
export const REVIEW_STATUSES = ['draft', 'needs-fix', 'approved'] as const
export const SOURCES = ['candidate', 'measured', 'authored'] as const
export const STRUCTURES = ['symmetric', 'dominant-only', 'asymmetric'] as const
export const PHASE_NAMES = ['onset', 'stroke', 'hold', 'retraction'] as const
export const EASINGS = ['linear', 'ease-in', 'ease-out', 'ease-in-out'] as const
export const DIRECTIONS = ['up', 'down', 'in', 'out', 'forward', 'back'] as const
export const DOMINANCES = ['right', 'left'] as const

export const kebabId = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)

const bilingualLabel = z.object({
  id: z.string().min(1),
  en: z.string().min(1),
})

export const reviewSchema = z.object({
  status: z.enum(REVIEW_STATUSES),
  validatedBy: z.string().min(1).nullable(),
  role: z.string().min(1).nullable(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
})

const flexTriple = z.tuple([
  z.number().min(0).max(90),
  z.number().min(0).max(110),
  z.number().min(0).max(80),
])

const fingerSchema = z.object({
  flex: flexTriple,
  abduct: z.number().min(0).max(25).default(0),
})

const thumbSchema = z.object({
  flex: flexTriple,
  abduct: z.number().min(0).max(60).default(0),
  oppose: z.number().min(0).max(90).default(0),
})

export const handshapeSchema = z.object({
  id: kebabId,
  label: bilingualLabel,
  localName: z.string().min(1).nullable(),
  dialect: z.string().min(1),
  fingers: z.object({
    thumb: thumbSchema,
    index: fingerSchema,
    middle: fingerSchema,
    ring: fingerSchema,
    pinky: fingerSchema,
  }),
  usedIn: z.array(kebabId),
  notes: z.string().min(1).nullable(),
  source: z.enum(SOURCES),
  review: reviewSchema,
})

export const locationSchema = z.object({
  anchor: z.enum(ANCHORS),
  offset: z.tuple([
    z.number().min(-3).max(3),
    z.number().min(-3).max(3),
    z.number().min(-3).max(3),
  ]),
})

export const orientationSchema = z.object({
  palm: z.enum(DIRECTIONS),
  fingers: z.enum(DIRECTIONS),
})

export const handSpecSchema = z.object({
  handshape: kebabId,
  location: locationSchema,
  orientation: orientationSchema,
})

export const pathSchema = z.object({
  shape: z.enum(PATH_SHAPES),
  curvature: z.number().min(0).max(1).optional(),
  plane: z.enum(PATH_PLANES).optional(),
  repeat: z.number().int().min(1).max(5).optional(),
  tilt: z.number().min(0).max(45).optional(),
})

export const phaseSchema = z.object({
  name: z.enum(PHASE_NAMES),
  duration: z.number().positive().max(5000),
  hold: z.number().min(0).max(5000).optional(),
  easing: z.enum(EASINGS).default('ease-in-out'),
  path: pathSchema.optional(),
  dominant: handSpecSchema,
  nonDominant: handSpecSchema.optional(),
})

export const contactSchema = z.object({
  activePart: z.string().min(1),
  passivePart: z.string().min(1),
  type: z.enum(CONTACT_TYPES),
})

export const nonManualSchema = z.object({
  brow: z.string().min(1).nullable(),
  mouth: z.string().min(1).nullable(),
  head: z.string().min(1).nullable(),
  gaze: z.string().min(1).nullable(),
})

export const mediaSchema = z.object({
  video: z.object({
    depan: z.string().min(1),
    kanan: z.string().min(1).optional(),
    kiri: z.string().min(1).optional(),
  }),
  poster: z.string().min(1).optional(),
})

export const signSchema = z.object({
  id: kebabId,
  gloss: bilingualLabel,
  dialect: z.string().min(1),
  structure: z.enum(STRUCTURES),
  dominance: z.enum(DOMINANCES),
  duration: z.number().positive().max(20000),
  recognitionMode: z.boolean(),
  phases: z.array(phaseSchema).min(1),
  contact: contactSchema.nullable(),
  nonManual: nonManualSchema,
  media: mediaSchema.optional(),
  review: reviewSchema,
})

const produceTask = z.object({
  type: z.literal('produce'),
  sign: kebabId,
})

const receptiveTask = z.object({
  type: z.literal('receptive'),
  sign: kebabId,
  options: z.array(kebabId).min(2),
})

const pointTask = z.object({
  type: z.literal('point'),
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correct: z.number().int().min(0),
})

export const taskSchema = z.discriminatedUnion('type', [produceTask, receptiveTask, pointTask])

export const scenarioNodeSchema = z.object({
  id: kebabId,
  actor: z.string().min(1),
  line: z.object({
    id: z.string().min(1),
    en: z.string().min(1).optional(),
  }),
  task: z
    .object({
      deaf: taskSchema,
      service: taskSchema,
    })
    .optional(),
  hint: z.string().min(1).optional(),
  next: kebabId.nullable(),
  onFail: kebabId.optional(),
})

export const scenarioSchema = z.object({
  id: kebabId,
  title: bilingualLabel,
  sdg: z.array(z.number().int().min(1).max(17)).min(1),
  vocab: z.array(kebabId),
  estimatedMinutes: z.number().positive().max(60),
  nodes: z.array(scenarioNodeSchema).min(1),
})

export type Review = z.infer<typeof reviewSchema>
export type Handshape = z.infer<typeof handshapeSchema>
export type SignLocation = z.infer<typeof locationSchema>
export type SignOrientation = z.infer<typeof orientationSchema>
export type HandSpec = z.infer<typeof handSpecSchema>
export type SignPath = z.infer<typeof pathSchema>
export type SignPhase = z.infer<typeof phaseSchema>
export type SignContact = z.infer<typeof contactSchema>
export type Sign = z.infer<typeof signSchema>
export type ScenarioTask = z.infer<typeof taskSchema>
export type ScenarioNode = z.infer<typeof scenarioNodeSchema>
export type Scenario = z.infer<typeof scenarioSchema>

export const parseHandshape = (value: unknown): Handshape => handshapeSchema.parse(value)
export const parseSign = (value: unknown): Sign => signSchema.parse(value)
export const parseScenario = (value: unknown): Scenario => scenarioSchema.parse(value)

export const isApproved = (item: { review: Review }) => item.review.status === 'approved'

export type ContentIssue = {
  file: string
  path: string
  message: string
}

export type ContentSet = {
  handshapes: Record<string, unknown>
  signs: Record<string, unknown>
  scenarios: Record<string, unknown>
}

const zodIssues = (file: string, error: z.ZodError): ContentIssue[] =>
  error.issues.map((issue) => ({
    file,
    path: issue.path.join('.') || '(akar)',
    message: issue.message,
  }))

const parseAll = <S extends z.ZodTypeAny>(
  files: Record<string, unknown>,
  schema: S,
  folder: string,
  issues: ContentIssue[],
): Map<string, z.output<S>> => {
  const parsed = new Map<string, z.output<S>>()
  for (const [name, raw] of Object.entries(files)) {
    const file = `${folder}/${name}.json`
    const result = schema.safeParse(raw)
    if (!result.success) {
      issues.push(...zodIssues(file, result.error))
      continue
    }
    const id = (result.data as { id: string }).id
    if (id !== name) {
      issues.push({ file, path: 'id', message: `id "${id}" does not match the file name` })
    }
    parsed.set(name, result.data)
  }
  return parsed
}

const validateSign = (file: string, sign: Sign, handshapeIds: Set<string>): ContentIssue[] => {
  const issues: ContentIssue[] = []

  sign.phases.forEach((phase, index) => {
    if (!handshapeIds.has(phase.dominant.handshape)) {
      issues.push({
        file,
        path: `phases.${index}.dominant.handshape`,
        message: `handshape "${phase.dominant.handshape}" has no file`,
      })
    }
    if (phase.nonDominant && !handshapeIds.has(phase.nonDominant.handshape)) {
      issues.push({
        file,
        path: `phases.${index}.nonDominant.handshape`,
        message: `handshape "${phase.nonDominant.handshape}" has no file`,
      })
    }
  })

  const phaseTotal = sign.phases.reduce((sum, phase) => sum + phase.duration + (phase.hold ?? 0), 0)
  if (Math.abs(phaseTotal - sign.duration) > 1) {
    issues.push({
      file,
      path: 'duration',
      message: `duration ${sign.duration} does not match the phase total ${phaseTotal}`,
    })
  }

  return issues
}

const validateScenario = (
  file: string,
  scenario: Scenario,
  signIds: Set<string>,
): ContentIssue[] => {
  const issues: ContentIssue[] = []

  for (const word of scenario.vocab) {
    if (!signIds.has(word)) {
      issues.push({
        file,
        path: 'vocab',
        message: `sign "${word}" has no file`,
      })
    }
  }

  const nodeIds = new Set<string>()
  scenario.nodes.forEach((node, index) => {
    if (nodeIds.has(node.id)) {
      issues.push({ file, path: `nodes.${index}.id`, message: `duplicate node id "${node.id}"` })
    }
    nodeIds.add(node.id)
  })

  scenario.nodes.forEach((node, index) => {
    if (node.next !== null && !nodeIds.has(node.next)) {
      issues.push({
        file,
        path: `nodes.${index}.next`,
        message: `points to missing node "${node.next}"`,
      })
    }
    if (node.onFail && !nodeIds.has(node.onFail)) {
      issues.push({
        file,
        path: `nodes.${index}.onFail`,
        message: `points to missing node "${node.onFail}"`,
      })
    }
    if (node.task) {
      for (const role of ['deaf', 'service'] as const) {
        const task = node.task[role]
        if (task.type === 'point') {
          if (task.correct >= task.options.length) {
            issues.push({
              file,
              path: `nodes.${index}.task.${role}.correct`,
              message: `answer index ${task.correct} is out of range for the choices`,
            })
          }
          continue
        }
        if (scenario.vocab.length > 0 && !scenario.vocab.includes(task.sign)) {
          issues.push({
            file,
            path: `nodes.${index}.task.${role}.sign`,
            message: `sign "${task.sign}" is not in vocab`,
          })
        }
        if (task.type === 'receptive' && !task.options.includes(task.sign)) {
          issues.push({
            file,
            path: `nodes.${index}.task.${role}.options`,
            message: `choices do not include the correct answer "${task.sign}"`,
          })
        }
      }
    }
  })

  return issues
}

export const validateContent = (content: ContentSet): ContentIssue[] => {
  const issues: ContentIssue[] = []

  const handshapes = parseAll(content.handshapes, handshapeSchema, 'content/handshapes', issues)
  const signs = parseAll(content.signs, signSchema, 'content/signs', issues)
  const scenarios = parseAll(content.scenarios, scenarioSchema, 'content/scenarios', issues)

  const handshapeIds = new Set(handshapes.keys())
  const signIds = new Set(signs.keys())

  for (const [name, sign] of signs) {
    issues.push(...validateSign(`content/signs/${name}.json`, sign, handshapeIds))
  }
  for (const [name, scenario] of scenarios) {
    issues.push(...validateScenario(`content/scenarios/${name}.json`, scenario, signIds))
  }

  return issues
}

export const unapprovedSigns = (signs: Record<string, unknown>): ContentIssue[] => {
  const issues: ContentIssue[] = []
  for (const [name, raw] of Object.entries(signs)) {
    const status = (raw as { review?: { status?: string } })?.review?.status ?? 'empty'
    if (status !== 'approved') {
      issues.push({
        file: `content/signs/${name}.json`,
        path: 'review.status',
        message: `"${status}" is not approved`,
      })
    }
  }
  return issues
}
