// Mismo esquema de hash que src/lib/adminAuth.js en el frontend (PBKDF2-SHA256),
// portado tal cual para que un hash generado en un lado se pueda verificar en el otro.
const PASSWORD_HASH_PREFIX = 'pbkdf2-sha256'
const PASSWORD_HASH_ITERATIONS = 210000
const PASSWORD_SALT_BYTES = 16

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
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
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
