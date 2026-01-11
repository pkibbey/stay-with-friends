// REST API utility for Stay With Friends
// Usage: import { apiGet, apiPost, apiPut, apiDelete } from './api'

interface ExtendedSession {
  user?: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  token?: string
}

// Allow overriding the API base via NEXT_PUBLIC_API_BASE (useful in dev and prod)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'

function joinPath(path: string) {
  if (!path) return API_BASE
  if (path.startsWith('/')) return `${API_BASE}${path}`
  return `${API_BASE}/${path}`
}

async function getAuthHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  // For client-side requests, the session is managed by better-auth automatically
  // The cookies are sent with the request automatically
  // If you need custom authorization headers, add them here

  return headers
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(joinPath(path), { headers })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(joinPath(path), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(joinPath(path), {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPatch(path: string, body: unknown): Promise<Response> {
  const headers = await getAuthHeaders()
  return fetch(joinPath(path), {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
}

export async function apiDelete<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(joinPath(path), { method: 'DELETE', headers })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
