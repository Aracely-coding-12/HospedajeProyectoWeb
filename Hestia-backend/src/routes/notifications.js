import { Router } from 'express'
import { pool } from '../db.js'

export const notificationsRouter = Router()

notificationsRouter.get('/notifications', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, type, title, message, target, read, created_at AS "createdAt" FROM notifications ORDER BY created_at DESC LIMIT 60',
    )
    res.json(rows)
  } catch (error) {
    next(error)
  }
})

notificationsRouter.put('/notifications', async (req, res, next) => {
  const notifications = Array.isArray(req.body) ? req.body : null
  if (!notifications) {
    res.status(400).json({ error: 'Se esperaba un array de notificaciones.' })
    return
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM notifications')
    for (const item of notifications) {
      await client.query(
        `INSERT INTO notifications (id, type, title, message, target, read, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          item.id,
          item.type ?? null,
          item.title,
          item.message,
          item.target ?? null,
          Boolean(item.read),
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
