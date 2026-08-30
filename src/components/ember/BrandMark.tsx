type Props = {
  name: string
  logoSrc?: string | null
  size?: 'sm' | 'md' | 'lg'
}

/** Tenant identity slot: the restaurant's logo if it has one, otherwise its name in type. Ember design system. */
export default function BrandMark({ name, logoSrc, size = 'md' }: Props) {
  const h = size === 'sm' ? 22 : size === 'lg' ? 40 : 28
  if (logoSrc) {
    return (
      <img
        src={logoSrc} alt={name}
        style={{ height: h, width: 'auto', display: 'block', objectFit: 'contain', borderRadius: 8 }}
      />
    )
  }
  return (
    <span
      style={{
        display: 'inline-block', color: 'var(--text-primary)',
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: Math.round(h * 0.78), lineHeight: 1, letterSpacing: '-0.03em', whiteSpace: 'nowrap',
      }}
    >
      {name}
    </span>
  )
}
