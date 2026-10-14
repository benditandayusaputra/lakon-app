import { integer, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['pengguna', 'validator', 'admin'] })
    .notNull()
    .default('pengguna'),
  avatar: text('avatar'),
  gender: text('gender', { enum: ['perempuan', 'laki-laki'] }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sessions = pgTable('sessions', {
  token: text('token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const signProgress = pgTable(
  'sign_progress',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    signId: text('sign_id').notNull(),
    direction: text('direction', { enum: ['deaf', 'service'] })
      .notNull()
      .default('deaf'),
    status: text('status', { enum: ['belum', 'berlatih', 'dikuasai', 'dinilai-sendiri'] })
      .notNull()
      .default('belum'),
    attempts: integer('attempts').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.signId, t.direction] })],
)

export const checkpoints = pgTable(
  'checkpoints',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    scenarioId: text('scenario_id').notNull(),
    direction: text('direction', { enum: ['deaf', 'service'] }).notNull(),
    state: text('state').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.scenarioId, t.direction] })],
)

export const scenarioRuns = pgTable('scenario_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  scenarioId: text('scenario_id').notNull(),
  direction: text('direction', { enum: ['deaf', 'service'] }).notNull(),
  durationMs: integer('duration_ms').notNull().default(0),
  mastered: text('mastered').notNull().default('[]'),
  needsRepeat: text('needs_repeat').notNull().default('[]'),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
})
