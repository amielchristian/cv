import type { Profile } from '../cv-schema'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { LinkSlot } from '@/lib/profile-link-presets'
import { PROFILE_LINK_NONE, PROFILE_LINK_PRESETS } from '@/lib/profile-link-presets'
import { inputClass, labelClass, SectionTitle } from './cvDataUi'

export function ProfileSection({
  profile,
  linkSlots,
  onProfilePatch,
  updateLinkSlots,
  onAddProfileLink,
  onRemoveProfileLink
}: {
  profile: Profile
  linkSlots: LinkSlot[]
  onProfilePatch: (patch: Partial<Profile>) => void
  updateLinkSlots: (updater: (prev: LinkSlot[]) => LinkSlot[]) => void
  onAddProfileLink: () => void
  onRemoveProfileLink: (slotId: string) => void
}): React.JSX.Element {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <SectionTitle>Profile</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Name
          <input
            className={inputClass}
            value={profile.name}
            onChange={(e) => onProfilePatch({ name: e.target.value })}
          />
        </label>
        <label className={labelClass}>
          Email
          <input
            className={inputClass}
            value={profile.email}
            onChange={(e) => onProfilePatch({ email: e.target.value })}
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Address
          <input
            className={inputClass}
            value={profile.address}
            onChange={(e) => onProfilePatch({ address: e.target.value })}
          />
        </label>
        <label className={labelClass}>
          Phone
          <input
            className={inputClass}
            value={profile.phone}
            onChange={(e) => onProfilePatch({ phone: e.target.value })}
          />
        </label>
      </div>

      <div className="mt-4">
        <p className={labelClass}>Links</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Typical résumés include LinkedIn, a personal website or portfolio, and GitHub for technical roles;
          optional extras include X, Stack Overflow, or Medium when relevant.
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
                <label className={`${labelClass} mb-1 block`} htmlFor={`link-custom-${slot.id}`}>
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
              onClick={() => onRemoveProfileLink(slot.id)}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          className="mt-3 rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
          onClick={onAddProfileLink}
        >
          Add link
        </button>
      </div>
    </section>
  )
}

