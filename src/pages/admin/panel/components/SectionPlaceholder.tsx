import type { LucideIcon } from 'lucide-react'

export default function SectionPlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="ap-placeholder">
      <div className="ap-placeholder-icon">
        <Icon size={22} />
      </div>
      <div className="ap-placeholder-title">{title}</div>
      <div className="ap-placeholder-desc">{description}</div>
    </div>
  )
}
