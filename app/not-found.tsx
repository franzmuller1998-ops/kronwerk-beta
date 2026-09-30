import Link from 'next/link'
import ColorFlow from '@/components/ColorFlow'

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-start justify-end gap-8 px-6 pb-16 pt-32 md:px-10">
      <ColorFlow palette="hero" intensity={0.6} speed={0.2} className="fixed inset-0 -z-10" />
      <h1 className="font-display w-fit text-[22vw] font-light leading-none tracking-tight md:text-[12vw]">404</h1>
      <p className="max-w-sm text-sm text-white/60">Такой страницы нет. Возможно, её переместили или ссылка устарела.</p>
      <Link href="/" className="ul text-xs tracking-[.2em]">НА ГЛАВНУЮ</Link>
    </main>
  )
}
