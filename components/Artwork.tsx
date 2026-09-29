import ColorFlow from './ColorFlow'

export default function Artwork({ colors, className='' }: { colors:[string,string,string], className?:string }) {
  // No `relative` when the caller positions the artwork itself: it would override `absolute inset-0`
  // and collapse the artwork to zero height.
  const position = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className) ? '' : 'relative'
  return (
    <div className={`${position} overflow-hidden bg-[#050608] ${className}`}>
      <ColorFlow colors={[colors[0], colors[1], colors[2], '#050608']} intensity={1.15} speed={0.22} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,.35)_100%)]" />
    </div>
  )
}
