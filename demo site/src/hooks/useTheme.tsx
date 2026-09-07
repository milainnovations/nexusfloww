import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react'

type Theme = 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Unimode: Remove any leftover dark class and clear localStorage dark preference
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('theme')
  }, [])

  const value: ThemeContextValue = {
    theme: 'light',
    toggleTheme: () => {},
    setTheme: () => {},
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
