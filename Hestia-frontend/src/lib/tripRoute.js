// Geometría de la ruta del huésped: tramos entre paradas, modo de transporte
// por tramo y utilidades para animar un marcador a lo largo de la línea.
// Todo es puro (sin red ni DOM) para poder probarlo con vitest.

const EARTH_RADIUS_KM = 6371

// Paradas a las que solo se llega en tren (no hay carretera hasta Aguas Calientes).
const TRAIN_ONLY_CATEGORIES = new Set(['Machu Picchu'])

const WALK_MAX_KM = 2.5

function toRad(deg) {
  return (deg * Math.PI) / 180
}

function toDeg(rad) {
  return (rad * 180) / Math.PI
}

// Coordenadas en formato GeoJSON: [lng, lat].
export function distanceKm([lng1, lat1], [lng2, lat2]) {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

export function bearingDeg([lng1, lat1], [lng2, lat2]) {
  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1))
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export function toCoord(stop) {
  return [stop.lng, stop.lat]
}

// pie: tramos cortos dentro de la ciudad.
// auto: taxi o tour hacia sitios alejados (Valle Sagrado, ruinas de las afueras).
// tren: cualquier tramo que entra o sale de la zona de Machu Picchu.
export function legMode(from, to) {
  const fromTrain = TRAIN_ONLY_CATEGORIES.has(from.category)
  const toTrain = TRAIN_ONLY_CATEGORIES.has(to.category)
  if (fromTrain !== toTrain) return 'tren'
  if (distanceKm(toCoord(from), toCoord(to)) <= WALK_MAX_KM) return 'pie'
  return 'auto'
}

// Un día empieza en el hospedaje. Vuelve al hospedaje salvo que termine en la
// zona de Machu Picchu (lo habitual es dormir en Aguas Calientes o volver en
// el tren de la noche, que no tiene sentido animar).
export function buildDayStops(hotel, pois) {
  if (pois.length === 0) return []
  const last = pois[pois.length - 1]
  const endsAway = TRAIN_ONLY_CATEGORIES.has(last.category)
  return endsAway ? [hotel, ...pois] : [hotel, ...pois, hotel]
}

export function buildLegs(stops) {
  const legs = []
  for (let index = 0; index < stops.length - 1; index += 1) {
    const from = stops[index]
    const to = stops[index + 1]
    legs.push({ from, to, mode: legMode(from, to) })
  }
  return legs
}

export function lineLengthKm(coords) {
  let total = 0
  for (let index = 1; index < coords.length; index += 1) {
    total += distanceKm(coords[index - 1], coords[index])
  }
  return total
}

// Punto a `km` del inicio de la línea + el rumbo del segmento en que cae.
export function pointAlong(coords, km) {
  if (coords.length === 0) return null
  if (coords.length === 1 || km <= 0) {
    const next = coords[1] ?? coords[0]
    return { point: coords[0], bearing: bearingDeg(coords[0], next), traveled: [coords[0]] }
  }

  let walked = 0
  for (let index = 1; index < coords.length; index += 1) {
    const start = coords[index - 1]
    const end = coords[index]
    const segment = distanceKm(start, end)
    if (walked + segment >= km && segment > 0) {
      const t = (km - walked) / segment
      const point = [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t]
      return {
        point,
        bearing: bearingDeg(start, end),
        traveled: [...coords.slice(0, index), point],
      }
    }
    walked += segment
  }

  const last = coords[coords.length - 1]
  return {
    point: last,
    bearing: bearingDeg(coords[coords.length - 2], last),
    traveled: coords,
  }
}

// Interpola el ángulo por el camino más corto (evita que la cámara gire 350°
// cuando el rumbo pasa de 355° a 5°).
export function lerpAngle(from, to, t) {
  const delta = ((((to - from) % 360) + 540) % 360) - 180
  return (from + delta * t + 360) % 360
}

// Duración de la animación de un tramo: los tramos largos no deben durar
// minutos, los cortos no deben ser un parpadeo.
export function legDurationMs(lengthKm, mode) {
  const perKm = mode === 'pie' ? 2200 : 260
  return Math.min(Math.max(lengthKm * perKm, 1800), 9000)
}

// Zoom de seguimiento según el modo: a pie se ve la calle, en tren el valle.
export function followZoom(mode) {
  if (mode === 'pie') return 16.2
  if (mode === 'auto') return 12.6
  return 12
}
