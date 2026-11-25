import { Router } from 'express'
import { pool } from '../db.js'
import { syncCollection } from '../syncCollection.js'

export const dataRouter = Router()

const ROOM_COLUMNS = [
  { key: 'id', sql: 'id' },
  { key: 'number', sql: 'number' },
  { key: 'floor', sql: 'floor' },
  { key: 'type', sql: 'type' },
  { key: 'capacity', sql: 'capacity' },
  { key: 'price', sql: 'price' },
  { key: 'status', sql: 'status' },
  { key: 'image', sql: 'image' },
  { key: 'description', sql: 'description' },
  { key: 'createdAt', sql: 'created_at' },
  { key: 'updatedAt', sql: 'updated_at' },
]

// Solo columnas "de negocio": nunca tocar password_hash/role/authorized/
// first_name/last_name aquí, esos los administran las rutas de auth de clientes.
const CLIENT_BUSINESS_COLUMNS = [
  { key: 'id', sql: 'id' },
  { key: 'name', sql: 'name' },
  { key: 'documentType', sql: 'document_type' },
  { key: 'document', sql: 'document' },
  { key: 'email', sql: 'email' },
  { key: 'phone', sql: 'phone' },
  { key: 'active', sql: 'active' },
  { key: 'source', sql: 'source' },
  { key: 'createdAt', sql: 'created_at' },
  { key: 'updatedAt', sql: 'updated_at' },
]

const RESERVATION_COLUMNS = [
  { key: 'id', sql: 'id' },
  { key: 'code', sql: 'code' },
  { key: 'roomId', sql: 'room_id' },
  { key: 'clientId', sql: 'client_id' },
  { key: 'guestName', sql: 'guest_name' },
  { key: 'checkIn', sql: 'check_in' },
  { key: 'checkOut', sql: 'check_out' },
  { key: 'status', sql: 'status' },
  { key: 'nights', sql: 'nights' },
  { key: 'total', sql: 'total' },
  { key: 'guests', sql: 'guests' },
  { key: 'promotionCode', sql: 'promotion_code' },
  // Ruta personalizada del huésped en Cusco: { version, days: [{ day, poiIds }] }.
  { key: 'tripPlan', sql: 'trip_plan' },
  { key: 'createdAt', sql: 'created_at' },
  { key: 'updatedAt', sql: 'updated_at' },
]

const PAYMENT_COLUMNS = [
  { key: 'id', sql: 'id' },
  { key: 'code', sql: 'code' },
  { key: 'reservationId', sql: 'reservation_id' },
  { key: 'amount', sql: 'amount' },
  { key: 'method', sql: 'method' },
  { key: 'status', sql: 'status' },
  { key: 'paidAt', sql: 'paid_at' },
]

const SERVICE_COLUMNS = [
  { key: 'id', sql: 'id' },
  { key: 'name', sql: 'name' },
  { key: 'category', sql: 'category' },
  { key: 'price', sql: 'price' },
  { key: 'description', sql: 'description' },
  { key: 'status', sql: 'status' },
]

const PROMOTION_COLUMNS = [
  { key: 'id', sql: 'id' },
  { key: 'code', sql: 'code' },
  { key: 'name', sql: 'name' },
  { key: 'description', sql: 'description' },
  { key: 'reservationNumber', sql: 'reservation_number' },
  { key: 'type', sql: 'type' },
  { key: 'category', sql: 'category' },
  { key: 'discount', sql: 'discount' },
  { key: 'startDate', sql: 'start_date' },
  { key: 'endDate', sql: 'end_date' },
  { key: 'status', sql: 'status' },
  { key: 'visibleOnWeb', sql: 'visible_on_web' },
  { key: 'image', sql: 'image' },
  { key: 'createdAt', sql: 'created_at' },
]

function row(record, mapping) {
  const result = {}
  for (const column of mapping) {
    result[column.key] = record[column.sql]
  }
  return result
}

async function fetchData() {
  const [rooms, clients, reservations, payments, services, promotions] = await Promise.all([
    pool.query('SELECT * FROM rooms ORDER BY number'),
    pool.query(
      'SELECT id, name, document_type, document, email, phone, active, source, created_at, updated_at FROM clients ORDER BY created_at',
    ),
    pool.query('SELECT * FROM reservations ORDER BY created_at'),
    pool.query('SELECT * FROM payments ORDER BY paid_at'),
    pool.query('SELECT * FROM services ORDER BY name'),
    pool.query('SELECT * FROM promotions ORDER BY created_at'),
  ])

  return {
    rooms: rooms.rows.map((item) => row(item, ROOM_COLUMNS)),
    clients: clients.rows.map((item) => row(item, CLIENT_BUSINESS_COLUMNS)),
    reservations: reservations.rows.map((item) => row(item, RESERVATION_COLUMNS)),
    payments: payments.rows.map((item) => row(item, PAYMENT_COLUMNS)),
    services: services.rows.map((item) => row(item, SERVICE_COLUMNS)),
    promotions: promotions.rows.map((item) => row(item, PROMOTION_COLUMNS)),
  }
}

dataRouter.get('/data', async (_req, res, next) => {
  try {
    res.json(await fetchData())
  } catch (error) {
    next(error)
  }
})

dataRouter.put('/data', async (req, res, next) => {
  const { rooms, clients, reservations, payments, services, promotions } = req.body ?? {}

  if (
    ![rooms, clients, reservations, payments, services, promotions].every(Array.isArray)
  ) {
    res.status(400).json({ error: 'Cuerpo inválido: se esperaban arrays para cada colección.' })
    return
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await syncCollection(client, { table: 'rooms', columns: ROOM_COLUMNS, rows: rooms })
    await syncCollection(client, {
      table: 'clients',
      columns: CLIENT_BUSINESS_COLUMNS,
      rows: clients,
      deleteMissing: false,
    })
    await syncCollection(client, { table: 'services', columns: SERVICE_COLUMNS, rows: services })
    await syncCollection(client, {
      table: 'promotions',
      columns: PROMOTION_COLUMNS,
      rows: promotions,
    })
    await syncCollection(client, {
      table: 'reservations',
      columns: RESERVATION_COLUMNS,
      rows: reservations,
    })
    await syncCollection(client, { table: 'payments', columns: PAYMENT_COLUMNS, rows: payments })
    await client.query('COMMIT')
    res.json(await fetchData())
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
})
