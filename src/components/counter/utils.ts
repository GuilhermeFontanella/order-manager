export function elapsedLabel(ts: number, now: number) {
  const mins = Math.floor((now - ts) / 60000)
  if (mins < 1) return 'agora mesmo'
  if (mins === 1) return 'há 1 min'
  return `há ${mins} min`
}

export function elapsedClass(ts: number, now: number) {
  const mins = (now - ts) / 60000
  if (mins < 5) return 'ok'
  if (mins < 10) return 'warn'
  return 'late'
}
