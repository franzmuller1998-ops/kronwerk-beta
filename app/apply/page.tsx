import type { Metadata } from 'next'
import ColorFlow from '@/components/ColorFlow'
import ApplyForm from '@/components/ApplyForm'

export const metadata: Metadata = { title: 'Заявка · KRONWERK music', description: 'Заявка на сотрудничество с лейблом KRONWERK music.' }

export default function Apply() {
  return (
    <main className="relative min-h-screen px-6 pb-24 pt-32 md:px-10">
      <ColorFlow palette="contact" intensity={0.45} speed={0.2} className="fixed inset-0 -z-10" />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h1 className="font-display mb-6 w-fit text-[11vw] font-light leading-none tracking-tight md:text-[5vw]">ЗАЯВКА</h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/60">Хотите выступить на площадке KRONWERK?<br />Расскажите о себе и пришлите треки.</p>
        </div>
        <ApplyForm />
      </div>
    </main>
  )
}
