import { type MockDatabase, SEED_VERSION, seedDatabase } from './seed'

const STORAGE_KEY = `shalgam:mock-db:v${SEED_VERSION}`
/** Re-seed after this long so "today" on the dashboard never goes stale. */
const MAX_AGE_MS = 12 * 60 * 60 * 1000

let db: MockDatabase | null = null
let persistTimer: ReturnType<typeof setTimeout> | null = null

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

function load(): MockDatabase | null {
  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MockDatabase
    if (parsed.version !== SEED_VERSION) return null
    if (Date.now() - new Date(parsed.seededAt).getTime() > MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

/** The in-memory database. Seeded lazily; restored from localStorage in the browser when fresh. */
export function getDb(): MockDatabase {
  db ??= load() ?? seedDatabase()
  return db
}

/** Replaces the database with a fresh deterministic seed (tests, "reset demo data"). */
export function resetDb(options: { seed?: number; now?: number } = {}): MockDatabase {
  db = seedDatabase(options.seed, options.now)
  storage()?.removeItem(STORAGE_KEY)
  return db
}

/** Debounced write-through so mutations survive a page reload. No-op outside the browser. */
export function persist(): void {
  const store = storage()
  if (!store || !db) return
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(db))
    } catch {
      // Quota exceeded or private mode — the session still works in memory.
    }
  }, 250)
}
