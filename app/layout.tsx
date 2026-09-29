import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import Navigation from '@/components/Navigation'
import PageTransition from '@/components/PageTransition'
import './globals.css'

export const metadata: Metadata = { title: 'KRONWERK music', description: 'Independent electronic music label.' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior: Next jumps to the top of the new route instantly instead of smooth-scrolling under the transition.
    <html lang="en" className={GeistSans.variable} data-scroll-behavior="smooth">
      <body><Navigation />{children}<PageTransition /></body>
    </html>
  )
}
