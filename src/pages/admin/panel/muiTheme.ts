import { createTheme } from '@mui/material/styles'

// Tema do MUI escopado ao painel administrativo — espelha a paleta já definida em
// admin-panel.css (--ap-*) para que componentes MUI (gráficos, e futuramente outros)
// não destoem visualmente do resto do painel, que é Tailwind/CSS puro.
export const adminMuiTheme = createTheme({
  palette: {
    primary: { main: '#2F5D46', dark: '#1E3D2E', light: '#E7EFE9' },
    secondary: { main: '#C79A56', dark: '#8C6A32', light: '#F4E9D4' },
    text: { primary: '#201E1A', secondary: '#79735F' },
    background: { default: '#F3EEE2', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
})
