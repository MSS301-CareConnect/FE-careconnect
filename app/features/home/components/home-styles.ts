/** Shared class strings of the landing sections (UI redesign 2026-11-09). */
export const homeContainer = 'mx-auto w-full max-w-[1200px] px-4 sm:px-6'

const pill =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-[background-color,transform,box-shadow] duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2'

/** Peach call to action — the one warm accent of the page; dark text keeps AA contrast. */
export const peachAction = `${pill} bg-peach-300 text-forest-950 shadow-[0_10px_24px_-12px_rgb(246_146_95/0.8)] hover:bg-peach-200 focus-visible:outline-peach-200`

/** Secondary action on a dark forest surface. */
export const glassAction = `${pill} border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 focus-visible:outline-white`

/** Primary action on a light surface. */
export const forestAction = `${pill} bg-forest-900 text-white shadow-[var(--shadow-soft)] hover:bg-forest-800 focus-visible:outline-forest-900`

export const sectionEyebrow =
  'inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-forest-700 ring-1 ring-forest-900/5'

export const sectionTitle =
  'mt-3 text-[clamp(1.75rem,3vw,2.4rem)] leading-tight font-bold tracking-tight text-forest-950'
