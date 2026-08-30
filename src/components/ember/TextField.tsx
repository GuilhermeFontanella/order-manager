import { useState, type ChangeEventHandler, type InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label?: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

/** Frosted text input with an optional label, matching SearchField's glass surface. Ember design system. */
export default function TextField({ label, value, onChange, id, style, ...rest }: Props) {
  const [focus, setFocus] = useState(false)
  return (
    <div style={{ textAlign: 'left' }}>
      {label && (
        <label htmlFor={id} style={{ display: 'block', marginBottom: 'var(--sp-2)', font: 'var(--text-caption)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caption)' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        value={value}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%', height: 52, padding: '0 var(--sp-4)', border: 0, outline: 'none',
          borderRadius: 'var(--r-md)', background: 'var(--glass-1)', color: 'var(--text-primary)',
          font: 'var(--text-body)',
          boxShadow: focus ? 'inset 0 0 0 1px var(--border-accent)' : 'var(--ring-inner)',
          backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)',
          transition: 'box-shadow var(--dur-base) var(--ease-standard)',
          ...style,
        }}
        {...rest}
      />
    </div>
  )
}
