export const ADMINS_KEY = 'hestia_admins_v1'
const DEFAULT_ADMIN_KEY = 'hestia_default_admin_v1'
const PASSWORD_MIN_LENGTH = 12

export const PASSWORD_HELP =
  '12 caracteres / letras mayúsculas, minúsculas, números y símbolos'

export const DEFAULT_ADMIN = {
  id: 'hestia-default-admin',
  name: 'Administrador Hestia',
  email: 'admin@hestia.com',
  password: 'Admin123!2026',
  role: 'admin',
  authorized: true,
  phone: '+51 984 123 456',
  document: 'DNI 45678912',
  address: 'Cusco, Perú',
  language: 'es',
  theme: 'oscuro',
  avatar: '',
  createdAt: Date.UTC(2026, 0, 15),
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'Mínimo 12 caracteres',
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  { id: 'uppercase', label: 'Al menos una mayúscula', test: (value) => /[A-Z]/.test(value) },
  { id: 'lowercase', label: 'Al menos una minúscula', test: (value) => /[a-z]/.test(value) },
  { id: 'number', label: 'Al menos un número', test: (value) => /\d/.test(value) },
  { id: 'special', label: 'Al menos un símbolo', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

const PROFILE_DEFAULTS = {
  phone: '',
  document: '',
  address: '',
  language: 'es',
  theme: 'oscuro',
  avatar: '',
  createdAt: null,
}

const PROFILE_FIELDS = [
  'name',
  'email',
  'phone',
  'document',
  'address',
  'avatar',
  'language',
  'theme',
]

export function readStore(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function readDefaultOverride() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DEFAULT_ADMIN_KEY) ?? 'null')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeDefaultOverride(value) {
  if (!writeStore(DEFAULT_ADMIN_KEY, value)) {
    throw new Error('No se pudo guardar la configuración de la cuenta.')
  }
}

function defaultProfile(override) {
  return { ...DEFAULT_ADMIN, ...(override.profile ?? {}) }
}

function sanitizeAccount(account) {
  const profile = { ...account }
  delete profile.password
  delete profile.passwordHash
  return profile
}

function isEmailTaken(email, accountId) {
  const defaultAccount = defaultProfile(readDefaultOverride())
  if (accountId !== DEFAULT_ADMIN.id && defaultAccount.email === email) return true

  return readStore(ADMINS_KEY).some(
    (admin) => admin.id !== accountId && admin.email === email,
  )
}

export async function hashPassword(password) {
  const bytes = new TextEncoder().encode(`hestia:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim())
}

export function isStrongPassword(value) {
  return PASSWORD_RULES.every((rule) => rule.test(value))
}

export function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

export function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `admin-${Date.now()}`
}

export async function authenticate(email, password) {
  const normalizedEmail = normalizeEmail(email)
  const passwordHash = await hashPassword(password)
  const override = readDefaultOverride()
  const defaultAccount = defaultProfile(override)
  const defaultPasswordHash =
    override.passwordHash ?? (await hashPassword(DEFAULT_ADMIN.password))

  if (normalizedEmail === defaultAccount.email && passwordHash === defaultPasswordHash) {
    return sanitizeAccount(defaultAccount)
  }

  const admin =
    readStore(ADMINS_KEY).find(
      (item) =>
        item.email === normalizedEmail &&
        item.passwordHash === passwordHash &&
        item.role === 'admin' &&
        item.authorized,
    ) ?? null

  return admin ? sanitizeAccount(admin) : null
}

export function getAdminProfile(account) {
  if (!account) return sanitizeAccount({ ...DEFAULT_ADMIN, ...PROFILE_DEFAULTS })

  const override = readDefaultOverride()
  if (account.id === DEFAULT_ADMIN.id) {
    return sanitizeAccount(defaultProfile(override))
  }

  const stored = readStore(ADMINS_KEY).find((admin) => admin.id === account.id) ?? account
  return { ...PROFILE_DEFAULTS, ...sanitizeAccount(stored) }
}

export function updateAdminProfile(account, patch) {
  if (!account) throw new Error('No se encontró la cuenta del administrador.')

  const changes = {}
  PROFILE_FIELDS.forEach((field) => {
    if (patch[field] === undefined) return
    changes[field] = typeof patch[field] === 'string' ? patch[field].trim() : patch[field]
  })

  if (changes.name !== undefined) {
    if (!changes.name) throw new Error('Ingresa tu nombre completo.')
    if (changes.name.length < 2) throw new Error('El nombre debe tener al menos 2 caracteres.')
    if (changes.name.length > 80) throw new Error('El nombre no puede superar los 80 caracteres.')
  }

  if (changes.email !== undefined) {
    changes.email = normalizeEmail(changes.email)
    if (!isValidEmail(changes.email)) {
      throw new Error('Ingresa un correo electrónico válido.')
    }
    if (isEmailTaken(changes.email, account.id)) {
      throw new Error('Ya existe otra cuenta con ese correo electrónico.')
    }
  }

  if (account.id === DEFAULT_ADMIN.id) {
    const override = readDefaultOverride()
    const nextOverride = {
      ...override,
      profile: { ...(override.profile ?? {}), ...changes },
    }
    writeDefaultOverride(nextOverride)
    return getAdminProfile(account)
  }

  const admins = readStore(ADMINS_KEY)
  const index = admins.findIndex((admin) => admin.id === account.id)
  if (index === -1) throw new Error('No se encontró la cuenta del administrador.')

  admins[index] = { ...admins[index], ...changes }
  if (!writeStore(ADMINS_KEY, admins)) {
    throw new Error('No se pudieron guardar los datos de la cuenta.')
  }

  return getAdminProfile(admins[index])
}

export async function changeAdminPassword(account, currentPassword, newPassword) {
  if (!account) throw new Error('No se encontró la cuenta del administrador.')
  if (!currentPassword) throw new Error('Ingresa tu contraseña actual.')
  if (!isStrongPassword(newPassword)) {
    throw new Error('La nueva contraseña no cumple los requisitos de seguridad.')
  }

  const currentHash = await hashPassword(currentPassword)
  const newHash = await hashPassword(newPassword)
  if (currentHash === newHash) {
    throw new Error('La nueva contraseña debe ser diferente a la actual.')
  }

  if (account.id === DEFAULT_ADMIN.id) {
    const override = readDefaultOverride()
    const storedHash = override.passwordHash ?? (await hashPassword(DEFAULT_ADMIN.password))
    if (currentHash !== storedHash) {
      throw new Error('La contraseña actual no es correcta.')
    }

    writeDefaultOverride({ ...override, passwordHash: newHash })
    return true
  }

  const admins = readStore(ADMINS_KEY)
  const index = admins.findIndex((admin) => admin.id === account.id)
  if (index === -1) throw new Error('No se encontró la cuenta del administrador.')
  if (admins[index].passwordHash !== currentHash) {
    throw new Error('La contraseña actual no es correcta.')
  }

  admins[index] = { ...admins[index], passwordHash: newHash }
  if (!writeStore(ADMINS_KEY, admins)) {
    throw new Error('No se pudo actualizar la contraseña.')
  }

  return true
}
