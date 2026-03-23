import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedRowUpserts } from './hooks/useDebouncedRowUpserts'
import type {
  AwardEntry,
  EducationEntry,
  ExperienceEntry,
  LeadershipEntry,
  Profile,
  SkillGroup
} from './cv-schema'
import { CV_DEBOUNCE_MS, dbRun, loadCvData } from '@/lib/cv-db'
import {
  emptyLinkSlot,
  profileLinksFromSlots,
  slotsFromProfileLinks,
  type LinkSlot
} from '@/lib/profile-link-presets'
import { newId } from '@/lib/id'
import { AwardsSection } from './components/AwardsSection'
import { EducationSection } from './components/EducationSection'
import { ExperienceSection } from './components/ExperienceSection'
import { ProfileSection } from './components/ProfileSection'
import { SkillGroupsSection } from './components/SkillGroupsSection'

const emptyProfile: Profile = {
  name: '',
  address: '',
  email: '',
  phone: '',
  links: []
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

  const flushAll = useCallback(() => {
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
  }, [certificationsRef, educationRef, experienceRef, leadershipRef, profileRef, skillGroupsRef])

  const { clearRowTimer, scheduleRowUpsert } = useDebouncedRowUpserts({
    debounceMs: CV_DEBOUNCE_MS,
    loadAppliedRef,
    flushAll
  })

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

        <ProfileSection
          profile={profile}
          linkSlots={linkSlots}
          onProfilePatch={(patch) => setProfile((p) => ({ ...p, ...patch }))}
          updateLinkSlots={updateLinkSlots}
          onAddProfileLink={addProfileLink}
          onRemoveProfileLink={removeProfileLink}
        />

        <EducationSection
          rows={education}
          onPatch={patchEducation}
          onRemove={removeEducation}
          onAdd={addEducation}
        />

        <ExperienceSection
          title="Experience"
          rows={experience}
          onChangeRow={onExperienceChange}
          onRemoveRow={removeExperience}
          onAdd={addExperience}
          addLabel="Add experience"
        />

        <ExperienceSection
          title="Leadership & Activities"
          rows={leadership}
          onChangeRow={onLeadershipChange}
          onRemoveRow={removeLeadership}
          onAdd={addLeadership}
          addLabel="Add leadership / activity"
        />

        <AwardsSection
          rows={certifications}
          onPatch={patchCert}
          onRemove={removeCert}
          onAdd={addCert}
        />

        <SkillGroupsSection
          rows={skillGroups}
          onPatch={patchSkillGroup}
          onRemove={removeSkillGroup}
          onAdd={addSkillGroup}
        />
      </fieldset>
    </div>
  )
}


