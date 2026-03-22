import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  AwardEntry,
  EducationEntry,
  ExperienceEntry,
  LeadershipEntry,
  Profile,
  SkillGroup
} from './cv-schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { CV_DEBOUNCE_MS, dbRun, loadCvData } from '@/lib/cv-db'
import {
  emptyLinkSlot,
  PROFILE_LINK_NONE,
  PROFILE_LINK_PRESETS,
  profileLinksFromSlots,
  slotsFromProfileLinks,
  type LinkSlot
} from '@/lib/profile-link-presets'
import { newId } from '@/lib/id'

const emptyProfile: Profile = {
  name: '',
  address: '',
  email: '',
  phone: '',
  links: []
}

const inputClass =
  'mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

const labelClass = 'text-xs font-medium text-muted-foreground'

function SectionTitle({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <h2 className="mb-3 border-b border-[var(--border-scroll)] pb-1 text-sm font-semibold uppercase tracking-wide text-foreground">
      {children}
    </h2>
  )
}

export function CvDataPage(): React.JSX.Element {
  /** UI: initial fetch finished (success or failure). */
  const [hydrated, setHydrated] = useState(false)
  /** DB writes allowed only after a successful load — avoids saving empty state over real data. */
  const [loadApplied, setLoadApplied] = useState(false)
  const loadAppliedRef = useRef(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const [linkSlots, setLinkSlots] = useState<LinkSlot[]>([])
  const [education, setEducation] = useState<EducationEntry[]>([])
  const [experience, setExperience] = useState<ExperienceEntry[]>([])
  const [leadership, setLeadership] = useState<LeadershipEntry[]>([])
  const [certifications, setCertifications] = useState<AwardEntry[]>([])
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([])

  const profileRef = useRef(profile)
  profileRef.current = profile
  const educationRef = useRef(education)
  educationRef.current = education
  const experienceRef = useRef(experience)
  experienceRef.current = experience
  const leadershipRef = useRef(leadership)
  leadershipRef.current = leadership
  const certificationsRef = useRef(certifications)
  certificationsRef.current = certifications
  const skillGroupsRef = useRef(skillGroups)
  skillGroupsRef.current = skillGroups

  const rowTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const clearRowTimer = useCallback((key: string) => {
    const t = rowTimersRef.current[key]
    if (t) clearTimeout(t)
    delete rowTimersRef.current[key]
  }, [])

  const scheduleRowUpsert = useCallback(
    (key: string, run: () => void) => {
      clearRowTimer(key)
      rowTimersRef.current[key] = setTimeout(() => {
        run()
        delete rowTimersRef.current[key]
      }, CV_DEBOUNCE_MS)
    },
    [clearRowTimer]
  )

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const data = await loadCvData()
        if (cancelled) return
        const prof = data.profile ?? emptyProfile
        loadAppliedRef.current = true
        setLoadApplied(true)
        setLoadError(null)
        setProfile(prof)
        setLinkSlots(slotsFromProfileLinks(prof.links))
        setEducation(data.education)
        setExperience(data.experience)
        setLeadership(data.leadership)
        setCertifications(data.awards)
        setSkillGroups(data.skillGroups)
      } catch (e) {
        console.error('Failed to load CV data:', e)
        loadAppliedRef.current = false
        setLoadApplied(false)
        setLoadError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setHydrated(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!loadApplied) return
    const t = setTimeout(() => {
      void dbRun({ type: 'upsertProfile', payload: profile }).catch((err) =>
        console.error('Failed to save profile:', err)
      )
    }, CV_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [profile, loadApplied])

  useEffect(() => {
    const timersRef = rowTimersRef
    return () => {
      if (!loadAppliedRef.current) return
      const pendingRowKeys = Object.keys(timersRef.current)
      pendingRowKeys.forEach((k) => clearRowTimer(k))
      void dbRun({ type: 'upsertProfile', payload: profileRef.current }).catch((err) =>
        console.error('Failed to flush profile:', err)
      )
      educationRef.current.forEach((row) => {
        void dbRun({ type: 'upsertEducation', payload: row }).catch((err) =>
          console.error('Failed to flush education:', err)
        )
      })
      experienceRef.current.forEach((row) => {
        void dbRun({ type: 'upsertExperience', payload: row }).catch((err) =>
          console.error('Failed to flush experience:', err)
        )
      })
      leadershipRef.current.forEach((row) => {
        void dbRun({ type: 'upsertLeadership', payload: row }).catch((err) =>
          console.error('Failed to flush leadership:', err)
        )
      })
      certificationsRef.current.forEach((row) => {
        void dbRun({ type: 'upsertAward', payload: row }).catch((err) =>
          console.error('Failed to flush award:', err)
        )
      })
      skillGroupsRef.current.forEach((row) => {
        void dbRun({ type: 'upsertSkillGroup', payload: row }).catch((err) =>
          console.error('Failed to flush skill group:', err)
        )
      })
    }
  }, [clearRowTimer])

  const patchEducation = useCallback(
    (id: string, patch: Partial<EducationEntry>) => {
      setEducation((list) => {
        const next = list.map((x) => (x.id === id ? { ...x, ...patch } : x))
        const row = next.find((r) => r.id === id)
        if (row) {
          scheduleRowUpsert(`edu:${id}`, () => {
            void dbRun({ type: 'upsertEducation', payload: row }).catch((err) =>
              console.error('Failed to save education:', err)
            )
          })
        }
        return next
      })
    },
    [scheduleRowUpsert]
  )

  const removeEducation = useCallback(
    (id: string) => {
      clearRowTimer(`edu:${id}`)
      void dbRun({ type: 'deleteEducation', id })
        .then(() => setEducation((list) => list.filter((x) => x.id !== id)))
        .catch((err) => console.error('Failed to delete education:', err))
    },
    [clearRowTimer]
  )

  const addEducation = useCallback((): void => {
    const row: EducationEntry = {
      id: newId(),
      institution: '',
      program: '',
      startDate: '',
      endDate: '',
      addenda: ''
    }
    setEducation((prev) => [...prev, row])
    void dbRun({ type: 'upsertEducation', payload: row }).catch((err) =>
      console.error('Failed to add education:', err)
    )
  }, [])

  const onExperienceChange = useCallback(
    (next: ExperienceEntry) => {
      setExperience((list) => list.map((x) => (x.id === next.id ? next : x)))
      scheduleRowUpsert(`exp:${next.id}`, () => {
        void dbRun({ type: 'upsertExperience', payload: next }).catch((err) =>
          console.error('Failed to save experience:', err)
        )
      })
    },
    [scheduleRowUpsert]
  )

  const removeExperience = useCallback(
    (id: string) => {
      clearRowTimer(`exp:${id}`)
      void dbRun({ type: 'deleteExperience', id })
        .then(() => setExperience((list) => list.filter((x) => x.id !== id)))
        .catch((err) => console.error('Failed to delete experience:', err))
    },
    [clearRowTimer]
  )

  const onLeadershipChange = useCallback(
    (next: ExperienceEntry) => {
      setLeadership((list) => list.map((x) => (x.id === next.id ? next : x)))
      scheduleRowUpsert(`lead:${next.id}`, () => {
        void dbRun({ type: 'upsertLeadership', payload: next }).catch((err) =>
          console.error('Failed to save leadership:', err)
        )
      })
    },
    [scheduleRowUpsert]
  )

  const removeLeadership = useCallback(
    (id: string) => {
      clearRowTimer(`lead:${id}`)
      void dbRun({ type: 'deleteLeadership', id })
        .then(() => setLeadership((list) => list.filter((x) => x.id !== id)))
        .catch((err) => console.error('Failed to delete leadership:', err))
    },
    [clearRowTimer]
  )

  const addExperience = useCallback((): void => {
    const row: ExperienceEntry = {
      id: newId(),
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      bullets: ''
    }
    setExperience((prev) => [...prev, row])
    void dbRun({ type: 'upsertExperience', payload: row }).catch((err) =>
      console.error('Failed to add experience:', err)
    )
  }, [])

  const addLeadership = useCallback((): void => {
    const row: ExperienceEntry = {
      id: newId(),
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      bullets: ''
    }
    setLeadership((prev) => [...prev, row])
    void dbRun({ type: 'upsertLeadership', payload: row }).catch((err) =>
      console.error('Failed to add leadership:', err)
    )
  }, [])

  const patchCert = useCallback(
    (id: string, patch: Partial<AwardEntry>) => {
      setCertifications((list) => {
        const next = list.map((x) => (x.id === id ? { ...x, ...patch } : x))
        const row = next.find((r) => r.id === id)
        if (row) {
          scheduleRowUpsert(`award:${id}`, () => {
            void dbRun({ type: 'upsertAward', payload: row }).catch((err) =>
              console.error('Failed to save certification:', err)
            )
          })
        }
        return next
      })
    },
    [scheduleRowUpsert]
  )

  const removeCert = useCallback(
    (id: string) => {
      clearRowTimer(`award:${id}`)
      void dbRun({ type: 'deleteAward', id })
        .then(() => setCertifications((list) => list.filter((x) => x.id !== id)))
        .catch((err) => console.error('Failed to delete certification:', err))
    },
    [clearRowTimer]
  )

  const addCert = useCallback((): void => {
    const row: AwardEntry = { id: newId(), name: '', conferrer: '', date: '' }
    setCertifications((prev) => [...prev, row])
    void dbRun({ type: 'upsertAward', payload: row }).catch((err) =>
      console.error('Failed to add certification:', err)
    )
  }, [])

  const patchSkillGroup = useCallback(
    (id: string, patch: Partial<SkillGroup>) => {
      setSkillGroups((list) => {
        const next = list.map((x) => (x.id === id ? { ...x, ...patch } : x))
        const row = next.find((r) => r.id === id)
        if (row) {
          scheduleRowUpsert(`skill:${id}`, () => {
            void dbRun({ type: 'upsertSkillGroup', payload: row }).catch((err) =>
              console.error('Failed to save skill group:', err)
            )
          })
        }
        return next
      })
    },
    [scheduleRowUpsert]
  )

  const removeSkillGroup = useCallback(
    (id: string) => {
      clearRowTimer(`skill:${id}`)
      void dbRun({ type: 'deleteSkillGroup', id })
        .then(() => setSkillGroups((list) => list.filter((x) => x.id !== id)))
        .catch((err) => console.error('Failed to delete skill group:', err))
    },
    [clearRowTimer]
  )

  const addSkillGroup = useCallback((): void => {
    const row: SkillGroup = { id: newId(), name: '', skills: '' }
    setSkillGroups((prev) => [...prev, row])
    void dbRun({ type: 'upsertSkillGroup', payload: row }).catch((err) =>
      console.error('Failed to add skill group:', err)
    )
  }, [])

  const updateLinkSlots = useCallback((updater: (prev: LinkSlot[]) => LinkSlot[]) => {
    setLinkSlots((prev) => {
      const next = updater(prev)
      setProfile((p) => ({ ...p, links: profileLinksFromSlots(next) }))
      return next
    })
  }, [])

  const addProfileLink = useCallback(() => {
    updateLinkSlots((prev) => [...prev, emptyLinkSlot()])
  }, [updateLinkSlots])

  const removeProfileLink = useCallback(
    (slotId: string) => {
      updateLinkSlots((prev) => prev.filter((s) => s.id !== slotId))
    },
    [updateLinkSlots]
  )

  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto bg-background p-4">
      <fieldset
        disabled={!hydrated || !loadApplied}
        className="mx-auto max-w-3xl space-y-8 pb-12 min-w-0 border-0 p-0 disabled:pointer-events-none disabled:opacity-60"
      >
        <p className="text-sm text-muted-foreground">
          {!hydrated
            ? 'Loading CV data…'
            : loadError
              ? `Could not load CV data: ${loadError}. Nothing was saved from this screen — your existing database was not overwritten.`
              : 'Structured CV fields (cvbuild-aligned). Saved to the app database on this device; not yet wired to the Source editor.'}
        </p>

        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <SectionTitle>Profile</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Name
              <input
                className={inputClass}
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
            </label>
            <label className={labelClass}>
              Email
              <input
                className={inputClass}
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Address
              <input
                className={inputClass}
                value={profile.address}
                onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
              />
            </label>
            <label className={labelClass}>
              Phone
              <input
                className={inputClass}
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </label>
          </div>
          <div className="mt-4">
            <p className={labelClass}>Links</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Typical résumés include LinkedIn, a personal website or portfolio, and GitHub for
              technical roles; optional extras include X, Stack Overflow, or Medium when relevant.
            </p>
            {linkSlots.map((slot) => (
              <div
                key={slot.id}
                className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
              >
                <div className="w-full sm:w-[13.5rem]">
                  <label className={`${labelClass} mb-1 block`} htmlFor={`link-type-${slot.id}`}>
                    Type
                  </label>
                  <Select
                    value={slot.presetId}
                    onValueChange={(v) => {
                      updateLinkSlots((prev) =>
                        prev.map((s) => {
                          if (s.id !== slot.id) return s
                          if (v === PROFILE_LINK_NONE) {
                            return {
                              ...s,
                              presetId: PROFILE_LINK_NONE,
                              customLabel: '',
                              url: ''
                            }
                          }
                          return {
                            ...s,
                            presetId: v as LinkSlot['presetId'],
                            customLabel: v === 'other' ? s.customLabel : '',
                            url: s.url
                          }
                        })
                      )
                    }}
                  >
                    <SelectTrigger id={`link-type-${slot.id}`} className="w-full bg-background">
                      <SelectValue placeholder="Choose type" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[100]">
                      <SelectItem value={PROFILE_LINK_NONE}>None</SelectItem>
                      {PROFILE_LINK_PRESETS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {slot.presetId === 'other' && (
                  <div className="min-w-0 flex-1 sm:max-w-[12rem]">
                    <label
                      className={`${labelClass} mb-1 block`}
                      htmlFor={`link-custom-${slot.id}`}
                    >
                      Custom label
                    </label>
                    <input
                      id={`link-custom-${slot.id}`}
                      className={inputClass}
                      placeholder="e.g. Behance"
                      value={slot.customLabel}
                      onChange={(e) => {
                        updateLinkSlots((prev) =>
                          prev.map((s) =>
                            s.id === slot.id ? { ...s, customLabel: e.target.value } : s
                          )
                        )
                      }}
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1 sm:min-w-[14rem]">
                  <label className={`${labelClass} mb-1 block`} htmlFor={`link-url-${slot.id}`}>
                    URL
                  </label>
                  <input
                    id={`link-url-${slot.id}`}
                    className={inputClass}
                    placeholder="https://…"
                    value={slot.url}
                    onChange={(e) => {
                      updateLinkSlots((prev) =>
                        prev.map((s) => (s.id === slot.id ? { ...s, url: e.target.value } : s))
                      )
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted sm:mb-0.5"
                  onClick={() => removeProfileLink(slot.id)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-3 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
              onClick={addProfileLink}
            >
              Add link
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <SectionTitle>Education</SectionTitle>
          {education.map((row) => (
            <div key={row.id} className="mb-4 rounded-md border border-border/80 p-3 last:mb-0">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className={labelClass}>
                  Institution
                  <input
                    className={inputClass}
                    value={row.institution}
                    onChange={(e) => patchEducation(row.id, { institution: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  Program
                  <input
                    className={inputClass}
                    value={row.program}
                    onChange={(e) => patchEducation(row.id, { program: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  Start
                  <input
                    className={inputClass}
                    value={row.startDate}
                    onChange={(e) => patchEducation(row.id, { startDate: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  End
                  <input
                    className={inputClass}
                    value={row.endDate}
                    onChange={(e) => patchEducation(row.id, { endDate: e.target.value })}
                  />
                </label>
              </div>
              <label className={`${labelClass} mt-2 block`}>
                Addenda (honors, GWA, etc.)
                <textarea
                  className={`${inputClass} min-h-[4rem] resize-y`}
                  value={row.addenda}
                  onChange={(e) => patchEducation(row.id, { addenda: e.target.value })}
                />
              </label>
              <button
                type="button"
                className="mt-2 text-xs text-destructive hover:underline"
                onClick={() => removeEducation(row.id)}
              >
                Remove entry
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            onClick={addEducation}
          >
            Add education
          </button>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <SectionTitle>Experience</SectionTitle>
          {experience.map((row) => (
            <ExperienceBlock
              key={row.id}
              row={row}
              onChange={onExperienceChange}
              onRemove={() => removeExperience(row.id)}
            />
          ))}
          <button
            type="button"
            className="rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            onClick={addExperience}
          >
            Add experience
          </button>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <SectionTitle>Leadership &amp; Activities</SectionTitle>
          {leadership.map((row) => (
            <ExperienceBlock
              key={row.id}
              row={row}
              onChange={onLeadershipChange}
              onRemove={() => removeLeadership(row.id)}
            />
          ))}
          <button
            type="button"
            className="rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            onClick={addLeadership}
          >
            Add leadership / activity
          </button>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <SectionTitle>Certifications</SectionTitle>
          {certifications.map((row) => (
            <div key={row.id} className="mb-4 rounded-md border border-border/80 p-3 last:mb-0">
              <div className="grid gap-2 sm:grid-cols-3">
                <label className={labelClass}>
                  Name
                  <input
                    className={inputClass}
                    value={row.name}
                    onChange={(e) => patchCert(row.id, { name: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  Conferrer
                  <input
                    className={inputClass}
                    value={row.conferrer}
                    onChange={(e) => patchCert(row.id, { conferrer: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  Date
                  <input
                    className={inputClass}
                    value={row.date}
                    onChange={(e) => patchCert(row.id, { date: e.target.value })}
                  />
                </label>
              </div>
              <button
                type="button"
                className="mt-2 text-xs text-destructive hover:underline"
                onClick={() => removeCert(row.id)}
              >
                Remove entry
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            onClick={addCert}
          >
            Add certification
          </button>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <SectionTitle>Skills</SectionTitle>
          {skillGroups.map((row) => (
            <div key={row.id} className="mb-4 rounded-md border border-border/80 p-3 last:mb-0">
              <label className={labelClass}>
                Group name
                <input
                  className={inputClass}
                  value={row.name}
                  onChange={(e) => patchSkillGroup(row.id, { name: e.target.value })}
                />
              </label>
              <label className={`${labelClass} mt-2 block`}>
                Skills (comma-separated or one per line)
                <textarea
                  className={`${inputClass} min-h-[4rem] resize-y`}
                  value={row.skills}
                  onChange={(e) => patchSkillGroup(row.id, { skills: e.target.value })}
                />
              </label>
              <button
                type="button"
                className="mt-2 text-xs text-destructive hover:underline"
                onClick={() => removeSkillGroup(row.id)}
              >
                Remove group
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            onClick={addSkillGroup}
          >
            Add skill group
          </button>
        </section>
      </fieldset>
    </div>
  )
}

function ExperienceBlock({
  row,
  onChange,
  onRemove
}: {
  row: ExperienceEntry
  onChange: (next: ExperienceEntry) => void
  onRemove: () => void
}): React.JSX.Element {
  return (
    <div className="mb-4 rounded-md border border-border/80 p-3 last:mb-0">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className={labelClass}>
          Organization
          <input
            className={inputClass}
            value={row.organization}
            onChange={(e) => onChange({ ...row, organization: e.target.value })}
          />
        </label>
        <label className={labelClass}>
          Role
          <input
            className={inputClass}
            value={row.role}
            onChange={(e) => onChange({ ...row, role: e.target.value })}
          />
        </label>
        <label className={labelClass}>
          Start
          <input
            className={inputClass}
            value={row.startDate}
            onChange={(e) => onChange({ ...row, startDate: e.target.value })}
          />
        </label>
        <label className={labelClass}>
          End
          <input
            className={inputClass}
            value={row.endDate}
            onChange={(e) => onChange({ ...row, endDate: e.target.value })}
          />
        </label>
      </div>
      <label className={`${labelClass} mt-2 block`}>
        Bullets (one per line)
        <textarea
          className={`${inputClass} min-h-[5rem] resize-y font-mono text-xs`}
          value={row.bullets}
          onChange={(e) => onChange({ ...row, bullets: e.target.value })}
        />
      </label>
      <button
        type="button"
        className="mt-2 text-xs text-destructive hover:underline"
        onClick={onRemove}
      >
        Remove entry
      </button>
    </div>
  )
}
