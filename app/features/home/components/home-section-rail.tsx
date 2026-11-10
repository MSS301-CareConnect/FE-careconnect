import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

const sections = [
  { id: 'home-hero', key: 'hero' },
  { id: 'how-it-works', key: 'process' },
  { id: 'home-reasons', key: 'reasons' },
  { id: 'home-trust', key: 'trust' }
] as const

const spring = { type: 'spring' as const, stiffness: 380, damping: 30 }
/** Pixels scrolled before the rail appears. */
const SHOW_AFTER = 80

/**
 * Section rail in place of the page scrollbar on large screens (UI redesign 2026-11-09): the landing sections sit as a
 * floating stack of cards at the middle of the right edge, shown all along the page; the one in view pops out in forest, and while the page scrolls
 * the stack drifts a little with the scroll speed and springs back to the middle, so it moves with the page. Hovering
 * or focusing fans the stack out with every name (collapsed it is only numbers, so it never covers the content), and a
 * click scrolls to that section. While mounted it hides the native scrollbar from `lg` up (`html.cc-rail-page` in
 * app.css); wheel, keys and touch still scroll. At the very top of the page it stays hidden (the hero is the whole
 * story there) and slides in from the right once the visitor starts scrolling down.
 */
export function HomeSectionRail() {
  const { t } = useTranslation()
  const { scrollY } = useScroll()
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  // Hidden at the top of the page; appears once the page has scrolled a little.
  const [shown, setShown] = useState(() => typeof window !== 'undefined' && window.scrollY > SHOW_AFTER)
  // Drift with the scroll speed (down → lags upward), clamped to ±18 px, then spring back to the middle.
  const drift = useSpring(useTransform(useVelocity(scrollY), [-3000, 0, 3000], [18, 0, -18]), {
    stiffness: 260,
    damping: 18,
    mass: 0.5
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('cc-rail-page')
    return () => root.classList.remove('cc-rail-page')
  }, [])

  useMotionValueEvent(scrollY, 'change', (y) => {
    setShown(y > SHOW_AFTER)
    const line = window.innerHeight * 0.4
    let current = 0
    sections.forEach((section, index) => {
      const top = document.getElementById(section.id)?.getBoundingClientRect().top
      if (top !== undefined && top <= line) current = index
    })
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections.length - 1
    setActive(current)
  })

  function go(index: number) {
    setActive(index)
    document.getElementById(sections[index].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Portalled to <body>: the layout's page transition wrapper would otherwise become the fixed element's containing
  // block and pin the rail to the page instead of the viewport.
  if (typeof document === 'undefined') return null
  return createPortal(
    <motion.nav
      animate={shown ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: 32, filter: 'blur(4px)' }}
      aria-hidden={shown ? undefined : true}
      aria-label={t('home.rail.label')}
      className={`fixed top-1/2 right-4 z-30 hidden -translate-y-1/2 lg:block ${shown ? '' : 'pointer-events-none'}`}
      inert={!shown}
      initial={false}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
      onFocus={() => setOpen(true)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.ol className='flex flex-col items-end' style={{ y: drift }}>
        {sections.map((section, index) => {
          const isActive = index === active
          const showLabel = open
          return (
            <motion.li
              animate={{ marginTop: index === 0 ? 0 : open ? 8 : isActive || index === active + 1 ? 6 : -14 }}
              className='relative'
              key={section.id}
              style={{ zIndex: isActive ? 20 : 10 - Math.abs(index - active) }}
              transition={spring}
            >
              <motion.button
                animate={{ scale: isActive ? 1 : open ? 0.96 : 0.88, x: isActive ? -6 : 0 }}
                aria-current={isActive ? 'true' : undefined}
                className={`flex h-10 items-center rounded-2xl border px-1.5 ${open ? 'gap-2 pr-3' : ''} text-left text-xs font-semibold whitespace-nowrap shadow-[var(--shadow-soft)] backdrop-blur-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 ${isActive ? 'border-forest-900 bg-forest-900 text-white' : 'border-white/80 bg-white/80 text-forest-800 hover:bg-white'}`}
                layout
                onClick={() => go(index)}
                transition={spring}
                type='button'
                whileTap={{ scale: 0.94 }}
              >
                <span
                  aria-hidden='true'
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-[11px] font-bold ${isActive ? 'bg-mint-300 text-forest-950' : 'bg-mint-100 text-forest-700'}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <motion.span
                  animate={{ opacity: showLabel ? 1 : 0, width: showLabel ? 'auto' : 0 }}
                  className='overflow-hidden'
                  initial={false}
                  transition={{ duration: 0.25 }}
                >
                  {t(`home.rail.${section.key}`)}
                </motion.span>
              </motion.button>
            </motion.li>
          )
        })}
      </motion.ol>
    </motion.nav>,
    document.body
  )
}
