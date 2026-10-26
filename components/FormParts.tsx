// Field styles and small pieces shared by the application form (ApplyForm) and the event sign-up form (RegisterForm).
export const label = 'mb-2 block text-[11px] uppercase tracking-[.2em] text-white/50'
export const input = 'w-full border-b border-white/25 bg-transparent py-3 text-lg outline-none transition-colors placeholder:text-white/25 focus:border-white aria-[invalid=true]:border-[#ff8a8a]'
export const Err = ({ id, msg }: { id: string; msg?: string }) => (msg ? <p id={id} className="mt-2 text-xs text-[#ff9a9a]">{msg}</p> : null)
export const Choice = ({ name, value, checked, onChange, children, invalid, disabled }: { name: string; value: string; checked: boolean; onChange: () => void; children: React.ReactNode; invalid?: boolean; disabled?: boolean }) => (
  <label className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} aria-invalid={invalid || undefined} className="peer sr-only" />
    <span className="block rounded-full border border-white/25 px-4 py-2 text-sm transition-colors hover:border-white peer-checked:border-white peer-checked:bg-white peer-checked:text-[#050608] peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white peer-disabled:opacity-30 peer-disabled:hover:border-white/25">{children}</span>
  </label>
)
