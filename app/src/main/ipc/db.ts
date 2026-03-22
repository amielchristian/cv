import { eq } from 'drizzle-orm'
import { ipcMain } from 'electron'
import type {
  AwardEntry,
  EducationEntry,
  ExperienceEntry,
  Profile,
  ProfileLink,
  SkillGroup
} from '../../db/cv-types'
import type { DbRequest, DbResult } from '../../db/ipc'
import * as schema from '../../db/schema'
import { getDb } from '../db/client'

const PROFILE_ID = 'default'

function parseLinks(json: string): ProfileLink[] {
  try {
    const parsed = JSON.parse(json) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed as ProfileLink[]
  } catch {
    return []
  }
}

function rowToProfile(row: typeof schema.profile.$inferSelect): Profile {
  return {
    name: row.name,
    address: row.address,
    email: row.email,
    phone: row.phone,
    links: parseLinks(row.linksJson)
  }
}

export async function handleDbOp(req: DbRequest): Promise<DbResult<unknown>> {
  const db = getDb()

  switch (req.type) {
    case 'getProfile': {
      const rows = await db.select().from(schema.profile).where(eq(schema.profile.id, PROFILE_ID))
      const row = rows[0]
      return { ok: true, data: row ? rowToProfile(row) : null }
    }
    case 'upsertProfile': {
      const p = req.payload
      await db
        .insert(schema.profile)
        .values({
          id: PROFILE_ID,
          name: p.name,
          address: p.address,
          email: p.email,
          phone: p.phone,
          linksJson: JSON.stringify(p.links ?? [])
        })
        .onConflictDoUpdate({
          target: schema.profile.id,
          set: {
            name: p.name,
            address: p.address,
            email: p.email,
            phone: p.phone,
            linksJson: JSON.stringify(p.links ?? [])
          }
        })
      return { ok: true, data: undefined }
    }
    case 'listEducation': {
      const rows = await db.select().from(schema.education)
      return { ok: true, data: rows.map(educationRowToEntry) }
    }
    case 'upsertEducation': {
      const e = req.payload
      await db
        .insert(schema.education)
        .values({
          id: e.id,
          institution: e.institution,
          program: e.program,
          startDate: e.startDate,
          endDate: e.endDate,
          addenda: e.addenda
        })
        .onConflictDoUpdate({
          target: schema.education.id,
          set: {
            institution: e.institution,
            program: e.program,
            startDate: e.startDate,
            endDate: e.endDate,
            addenda: e.addenda
          }
        })
      return { ok: true, data: undefined }
    }
    case 'deleteEducation': {
      await db.delete(schema.education).where(eq(schema.education.id, req.id))
      return { ok: true, data: undefined }
    }
    case 'listExperience': {
      const rows = await db.select().from(schema.experience)
      return { ok: true, data: rows.map(experienceRowToEntry) }
    }
    case 'upsertExperience': {
      await upsertExperienceRow(db, req.payload)
      return { ok: true, data: undefined }
    }
    case 'deleteExperience': {
      await db.delete(schema.experience).where(eq(schema.experience.id, req.id))
      return { ok: true, data: undefined }
    }
    case 'listLeadership': {
      const rows = await db.select().from(schema.leadership)
      return { ok: true, data: rows.map(leadershipRowToEntry) }
    }
    case 'upsertLeadership': {
      await upsertLeadershipRow(db, req.payload)
      return { ok: true, data: undefined }
    }
    case 'deleteLeadership': {
      await db.delete(schema.leadership).where(eq(schema.leadership.id, req.id))
      return { ok: true, data: undefined }
    }
    case 'listAwards': {
      const rows = await db.select().from(schema.awards)
      return { ok: true, data: rows.map(awardRowToEntry) }
    }
    case 'upsertAward': {
      const a = req.payload
      await db
        .insert(schema.awards)
        .values({
          id: a.id,
          name: a.name,
          conferrer: a.conferrer,
          date: a.date
        })
        .onConflictDoUpdate({
          target: schema.awards.id,
          set: {
            name: a.name,
            conferrer: a.conferrer,
            date: a.date
          }
        })
      return { ok: true, data: undefined }
    }
    case 'deleteAward': {
      await db.delete(schema.awards).where(eq(schema.awards.id, req.id))
      return { ok: true, data: undefined }
    }
    case 'listSkillGroups': {
      const rows = await db.select().from(schema.skillGroups)
      return { ok: true, data: rows.map(skillRowToEntry) }
    }
    case 'upsertSkillGroup': {
      const s = req.payload
      await db
        .insert(schema.skillGroups)
        .values({
          id: s.id,
          name: s.name,
          skills: s.skills
        })
        .onConflictDoUpdate({
          target: schema.skillGroups.id,
          set: {
            name: s.name,
            skills: s.skills
          }
        })
      return { ok: true, data: undefined }
    }
    case 'deleteSkillGroup': {
      await db.delete(schema.skillGroups).where(eq(schema.skillGroups.id, req.id))
      return { ok: true, data: undefined }
    }
    default: {
      const _exhaustive: never = req
      return { ok: false, error: `Unsupported op: ${String(_exhaustive)}` }
    }
  }
}

function educationRowToEntry(row: typeof schema.education.$inferSelect): EducationEntry {
  return {
    id: row.id,
    institution: row.institution,
    program: row.program,
    startDate: row.startDate,
    endDate: row.endDate,
    addenda: row.addenda
  }
}

function experienceRowToEntry(row: typeof schema.experience.$inferSelect): ExperienceEntry {
  return {
    id: row.id,
    organization: row.organization,
    role: row.role,
    startDate: row.startDate,
    endDate: row.endDate,
    bullets: row.bullets
  }
}

function leadershipRowToEntry(row: typeof schema.leadership.$inferSelect): ExperienceEntry {
  return {
    id: row.id,
    organization: row.organization,
    role: row.role,
    startDate: row.startDate,
    endDate: row.endDate,
    bullets: row.bullets
  }
}

function awardRowToEntry(row: typeof schema.awards.$inferSelect): AwardEntry {
  return {
    id: row.id,
    name: row.name,
    conferrer: row.conferrer,
    date: row.date
  }
}

function skillRowToEntry(row: typeof schema.skillGroups.$inferSelect): SkillGroup {
  return {
    id: row.id,
    name: row.name,
    skills: row.skills
  }
}

async function upsertExperienceRow(
  db: ReturnType<typeof getDb>,
  e: ExperienceEntry
): Promise<void> {
  await db
    .insert(schema.experience)
    .values({
      id: e.id,
      organization: e.organization,
      role: e.role,
      startDate: e.startDate,
      endDate: e.endDate,
      bullets: e.bullets
    })
    .onConflictDoUpdate({
      target: schema.experience.id,
      set: {
        organization: e.organization,
        role: e.role,
        startDate: e.startDate,
        endDate: e.endDate,
        bullets: e.bullets
      }
    })
}

async function upsertLeadershipRow(
  db: ReturnType<typeof getDb>,
  e: ExperienceEntry
): Promise<void> {
  await db
    .insert(schema.leadership)
    .values({
      id: e.id,
      organization: e.organization,
      role: e.role,
      startDate: e.startDate,
      endDate: e.endDate,
      bullets: e.bullets
    })
    .onConflictDoUpdate({
      target: schema.leadership.id,
      set: {
        organization: e.organization,
        role: e.role,
        startDate: e.startDate,
        endDate: e.endDate,
        bullets: e.bullets
      }
    })
}

export function registerDbIpc(): void {
  ipcMain.handle('db:op', async (_, req: DbRequest) => {
    try {
      return await handleDbOp(req)
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })
}
