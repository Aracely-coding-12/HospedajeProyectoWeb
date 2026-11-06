import {
  hashPassword,
  isAdminEmail,
  isStrongPassword,
  isValidEmail,
  normalizeEmail,
  readStore,
  verifyPassword,
  writeStore,
} from './adminAuth.js'

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

  const account = {
    id: input.id,
    name: String(input.name ?? '').trim(),
    firstName: String(input.firstName ?? '').trim(),
    lastName: String(input.lastName ?? '').trim(),
    email,
    phone: String(input.phone ?? '').trim(),
    documentType: input.documentType ?? 'DNI',
    document: String(input.document ?? '').trim(),
    role: 'client',
    authorized: true,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  }

  if (!writeStore(CLIENTS_KEY, [...readStore(CLIENTS_KEY), account])) {
    throw new Error('No se pudo guardar la cuenta del cliente.')
  }

  return sanitizeClient(account)
}

export async function authenticateClient(email, password) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail || !password) return null

  const account = readClientAccounts().find(
    (item) => item.email === normalizedEmail,
  )
  if (!account) return null
  if (!(await verifyPassword(password, account.passwordHash))) return null

  return sanitizeClient(account)
}

export function updateClientAccount(accountId, patch) {
  const accounts = readStore(CLIENTS_KEY)
  const index = accounts.findIndex(
    (account) => account.id === accountId && account.role === 'client',
  )
  if (index === -1) throw new Error('No se encontró la cuenta del cliente.')

  const changes = { ...patch }
  if (changes.email !== undefined) {
    const email = normalizeEmail(changes.email)
    if (!isValidEmail(email)) throw new Error('Ingresa un correo electrónico válido.')
    ensureClientEmailAvailable(email, accountId)
    changes.email = email
  }

  const updated = {
    ...accounts[index],
    ...changes,
    updatedAt: new Date().toISOString(),
  }
  accounts[index] = updated

  if (!writeStore(CLIENTS_KEY, accounts)) {
    throw new Error('No se pudieron guardar los datos de la cuenta.')
  }

  return sanitizeClient(updated)
}

export async function changeClientPassword(accountId, currentPassword, newPassword) {
  const accounts = readStore(CLIENTS_KEY)
  const index = accounts.findIndex(
    (account) => account.id === accountId && account.role === 'client',
  )
  if (index === -1) throw new Error('No se encontró la cuenta del cliente.')

  if (!currentPassword) throw new Error('Ingresa tu contraseña actual.')
  if (!isStrongPassword(newPassword)) {
    throw new Error('La nueva contraseña no cumple los requisitos de seguridad.')
  }
  if (currentPassword === newPassword) {
    throw new Error('La nueva contraseña debe ser diferente a la actual.')
  }
  if (!(await verifyPassword(currentPassword, accounts[index].passwordHash))) {
    throw new Error('La contraseña actual no es correcta.')
  }

  accounts[index] = {
    ...accounts[index],
    passwordHash: await hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
  }

  if (!writeStore(CLIENTS_KEY, accounts)) {
    throw new Error('No se pudo actualizar la contraseña.')
  }

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
