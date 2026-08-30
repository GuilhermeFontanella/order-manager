import { useState, type ChangeEventHandler } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'

type Props = {
  placeholder?: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onFilter?: () => void
  id?: string
}

/** Full-width frosted search input with a trailing filter affordance. Ember design system. */
export default function SearchField({ placeholder = 'Buscar no cardápio', value, onChange, onFilter, id }: Props) {
  const [focus, setFocus] = useState(false)
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
        height: 52, padding: '0 var(--sp-4)', borderRadius: 'var(--r-md)',
        background: 'var(--glass-1)',
        backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)',
        boxShadow: focus ? 'inset 0 0 0 1px var(--border-accent)' : 'var(--ring-inner)',
        transition: 'box-shadow var(--dur-base) var(--ease-standard)',
      }}
    >
      <Search size={20} color="var(--text-muted)" />
      <input
        id={id}
        value={value}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={placeholder}
        style={{
          flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent',
          color: 'var(--text-primary)', font: 'var(--text-body)',
        }}
      />
      {onFilter && (
        <button
          type="button" onClick={onFilter} aria-label="Filtros"
          style={{ display: 'inline-flex', border: 0, background: 'transparent', cursor: 'pointer', padding: 4 }}
        >
          <SlidersHorizontal size={20} color="var(--text-secondary)" />
        </button>
      )}
    </div>
  )
}
