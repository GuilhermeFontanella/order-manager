import { Box, Tooltip, Typography } from '@mui/material'

export type BarChartItem = {
  label: string
  value: number
  title?: string
}

export default function BarChart({
  bars,
  variant = 'gold',
  height = 180,
  gap = 8,
}: {
  bars: BarChartItem[]
  variant?: 'gold' | 'green'
  height?: number
  gap?: number
}) {
  const max = Math.max(...bars.map(b => b.value), 1)
  const barColor = variant === 'green' ? 'primary.main' : 'secondary.main'
  const barRadius = variant === 'green' ? '4px 4px 0 0' : '6px 6px 0 0'

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: `${gap}px`, height, minWidth: 0 }}>
      {bars.map((bar, idx) => (
        <Tooltip key={idx} title={bar.title ?? ''} arrow disableHoverListener={!bar.title}>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <Box
              sx={{
                width: '100%',
                borderRadius: barRadius,
                bgcolor: barColor,
                height: `${Math.max(4, Math.round((bar.value / max) * 100))}%`,
                transition: 'height 0.2s ease',
              }}
            />
            <Typography
              variant="caption"
              noWrap
              sx={{ color: 'text.secondary', fontSize: '10.5px', maxWidth: '100%' }}
            >
              {bar.label}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  )
}
