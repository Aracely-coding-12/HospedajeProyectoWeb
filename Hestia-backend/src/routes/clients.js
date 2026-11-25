import { Router } from 'express'
import { pool } from '../db.js'
import { hashPassword, verifyPassword } from '../crypto.js'

export const clientsRouter = Router()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN_LENGTH = 12

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function isStrongPassword(value) {
  const text = String(value ?? '')
  return (
    text.length >= PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(text) &&
    /[a-z]/.test(text) &&
    /\d/.test(text) &&
    /[^A-Za-z0-9]/.test(text)
  )
}

function sanitize(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    email: row.email,
    phone: row.phone ?? '',
    documentType: row.document_type ?? 'DNI',
    document: row.document ?? '',
    role: row.role ?? 'client',
    authorized: row.authorized !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM clients WHERE email = $1 LIMIT 1', [email])
  return rows[0] ?? null
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM clients WHERE id = $1 LIMIT 1', [id])
  return rows[0] ?? null
}

async function isAdminEmail(email) {
  const { rows } = await pool.query('SELECT id FROM admins WHERE email = $1 LIMIT 1', [email])
  return rows.length > 0
}

clientsRouter.post('/clients/register', async (req, res, next) => {
  try {
    const body = req.body ?? {}
    const email = normalizeEmail(body.email)
    const firstName = String(body.firstName ?? '').trim()
    const lastName = String(body.lastName ?? '').trim()
    const name = body.name ? String(body.name).trim() : `${firstName} ${lastName}`.trim()

    if (!EMAIL_PATTERN.test(email)) {
      res.status(400).json({ error: 'Ingresa un correo electrónico válido.' })
      return
    }
    if (!isStrongPassword(body.password)) {
      res.status(400).json({ error: 'La contraseña no cumple los requisitos de seguridad.' })
      return
    }
    if (await isAdminEmail(email)) {
      res
        .status(409)
        .json({ error: 'Ese correo electrónico no está disponible para una cuenta de cliente.' })
      return
    }
    if (await findByEmail(email)) {
      res.status(409).json({ error: 'Ya existe una cuenta de cliente con este correo electrónico.' })
      return
    }

    const id = body.id || `client-${crypto.randomUUID()}`
    const passwordHash = await hashPassword(body.password)

    const { rows } = await pool.query(
      `INSERT INTO clients
         (id, name, first_name, last_name, document_type, document, email, phone, active, source, role, authorized, password_hash, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, true, 'web', 'client', true, $9, now())
       ON CONFLICT (id) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         password_hash = EXCLUDED.password_hash
       RETURNING *`,
      [
        id,
        name,
        firstName,
        lastName,
        body.documentType ?? 'DNI',
        String(body.document ?? '').trim(),
        email,
        String(body.phone ?? '').trim(),
        passwordHash,
      ],
    )

    res.status(201).json(sanitize(rows[0]))
  } catch (error) {
    next(error)
  }
})

clientsRouter.post('/clients/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email)
    const password = String(req.body?.password ?? '')
    if (!email || !password) {
      res.json(null)
      return
    }

    const account = await findByEmail(email)
    if (!account || !account.password_hash || !(await verifyPassword(password, account.password_hash))) {
      res.json(null)
      return
    }

    res.json(sanitize(account))
  } catch (error) {
    next(error)
  }
})

clientsRouter.patch('/clients/:id', async (req, res, next) => {
  try {
    const existing = await findById(req.params.id)
    if (!existing || !existing.password_hash) {
      res.status(404).json({ error: 'No se encontró la cuenta del cliente.' })
      return
    }

    const patch = req.body ?? {}
    const firstName = patch.firstName !== undefined ? String(patch.firstName).trim() : existing.first_name
    const lastName = patch.lastName !== undefined ? String(patch.lastName).trim() : existing.last_name
    const name = patch.name !== undefined ? String(patch.name).trim() : `${firstName} ${lastName}`.trim()

    let email = existing.email
    if (patch.email !== undefined) {
      email = normalizeEmail(patch.email)
      if (!EMAIL_PATTERN.test(email)) {
        res.status(400).json({ error: 'Ingresa un correo electrónico válido.' })
        return
      }
      const taken = await findByEmail(email)
      if (taken && taken.id !== existing.id) {
        res.status(409).json({ error: 'Ya existe una cuenta de cliente con este correo electrónico.' })
        return
      }
    }

    const phone = patch.phone !== undefined ? String(patch.phone).trim() : existing.phone
    const documentType = patch.documentType !== undefined ? patch.documentType : existing.document_type
    const document = patch.document !== undefined ? String(patch.document).trim() : existing.document

    const { rows } = await pool.query(
      `UPDATE clients SET
         name = $1, first_name = $2, last_name = $3, email = $4, phone = $5,
         document_type = $6, document = $7, updated_at = now()
       WHERE id = $8
       RETURNING *`,
      [name, firstName, lastName, email, phone, documentType, document, existing.id],
    )

    res.json(sanitize(rows[0]))
  } catch (error) {
    next(error)
  }
})

clientsRouter.post('/clients/:id/change-password', async (req, res, next) => {
  try {
    const existing = await findById(req.params.id)
    if (!existing || !existing.password_hash) {
      res.status(404).json({ error: 'No se encontró la cuenta del cliente.' })
      return
    }

    const { currentPassword, newPassword } = req.body ?? {}
    if (!currentPassword || !(await verifyPassword(currentPassword, existing.password_hash))) {
      res.status(401).json({ error: 'La contraseña actual no es correcta.' })
      return
    }
    if (!isStrongPassword(newPassword)) {
      res.status(400).json({ error: 'La nueva contraseña no cumple los requisitos de seguridad.' })
      return
    }
    if (currentPassword === newPassword) {
      res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la actual.' })
      return
    }

    const passwordHash = await hashPassword(newPassword)
    await pool.query('UPDATE clients SET password_hash = $1, updated_at = now() WHERE id = $2', [
      passwordHash,
      existing.id,
    ])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})
