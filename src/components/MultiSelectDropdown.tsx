import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export type MultiSelectOption = { value: string; label: string }

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: MultiSelectOption[]
  selected: Set<string>
  onChange: (next: Set<string>) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggle(value: string) {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onChange(next)
  }

  const selectedLabels = options.filter(option => selected.has(option.value)).map(option => option.label)
  const summary =
    selectedLabels.length === 0 ? placeholder : selectedLabels.length <= 2 ? selectedLabels.join(', ') : `${selectedLabels.length} selecionadas`

  return (
    <div className="ap-multiselect" ref={containerRef}>
      <button
        type="button"
        className="ap-select ap-multiselect-trigger"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <span className={selectedLabels.length === 0 ? 'ap-multiselect-placeholder' : ''}>{summary}</span>
        <ChevronDown size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="ap-multiselect-panel"
          >
            {options.map(option => (
              <label key={option.value} className={`ap-multiselect-option ${selected.has(option.value) ? 'is-selected' : ''}`}>
                <input type="checkbox" checked={selected.has(option.value)} onChange={() => toggle(option.value)} />
                {option.label}
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
