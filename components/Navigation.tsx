'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ColorFlow from './ColorFlow'
import CustomCursor from './CustomCursor'

const links = [['Releases', '/releases', '#2f6bff'], ['Artists', '/artists', '#9b4dff'], ['About', '/about', '#ffffff'], ['Contact', '/contact', '#ff7a1a']] as const
const Logo = () => (
  <Link href="/" className="font-display block leading-[.95]"><b className="text-[15px] font-bold tracking-tight">KRONWERK</b><span className="block text-[15px] font-light tracking-wide">music</span></Link>
)

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const pathname = usePathname()

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
          {links.map(([l, h]) => (<Link key={h} href={h} className="ul hidden text-white/80 transition-opacity hover:text-white md:block">{l}</Link>))}
          <button aria-label="Menu" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(true)} className="group flex h-6 w-7 flex-col justify-center gap-[5px]">
            {[0, 1, 2].map((i) => <span key={i} className="h-px w-full origin-right bg-white transition-transform group-hover:scale-x-75" />)}
          </button>
        </nav>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div id="site-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 bg-[#050608]" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}>
            <ColorFlow palette="hero" colors={hover ? [hover, hover, '#7a3cff', '#00d5ff'] : undefined} interactive className="absolute inset-0 opacity-80" />
            <div className="relative flex h-full flex-col justify-between px-6 py-6 md:px-10">
              <div className="flex items-start justify-between"><Logo /><button onClick={() => setOpen(false)} className="text-[13px] tracking-widest">CLOSE ✕</button></div>
              <ul className="space-y-[1vw]">
                {links.map(([l, h, c], i) => (
                  <li key={h} onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)}>
                    <Link href={h} onClick={() => setOpen(false)} className="font-display group flex items-baseline gap-[3vw] text-[10vw] leading-[1.05] tracking-tight md:text-[7vw]" style={{ ['--c' as string]: c }}>
                      <span className="text-[.35em] font-light text-white/50">0{i + 1}</span><span className="transition-colors duration-500 group-hover:text-[var(--c)]">{l.toUpperCase()}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@kronwerk.music" className="ul self-start text-xs text-white/50">hello@kronwerk.music</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
