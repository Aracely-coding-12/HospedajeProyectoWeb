import { createInitialData } from '../data/hestiaData.js'

export const HESTIA_DATA_KEY = 'hestia_data_v1'
export const HESTIA_NOTIFICATIONS_KEY = 'hestia_notifications_v1'
export const HESTIA_SERVICE_REQUESTS_KEY = 'hestia_service_requests_v1'

const MAX_NOTIFICATIONS = 60
const DATA_COLLECTIONS = [
  'rooms',
  'clients',
  'reservations',
  'payments',
  'services',
  'promotions',
]

function hasDataShape(value) {
  return (
    value &&
    typeof value === 'object' &&
    DATA_COLLECTIONS.every((key) => Array.isArray(value[key]))
  )
}

export function loadHestiaData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HESTIA_DATA_KEY) ?? 'null')
    if (hasDataShape(parsed)) return parsed
  } catch {
    // Si el almacenamiento está corrupto, se regeneran los datos iniciales.
  }

  return createInitialData()
}

export function saveHestiaData(data) {
  if (!hasDataShape(data)) return
  try {
    const serialized = JSON.stringify(data)
    if (localStorage.getItem(HESTIA_DATA_KEY) === serialized) return
    localStorage.setItem(HESTIA_DATA_KEY, serialized)
  } catch {
    // La aplicación sigue funcionando en memoria si el navegador bloquea el storage.
  }
}

export function loadNotifications() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HESTIA_NOTIFICATIONS_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (notification) =>
        notification &&
        typeof notification === 'object' &&
        typeof notification.id === 'string' &&
        typeof notification.title === 'string' &&
        typeof notification.message === 'string',
    )
  } catch {
    return []
  }
}

export function saveNotifications(notifications) {
  try {
    const serialized = JSON.stringify(notifications)
    if (localStorage.getItem(HESTIA_NOTIFICATIONS_KEY) === serialized) return
    localStorage.setItem(HESTIA_NOTIFICATIONS_KEY, serialized)
  } catch {
    // Las notificaciones se conservan en memoria durante la sesión.
  }
}

export function createNotification({ type, title, message, target = null }) {
  return {
    id: crypto.randomUUID ? `notification-${crypto.randomUUID()}` : `notification-${Date.now()}`,
    type,
    title,
    message,
    target,
    read: false,
    createdAt: new Date().toISOString(),
  }
}

export function appendNotification(notifications, input) {
  return [createNotification(input), ...notifications].slice(0, MAX_NOTIFICATIONS)
}

export function formatNotificationTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function loadServiceRequests() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HESTIA_SERVICE_REQUESTS_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (request) =>
        request &&
        typeof request === 'object' &&
        typeof request.id === 'string' &&
        typeof request.clientId === 'string' &&
        typeof request.serviceName === 'string',
    )
  } catch {
    return []
  }
}

export function saveServiceRequests(requests) {
  try {
    const serialized = JSON.stringify(requests)
    if (localStorage.getItem(HESTIA_SERVICE_REQUESTS_KEY) === serialized) return
    localStorage.setItem(HESTIA_SERVICE_REQUESTS_KEY, serialized)
  } catch {
    // Las solicitudes se conservan en memoria durante la sesión.
  }
}

export function createServiceRequest(input) {
  return {
    id: crypto.randomUUID ? `request-${crypto.randomUUID()}` : `request-${Date.now()}`,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
    ...input,
  }
}

export function appendServiceRequest(requests, input) {
  return [createServiceRequest(input), ...requests].slice(0, 100)
}
