import { describe, expect, it } from 'vitest'
import { HOTEL, buildCuscoItinerary, planFromItinerary, poiById } from '../data/cuscoItinerary.js'
import {
  bearingDeg,
  buildDayStops,
  buildLegs,
  distanceKm,
  legMode,
  lerpAngle,
  lineLengthKm,
  pointAlong,
} from './tripRoute.js'

const plaza = poiById('plaza-armas')
const qorikancha = poiById('qorikancha')
const pisac = poiById('pisac')
const aguasCalientes = poiById('aguas-calientes')
const machuPicchu = poiById('machu-picchu')

describe('distancias y rumbos', () => {
  it('Plaza de Armas → Qorikancha está a unos 400 m', () => {
    const km = distanceKm([plaza.lng, plaza.lat], [qorikancha.lng, qorikancha.lat])
    expect(km).toBeGreaterThan(0.3)
    expect(km).toBeLessThan(0.5)
  })

  it('rumbo norte = 0° y este = 90°', () => {
    expect(bearingDeg([0, 0], [0, 1])).toBeCloseTo(0, 5)
    expect(bearingDeg([0, 0], [1, 0])).toBeCloseTo(90, 5)
  })

  it('interpola el ángulo por el camino corto', () => {
    expect(lerpAngle(350, 10, 0.5)).toBeCloseTo(0, 5)
    expect(lerpAngle(10, 350, 0.5)).toBeCloseTo(0, 5)
  })
})

describe('modo de cada tramo', () => {
  it('a pie dentro del centro, auto al Valle Sagrado, tren a Machu Picchu', () => {
    expect(legMode(plaza, qorikancha)).toBe('pie')
    expect(legMode(HOTEL, pisac)).toBe('auto')
    expect(legMode(HOTEL, aguasCalientes)).toBe('tren')
    expect(legMode(aguasCalientes, machuPicchu)).not.toBe('tren')
  })
})

describe('paradas del día', () => {
  it('sale y vuelve al hospedaje', () => {
    const stops = buildDayStops(HOTEL, [plaza, qorikancha])
    expect(stops.map((stop) => stop.id)).toEqual(['hestia', 'plaza-armas', 'qorikancha', 'hestia'])
    expect(buildLegs(stops)).toHaveLength(3)
  })

  it('no vuelve si el día termina en Machu Picchu', () => {
    const stops = buildDayStops(HOTEL, [aguasCalientes, machuPicchu])
    expect(stops.at(-1).id).toBe('machu-picchu')
  })

  it('sin paradas no hay ruta', () => {
    expect(buildDayStops(HOTEL, [])).toEqual([])
  })
})

describe('punto a lo largo de la línea', () => {
  const line = [
    [0, 0],
    [0, 1],
    [1, 1],
  ]

  it('la mitad cae en la esquina', () => {
    const half = lineLengthKm(line) / 2
    const { point, traveled } = pointAlong(line, half)
    expect(point[0]).toBeCloseTo(0, 2)
    expect(point[1]).toBeCloseTo(1, 2)
    expect(traveled.length).toBeGreaterThanOrEqual(2)
  })

  it('más allá del final se queda en el último punto', () => {
    expect(pointAlong(line, 99999).point).toEqual([1, 1])
  })
})

describe('ruta guardada por el huésped', () => {
  it('reemplaza las paradas del día personalizado y respeta el resto', () => {
    const base = buildCuscoItinerary({ nights: 2, guests: 2 })
    const plan = planFromItinerary(base)
    plan.days[0].poiIds = ['qorikancha', 'plaza-armas', 'id-que-no-existe']

    const custom = buildCuscoItinerary({ nights: 2, guests: 2, plan })
    expect(custom.days[0].custom).toBe(true)
    expect(custom.days[0].pois.map((poi) => poi.id)).toEqual(['qorikancha', 'plaza-armas'])
    expect(custom.days[1].pois).toEqual(base.days[1].pois)
  })

  it('sin plan usa la sugerencia del perfil (familia suma el ChocoMuseo)', () => {
    const family = buildCuscoItinerary({ nights: 1, guests: 4 })
    expect(family.days[0].custom).toBe(false)
    expect(family.days[0].pois.map((poi) => poi.id)).toContain('choco-museo')
  })
})
