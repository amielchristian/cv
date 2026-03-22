import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

/** Single row id — `default`. */
export const profile = sqliteTable('profile', {
  id: text('id').primaryKey(),
  name: text('name').notNull().default(''),
  address: text('address').notNull().default(''),
  email: text('email').notNull().default(''),
  phone: text('phone').notNull().default(''),
  linksJson: text('links_json').notNull().default('[]')
})

export const education = sqliteTable('education', {
  id: text('id').primaryKey(),
  institution: text('institution').notNull(),
  program: text('program').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  addenda: text('addenda').notNull().default('')
})

export const experience = sqliteTable('experience', {
  id: text('id').primaryKey(),
  organization: text('organization').notNull(),
  role: text('role').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  bullets: text('bullets').notNull().default('')
})

export const leadership = sqliteTable('leadership', {
  id: text('id').primaryKey(),
  organization: text('organization').notNull(),
  role: text('role').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  bullets: text('bullets').notNull().default('')
})

export const awards = sqliteTable('awards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  conferrer: text('conferrer').notNull(),
  date: text('date').notNull()
})

export const skillGroups = sqliteTable('skill_groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  skills: text('skills').notNull()
})
