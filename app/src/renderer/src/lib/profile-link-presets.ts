import type { ProfileLink } from '@db/cv-types'
import { newId } from '@/lib/id'

/**
 * Common resume/CV links (professional norms + tech roles):
 * LinkedIn is widely expected; portfolio/website and GitHub are standard for
 * design and engineering; optional extras cover common professional URLs.
 */
export const PROFILE_LINK_NONE = '__none__' as const

export const PROFILE_LINK_PRESETS = [
  { id: 'website', label: 'Personal website' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'github', label: 'GitHub' },
  { id: 'twitter', label: 'X (Twitter)' },
  { id: 'stackoverflow', label: 'Stack Overflow' },
  { id: 'medium', label: 'Medium' },
  { id: 'other', label: 'Other' }
] as const

export type ProfileLinkPresetId = (typeof PROFILE_LINK_PRESETS)[number]['id']

export type LinkSlot = {
  /** Client-only id for list keys and stable updates (not persisted). */
  id: string
  presetId: typeof PROFILE_LINK_NONE | ProfileLinkPresetId
  customLabel: string
  url: string
}

export function emptyLinkSlot(): LinkSlot {
  return { id: newId(), presetId: PROFILE_LINK_NONE, customLabel: '', url: '' }
}

function presetById(id: string): (typeof PROFILE_LINK_PRESETS)[number] | undefined {
  return PROFILE_LINK_PRESETS.find((p) => p.id === id)
}

/** Map stored label → preset when loading legacy or edited data. */
export function matchPresetFromLabel(
  label: string
): (typeof PROFILE_LINK_PRESETS)[number] | undefined {
  const t = label.trim()
  if (!t) return undefined
  const lower = t.toLowerCase()
  for (const p of PROFILE_LINK_PRESETS) {
    if (p.id === 'other') continue
    if (p.label.toLowerCase() === lower) return p
  }
  if (lower.includes('linkedin')) return presetById('linkedin')
  if (lower.includes('github')) return presetById('github')
  if (lower.includes('twitter') || lower === 'x') return presetById('twitter')
  if (lower.includes('stackoverflow')) return presetById('stackoverflow')
  if (lower.includes('medium')) return presetById('medium')
  if (lower.includes('website') || lower.includes('portfolio')) return presetById('website')
  return undefined
}

export function profileLinksFromSlots(slots: LinkSlot[]): ProfileLink[] {
  const out: ProfileLink[] = []
  for (const slot of slots) {
    if (slot.presetId === PROFILE_LINK_NONE || !slot.url.trim()) continue
    if (slot.presetId === 'other') {
      const label = slot.customLabel.trim() || 'Link'
      out.push({ label, url: slot.url.trim() })
      continue
    }
    const preset = presetById(slot.presetId)
    if (!preset) continue
    out.push({ label: preset.label, url: slot.url.trim() })
  }
  return out
}

export function slotsFromProfileLinks(links: ProfileLink[]): LinkSlot[] {
  return links.map((link) => {
    const preset = matchPresetFromLabel(link.label)
    return {
      id: newId(),
      presetId: preset?.id ?? 'other',
      customLabel: preset ? '' : link.label,
      url: link.url
    }
  })
}
