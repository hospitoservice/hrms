/**
 * ThemeService
 *
 * Controls light/dark mode by toggling the `dark` class on <html>, which
 * Tailwind's `darkMode: "class"` config (index.html) uses to activate every
 * `dark:` utility class already present across the screens.
 *
 * Persists the user's choice in localStorage; falls back to the OS-level
 * `prefers-color-scheme` when no choice has been made yet.
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

const ThemeService = {
  /** Returns the active theme: the stored choice, or the OS preference if none is stored. */
  getTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  /** Applies the given theme to the document without persisting it. */
  applyTheme(theme: Theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

  /** Persists and applies the given theme. */
  setTheme(theme: Theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    ThemeService.applyTheme(theme);
  },

  /** Applies the current theme — call once at app startup. */
  init() {
    ThemeService.applyTheme(ThemeService.getTheme());
  },
};

export default ThemeService;
