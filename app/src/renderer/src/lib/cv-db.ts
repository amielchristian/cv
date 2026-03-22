import type { AwardEntry, EducationEntry, ExperienceEntry, Profile, SkillGroup } from '@db/cv-types'
import type { DbRequest } from '@db/ipc'

export const CV_DEBOUNCE_MS = 500

export async function dbRun(req: DbRequest): Promise<void> {
  const result = await window.api.db.run(req)
  if (!result.ok) throw new Error(result.error)
}

async function dbRunData<T>(req: DbRequest): Promise<T> {
  const result = await window.api.db.run(req)
  if (!result.ok) throw new Error(result.error)
  return result.data as T
}

export async function loadCvData(): Promise<{
  profile: Profile | null
  education: EducationEntry[]
  experience: ExperienceEntry[]
  leadership: ExperienceEntry[]
  awards: AwardEntry[]
  skillGroups: SkillGroup[]
}> {
  const [profile, education, experience, leadership, awards, skillGroups] = await Promise.all([
    dbRunData<Profile | null>({ type: 'getProfile' }),
    dbRunData<EducationEntry[]>({ type: 'listEducation' }),
    dbRunData<ExperienceEntry[]>({ type: 'listExperience' }),
    dbRunData<ExperienceEntry[]>({ type: 'listLeadership' }),
    dbRunData<AwardEntry[]>({ type: 'listAwards' }),
    dbRunData<SkillGroup[]>({ type: 'listSkillGroups' })
  ])
  return { profile, education, experience, leadership, awards, skillGroups }
}
