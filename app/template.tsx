'use client'
import { motion } from 'framer-motion'

// Each route resolves from blur. On link navigation this happens under the leaving
// COLOR FLOW band (components/PageTransition.tsx); on first load and back/forward it runs on its own.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    // filter has to end as `none`: any filter value makes this wrapper the containing block for the
    // pages' `fixed inset-0` backgrounds, so they scroll away and stretch to the full page height.
    <motion.div initial={{opacity:0, filter:'blur(14px)', y:8}} animate={{opacity:1, filter:'blur(0px)', y:0, transitionEnd:{filter:'none'}}} transition={{duration:.7,ease:[.22,1,.36,1]}}>
      {children}
    </motion.div>
  )
}
