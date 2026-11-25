// Punto de partida y llegada de cada día. Ubicación referencial en San Blas:
// reemplazar por la dirección real del hospedaje.
export const HOTEL = {
  id: 'hestia',
  name: 'Hospedaje Hestia',
  lat: -13.5153,
  lng: -71.9752,
  category: 'Tu hospedaje',
  image: null,
}

const POIS = {
  plazaArmas: {
    id: 'plaza-armas',
    name: 'Plaza de Armas',
    lat: -13.5164,
    lng: -71.9785,
    category: 'Centro histórico',
    image: '/cusco/plaza-armas.jpg',
  },
  catedral: {
    id: 'catedral',
    name: 'Catedral del Cusco',
    lat: -13.5168,
    lng: -71.9787,
    category: 'Centro histórico',
    image: '/cusco/catedral.jpg',
  },
  qorikancha: {
    id: 'qorikancha',
    name: 'Qorikancha',
    lat: -13.5194,
    lng: -71.9766,
    category: 'Centro histórico',
    image: '/cusco/qorikancha.jpg',
  },
  sanBlas: {
    id: 'san-blas',
    name: 'Barrio de San Blas',
    lat: -13.5144,
    lng: -71.9748,
    category: 'Centro histórico',
    image: '/cusco/san-blas.jpg',
  },
  sanPedro: {
    id: 'mercado-san-pedro',
    name: 'Mercado de San Pedro',
    lat: -13.5212,
    lng: -71.9808,
    category: 'Centro histórico',
    image: '/cusco/mercado-san-pedro.jpg',
  },
  sacsayhuaman: {
    id: 'sacsayhuaman',
    name: 'Sacsayhuamán',
    lat: -13.5078,
    lng: -71.982,
    category: 'Arqueológico',
    image: '/cusco/sacsayhuaman.jpg',
  },
  qenqo: {
    id: 'qenqo',
    name: "Q'enqo",
    lat: -13.5035,
    lng: -71.9745,
    category: 'Arqueológico',
    image: '/cusco/qenqo.jpg',
  },
  pukaPukara: {
    id: 'puka-pukara',
    name: 'Puka Pukara',
    lat: -13.4875,
    lng: -71.9625,
    category: 'Arqueológico',
    image: '/cusco/puka-pukara.jpg',
  },
  tambomachay: {
    id: 'tambomachay',
    name: 'Tambomachay',
    lat: -13.4855,
    lng: -71.9608,
    category: 'Arqueológico',
    image: '/cusco/tambomachay.jpg',
  },
  cristoBlanco: {
    id: 'cristo-blanco',
    name: 'Mirador Cristo Blanco',
    lat: -13.5094,
    lng: -71.9797,
    category: 'Mirador',
    image: '/cusco/cristo-blanco.jpg',
  },
  pisac: {
    id: 'pisac',
    name: 'Pisac',
    lat: -13.4256,
    lng: -71.8472,
    category: 'Valle Sagrado',
    image: '/cusco/pisac.jpg',
  },
  ollantaytambo: {
    id: 'ollantaytambo',
    name: 'Ollantaytambo',
    lat: -13.259,
    lng: -72.2633,
    category: 'Valle Sagrado',
    image: '/cusco/ollantaytambo.jpg',
  },
  aguasCalientes: {
    id: 'aguas-calientes',
    name: 'Aguas Calientes',
    lat: -13.1547,
    lng: -72.5255,
    category: 'Machu Picchu',
    image: '/cusco/aguas-calientes.jpg',
  },
  machuPicchu: {
    id: 'machu-picchu',
    name: 'Machu Picchu',
    lat: -13.1631,
    lng: -72.545,
    category: 'Machu Picchu',
    image: '/cusco/machu-picchu.jpg',
  },
  chocoMuseo: {
    id: 'choco-museo',
    name: 'ChocoMuseo Cusco',
    lat: -13.5176,
    lng: -71.9774,
    category: 'En familia',
    image: '/cusco/choco-museo.jpg',
  },
  planetario: {
    id: 'planetario-cusco',
    name: 'Planetario Cusco',
    lat: -13.4975,
    lng: -71.9524,
    category: 'En familia',
    image: '/cusco/planetario-cusco.jpg',
  },
}

// Catálogo para el editor de ruta: el huésped puede sumar cualquiera de estos.
export const POI_CATALOG = Object.values(POIS)

const POIS_BY_ID = new Map(POI_CATALOG.map((poi) => [poi.id, poi]))

export function poiById(id) {
  return POIS_BY_ID.get(id) ?? null
}

const DAY_TEMPLATES = [
  {
    day: 1,
    title: 'Llegada y centro histórico',
    description:
      'Aclimátate con calma: la Plaza de Armas, la Catedral y el Qorikancha están a pocos minutos a pie del hospedaje.',
    pois: ['plazaArmas', 'catedral', 'qorikancha', 'sanBlas'],
  },
  {
    day: 2,
    title: 'City tour arqueológico',
    description:
      'Las ruinas incas más cercanas a la ciudad: Sacsayhuamán, Q\'enqo, Puka Pukara y Tambomachay, con el atardecer desde el mirador Cristo Blanco.',
    pois: ['sacsayhuaman', 'qenqo', 'pukaPukara', 'tambomachay', 'cristoBlanco'],
  },
  {
    day: 3,
    title: 'Valle Sagrado',
    description:
      'Día completo fuera de la ciudad: el mercado y andenes de Pisac por la mañana, la fortaleza de Ollantaytambo por la tarde.',
    pois: ['pisac', 'ollantaytambo'],
  },
  {
    day: 4,
    title: 'Machu Picchu',
    description:
      'El punto más alto del viaje. Tren hacia Aguas Calientes y subida a la ciudadela — reserva boletos de tren e ingreso con anticipación.',
    pois: ['aguasCalientes', 'machuPicchu'],
  },
  {
    day: 5,
    title: 'Día libre y despedida',
    description:
      'Un último recorrido con calma por el mercado de San Pedro y San Blas para cerrar el viaje con compras y un café.',
    pois: ['sanPedro', 'sanBlas'],
  },
]

const TRAVELER_PROFILES = {
  solo: {
    label: 'Viajero solo',
    intro:
      'Viajas solo: súmate a free walking tours y excursiones compartidas a Valle Sagrado y Machu Picchu — son más baratas y una buena forma de conocer gente. Elige hostales con zonas comunes para socializar.',
    extras: {
      1: { tip: 'Free walking tour por el centro histórico, punto de encuentro en la Plaza de Armas, 2:00 p.m.' },
      2: { tip: 'Las excursiones compartidas (van + guía) a las ruinas cercanas suelen costar menos que ir por tu cuenta.' },
      3: { tip: 'Un tour compartido de día completo a Valle Sagrado es la opción más económica si viajas solo.' },
      4: { tip: 'Reserva el tren y la entrada a Machu Picchu con semanas de anticipación: los cupos individuales se agotan rápido.' },
      5: { tip: 'Aprovecha para comer en el segundo piso del mercado de San Pedro, ideal para comer algo rápido y barato.' },
    },
  },
  pareja: {
    label: 'Viaje en pareja',
    intro:
      'Viajan en pareja: prioricen los miradores al atardecer y los recorridos con calma — Cusco tiene varios rincones pensados para una escapada romántica.',
    extras: {
      1: { tip: 'Atardecer y foto desde el mirador de San Blas, a pocas cuadras de la plaza.' },
      2: { tip: 'El atardecer desde Cristo Blanco, con toda la ciudad iluminándose abajo, es el mejor cierre del día.' },
      3: { tip: 'Almuerzo con vista a los andenes de Pisac antes de seguir a Ollantaytambo.' },
      4: { tip: 'Lleguen un día antes a Aguas Calientes para evitar las colas de la mañana y disfrutar el pueblo con calma.' },
      5: { tip: 'Cierren el viaje con un café en algún balcón de San Blas con vista a los techos de tejas del centro.' },
    },
  },
  familia: {
    label: 'Viaje en familia',
    intro:
      'Viajan en familia: alternen caminatas cortas con paradas de descanso, usen transporte privado entre sitios alejados y sumen actividades pensadas para niños como el ChocoMuseo o el Planetario.',
    extras: {
      1: { poiKey: 'chocoMuseo', tip: 'Taller de chocolate en familia en el ChocoMuseo, cerca de la plaza — ideal para los más chicos.' },
      2: { tip: 'Sacsayhuamán tiene espacio abierto de sobra para que los niños corran entre explicación y explicación.' },
      3: { tip: 'Contraten transporte privado para Valle Sagrado: es un día largo y evita caminatas de más con niños.' },
      4: { tip: 'El tren a Aguas Calientes ya es una aventura en sí misma para los niños — lleven snacks y agua.' },
      5: { poiKey: 'planetario', tip: 'Si queda energía, el Planetario Cusco tiene una función nocturna pensada para familias.' },
    },
  },
}

export function travelerTypeFromGuests(guests) {
  const count = Number(guests) || 1
  if (count <= 1) return 'solo'
  if (count === 2) return 'pareja'
  return 'familia'
}

// Ruta guardada por el huésped: { version: 1, days: [{ day, poiIds: [...] }] }.
// Se guarda en la reserva (reservation.tripPlan) y llega a Postgres como jsonb.
export function planFromItinerary(itinerary) {
  return {
    version: 1,
    days: itinerary.days.map((day) => ({ day: day.day, poiIds: day.pois.map((poi) => poi.id) })),
  }
}

function customPoisForDay(plan, dayNumber) {
  const saved = plan?.days?.find((item) => item.day === dayNumber)
  if (!saved || !Array.isArray(saved.poiIds)) return null
  return saved.poiIds.map(poiById).filter(Boolean)
}

export function buildCuscoItinerary({ nights, guests, plan = null }) {
  const travelerType = travelerTypeFromGuests(guests)
  const profile = TRAVELER_PROFILES[travelerType]
  const dayCount = Math.min(Math.max(Number(nights) || 1, 1), DAY_TEMPLATES.length)

  const seenPois = new Map()
  const days = DAY_TEMPLATES.slice(0, dayCount).map((template) => {
    const extra = profile.extras[template.day]
    const custom = customPoisForDay(plan, template.day)
    const pois = custom ?? template.pois.map((key) => POIS[key])

    if (!custom && extra?.poiKey && !template.pois.includes(extra.poiKey)) {
      pois.push(POIS[extra.poiKey])
    }

    for (const poi of pois) seenPois.set(poi.id, poi)

    return {
      day: template.day,
      title: template.title,
      description: template.description,
      tip: extra?.tip ?? null,
      custom: Boolean(custom),
      pois,
    }
  })

  const extraNights = Math.max(Number(nights) || 1, 1) - dayCount

  return {
    travelerType,
    travelerLabel: profile.label,
    intro: profile.intro,
    days,
    extraNights: extraNights > 0 ? extraNights : 0,
    pois: Array.from(seenPois.values()),
  }
}
