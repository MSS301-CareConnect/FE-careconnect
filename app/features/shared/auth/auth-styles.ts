/** Class strings shared by the sign-in, registration and password reset forms ("Soft Bento", 2026-11-09). */
export const authLabel = 'block text-[13px] font-semibold text-forest-900'

/** Input with room for a leading icon (`AuthInputIcon`); clean white bg, subtle shadow, crisp mint focus. */
export const authInput =
  'h-11 sm:h-12 w-full rounded-xl border border-forest-900/15 bg-white pr-4 pl-11 text-[14px] sm:text-[15px] font-medium text-forest-950 outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-forest-800/35 hover:border-forest-900/30 focus-visible:border-mint-500 focus-visible:ring-4 focus-visible:ring-mint-200/50 shadow-[0_1px_2px_rgba(12,43,37,0.03)] aria-[invalid=true]:border-error'

export const authIcon =
  'pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[19px] text-forest-800/40 transition-colors group-focus-within:text-mint-600'

/** Peach call to action, warm energetic glow, dark text for AA contrast (plan §2.4). */
export const authSubmit =
  'inline-flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-xl bg-peach-300 text-[15px] font-bold text-forest-950 shadow-[0_10px_22px_-10px_rgb(246_146_95/0.8)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-peach-200 hover:shadow-[0_14px_26px_-10px_rgb(246_146_95/0.9)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100'

export const authLink =
  'font-semibold text-forest-700 underline-offset-4 transition-colors hover:text-forest-950 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-55'

export const authTitle =
  'text-[clamp(1.65rem,2.4vw,2.15rem)] leading-[1.15] font-extrabold tracking-tight text-forest-950'

export const authDescription = 'mt-1.5 text-sm sm:text-[15px] leading-6 text-forest-800/70'

export const authError =
  'flex items-start gap-2.5 rounded-xl border border-error/20 bg-error-container/70 p-3 text-sm font-medium text-on-error-container'

export const authNotice =
  'flex items-start gap-2.5 rounded-xl bg-mint-50 p-3 text-sm text-forest-800 ring-1 ring-mint-200'
