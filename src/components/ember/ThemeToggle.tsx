import { Moon, Sun } from 'lucide-react'
import { useEmberTheme } from '../../context/EmberThemeContext'
import IconButton from './IconButton'

/** Dark/light switch for staff-facing Ember screens. */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useEmberTheme()
  return (
    <IconButton
      icon={theme === 'dark' ? Sun : Moon}
      label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      variant="glass"
      onClick={toggleTheme}
    />
  )
}
