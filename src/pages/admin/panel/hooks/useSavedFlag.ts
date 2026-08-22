import { useRef, useState } from 'react'

export function useSavedFlag() {
  const [saved, setSaved] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function trigger() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setSaved(true)
    timeoutRef.current = setTimeout(() => setSaved(false), 2500)
  }

  return { saved, trigger }
}
