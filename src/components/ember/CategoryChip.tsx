type Props = {
  label: string
  selected?: boolean
  onClick?: () => void
}

/** Pill category filter. Adapted from the design system's CategoryChip (icon tile)
 *  to a label-only pill since our real categories have no per-category artwork. */
export default function CategoryChip({ label, selected = false, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        flex: '0 0 auto', cursor: 'pointer', whiteSpace: 'nowrap',
        height: 40, padding: '0 var(--sp-4)', border: 0, borderRadius: 'var(--r-pill)',
        font: 'var(--text-label)',
        background: selected ? 'var(--accent)' : 'var(--glass-1)',
        color: selected ? 'var(--text-on-accent)' : 'var(--text-secondary)',
        boxShadow: selected ? 'none' : 'var(--ring-inner)',
        backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)',
        transition: 'background var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard)',
      }}
    >
      {label}
    </button>
  )
}
