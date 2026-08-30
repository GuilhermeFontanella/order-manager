type Option = { value: string; label: string }

type Props = {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
}

/** Row of pill options — any number selected, ember-filled. Ember design system. */
export default function MultiSelectControl({ options, value, onChange }: Props) {
  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
  }

  return (
    <div role="group" style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const on = value.includes(opt.value)
        return (
          <button
            key={opt.value} type="button" role="checkbox" aria-checked={on}
            onClick={() => toggle(opt.value)}
            style={{
              height: 34, padding: '0 var(--sp-4)', border: 0, borderRadius: 'var(--r-pill)',
              cursor: 'pointer', font: 'var(--text-label)',
              background: on ? 'var(--accent)' : 'var(--surface-control)',
              color: on ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              boxShadow: on ? 'none' : 'var(--ring-inner)',
              transition: 'background var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard)',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
