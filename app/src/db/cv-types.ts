/** Shared CV shapes (UI + DB IPC). */

export interface ProfileLink {
  label: string
  url: string
}

export interface Profile {
  name: string
  address: string
  email: string
  phone: string
  links: ProfileLink[]
}

export interface EducationEntry {
  id: string
  institution: string
  program: string
  startDate: string
  endDate: string
  addenda: string
}

export interface ExperienceEntry {
  id: string
  organization: string
  role: string
  startDate: string
  endDate: string
  bullets: string
}

export type LeadershipEntry = ExperienceEntry

export interface AwardEntry {
  id: string
  name: string
  conferrer: string
  date: string
}

export interface SkillGroup {
  id: string
  name: string
  skills: string
}
