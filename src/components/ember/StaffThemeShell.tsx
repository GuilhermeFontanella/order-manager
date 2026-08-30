import type { ReactNode } from 'react'
import { EmberThemeProvider, useEmberTheme } from '../../context/EmberThemeContext'
import '../../styles/ember-theme.css'

function Scoped({ children }: { children: ReactNode }) {
  const { theme } = useEmberTheme()
  return (
    <div className="ember-theme" data-theme={theme} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  )
}

/**
 * Wraps a staff/operational screen (login, kitchen, counter, ready-orders) in the
 * Ember design system with both dark and light modes available. Drop a <ThemeToggle />
 * somewhere in the page's header to let staff switch; the choice persists across screens.
 */
export default function StaffThemeShell({ children }: { children: ReactNode }) {
  return (
    <EmberThemeProvider>
      <Scoped>{children}</Scoped>
    </EmberThemeProvider>
  )
}
