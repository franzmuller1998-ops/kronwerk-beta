'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import ColorFlow from './ColorFlow'
import CustomCursor from './CustomCursor'

// The application tab comes first and is highlighted (4th field): a pill in the header, always coloured in the menu.
const links = [['Заявка', '/apply', '#ff3cc8', true], ['О нас', '/about', '#ffffff', false], ['Контакты', '/contact', '#ff7a1a', false]] as const
const Logo = () => (
  <Link href="/" className="font-display block leading-[.95]"><b className="text-[15px] font-bold tracking-tight">KRONWERK</b><span className="block text-[15px] font-light tracking-wide">music</span></Link>
)

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  // Close on any route change (logo link, browser back/forward), not only on menu item clicks.
  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    // mouseleave never fires when the menu unmounts under the cursor, so reset the hover colour here.
    if (!open) { setHover(null); return }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    addEventListener('keydown', key)
    return () => { document.body.style.overflow = overflow; removeEventListener('keydown', key) }
  }, [open])

  return (
    <>
      <CustomCursor />
      <header className="fixed inset-x-0 top-0 z-40 flex items-start justify-between px-6 py-6 md:px-10">
        <Logo />
        <nav className="flex items-center gap-8 text-[13px]">
          {links.map(([l, h, , accent]) => accent
            ? <Link key={h} href={h} className="rounded-full border border-white/70 px-4 py-1.5 text-white transition-colors hover:border-white hover:bg-white hover:text-[#050608]">{l}</Link>
            : <Link key={h} href={h} className="ul hidden text-white/80 transition-opacity hover:text-white md:block">{l}</Link>)}
          <button aria-label="Меню" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(true)} className="group flex h-6 w-7 flex-col justify-center gap-[5px]">
            {[0, 1, 2].map((i) => <span key={i} className="h-px w-full origin-right bg-white transition-transform group-hover:scale-x-75" />)}
          </button>
        </nav>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div id="site-menu" role="dialog" aria-modal="true" aria-label="Меню" className="fixed inset-0 z-50 bg-[#050608]" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.76, 0, 0.24, 1] }}>
            <ColorFlow palette="hero" colors={hover ? [hover, hover, '#7a3cff', '#00d5ff'] : undefined} className="absolute inset-0 opacity-80" />
            <div className="relative flex h-full flex-col justify-between px-6 py-6 md:px-10">
              <div className="flex items-start justify-between"><Logo /><button onClick={() => setOpen(false)} className="text-[13px] tracking-widest">ЗАКРЫТЬ ✕</button></div>
              <ul className="space-y-[1vw]">
                {links.map(([l, h, c, accent], i) => (
                  <li key={h} onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)}>
                    <Link href={h} onClick={() => setOpen(false)} className="font-display group flex items-baseline gap-[3vw] text-[10vw] leading-[1.05] tracking-tight md:text-[7vw]" style={{ ['--c' as string]: c }}>
                      <span className="text-[.35em] font-light text-white/50">0{i + 1}</span><span data-cursor="lg" className={`transition-colors duration-500 group-hover:text-[var(--c)] ${accent ? 'text-[var(--c)]' : ''}`}>{l.toUpperCase()}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <a href="mailto:kronwerkmusic@gmail.com" className="ul self-start text-xs text-white/50">kronwerkmusic@gmail.com</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
