import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type EmberThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'ember-theme-mode'

type EmberThemeContextType = {
  theme: EmberThemeMode
  toggleTheme: () => void
}

const EmberThemeContext = createContext<EmberThemeContextType | undefined>(undefined)

function readStoredTheme(): EmberThemeMode | null {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' || stored === 'light' ? stored : null
}

/**
 * Theme scope for staff/operational screens (login, kitchen, counter, ready-orders),
 * which — unlike the customer-held menu flow — support both Ember modes. Defaults to
 * dark (this design system's native look), remembers the user's choice per browser.
 */
export function EmberThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<EmberThemeMode>(() => readStoredTheme() ?? 'dark')

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <EmberThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </EmberThemeContext.Provider>
  )
}

export function useEmberTheme() {
  const ctx = useContext(EmberThemeContext)
  if (!ctx) throw new Error('useEmberTheme must be used inside EmberThemeProvider')
  return ctx
}
