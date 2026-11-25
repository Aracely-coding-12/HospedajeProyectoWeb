import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { adminRouter } from './routes/admin.js'
import { clientsRouter } from './routes/clients.js'
import { dataRouter } from './routes/data.js'
import { notificationsRouter } from './routes/notifications.js'
import { serviceRequestsRouter } from './routes/serviceRequests.js'

export const app = express()

app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api', dataRouter)
app.use('/api', notificationsRouter)
app.use('/api', serviceRequestsRouter)
app.use('/api', adminRouter)
app.use('/api', clientsRouter)

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(error.statusCode ?? 500).json({ error: error.message ?? 'Error interno del servidor.' })
})
