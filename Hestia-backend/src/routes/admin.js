import { Router } from 'express'
import { pool } from '../db.js'
import { hashPassword, verifyPassword } from '../crypto.js'

export const adminRouter = Router()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SESSION_TIMEOUT_OPTIONS = [5, 10, 15, 30, 60]
const PROFILE_FIELDS = ['name', 'email', 'phone', 'document', 'address', 'language', 'theme', 'sessionTimeout', 'avatar']
const FIELD_TO_COLUMN = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  document: 'document',
  address: 'address',
  language: 'language',
  theme: 'theme',
  sessionTimeout: 'session_timeout',
  avatar: 'avatar',
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function sanitize(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: 'admin',
    authorized: true,
    phone: row.phone ?? '',
    document: row.document ?? '',
    address: row.address ?? '',
    language: row.language ?? 'es',
    theme: row.theme ?? 'oscuro',
    sessionTimeout: row.session_timeout ?? 15,
    avatar: row.avatar ?? '',
    createdAt: row.created_at,
  }
}

async function findAdminByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1 LIMIT 1', [email])
  return rows[0] ?? null
}

async function findAdminById(id) {
  const { rows } = await pool.query('SELECT * FROM admins WHERE id = $1 LIMIT 1', [id])
  return rows[0] ?? null
}

adminRouter.post('/admin/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email)
    const password = String(req.body?.password ?? '')
    if (!email || !password) {
      res.status(400).json({ error: 'Ingresa correo y contraseña.' })
      return
    }

    const admin = await findAdminByEmail(email)
    if (!admin || !(await verifyPassword(password, admin.password_hash))) {
      res.status(401).json({ error: 'Las credenciales de administrador no son correctas.' })
      return
    }

    res.json(sanitize(admin))
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/admin/profile/:id', async (req, res, next) => {
  try {
    const admin = await findAdminById(req.params.id)
    if (!admin) {
      res.status(404).json({ error: 'No se encontró la cuenta del administrador.' })
      return
    }
    res.json(sanitize(admin))
  } catch (error) {
    next(error)
  }
})

adminRouter.put('/admin/profile/:id', async (req, res, next) => {
  try {
    const admin = await findAdminById(req.params.id)
    if (!admin) {
      res.status(404).json({ error: 'No se encontró la cuenta del administrador.' })
      return
    }

    const patch = req.body ?? {}
    const changes = {}
    for (const field of PROFILE_FIELDS) {
      if (patch[field] === undefined) continue
      changes[field] = typeof patch[field] === 'string' ? patch[field].trim() : patch[field]
    }

    if (changes.sessionTimeout !== undefined) {
      const minutes = Number(changes.sessionTimeout)
      if (!SESSION_TIMEOUT_OPTIONS.includes(minutes)) {
        res.status(400).json({ error: 'Selecciona un tiempo de inactividad válido.' })
        return
      }
      changes.sessionTimeout = minutes
    }

    if (changes.name !== undefined) {
      if (!changes.name || changes.name.length < 2 || changes.name.length > 80) {
        res.status(400).json({ error: 'El nombre debe tener entre 2 y 80 caracteres.' })
        return
      }
    }

    if (changes.email !== undefined) {
      changes.email = normalizeEmail(changes.email)
      if (!EMAIL_PATTERN.test(changes.email)) {
        res.status(400).json({ error: 'Ingresa un correo electrónico válido.' })
        return
      }
      const taken = await findAdminByEmail(changes.email)
      if (taken && taken.id !== admin.id) {
        res.status(409).json({ error: 'Ya existe otra cuenta con ese correo electrónico.' })
        return
      }
    }

    const keys = Object.keys(changes)
    if (keys.length > 0) {
      const setClause = keys.map((field, index) => `${FIELD_TO_COLUMN[field]} = $${index + 2}`).join(', ')
      await pool.query(
        `UPDATE admins SET ${setClause}, updated_at = now() WHERE id = $1`,
        [admin.id, ...keys.map((field) => changes[field])],
      )
    }

    res.json(sanitize(await findAdminById(admin.id)))
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/admin/change-password/:id', async (req, res, next) => {
  try {
    const admin = await findAdminById(req.params.id)
    if (!admin) {
      res.status(404).json({ error: 'No se encontró la cuenta del administrador.' })
      return
    }

    const { currentPassword, newPassword } = req.body ?? {}
    if (!currentPassword || !(await verifyPassword(currentPassword, admin.password_hash))) {
      res.status(401).json({ error: 'La contraseña actual no es correcta.' })
      return
    }
    if (!newPassword || currentPassword === newPassword) {
      res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la actual.' })
      return
    }

    const passwordHash = await hashPassword(newPassword)
    await pool.query('UPDATE admins SET password_hash = $1, updated_at = now() WHERE id = $2', [
      passwordHash,
      admin.id,
    ])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})
