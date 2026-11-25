import { Router } from 'express'
import { pool } from '../db.js'

export const serviceRequestsRouter = Router()

serviceRequestsRouter.get('/service-requests', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, client_id AS "clientId", client_name AS "clientName", service_id AS "serviceId",
              service_name AS "serviceName", category, price, quantity, total, notes, status,
              created_at AS "createdAt"
       FROM service_requests ORDER BY created_at DESC LIMIT 100`,
    )
    res.json(rows)
  } catch (error) {
    next(error)
  }
})

serviceRequestsRouter.put('/service-requests', async (req, res, next) => {
  const requests = Array.isArray(req.body) ? req.body : null
  if (!requests) {
    res.status(400).json({ error: 'Se esperaba un array de solicitudes.' })
    return
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM service_requests')
    for (const item of requests) {
      await client.query(
        `INSERT INTO service_requests
           (id, client_id, client_name, service_id, service_name, category, price, quantity, total, notes, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          item.id,
          item.clientId ?? null,
          item.clientName ?? null,
          item.serviceId ?? null,
          item.serviceName ?? null,
          item.category ?? null,
          item.price ?? null,
          item.quantity ?? null,
          item.total ?? null,
          item.notes ?? null,
          item.status ?? 'pendiente',
          item.createdAt ?? new Date().toISOString(),
        ],
      )
    }
    await client.query('COMMIT')
    res.json({ ok: true })
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
})
