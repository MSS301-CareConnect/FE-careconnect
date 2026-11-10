/**
 * Class strings of the customer portal in "Soft Bento" (2026-11-09, docs/2026-11-09-UI_REDESIGN_PLAN.md phase 3).
 * Mirrors the landing's buttons (features/home cannot be imported from here) so every customer page shares them.
 */
const pill =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,transform,box-shadow] duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50'

/** Peach call to action — the one warm accent per screen; dark text keeps AA contrast. */
export const peachPill = `${pill} min-h-11 px-5 text-sm bg-peach-300 text-forest-950 shadow-[0_10px_24px_-12px_rgb(246_146_95/0.8)] hover:bg-peach-200 focus-visible:outline-peach-400`

/** Small peach action inside a card. */
export const peachPillSm = `${pill} min-h-10 px-4 text-sm bg-peach-300 text-forest-950 shadow-[0_8px_18px_-10px_rgb(246_146_95/0.8)] hover:bg-peach-200 focus-visible:outline-peach-400`

/** Dark forest action on a light surface. */
export const forestPill = `${pill} min-h-11 px-5 text-sm bg-forest-900 text-white shadow-[var(--shadow-soft)] hover:bg-forest-800 focus-visible:outline-forest-900`

/** Quiet white action on a light surface. */
export const whitePill = `${pill} min-h-11 px-5 text-sm border border-forest-900/10 bg-white text-forest-900 hover:bg-mint-50 focus-visible:outline-forest-900`

/** Secondary action on a dark forest surface. */
export const glassPill = `${pill} min-h-11 px-5 text-sm border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 focus-visible:outline-white`

/** A white bento card. */
export const bentoCard = 'rounded-3xl border border-forest-900/[0.06] bg-white shadow-[var(--shadow-card)]'

/** A deep forest bento block with its own soft glows (add `relative isolate overflow-hidden`). */
export const forestBlock = 'rounded-3xl bg-forest-900 text-white shadow-[var(--shadow-float)]'

/** Small pill over an image or a light card. */
export const softChip =
  'inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-semibold text-forest-800 ring-1 ring-mint-200/60'
