export const ADMINS_KEY = 'hestia_admins_v1'
const DEFAULT_ADMIN_KEY = 'hestia_default_admin_v1'
const PASSWORD_MIN_LENGTH = 12
const PASSWORD_HASH_PREFIX = 'pbkdf2-sha256'
const PASSWORD_HASH_ITERATIONS = 210000
const PASSWORD_SALT_BYTES = 16

export const SESSION_TIMEOUT_OPTIONS = [5, 10, 15, 30, 60]
export const DEFAULT_SESSION_TIMEOUT_MINUTES = 15

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
  sessionTimeout: DEFAULT_SESSION_TIMEOUT_MINUTES,
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
  sessionTimeout: DEFAULT_SESSION_TIMEOUT_MINUTES,
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
  'sessionTimeout',
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

export function isAdminEmail(value) {
  const email = normalizeEmail(value)
  if (!email) return false

  const defaultAccount = defaultProfile(readDefaultOverride())
  if (email === defaultAccount.email) return true

  return readStore(ADMINS_KEY).some(
    (admin) => admin.role === 'admin' && admin.email === email,
  )
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  }
  return bytes
}

function timingSafeEqualHex(left, right) {
  if (left.length !== right.length) return false

  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return mismatch === 0
}

async function legacyHashPassword(password) {
  const bytes = new TextEncoder().encode(`hestia:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return bytesToHex(new Uint8Array(digest))
}

async function derivePasswordHash(password, salt, iterations) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    key,
    256,
  )
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_BYTES))
  const derived = new Uint8Array(
    await derivePasswordHash(password, salt, PASSWORD_HASH_ITERATIONS),
  )

  return `${PASSWORD_HASH_PREFIX}$${PASSWORD_HASH_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(derived)}`
}

export async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string' || storedHash.length === 0) return false

  if (storedHash.startsWith(`${PASSWORD_HASH_PREFIX}$`)) {
    const parts = storedHash.split('$')
    if (parts.length !== 4) return false

    const [, iterationsText, saltHex, expectedHex] = parts
    const iterations = Number(iterationsText)

    if (!Number.isInteger(iterations) || iterations <= 0) return false
    if (!/^[0-9a-f]+$/i.test(saltHex) || saltHex.length % 2 !== 0) return false
    if (!/^[0-9a-f]{64}$/i.test(expectedHex)) return false

    try {
      const derived = new Uint8Array(
        await derivePasswordHash(password, hexToBytes(saltHex), iterations),
      )
      return timingSafeEqualHex(bytesToHex(derived), expectedHex.toLowerCase())
    } catch {
      return false
    }
  }

  return timingSafeEqualHex(await legacyHashPassword(password), storedHash)
}

function isSecurePasswordHash(storedHash) {
  return (
    typeof storedHash === 'string' &&
    storedHash.startsWith(`${PASSWORD_HASH_PREFIX}$`)
  )
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
  if (!normalizedEmail || !password) return null

  const override = readDefaultOverride()
  const defaultAccount = defaultProfile(override)

  // El panel de administración es exclusivo de la cuenta principal de Hestia.
  if (normalizedEmail !== defaultAccount.email) return null

  const storedHash =
    override.passwordHash ?? (await legacyHashPassword(DEFAULT_ADMIN.password))

  if (!(await verifyPassword(password, storedHash))) return null

  if (!isSecurePasswordHash(storedHash)) {
    try {
      writeDefaultOverride({
        ...override,
        passwordHash: await hashPassword(password),
      })
    } catch {
      // La migración es opcional y no debe bloquear el acceso.
    }
  }

  return sanitizeAccount(defaultAccount)
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

export function updateAdminProfile(account, patch, reservedEmails = []) {
  if (!account) throw new Error('No se encontró la cuenta del administrador.')

  const changes = {}
  PROFILE_FIELDS.forEach((field) => {
    if (patch[field] === undefined) return
    changes[field] = typeof patch[field] === 'string' ? patch[field].trim() : patch[field]
  })

  if (changes.sessionTimeout !== undefined) {
    const minutes = Number(changes.sessionTimeout)
    if (!SESSION_TIMEOUT_OPTIONS.includes(minutes)) {
      throw new Error('Selecciona un tiempo de inactividad válido.')
    }
    changes.sessionTimeout = minutes
  }

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

    const usedByClient = reservedEmails.some(
      (value) => normalizeEmail(String(value ?? '')) === changes.email,
    )
    if (usedByClient) {
      throw new Error('Ese correo ya está vinculado a una cuenta de cliente.')
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

  if (currentPassword === newPassword) {
    throw new Error('La nueva contraseña debe ser diferente a la actual.')
  }

  if (account.id === DEFAULT_ADMIN.id) {
    const override = readDefaultOverride()
    const storedHash =
      override.passwordHash ?? (await legacyHashPassword(DEFAULT_ADMIN.password))
    if (!(await verifyPassword(currentPassword, storedHash))) {
      throw new Error('La contraseña actual no es correcta.')
    }

    writeDefaultOverride({
      ...override,
      passwordHash: await hashPassword(newPassword),
    })
    return true
  }

  const admins = readStore(ADMINS_KEY)
  const index = admins.findIndex((admin) => admin.id === account.id)
  if (index === -1) throw new Error('No se encontró la cuenta del administrador.')
  if (!(await verifyPassword(currentPassword, admins[index].passwordHash))) {
    throw new Error('La contraseña actual no es correcta.')
  }

  admins[index] = {
    ...admins[index],
    passwordHash: await hashPassword(newPassword),
  }
  if (!writeStore(ADMINS_KEY, admins)) {
    throw new Error('No se pudo actualizar la contraseña.')
  }

  return true
}
