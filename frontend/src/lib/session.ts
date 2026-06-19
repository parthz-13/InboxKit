const STORAGE_KEY = 'gridwars_identity'
const HOME_FLAG_KEY = 'gridwars_show_home'

export function markHomePage(): void {
  localStorage.setItem(HOME_FLAG_KEY, '1')
}

export function clearHomePage(): void {
  localStorage.removeItem(HOME_FLAG_KEY)
}

export function shouldShowHome(): boolean {
  return localStorage.getItem(HOME_FLAG_KEY) === '1'
}

export interface StoredIdentity {
  session_id: string
  name: string
  color: string
}

function uuid4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getOrCreateSessionId(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return (JSON.parse(stored) as StoredIdentity).session_id
    } catch {
    }
  }
  const id = uuid4()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ session_id: id, name: '', color: '' }))
  return id
}

export function getStoredIdentity(): StoredIdentity | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredIdentity
    if (parsed.name && parsed.color) return parsed
    return null
  } catch {
    return null
  }
}

export function saveIdentity(name: string, color: string): StoredIdentity {
  const session_id = getOrCreateSessionId()
  const identity: StoredIdentity = { session_id, name, color }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
  return identity
}
