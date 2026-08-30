import { useState, type CSSProperties, type ButtonHTMLAttributes, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  iconLeft?: LucideIcon
  trailing?: ReactNode
}

const SIZES: Record<Size, { h: number; px: number; font: string }> = {
  sm: { h: 36, px: 16, font: 'var(--fs-label)' },
  md: { h: 44, px: 22, font: 'var(--fs-title)' },
  lg: { h: 56, px: 26, font: 'var(--fs-title)' },
}

/** Primary action. Pill-shaped, ember gradient, warm glow. Ember design system. */
export default function Button({
  children, variant = 'primary', size = 'md', fullWidth = false, disabled = false,
  iconLeft: IconLeft, trailing, style, ...rest
}: Props) {
  const s = SIZES[size]
  const [hot, setHot] = useState(false)
  const [down, setDown] = useState(false)

  const skins: Record<Variant, CSSProperties> = {
    primary: {
      background: hot ? 'var(--accent-hover)' : 'var(--gradient-cta)',
      color: 'var(--text-on-accent)',
      boxShadow: down ? 'none' : 'var(--shadow-cta)',
    },
    secondary: {
      background: 'var(--surface-control)',
      color: 'var(--text-primary)',
      boxShadow: 'var(--ring-inner)',
    },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', boxShadow: 'none' },
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => { setHot(false); setDown(false) }}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)',
        height: s.h, padding: `0 ${s.px}px`, width: fullWidth ? '100%' : 'auto',
        border: 0, borderRadius: 'var(--r-button)', cursor: disabled ? 'not-allowed' : 'pointer',
        font: 'var(--text-title)', fontSize: s.font, fontWeight: 700, letterSpacing: '-0.01em',
        opacity: disabled ? 0.4 : 1,
        transform: down && !disabled ? 'scale(var(--press-scale))' : 'scale(1)',
        transition: 'transform var(--dur-fast) var(--ease-standard), background var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
        ...skins[variant], ...style,
      }}
      {...rest}
    >
      {IconLeft && <IconLeft size={18} strokeWidth={2.25} />}
      <span>{children}</span>
      {trailing && <span style={{ marginLeft: 'var(--sp-3)', fontWeight: 700 }}>{trailing}</span>}
    </button>
  )
}
