import type { AwardEntry, EducationEntry, ExperienceEntry, Profile, SkillGroup } from './cv-types'

export type DbRequest =
  | { type: 'getProfile' }
  | { type: 'upsertProfile'; payload: Profile }
  | { type: 'listEducation' }
  | { type: 'upsertEducation'; payload: EducationEntry }
  | { type: 'deleteEducation'; id: string }
  | { type: 'listExperience' }
  | { type: 'upsertExperience'; payload: ExperienceEntry }
  | { type: 'deleteExperience'; id: string }
  | { type: 'listLeadership' }
  | { type: 'upsertLeadership'; payload: ExperienceEntry }
  | { type: 'deleteLeadership'; id: string }
  | { type: 'listAwards' }
  | { type: 'upsertAward'; payload: AwardEntry }
  | { type: 'deleteAward'; id: string }
  | { type: 'listSkillGroups' }
  | { type: 'upsertSkillGroup'; payload: SkillGroup }
  | { type: 'deleteSkillGroup'; id: string }

export type DbResult<T = void> = { ok: true; data: T } | { ok: false; error: string }
