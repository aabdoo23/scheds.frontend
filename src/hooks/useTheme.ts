import { useEffect, useState } from 'react';

const THEME_KEY = 'theme';

export function useTheme() {
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(THEME_KEY) === 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isLight) {
      root.classList.add('light-mode');
      localStorage.setItem(THEME_KEY, 'light');
    } else {
      root.classList.remove('light-mode');
      localStorage.setItem(THEME_KEY, 'dark');
    }
  }, [isLight]);

  const toggle = () => setIsLight((prev) => !prev);

  return { isLight, toggle };
}
