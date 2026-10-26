// Safe local storage helper resilient to SSR and restricted environments

export function getStoredItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Return null if storage is blocked or in test environment
  }
  return null;
}

export function setStoredItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore write failures in test or private browsing
  }
}
