import type { ReactNode } from 'react'

type Props = {
  label: string
  control: ReactNode
  divider?: boolean
}

/** Label-left / control-right row used in the customise / options block. Ember design system. */
export default function OptionRow({ label, control, divider = false }: Props) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 'var(--sp-4)', minHeight: 'var(--tap-min)',
        borderTop: divider ? '1px solid var(--border-hairline)' : 'none',
        paddingTop: divider ? 'var(--sp-3)' : 0,
      }}
    >
      <span style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>{label}</span>
      {control}
    </div>
  )
}
