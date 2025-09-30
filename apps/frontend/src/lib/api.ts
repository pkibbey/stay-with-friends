export async function apiPatch(path: string, body: unknown): Promise<Response> {
  const headers = await getAuthHeaders()
  return fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
}
// REST API utility for Stay With Friends
// Usage: import { apiGet, apiPost, apiPut, apiDelete } from './api'

import { getSession } from 'next-auth/react'

interface ExtendedSession {
  user?: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  apiToken?: string
}

const API_BASE = 'http://localhost:4000/api'

async function getAuthHeaders() {
  const session = await getSession() as ExtendedSession
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (session?.apiToken) headers['Authorization'] = `Bearer ${session.apiToken}`
  return headers
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiDelete<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
