/** Minimal types aligned with cvbuild / LaTeXGenerator section shapes. */

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

/** Same fields as experience-type in cvbuild (Leadership & Activities). */
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
