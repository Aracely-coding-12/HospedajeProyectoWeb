import {
  isAdminEmail,
  isStrongPassword,
  isValidEmail,
  normalizeEmail,
  readStore,
  writeStore,
} from './adminAuth.js'
import { apiRequest } from './apiClient.js'

export const CLIENTS_KEY = 'hestia_clients_v1'
export const CLIENT_SESSION_KEY = 'hestia_client_session_v1'

function sanitizeClient(account) {
  const profile = { ...account }
  delete profile.passwordHash
  return profile
}

function readClientAccounts() {
  return readStore(CLIENTS_KEY).filter((account) => account.role === 'client')
}

function ensureClientEmailAvailable(email, accountId = null) {
  if (isAdminEmail(email)) {
    throw new Error('Ese correo electrónico no está disponible para una cuenta de cliente.')
  }

  const normalized = normalizeEmail(email)
  const taken = readClientAccounts().some(
    (account) => account.id !== accountId && account.email === normalized,
  )
  if (taken) throw new Error('Ya existe una cuenta de cliente con este correo electrónico.')
}

export async function registerClientAccount(input) {
  const email = normalizeEmail(input.email)
  if (!isValidEmail(email)) throw new Error('Ingresa un correo electrónico válido.')
  if (!isStrongPassword(input.password)) {
    throw new Error('La contraseña no cumple los requisitos de seguridad.')
  }
  ensureClientEmailAvailable(email)

  const account = await apiRequest('/api/clients/register', {
    method: 'POST',
    body: {
      id: input.id,
      name: String(input.name ?? '').trim(),
      firstName: String(input.firstName ?? '').trim(),
      lastName: String(input.lastName ?? '').trim(),
      email,
      phone: String(input.phone ?? '').trim(),
      documentType: input.documentType ?? 'DNI',
      document: String(input.document ?? '').trim(),
      password: input.password,
    },
  })

  writeStore(CLIENTS_KEY, [...readStore(CLIENTS_KEY).filter((item) => item.id !== account.id), account])

  return sanitizeClient(account)
}

export async function authenticateClient(email, password) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail || !password) return null

  const account = await apiRequest('/api/clients/login', {
    method: 'POST',
    body: { email: normalizedEmail, password },
  })
  if (!account) return null

  writeStore(CLIENTS_KEY, [...readStore(CLIENTS_KEY).filter((item) => item.id !== account.id), account])

  return sanitizeClient(account)
}

export async function updateClientAccount(accountId, patch) {
  const changes = { ...patch }
  if (changes.email !== undefined) {
    const email = normalizeEmail(changes.email)
    if (!isValidEmail(email)) throw new Error('Ingresa un correo electrónico válido.')
    ensureClientEmailAvailable(email, accountId)
    changes.email = email
  }

  const updated = await apiRequest(`/api/clients/${accountId}`, {
    method: 'PATCH',
    body: changes,
  })

  writeStore(CLIENTS_KEY, [
    ...readStore(CLIENTS_KEY).filter((item) => item.id !== updated.id),
    updated,
  ])

  return sanitizeClient(updated)
}

export async function changeClientPassword(accountId, currentPassword, newPassword) {
  if (!currentPassword) throw new Error('Ingresa tu contraseña actual.')
  if (!isStrongPassword(newPassword)) {
    throw new Error('La nueva contraseña no cumple los requisitos de seguridad.')
  }
  if (currentPassword === newPassword) {
    throw new Error('La nueva contraseña debe ser diferente a la actual.')
  }

  await apiRequest(`/api/clients/${accountId}/change-password`, {
    method: 'POST',
    body: { currentPassword, newPassword },
  })

  return true
}

export function saveClientSession(session) {
  try {
    sessionStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(session))
  } catch {
    // La sesión sigue activa en memoria aunque el navegador bloquee el storage.
  }
}

export function loadClientSession() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CLIENT_SESSION_KEY) ?? 'null')
    if (!parsed || parsed.role !== 'client' || !parsed.id) return null
    return parsed
  } catch {
    return null
  }
}

export function clearClientSession() {
  try {
    sessionStorage.removeItem(CLIENT_SESSION_KEY)
  } catch {
    // No hay nada que limpiar si el storage está bloqueado.
  }
}
