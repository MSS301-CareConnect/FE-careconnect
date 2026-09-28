import { useState } from 'react'

export type Rating = 1 | 2 | 3 | 4 | 5
export type Highlight = 'punctual' | 'expertise' | 'communication' | 'gentle' | 'reports'
export interface ReviewDraft {
  rating: Rating
  highlights: Highlight[]
  comment: string
  tip: number
  isPublic: boolean
  isAnonymous: boolean
}

export function useBookingReviewDraft() {
  const [draft, setDraft] = useState<ReviewDraft>({
    rating: 5,
    highlights: [],
    comment: '',
    tip: 0,
    isPublic: true,
    isAnonymous: false
  })

  function updateDraft(patch: Partial<ReviewDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  function toggleHighlight(highlight: Highlight) {
    setDraft((current) => ({
      ...current,
      highlights: current.highlights.includes(highlight)
        ? current.highlights.filter((item) => item !== highlight)
        : [...current.highlights, highlight]
    }))
  }

  return { draft, updateDraft, toggleHighlight }
}
