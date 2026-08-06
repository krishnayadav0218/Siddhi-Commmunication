import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'siddhi_theme';

export const THEMES = [
  { key: 'dark', label: 'Vibrant', swatch: ['#8b5cf6', '#ff3d81', '#ffb020'] },
  { key: 'pulse', label: 'Pulse', swatch: ['#14b8a6', '#22d3ee', '#0d1b2a'] },
  { key: 'light', label: 'Light', swatch: ['#ffffff', '#8b5cf6', '#ffb020'] },
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES.some((t) => t.key === saved)) setThemeState(saved);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    // 'dark' is the unlabeled default in :root — only non-default themes
    // need the attribute, keeping the CSS simple (no duplicate dark block).
    if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  function setTheme(next) {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // ignore
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
