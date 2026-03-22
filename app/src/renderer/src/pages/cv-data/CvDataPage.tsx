import { useCallback, useState } from 'react'
import type {
  AwardEntry,
  EducationEntry,
  ExperienceEntry,
  LeadershipEntry,
  Profile,
  ProfileLink,
  SkillGroup
} from './cv-schema'
import { newId } from '@/lib/id'

// TODO: Serialize to JSON / drive LaTeX generation (see cvbuild LaTeXGenerator).

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
  const [profile, setProfile] = useState<Profile>({
    name: '',
    address: '',
    email: '',
    phone: '',
    links: []
  })

  const [education, setEducation] = useState<EducationEntry[]>([])
  const [experience, setExperience] = useState<ExperienceEntry[]>([])
  const [leadership, setLeadership] = useState<LeadershipEntry[]>([])
  const [certifications, setCertifications] = useState<AwardEntry[]>([])
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([])

  const addEducation = useCallback((): void => {
    setEducation((prev) => [
      ...prev,
      {
        id: newId(),
        institution: '',
        program: '',
        startDate: '',
        endDate: '',
        addenda: ''
      }
    ])
  }, [])

  const addExperience = useCallback((): void => {
    setExperience((prev) => [
      ...prev,
      {
        id: newId(),
        organization: '',
        role: '',
        startDate: '',
        endDate: '',
        bullets: ''
      }
    ])
  }, [])

  const addLeadership = useCallback((): void => {
    setLeadership((prev) => [
      ...prev,
      {
        id: newId(),
        organization: '',
        role: '',
        startDate: '',
        endDate: '',
        bullets: ''
      }
    ])
  }, [])

  const addCert = useCallback((): void => {
    setCertifications((prev) => [...prev, { id: newId(), name: '', conferrer: '', date: '' }])
  }, [])

  const addSkillGroup = useCallback((): void => {
    setSkillGroups((prev) => [...prev, { id: newId(), name: '', skills: '' }])
  }, [])

  const addProfileLink = useCallback((): void => {
    setProfile((p) => ({ ...p, links: [...p.links, { label: '', url: '' }] }))
  }, [])

  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto bg-background p-4">
      <div className="mx-auto max-w-3xl space-y-8 pb-12">
        <p className="text-sm text-muted-foreground">
          Structured CV fields (cvbuild-aligned). Local state only — not yet synced to the Source
          editor.
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
            {profile.links.map((link, i) => (
              <div key={i} className="mt-2 flex flex-wrap gap-2">
                <input
                  className={`${inputClass} flex-1 min-w-[8rem]`}
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => {
                    const links = profile.links.slice() as ProfileLink[]
                    links[i] = { ...links[i], label: e.target.value }
                    setProfile((p) => ({ ...p, links }))
                  }}
                />
                <input
                  className={`${inputClass} flex-[2] min-w-[10rem]`}
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => {
                    const links = profile.links.slice() as ProfileLink[]
                    links[i] = { ...links[i], url: e.target.value }
                    setProfile((p) => ({ ...p, links }))
                  }}
                />
                <button
                  type="button"
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                  onClick={() => {
                    setProfile((p) => ({
                      ...p,
                      links: p.links.filter((_, j) => j !== i)
                    }))
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
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
                    onChange={(e) =>
                      setEducation((list) =>
                        list.map((x) =>
                          x.id === row.id ? { ...x, institution: e.target.value } : x
                        )
                      )
                    }
                  />
                </label>
                <label className={labelClass}>
                  Program
                  <input
                    className={inputClass}
                    value={row.program}
                    onChange={(e) =>
                      setEducation((list) =>
                        list.map((x) => (x.id === row.id ? { ...x, program: e.target.value } : x))
                      )
                    }
                  />
                </label>
                <label className={labelClass}>
                  Start
                  <input
                    className={inputClass}
                    value={row.startDate}
                    onChange={(e) =>
                      setEducation((list) =>
                        list.map((x) => (x.id === row.id ? { ...x, startDate: e.target.value } : x))
                      )
                    }
                  />
                </label>
                <label className={labelClass}>
                  End
                  <input
                    className={inputClass}
                    value={row.endDate}
                    onChange={(e) =>
                      setEducation((list) =>
                        list.map((x) => (x.id === row.id ? { ...x, endDate: e.target.value } : x))
                      )
                    }
                  />
                </label>
              </div>
              <label className={`${labelClass} mt-2 block`}>
                Addenda (honors, GWA, etc.)
                <textarea
                  className={`${inputClass} min-h-[4rem] resize-y`}
                  value={row.addenda}
                  onChange={(e) =>
                    setEducation((list) =>
                      list.map((x) => (x.id === row.id ? { ...x, addenda: e.target.value } : x))
                    )
                  }
                />
              </label>
              <button
                type="button"
                className="mt-2 text-xs text-destructive hover:underline"
                onClick={() => setEducation((list) => list.filter((x) => x.id !== row.id))}
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
              onChange={(next) =>
                setExperience((list) => list.map((x) => (x.id === row.id ? next : x)))
              }
              onRemove={() => setExperience((list) => list.filter((x) => x.id !== row.id))}
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
              onChange={(next) =>
                setLeadership((list) => list.map((x) => (x.id === row.id ? next : x)))
              }
              onRemove={() => setLeadership((list) => list.filter((x) => x.id !== row.id))}
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
                    onChange={(e) =>
                      setCertifications((list) =>
                        list.map((x) => (x.id === row.id ? { ...x, name: e.target.value } : x))
                      )
                    }
                  />
                </label>
                <label className={labelClass}>
                  Conferrer
                  <input
                    className={inputClass}
                    value={row.conferrer}
                    onChange={(e) =>
                      setCertifications((list) =>
                        list.map((x) => (x.id === row.id ? { ...x, conferrer: e.target.value } : x))
                      )
                    }
                  />
                </label>
                <label className={labelClass}>
                  Date
                  <input
                    className={inputClass}
                    value={row.date}
                    onChange={(e) =>
                      setCertifications((list) =>
                        list.map((x) => (x.id === row.id ? { ...x, date: e.target.value } : x))
                      )
                    }
                  />
                </label>
              </div>
              <button
                type="button"
                className="mt-2 text-xs text-destructive hover:underline"
                onClick={() => setCertifications((list) => list.filter((x) => x.id !== row.id))}
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
                  onChange={(e) =>
                    setSkillGroups((list) =>
                      list.map((x) => (x.id === row.id ? { ...x, name: e.target.value } : x))
                    )
                  }
                />
              </label>
              <label className={`${labelClass} mt-2 block`}>
                Skills (comma-separated or one per line)
                <textarea
                  className={`${inputClass} min-h-[4rem] resize-y`}
                  value={row.skills}
                  onChange={(e) =>
                    setSkillGroups((list) =>
                      list.map((x) => (x.id === row.id ? { ...x, skills: e.target.value } : x))
                    )
                  }
                />
              </label>
              <button
                type="button"
                className="mt-2 text-xs text-destructive hover:underline"
                onClick={() => setSkillGroups((list) => list.filter((x) => x.id !== row.id))}
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
      </div>
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
