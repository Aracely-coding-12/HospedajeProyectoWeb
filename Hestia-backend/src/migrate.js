import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'
import { hashPassword } from './crypto.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DEFAULT_ADMIN = {
  id: 'hestia-default-admin',
  name: 'Administrador Hestia',
  email: 'admin@hestia.com',
  password: 'Admin123!2026',
  phone: '+51 984 123 456',
  document: 'DNI 45678912',
  address: 'Cusco, Perú',
  language: 'es',
  theme: 'oscuro',
  sessionTimeout: 15,
}

async function run() {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('Esquema aplicado (tablas creadas si no existían).')

  const { rows } = await pool.query('SELECT id FROM admins LIMIT 1')
  if (rows.length === 0) {
    const passwordHash = await hashPassword(DEFAULT_ADMIN.password)
    await pool.query(
      `INSERT INTO admins (id, name, email, password_hash, phone, document, address, language, theme, session_timeout)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        DEFAULT_ADMIN.id,
        DEFAULT_ADMIN.name,
        DEFAULT_ADMIN.email,
        passwordHash,
        DEFAULT_ADMIN.phone,
        DEFAULT_ADMIN.document,
        DEFAULT_ADMIN.address,
        DEFAULT_ADMIN.language,
        DEFAULT_ADMIN.theme,
        DEFAULT_ADMIN.sessionTimeout,
      ],
    )
    console.log(`Admin por defecto creado (${DEFAULT_ADMIN.email} / ${DEFAULT_ADMIN.password}).`)
  } else {
    console.log('Ya existe al menos un admin, no se crea el admin por defecto.')
  }

  await pool.end()
}

run().catch((error) => {
  console.error('Error aplicando la migración:', error)
  process.exit(1)
})
