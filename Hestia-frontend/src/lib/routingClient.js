import { toCoord } from './tripRoute.js'

// Ruteo real por calles con OSRM (servidores públicos de FOSSGIS, gratis y sin
// clave). Para producción conviene un servidor propio u OpenRouteService con
// clave: el servidor público no garantiza disponibilidad.
const OSRM_PROFILES = {
  pie: 'https://routing.openstreetmap.de/routed-foot/route/v1/driving',
  auto: 'https://routing.openstreetmap.de/routed-car/route/v1/driving',
}

const CACHE_KEY = 'hestia_route_cache_v1'
const MAX_CACHE_ENTRIES = 200
const memoryCache = new Map()

function cacheId(leg) {
  const [a, b] = [toCoord(leg.from), toCoord(leg.to)].map((c) => c.map((n) => n.toFixed(5)).join(','))
  return `${leg.mode}:${a};${b}`
}

function readStoredCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

function writeStoredCache(id, coords) {
  try {
    const stored = readStoredCache()
    stored[id] = coords
    const ids = Object.keys(stored)
    for (const old of ids.slice(0, Math.max(ids.length - MAX_CACHE_ENTRIES, 0))) delete stored[old]
    localStorage.setItem(CACHE_KEY, JSON.stringify(stored))
  } catch {
    // Sin storage se queda solo la caché en memoria.
  }
}

// Línea recta densificada: sirve para el tren y como respaldo si el ruteo
// falla. Con varios puntos la animación avanza suave igual.
export function straightLine(from, to, steps = 24) {
  const [a, b] = [toCoord(from), toCoord(to)]
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
  })
}

async function fetchOsrm(leg, signal) {
  const base = OSRM_PROFILES[leg.mode]
  const coords = `${toCoord(leg.from).join(',')};${toCoord(leg.to).join(',')}`
  const response = await fetch(`${base}/${coords}?overview=full&geometries=geojson`, { signal })
  if (!response.ok) throw new Error(`OSRM respondió ${response.status}`)
  const payload = await response.json()
  const geometry = payload?.routes?.[0]?.geometry?.coordinates
  if (!Array.isArray(geometry) || geometry.length < 2) throw new Error('OSRM sin ruta')
  return geometry
}

// La vía férrea Cusco → Machu Picchu pasa por Poroy y Ollantaytambo. No hay
// ruteo público de trenes: se aproxima con esas estaciones como puntos de paso.
const TRAIN_WAYPOINTS = [
  { lng: -72.0449, lat: -13.4966 }, // Estación Poroy
  { lng: -72.265, lat: -13.2617 }, // Estación Ollantaytambo
]

export function trainLine(from, to) {
  const [a, b] = [toCoord(from), toCoord(to)]
  // Orden de las estaciones según el sentido del viaje (ida o vuelta).
  const goingOut = b[0] < a[0]
  const stations = goingOut ? TRAIN_WAYPOINTS : [...TRAIN_WAYPOINTS].reverse()
  const points = [from, ...stations, to]
  return points.slice(1).flatMap((point, index) => {
    const segment = straightLine(points[index], point, 12)
    return index === 0 ? segment : segment.slice(1)
  })
}

// Devuelve { coords, approximate } para un tramo. `approximate` = true cuando
// la línea no sigue calles reales (tren o ruteo caído).
export async function routeLeg(leg, { signal } = {}) {
  if (leg.mode === 'tren') return { coords: trainLine(leg.from, leg.to), approximate: true }

  const id = cacheId(leg)
  if (memoryCache.has(id)) return { coords: memoryCache.get(id), approximate: false }

  const stored = readStoredCache()[id]
  if (Array.isArray(stored)) {
    memoryCache.set(id, stored)
    return { coords: stored, approximate: false }
  }

  try {
    const coords = await fetchOsrm(leg, signal)
    memoryCache.set(id, coords)
    writeStoredCache(id, coords)
    return { coords, approximate: false }
  } catch (error) {
    if (error.name === 'AbortError') throw error
    return { coords: straightLine(leg.from, leg.to), approximate: true }
  }
}

// Rutea los tramos de a uno (el servidor público limita la tasa).
export async function routeLegs(legs, { signal } = {}) {
  const routed = []
  for (const leg of legs) {
    const result = await routeLeg(leg, { signal })
    routed.push({ ...leg, ...result })
  }
  return routed
}
