import IconButton from './IconButton'
import { Minus, Plus } from 'lucide-react'

type Props = {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  size?: number
}

/** Minus / count / plus. Ember design system. */
export default function QuantityStepper({ value, min = 1, max = 99, onChange, size = 38 }: Props) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)))
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
      <IconButton
        icon={Minus} size={size} variant="solid" label="Diminuir quantidade"
        onClick={() => set(value - 1)} style={{ opacity: value <= min ? 0.45 : 1 }}
      />
      <span style={{ minWidth: 18, textAlign: 'center', font: 'var(--text-title)', fontWeight: 700 }}>{value}</span>
      <IconButton icon={Plus} size={size} variant="solid" label="Aumentar quantidade" onClick={() => set(value + 1)} />
    </div>
  )
}
