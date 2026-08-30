import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type Tone = 'spicy' | 'offer' | 'neutral' | 'accent'

const TONES: Record<Tone, CSSProperties> = {
  spicy: { background: 'var(--danger)', color: '#fff' },
  offer: { background: 'var(--accent-soft)', color: 'var(--accent-quiet)' },
  neutral: { background: 'var(--glass-2)', color: 'var(--text-secondary)' },
  accent: { background: 'var(--accent)', color: 'var(--text-on-accent)' },
}

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone
  icon?: LucideIcon
  children: ReactNode
}

/** Small pill label — "Picante", "Sem estoque". Ember design system. */
export default function Badge({ children, tone = 'neutral', icon: Icon, style, ...rest }: Props) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-1)',
        padding: '5px 10px', borderRadius: 'var(--r-pill)',
        font: 'var(--text-caption)', letterSpacing: 'var(--ls-caption)',
        whiteSpace: 'nowrap', ...TONES[tone], ...style,
      }}
      {...rest}
    >
      {Icon && <Icon size={12} strokeWidth={2.5} />}
      {children}
    </span>
  )
}
