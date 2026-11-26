import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

// pg devuelve `numeric` como string para no perder precisión; el frontend
// espera number (hace `room.price * nights`, `.toFixed()`, etc.), así que
// parseamos numeric -> float en todo el pool (OID 1700 = numeric).
pg.types.setTypeParser(1700, (value) => (value === null ? null : parseFloat(value)))
// `date` (sin hora) lo deja como string "YYYY-MM-DD" en vez de Date: el
// frontend compara checkIn/checkOut/startDate/endDate como texto plano
// (toDateKey/parseDateKey), no como objetos Date con hora.
pg.types.setTypeParser(1082, (value) => value)

if (!process.env.DB_URL) {
  throw new Error('Falta DB_URL en el archivo .env del backend.')
}

export const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
})
