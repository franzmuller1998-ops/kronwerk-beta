import ColorFlow from '@/components/ColorFlow'
import ReleaseGrid from '@/components/ReleaseGrid'
export default function Releases() {
  return (
    <main className="relative min-h-screen px-6 pb-24 pt-32 md:px-10">
      <ColorFlow palette="releases" intensity={0.45} speed={0.2} className="fixed inset-0 -z-10" />
      <h1 className="font-display mb-10 w-fit text-[9vw] font-light tracking-tight md:text-[5vw]">RELEASES</h1>
      <ReleaseGrid />
    </main>
  )
}
