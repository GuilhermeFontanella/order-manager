import { createTheme } from '@mui/material/styles'
import type { EmberThemeMode } from '../../../context/EmberThemeContext'

// Tema do MUI escopado ao painel administrativo — espelha a paleta Ember (dark/light)
// já aplicada via CSS em admin-panel.css (--ap-*), para que componentes MUI (gráficos,
// tooltips) não destoem visualmente do resto do painel. MUI precisa de cores literais
// (não var(--x)) porque calcula estados internos (hover, disabled) a partir delas.
const PALETTES: Record<EmberThemeMode, { primary: string; primaryDark: string; primaryLight: string; secondary: string; secondaryDark: string; secondaryLight: string; textPrimary: string; textSecondary: string; bgDefault: string; bgPaper: string }> = {
  dark: {
    primary: '#F5811F',
    primaryDark: '#E06C0C',
    primaryLight: 'rgba(245, 129, 31, 0.16)',
    secondary: '#FFC53D',
    secondaryDark: '#B08A2E',
    secondaryLight: 'rgba(255, 197, 61, 0.18)',
    textPrimary: '#FFFFFF',
    textSecondary: '#C9BAB1',
    bgDefault: '#0E0907',
    bgPaper: '#1F1611',
  },
  light: {
    primary: '#F5811F',
    primaryDark: '#B05408',
    primaryLight: 'rgba(245, 129, 31, 0.14)',
    secondary: '#C79A56',
    secondaryDark: '#8C6A32',
    secondaryLight: 'rgba(199, 154, 86, 0.18)',
    textPrimary: '#0E0907',
    textSecondary: '#392A20',
    bgDefault: '#EDE4DE',
    bgPaper: '#FFFFFF',
  },
}

export function createAdminMuiTheme(mode: EmberThemeMode) {
  const p = PALETTES[mode]
  return createTheme({
    palette: {
      mode,
      primary: { main: p.primary, dark: p.primaryDark, light: p.primaryLight },
      secondary: { main: p.secondary, dark: p.secondaryDark, light: p.secondaryLight },
      text: { primary: p.textPrimary, secondary: p.textSecondary },
      background: { default: p.bgDefault, paper: p.bgPaper },
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    },
    shape: {
      borderRadius: 8,
    },
  })
}
