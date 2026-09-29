'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ColorFlow from '@/components/ColorFlow'

export default function Template({ children }: { children: React.ReactNode }) {
  // Unmount the overlay once it has faded out, otherwise its WebGL loop keeps running invisibly.
  const [overlay, setOverlay] = useState(true)
  return (
    <div className="relative">
      {overlay && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[80]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: .9, ease: [0.22,1,0.36,1] }}
          onAnimationComplete={() => setOverlay(false)}
        >
          <ColorFlow palette="hero" speed={0.18} intensity={1.15} className="absolute inset-0" />
        </motion.div>
      )}
      {/* filter has to end as `none`: any filter value makes this wrapper the containing block for the
          pages' `fixed inset-0` backgrounds, so they scroll away and stretch to the full page height. */}
      <motion.div initial={{opacity:0, filter:'blur(10px)', y:8}} animate={{opacity:1, filter:'blur(0px)', y:0, transitionEnd:{filter:'none'}}} transition={{duration:.8,ease:[.22,1,.36,1]}}>
        {children}
      </motion.div>
    </div>
  )
}
