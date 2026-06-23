/**
 * localStorage wrapper that never throws: read errors return null, write/remove
 * errors are swallowed so a blocked or full storage degrades to in-memory state
 * instead of crashing the app.
 */
export const safeStorage: Storage = {
  get length() {
    try {
      return window.localStorage.length
    } catch {
      return 0
    }
  },
  key(index: number) {
    try {
      return window.localStorage.key(index)
    } catch {
      return null
    }
  },
  getItem(key: string) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* ignore: degrade to in-memory */
    }
  },
  removeItem(key: string) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      window.localStorage.clear()
    } catch {
      /* ignore */
    }
  },
}
