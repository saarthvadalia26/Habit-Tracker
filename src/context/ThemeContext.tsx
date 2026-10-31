'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const themeHex = t === 'dark' ? '#11100d' : '#f2ecdf';
  if (t === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }

  // Update theme-color meta tag so Android/iOS navigation bar & status bar match background
  try {
    let meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.querySelector('meta[name="theme-color"]');
    }
    if (meta) {
      meta.setAttribute('content', themeHex);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      newMeta.content = themeHex;
      document.head.appendChild(newMeta);
    }
  } catch {
    // Ignore in non-browser environments
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  

  useEffect(() => {
    const saved = localStorage.getItem('habit_tracker_theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme('dark');
    }
    
  }, []);

  
  const setTheme = (nextTheme: Theme) => {
    // Check for native browser View Transition API
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        setThemeState(nextTheme);
        localStorage.setItem('habit_tracker_theme', nextTheme);
        applyTheme(nextTheme);
      });
    } else {
      setThemeState(nextTheme);
      localStorage.setItem('habit_tracker_theme', nextTheme);
      applyTheme(nextTheme);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
