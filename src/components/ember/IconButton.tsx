import { useState, type CSSProperties, type ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

type Variant = 'glass' | 'solid' | 'accent' | 'favorite'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon
  size?: number
  variant?: Variant
  active?: boolean
  label: string
}

/** Circular glyph button — nav chrome, favourite hearts, stepper +/-. Ember design system. */
export default function IconButton({ icon: Icon, size = 44, variant = 'glass', active = false, label, style, ...rest }: Props) {
  const [down, setDown] = useState(false)

  const skins: Record<Variant, CSSProperties> = {
    glass: { background: 'var(--glass-2)', color: 'var(--text-primary)', boxShadow: 'var(--ring-inner)' },
    solid: { background: 'var(--surface-control)', color: 'var(--text-primary)', boxShadow: 'none' },
    accent: { background: 'var(--gradient-cta)', color: 'var(--text-on-accent)', boxShadow: 'var(--shadow-cta)' },
    favorite: {
      background: 'var(--glass-2)',
      color: active ? 'var(--danger)' : 'var(--text-primary)',
      boxShadow: 'var(--ring-inner)',
    },
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={variant === 'favorite' ? active : undefined}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flex: '0 0 auto',
        border: 0,
        borderRadius: 'var(--r-pill)',
        cursor: 'pointer',
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        transform: down ? 'scale(var(--press-scale))' : 'scale(1)',
        transition: 'transform var(--dur-fast) var(--ease-standard), color var(--dur-base) var(--ease-standard)',
        ...skins[variant],
        ...style,
      }}
      {...rest}
    >
      <Icon
        size={Math.round(size * 0.45)}
        strokeWidth={2}
        fill={variant === 'favorite' && active ? 'var(--danger)' : 'none'}
      />
    </button>
  )
}
