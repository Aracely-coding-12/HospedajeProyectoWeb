const ROOM_TOTAL = 30
const OCCUPIED_ROOMS = 18
const MAINTENANCE_ROOMS = 2
const CLIENT_TOTAL = 320
const TODAY_RESERVATIONS = 15
const MS_PER_DAY = 24 * 60 * 60 * 1000 // 86.400.000
const DOCUMENT_BASE = 10 * 1000 * 1000 // 10.000.000
const PHONE_RANGE = 100 * 1000 * 1000 // 100.000.000
const INACTIVE_CLIENT_EVERY = 15
const WEB_CLIENT_EVERY = 4

const FIRST_NAMES = [
  'Ana',
  'Luis',
  'María',
  'Carlos',
  'Rosa',
  'Jorge',
  'Lucía',
  'Diego',
  'Patricia',
  'Miguel',
  'Elena',
  'José',
  'Carmen',
  'Andrés',
  'Sofía',
  'Raúl',
]

const LAST_NAMES = [
  'Quispe',
  'Mamani',
  'Flores',
  'Huamán',
  'García',
  'Rojas',
  'Condori',
  'Vargas',
  'Cárdenas',
  'Choque',
  'Ramos',
  'Ticona',
  'Salazar',
  'Paredes',
  'Cruz',
  'Medina',
]

export const ROOM_TYPES = ['Simple', 'Doble', 'Matrimonial', 'Suite']

export const ROOM_STATUS_OPTIONS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'ocupada', label: 'Ocupada' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'inactiva', label: 'Inactiva' },
]

export const CLIENT_DOCUMENT_TYPES = [
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' },
  { value: 'CE', label: 'Carné de extranjería' },
]

export const CLIENT_SOURCE_OPTIONS = [
  { value: 'web', label: 'Página web' },
  { value: 'admin', label: 'Administrador' },
]

export const DEFAULT_ROOM_IMAGES = {
  Simple: '/rooms/simple.svg',
  Doble: '/rooms/doble.svg',
  Matrimonial: '/rooms/matrimonial.svg',
  Suite: '/rooms/suite.svg',
}

const ROOM_DESCRIPTIONS = {
  Simple:
    'Habitación individual acogedora con cama de una plaza, baño privado, Wi-Fi y desayuno incluido.',
  Doble:
    'Habitación amplia para dos personas, con dos camas, baño privado, Wi-Fi, TV y servicio de limpieza diario.',
  Matrimonial:
    'Habitación cálida con cama matrimonial, baño privado, Wi-Fi y TV. Ideal para parejas.',
  Suite:
    'Suite amplia con sala de estar, cama king, baño privado, Wi-Fi, TV y vista al jardín. Incluye desayuno.',
}

const DEFAULT_ROOM_IMAGE_BY_TYPE = new Map(Object.entries(DEFAULT_ROOM_IMAGES))
const ROOM_DESCRIPTION_BY_TYPE = new Map(Object.entries(ROOM_DESCRIPTIONS))

export function defaultRoomImage(type) {
  return DEFAULT_ROOM_IMAGE_BY_TYPE.get(type)
}

export function roomDescription(type) {
  return ROOM_DESCRIPTION_BY_TYPE.get(type)
}

const PAYMENT_AMOUNTS = [40, 60, 50, 80, 70, 90, 60, 50, 70, 80, 60, 50, 80, 70, 90]
const STATUS_LABELS = new Map([
  ['pendiente', 'Pendiente'],
  ['confirmada', 'Confirmada'],
  ['finalizada', 'Finalizada'],
  ['cancelada', 'Cancelada'],
  ['rechazada', 'Rechazada'],
])

export const RESERVATION_STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'rechazada', label: 'Rechazada' },
]

export function reservationStatusLabel(status) {
  return RESERVATION_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Tarjeta', label: 'Tarjeta' },
  { value: 'Yape', label: 'Yape' },
  { value: 'Plin', label: 'Plin' },
  { value: 'Transferencia', label: 'Transferencia bancaria' },
]

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pagado', label: 'Pagado' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'reembolsado', label: 'Reembolsado' },
]

const PAYMENT_METHOD_VALUES = new Set(PAYMENT_METHOD_OPTIONS.map((option) => option.value))
const PAYMENT_STATUS_VALUES = new Set(PAYMENT_STATUS_OPTIONS.map((option) => option.value))

export function paymentMethodLabel(method) {
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method
}

export function paymentStatusLabel(status) {
  return PAYMENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

export function paymentDateKey(payment) {
  if (!payment?.paidAt) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(payment.paidAt)) return payment.paidAt
  return toDateKey(new Date(payment.paidAt))
}

export function findReservationByNumber(reservations, value) {
  const raw = String(value ?? '').trim()
  if (!raw) return null

  const normalized = raw.replace(/^#/, '').trim().toUpperCase()
  const directMatch = reservations.find(
    (reservation) => reservation.code.toUpperCase() === normalized,
  )
  if (directMatch) return directMatch

  const digits = normalized.replace(/\D/g, '')
  if (!digits) return null

  return (
    reservations.find(
      (reservation) => reservation.code.replace(/\D/g, '') === digits,
    ) ?? null
  )
}

export const SERVICE_CATEGORY_OPTIONS = [
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'desayuno', label: 'Desayunos' },
  { value: 'almuerzo', label: 'Almuerzos' },
  { value: 'cena', label: 'Cenas' },
]

export const SERVICE_STATUS_OPTIONS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'no-disponible', label: 'No disponible' },
]

const SERVICE_CATEGORY_VALUES = new Set(
  SERVICE_CATEGORY_OPTIONS.map((option) => option.value),
)
const SERVICE_STATUS_VALUES = new Set(SERVICE_STATUS_OPTIONS.map((option) => option.value))

export function serviceCategoryLabel(category) {
  return (
    SERVICE_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category
  )
}

export function serviceStatusLabel(status) {
  return SERVICE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

export const PROMOTION_TYPE_OPTIONS = [
  { value: 'descuento', label: 'Descuento' },
  { value: 'paquete', label: 'Paquete' },
  { value: 'combo', label: 'Combo' },
  { value: 'dosxuno', label: '2x1' },
  { value: 'cortesia', label: 'Cortesía' },
]

export const PROMOTION_CATEGORY_OPTIONS = [
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'habitacion', label: 'Habitación' },
  { value: 'desayunos', label: 'Desayunos' },
  { value: 'combos', label: 'Combos' },
]

export const PROMOTION_STATUS_OPTIONS = [
  { value: 'activa', label: 'Activa' },
  { value: 'inactiva', label: 'Inactiva' },
]

const PROMOTION_TYPE_VALUES = new Set(PROMOTION_TYPE_OPTIONS.map((option) => option.value))
const PROMOTION_CATEGORY_VALUES = new Set(
  PROMOTION_CATEGORY_OPTIONS.map((option) => option.value),
)
const PROMOTION_STATUS_VALUES = new Set(PROMOTION_STATUS_OPTIONS.map((option) => option.value))
const PROMOTION_STATUS_LABELS = new Map([
  ['activa', 'Activa'],
  ['programada', 'Programada'],
  ['vencida', 'Vencida'],
  ['inactiva', 'Inactiva'],
])

export function promotionTypeLabel(type) {
  return PROMOTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
}

export function promotionCategoryLabel(category) {
  return (
    PROMOTION_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category
  )
}

export function promotionStatusLabel(status) {
  return PROMOTION_STATUS_LABELS.get(status) ?? status
}

export function promotionEffectiveStatus(promotion, now = new Date()) {
  const today = toDateKey(now)

  if (promotion.endDate && promotion.endDate < today) return 'vencida'
  if ((promotion.status ?? 'activa') !== 'activa') return 'inactiva'
  if (promotion.startDate && promotion.startDate > today) return 'programada'

  return 'activa'
}

const RANDOM_INCREMENT = 27947 * 65536 + 31221 // 0x6d2b79f5
const UINT32_RANGE = 65536 * 65536 // 2^32
const RANDOM_SEED = 2026 * 10000 + 1028 // 20.261.028

function createRandom(seed) {
  let state = seed

  return function random() {
    state |= 0
    state = (state + RANDOM_INCREMENT) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / UINT32_RANGE
  }
}

const random = createRandom(RANDOM_SEED)

function pick(list) {
  return list[Math.floor(random() * list.length)]
}

function startOfDay(date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date, amount) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}

export function toDateKey(date = new Date()) {
  const value = new Date(date)
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(value) {
  return new Date(`${value}T00:00:00`)
}

export function nightsBetween(checkIn, checkOut) {
  const start = parseDateKey(checkIn)
  const end = parseDateKey(checkOut)
  return Math.max(0, Math.round((end - start) / MS_PER_DAY))
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

const today = startOfDay(new Date())

const rooms = Array.from({ length: ROOM_TOTAL }, (_, index) => {
  const floor = Math.floor(index / 10) + 1
  const number = `${floor}${String((index % 10) + 1).padStart(2, '0')}`
  const type = ROOM_TYPES[index % ROOM_TYPES.length]
  const status =
    index < OCCUPIED_ROOMS
      ? 'ocupada'
      : index < ROOM_TOTAL - MAINTENANCE_ROOMS
        ? 'disponible'
        : 'mantenimiento'

  return {
    id: `room-${index + 1}`,
    number,
    floor,
    type,
    capacity: type === 'Simple' ? 1 : type === 'Suite' ? 4 : 2,
    price: 120 + (index % 4) * 40,
    status,
    image: defaultRoomImage(type),
    description: roomDescription(type),
  }
})

const clients = Array.from({ length: CLIENT_TOTAL }, (_, index) => {
  const firstName = pick(FIRST_NAMES)
  const lastName = pick(LAST_NAMES)
  const secondLastName = pick(LAST_NAMES)
  const name = `${firstName} ${lastName} ${secondLastName}`

  return {
    id: `client-${index + 1}`,
    name,
    documentType: 'DNI',
    document: String(DOCUMENT_BASE + Math.floor(random() * 9000000)),
    email: `${slugify(firstName)}.${slugify(lastName)}${index + 1}@correo.com`,
    phone: `9${String(Math.floor(random() * PHONE_RANGE)).padStart(8, '0')}`,
    active: index % INACTIVE_CLIENT_EVERY !== 0,
    source: index % WEB_CLIENT_EVERY === 0 ? 'web' : 'admin',
    createdAt: addDays(today, -Math.floor(random() * 720)).toISOString(),
  }
})

let reservationSequence = 0
let paymentSequence = 0

function createReservation({ index, roomIndex, checkIn, checkOut, createdOn, status, paymentIndex = null }) {
  const room = rooms.at(roomIndex)
  const client = clients.at(index)
  const nights = nightsBetween(toDateKey(checkIn), toDateKey(checkOut))
  reservationSequence += 1

  return {
    id: `reservation-${reservationSequence}`,
    code: `HES-${String(reservationSequence).padStart(4, '0')}`,
    roomId: room.id,
    clientId: client.id,
    guestName: client.name,
    checkIn: toDateKey(checkIn),
    checkOut: toDateKey(checkOut),
    status,
    nights,
    total: room.price * nights,
    createdAt: createdOn.toISOString(),
    paymentIndex,
  }
}

const reservations = Array.from({ length: TODAY_RESERVATIONS }, (_, index) => {
  const createdOn = new Date(today)
  createdOn.setHours(8 + Math.floor(index / 2), (index * 7) % 60, 0, 0)

  return createReservation({
    index,
    roomIndex: index,
    checkIn: today,
    checkOut: addDays(today, (index % 3) + 1),
    createdOn,
    status: 'confirmada',
    paymentIndex: index,
  })
})

const extraSeed = [
  {
    clientIndex: 15,
    roomIndex: 15,
    checkIn: addDays(today, -2),
    checkOut: addDays(today, 2),
    createdOn: addDays(today, -4),
    status: 'confirmada',
    paymentIndex: null,
  },
  {
    clientIndex: 16,
    roomIndex: 16,
    checkIn: addDays(today, -1),
    checkOut: addDays(today, 3),
    createdOn: addDays(today, -3),
    status: 'confirmada',
    paymentIndex: null,
  },
  {
    clientIndex: 20,
    roomIndex: 17,
    checkIn: addDays(today, 2),
    checkOut: addDays(today, 5),
    createdOn: addDays(today, -5),
    status: 'confirmada',
    paymentIndex: null,
  },
  {
    clientIndex: 32,
    roomIndex: 18,
    checkIn: addDays(today, 4),
    checkOut: addDays(today, 6),
    createdOn: addDays(today, -3),
    status: 'confirmada',
    paymentIndex: null,
  },
  {
    clientIndex: 45,
    roomIndex: 19,
    checkIn: addDays(today, 7),
    checkOut: addDays(today, 9),
    createdOn: addDays(today, -1),
    status: 'pendiente',
    paymentIndex: null,
  },
]

extraSeed.forEach((seed) => {
  reservations.push(createReservation({ ...seed, index: seed.clientIndex }))
})

const payments = reservations
  .filter((reservation) => reservation.paymentIndex !== null)
  .map((reservation) => {
    const paidAt = new Date(today)
    paidAt.setHours(9 + (reservation.paymentIndex % 10), 15, 0, 0)
    paymentSequence += 1

    return {
      id: `payment-${reservation.id}`,
      code: `PAG-${String(paymentSequence).padStart(4, '0')}`,
      reservationId: reservation.id,
      amount: PAYMENT_AMOUNTS[reservation.paymentIndex],
      method:
        PAYMENT_METHOD_OPTIONS[reservation.paymentIndex % PAYMENT_METHOD_OPTIONS.length].value,
      status: 'pagado',
      paidAt: paidAt.toISOString(),
    }
  })

const services = [
  {
    name: 'Café americano',
    category: 'bebidas',
    price: 7,
    description: 'Café filtrado con granos locales de Quillabamba, servido caliente.',
    status: 'disponible',
  },
  {
    name: 'Mate de coca',
    category: 'bebidas',
    price: 5,
    description: 'Infusión tradicional andina, ideal para aclimatarse a la altura.',
    status: 'disponible',
  },
  {
    name: 'Jugo de naranja natural',
    category: 'bebidas',
    price: 9,
    description: 'Jugo exprimido al momento, sin azúcar añadida ni conservantes.',
    status: 'disponible',
  },
  {
    name: 'Chicha morada',
    category: 'bebidas',
    price: 6,
    description: 'Bebida tradicional de maíz morado con frutas y especias.',
    status: 'no-disponible',
  },
  {
    name: 'Agua mineral',
    category: 'bebidas',
    price: 4,
    description: 'Botella de agua mineral de 625 ml, con o sin gas.',
    status: 'disponible',
  },
  {
    name: 'Smoothie de fresa',
    category: 'bebidas',
    price: 11,
    description: 'Batido de fresa, plátano y yogurt natural de la región.',
    status: 'disponible',
  },
  {
    name: 'Desayuno andino',
    category: 'desayuno',
    price: 18,
    description: 'Pan de quinua, huevos, queso andino, fruta de estación y mate de coca.',
    status: 'disponible',
  },
  {
    name: 'Desayuno americano',
    category: 'desayuno',
    price: 22,
    description: 'Huevos al gusto, tostadas, mantequilla, mermelada y café americano.',
    status: 'disponible',
  },
  {
    name: 'Avena con frutas',
    category: 'desayuno',
    price: 12,
    description: 'Avena cremosa con plátano, manzana, pasas y un toque de canela.',
    status: 'disponible',
  },
  {
    name: 'Pan con palta',
    category: 'desayuno',
    price: 10,
    description: 'Pan artesanal tostado con palta, tomate y sal de Maras.',
    status: 'no-disponible',
  },
  {
    name: 'Menú del día',
    category: 'almuerzo',
    price: 25,
    description: 'Sopa del día, segundo a elección y refresco natural de la casa.',
    status: 'disponible',
  },
  {
    name: 'Lomo saltado',
    category: 'almuerzo',
    price: 32,
    description: 'Lomo de res salteado con cebolla, tomate, ají y papas fritas.',
    status: 'disponible',
  },
  {
    name: 'Trucha a la plancha',
    category: 'almuerzo',
    price: 30,
    description: 'Trucha fresca de los Andes acompañada de arroz y ensalada.',
    status: 'no-disponible',
  },
  {
    name: 'Ají de gallina',
    category: 'almuerzo',
    price: 28,
    description: 'Pollo deshilachado en crema de ají amarillo, servido con arroz.',
    status: 'disponible',
  },
  {
    name: 'Cena ligera',
    category: 'cena',
    price: 20,
    description: 'Sopa reconfortante, pan artesanal y una bebida caliente.',
    status: 'disponible',
  },
  {
    name: 'Pizza artesanal',
    category: 'cena',
    price: 35,
    description: 'Masa delgada con queso mozzarella, tomate fresco y albahaca.',
    status: 'disponible',
  },
  {
    name: 'Pasta al pesto',
    category: 'cena',
    price: 26,
    description: 'Pasta al dente con salsa de albahaca, queso parmesano y nueces.',
    status: 'disponible',
  },
  {
    name: 'Sopa criolla',
    category: 'cena',
    price: 18,
    description: 'Caldo de res con fideos, leche, huevo y hierbas frescas.',
    status: 'no-disponible',
  },
].map((service, index) => ({ id: `service-${index + 1}`, ...service }))

let promotionSequence = 0

const promotions = [
  {
    name: 'Escapada romántica',
    description: 'Incluye desayuno y late check-out para dos personas.',
    reservationNumber: 'HES-0001',
    type: 'descuento',
    category: 'habitacion',
    discount: 15,
    startDate: toDateKey(addDays(today, -10)),
    endDate: toDateKey(addDays(today, 20)),
    status: 'activa',
    visibleOnWeb: true,
    image: '/rooms/suite.svg',
    createdAt: addDays(today, -12).toISOString(),
  },
  {
    name: 'Desayuno incluido',
    description: 'Disfruta de un delicioso desayuno durante tu estadía.',
    reservationNumber: '',
    type: 'paquete',
    category: 'desayunos',
    discount: 100,
    startDate: toDateKey(addDays(today, -5)),
    endDate: toDateKey(addDays(today, 15)),
    status: 'activa',
    visibleOnWeb: true,
    image: '',
    createdAt: addDays(today, -6).toISOString(),
  },
  {
    name: 'Fin de semana especial',
    description: '2 noches + 1 cena incluida para disfrutar en pareja.',
    reservationNumber: '',
    type: 'paquete',
    category: 'combos',
    discount: 20,
    startDate: toDateKey(addDays(today, -20)),
    endDate: toDateKey(addDays(today, 30)),
    status: 'activa',
    visibleOnWeb: true,
    image: '/rooms/matrimonial.svg',
    createdAt: addDays(today, -22).toISOString(),
  },
  {
    name: 'Happy Hour',
    description: '2x1 en bebidas seleccionadas de 6 a 8 p. m.',
    reservationNumber: '',
    type: 'dosxuno',
    category: 'bebidas',
    discount: 50,
    startDate: toDateKey(addDays(today, -30)),
    endDate: toDateKey(addDays(today, -10)),
    status: 'activa',
    visibleOnWeb: true,
    image: '',
    createdAt: addDays(today, -32).toISOString(),
  },
  {
    name: 'Cena especial',
    description: 'Menú gourmet a precio especial para huéspedes.',
    reservationNumber: 'HES-0010',
    type: 'descuento',
    category: 'combos',
    discount: 10,
    startDate: toDateKey(addDays(today, 5)),
    endDate: toDateKey(addDays(today, 35)),
    status: 'activa',
    visibleOnWeb: true,
    image: '',
    createdAt: addDays(today, -1).toISOString(),
  },
].map((promotion) => {
  promotionSequence += 1

  return {
    id: `promotion-${promotionSequence}`,
    code: `PROM-${String(promotionSequence).padStart(4, '0')}`,
    ...promotion,
  }
})

function presentReservation(reservation, roomList) {
  const room = roomList.find((item) => item.id === reservation.roomId)

  return {
    ...reservation,
    roomNumber: room?.number ?? '—',
    roomType: room?.type ?? '',
    statusLabel: STATUS_LABELS.get(reservation.status) ?? reservation.status,
  }
}

export function createInitialData() {
  return {
    rooms: rooms.map((room) => ({ ...room })),
    clients: clients.map((client) => ({ ...client })),
    reservations: reservations.map((reservation) => ({ ...reservation })),
    payments: payments.map((payment) => ({ ...payment })),
    services: services.map((service) => ({ ...service })),
    promotions: promotions.map((promotion) => ({ ...promotion })),
  }
}

export function buildDashboardSummary(data, now = new Date()) {
  const todayKey = toDateKey(now)
  const occupiedRooms = data.rooms.filter((room) => room.status === 'ocupada').length
  const reservationsToday = data.reservations.filter(
    (reservation) =>
      reservation.status !== 'cancelada' &&
      reservation.status !== 'rechazada' &&
      toDateKey(new Date(reservation.createdAt)) === todayKey,
  ).length
  const revenueToday = data.payments
    .filter(
      (payment) =>
        (payment.status ?? 'pagado') === 'pagado' &&
        toDateKey(new Date(payment.paidAt)) === todayKey,
    )
    .reduce((total, payment) => total + payment.amount, 0)

  const upcomingReservations = data.reservations
    .filter(
      (reservation) =>
        (reservation.status === 'confirmada' || reservation.status === 'pendiente') &&
        reservation.checkIn > todayKey,
    )
    .sort((first, second) => first.checkIn.localeCompare(second.checkIn))
    .slice(0, 4)
    .map((reservation) => presentReservation(reservation, data.rooms))

  const recentReservations = data.reservations
    .filter(
      (reservation) =>
        reservation.status !== 'cancelada' && reservation.status !== 'rechazada',
    )
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, 4)
    .map((reservation) => presentReservation(reservation, data.rooms))

  return {
    rooms: {
      total: data.rooms.length,
      occupied: occupiedRooms,
      available: data.rooms.filter((room) => room.status === 'disponible').length,
    },
    reservationsToday,
    clients: data.clients.length,
    revenueToday,
    upcomingReservations,
    recentReservations,
  }
}

export function hasReservationConflict(
  reservations,
  { roomId, checkIn, checkOut, excludeId = null },
) {
  if (!roomId || !checkIn || !checkOut || checkOut <= checkIn) return false

  return reservations.some(
    (reservation) =>
      reservation.id !== excludeId &&
      reservation.roomId === roomId &&
      (reservation.status === 'pendiente' || reservation.status === 'confirmada') &&
      reservation.checkIn < checkOut &&
      reservation.checkOut > checkIn,
  )
}

function isValidDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseDateKey(value).getTime())
}

function assertRoomBookable(data, roomId, checkIn, checkOut, excludeId = null) {
  const room = data.rooms.find((item) => item.id === roomId)
  if (!room) throw new Error('La habitación seleccionada no existe.')

  if (room.status === 'mantenimiento' || room.status === 'inactiva') {
    throw new Error(`La habitación ${room.number} no está disponible para reservas.`)
  }

  if (hasReservationConflict(data.reservations, { roomId, checkIn, checkOut, excludeId })) {
    throw new Error(`La habitación ${room.number} ya tiene una reserva en esas fechas.`)
  }

  return room
}

function normalizeReservationInput(
  data,
  input,
  { excludeId = null, allowPast = false, now = new Date() } = {},
) {
  const client = data.clients.find((item) => item.id === input.clientId)
  if (!client) throw new Error('Selecciona un huésped registrado.')

  const checkIn = String(input.checkIn ?? '')
  const checkOut = String(input.checkOut ?? '')

  if (!isValidDateKey(checkIn)) throw new Error('Ingresa una fecha de ingreso válida.')
  if (!isValidDateKey(checkOut)) throw new Error('Ingresa una fecha de salida válida.')
  if (checkOut <= checkIn) {
    throw new Error('La fecha de salida debe ser posterior a la de ingreso.')
  }

  if (!allowPast && checkIn < toDateKey(now)) {
    throw new Error('La fecha de ingreso no puede ser anterior a hoy.')
  }

  const room = assertRoomBookable(data, input.roomId, checkIn, checkOut, excludeId)
  const nights = nightsBetween(checkIn, checkOut)
  if (nights < 1) throw new Error('La reserva debe tener al menos una noche.')

  const guests = Number(input.guests ?? 1)
  if (!Number.isInteger(guests) || guests < 1) {
    throw new Error('Indica al menos un huésped.')
  }
  if (guests > room.capacity) {
    throw new Error(`La habitación ${room.number} admite hasta ${room.capacity} huéspedes.`)
  }

  const promotionCode = String(input.promotionCode ?? '').trim().toUpperCase()
  let promotion = null

  if (promotionCode) {
    promotion = data.promotions.find(
      (item) => String(item.code ?? '').toUpperCase() === promotionCode,
    )
    if (!promotion) throw new Error('El código promocional no existe.')
    if (promotionEffectiveStatus(promotion, now) !== 'activa') {
      throw new Error('El código promocional no está vigente.')
    }
    if (promotion.category !== 'habitacion' && promotion.category !== 'combos') {
      throw new Error('Esta promoción no aplica a reservas de habitación.')
    }
  }

  const subtotal = room.price * nights
  const discountPercent = promotion ? Number(promotion.discount) || 0 : 0
  const discountAmount = Math.round(subtotal * discountPercent) / 100

  const status =
    input.status === 'pendiente' || input.status === 'confirmada' ? input.status : 'pendiente'

  return {
    room,
    client,
    checkIn,
    checkOut,
    nights,
    guests,
    status,
    subtotal,
    discountPercent,
    discountAmount,
    promotionCode: promotion?.code ?? '',
    total: Math.max(0, subtotal - discountAmount),
  }
}

function reservationCoversToday(reservation, now = new Date()) {
  const todayKey = toDateKey(now)
  return (
    reservation.status === 'confirmada' &&
    reservation.checkIn <= todayKey &&
    reservation.checkOut > todayKey
  )
}

function applyRoomOccupancy(rooms, reservations, roomIds, now = new Date()) {
  const todayKey = toDateKey(now)

  return rooms.map((room) => {
    if (!roomIds.includes(room.id)) return room
    if (room.status === 'mantenimiento' || room.status === 'inactiva') return room

    const occupied = reservations.some(
      (reservation) =>
        reservation.roomId === room.id &&
        reservation.status === 'confirmada' &&
        reservation.checkIn <= todayKey &&
        reservation.checkOut > todayKey,
    )
    const status = occupied ? 'ocupada' : 'disponible'

    return room.status === status ? room : { ...room, status }
  })
}

export function buildReservationSummary(data, now = new Date()) {
  const monthKey = toDateKey(now).slice(0, 7)
  const todayKey = toDateKey(now)

  const monthReservations = data.reservations.filter(
    (reservation) =>
      reservation.status !== 'rechazada' &&
      toDateKey(new Date(reservation.createdAt)).slice(0, 7) === monthKey,
  )
  const cancelled = monthReservations.filter(
    (reservation) => reservation.status === 'cancelada',
  ).length
  const totalMonth = monthReservations.length
  const cancellationRate =
    totalMonth === 0 ? 0 : Math.round((cancelled / totalMonth) * 100)

  const upcoming = data.reservations.filter(
    (reservation) =>
      (reservation.status === 'pendiente' || reservation.status === 'confirmada') &&
      reservation.checkIn > todayKey,
  ).length
  const pending = data.reservations.filter(
    (reservation) => reservation.status === 'pendiente',
  ).length

  return { totalMonth, cancelled, cancellationRate, upcoming, pending }
}

export function buildPaymentSummary(data, now = new Date()) {
  const todayKey = toDateKey(now)
  const isPaid = (payment) => (payment.status ?? 'pagado') === 'pagado'

  const paidPayments = data.payments.filter(isPaid)
  const todaysPayments = data.payments.filter(
    (payment) => paymentDateKey(payment) === todayKey,
  )
  const todaysPaidPayments = todaysPayments.filter(isPaid)

  return {
    total: data.payments.length,
    paid: paidPayments.length,
    pending: data.payments.filter((payment) => payment.status === 'pendiente').length,
    refunded: data.payments.filter((payment) => payment.status === 'reembolsado').length,
    totalAmount: data.payments.reduce((sum, payment) => sum + payment.amount, 0),
    collected: paidPayments.reduce((sum, payment) => sum + payment.amount, 0),
    todayCount: todaysPayments.length,
    todayAmount: todaysPaidPayments.reduce((sum, payment) => sum + payment.amount, 0),
  }
}

export function addReservationToData(data, input, now = new Date()) {
  const fields = normalizeReservationInput(data, input, { now })

  reservationSequence = nextSequence('reservation', data)
  const reservation = {
    id: `reservation-${reservationSequence}`,
    code: `HES-${String(reservationSequence).padStart(4, '0')}`,
    roomId: fields.room.id,
    clientId: fields.client.id,
    guestName: fields.client.name,
    checkIn: fields.checkIn,
    checkOut: fields.checkOut,
    status: fields.status,
    nights: fields.nights,
    guests: fields.guests,
    subtotal: fields.subtotal,
    discountPercent: fields.discountPercent,
    discountAmount: fields.discountAmount,
    promotionCode: fields.promotionCode,
    total: fields.total,
    createdAt: now.toISOString(),
    paymentIndex: null,
  }

  let payment = null
  if (input.registerPayment) {
    paymentSequence = nextSequence('payment', data)
    payment = {
      id: `payment-${reservation.id}`,
      code: `PAG-${String(paymentSequence).padStart(4, '0')}`,
      reservationId: reservation.id,
      amount: fields.total,
      method: 'Efectivo',
      status: 'pagado',
      paidAt: now.toISOString(),
    }
  }

  const reservations = [reservation, ...data.reservations]
  const rooms = reservationCoversToday(reservation, now)
    ? applyRoomOccupancy(data.rooms, reservations, [reservation.roomId], now)
    : data.rooms

  return {
    ...data,
    rooms,
    reservations,
    payments: payment ? [payment, ...data.payments] : data.payments,
  }
}

export function updateReservationInData(data, input, now = new Date()) {
  const existing = data.reservations.find((reservation) => reservation.id === input.id)
  if (!existing) throw new Error('La reserva que intentas editar ya no existe.')

  if (existing.status !== 'pendiente' && existing.status !== 'confirmada') {
    throw new Error('Solo se pueden editar reservas pendientes o confirmadas.')
  }

  const preservePromotion = input.promotionCode === undefined
  const fields = normalizeReservationInput(
    data,
    {
      ...input,
      guests: input.guests ?? existing.guests ?? 1,
      promotionCode: preservePromotion ? '' : input.promotionCode,
    },
    {
      excludeId: existing.id,
      allowPast: true,
      now,
    },
  )

  const discountPercent = preservePromotion
    ? Number(existing.discountPercent) || 0
    : fields.discountPercent
  const discountAmount = preservePromotion
    ? Math.round(fields.subtotal * discountPercent) / 100
    : fields.discountAmount
  const total = preservePromotion
    ? Math.max(0, fields.subtotal - discountAmount)
    : fields.total

  const reservation = {
    ...existing,
    roomId: fields.room.id,
    clientId: fields.client.id,
    guestName: fields.client.name,
    checkIn: fields.checkIn,
    checkOut: fields.checkOut,
    status: fields.status,
    nights: fields.nights,
    guests: fields.guests,
    subtotal: fields.subtotal,
    discountPercent,
    discountAmount,
    promotionCode: preservePromotion ? existing.promotionCode ?? '' : fields.promotionCode,
    total,
    updatedAt: now.toISOString(),
  }

  const reservations = data.reservations.map((item) =>
    item.id === existing.id ? reservation : item,
  )

  const affectedRoomIds = new Set()
  if (reservationCoversToday(existing, now)) affectedRoomIds.add(existing.roomId)
  if (reservationCoversToday(reservation, now)) affectedRoomIds.add(reservation.roomId)

  return {
    ...data,
    rooms:
      affectedRoomIds.size > 0
        ? applyRoomOccupancy(data.rooms, reservations, [...affectedRoomIds], now)
        : data.rooms,
    reservations,
  }
}

export function confirmReservationInData(data, reservationId, now = new Date()) {
  const reservation = data.reservations.find((item) => item.id === reservationId)
  if (!reservation) throw new Error('La reserva seleccionada ya no existe.')
  if (reservation.status !== 'pendiente') {
    throw new Error('Solo se pueden confirmar solicitudes pendientes.')
  }

  const room = data.rooms.find((item) => item.id === reservation.roomId)
  if (!room) throw new Error('La habitación de la solicitud ya no existe.')
  if (room.status === 'mantenimiento' || room.status === 'inactiva') {
    throw new Error(`La habitación ${room.number} no está disponible para reservas.`)
  }

  if (
    hasReservationConflict(data.reservations, {
      roomId: reservation.roomId,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      excludeId: reservation.id,
    })
  ) {
    throw new Error('No se puede confirmar: la habitación ya tiene otra reserva en esas fechas.')
  }

  const confirmed = {
    ...reservation,
    status: 'confirmada',
    confirmedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
  const reservations = data.reservations.map((item) =>
    item.id === reservation.id ? confirmed : item,
  )

  return {
    ...data,
    rooms: reservationCoversToday(confirmed, now)
      ? applyRoomOccupancy(data.rooms, reservations, [confirmed.roomId], now)
      : data.rooms,
    reservations,
  }
}

export function rejectReservationInData(data, reservationId, now = new Date()) {
  const reservation = data.reservations.find((item) => item.id === reservationId)
  if (!reservation) throw new Error('La reserva seleccionada ya no existe.')
  if (reservation.status !== 'pendiente') {
    throw new Error('Solo se pueden rechazar solicitudes pendientes.')
  }

  return {
    ...data,
    reservations: data.reservations.map((item) =>
      item.id === reservation.id
        ? {
            ...item,
            status: 'rechazada',
            rejectedAt: now.toISOString(),
            updatedAt: now.toISOString(),
          }
        : item,
    ),
  }
}

export function reservationCancellationPolicy(reservation, now = new Date()) {
  if (!reservation) {
    return { allowed: false, late: false, message: 'La reserva seleccionada ya no existe.' }
  }

  if (reservation.status === 'cancelada') {
    return { allowed: false, late: false, message: 'La reserva ya está cancelada.' }
  }

  if (reservation.status === 'rechazada') {
    return { allowed: false, late: false, message: 'La solicitud ya fue rechazada.' }
  }

  if (reservation.status === 'finalizada') {
    return { allowed: false, late: false, message: 'La estadía ya finalizó.' }
  }

  if (reservation.status === 'pendiente') {
    return { allowed: true, late: false, message: 'La solicitud se cancelará sin cargos.' }
  }

  const todayKey = toDateKey(now)
  if (reservation.checkOut <= todayKey) {
    return {
      allowed: false,
      late: false,
      message: 'La estadía ya finalizó; la reserva no se puede cancelar.',
    }
  }

  if (reservation.checkIn <= todayKey) {
    return {
      allowed: true,
      late: true,
      message: 'La estadía ya inició. La cancelación se registrará sin reembolso.',
    }
  }

  return {
    allowed: true,
    late: false,
    message: 'La cancelación no genera cargos.',
  }
}

export function cancelReservationInData(data, reservationId, now = new Date()) {
  const reservation = data.reservations.find((item) => item.id === reservationId)
  if (!reservation) throw new Error('La reserva seleccionada ya no existe.')

  const policy = reservationCancellationPolicy(reservation, now)
  if (!policy.allowed) throw new Error(policy.message)

  const cancelled = {
    ...reservation,
    status: 'cancelada',
    lateCancellation: policy.late,
    cancelledAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
  const reservations = data.reservations.map((item) =>
    item.id === reservation.id ? cancelled : item,
  )

  return {
    ...data,
    rooms: reservationCoversToday(reservation, now)
      ? applyRoomOccupancy(data.rooms, reservations, [reservation.roomId], now)
      : data.rooms,
    reservations,
  }
}

export function deleteReservationFromData(data, reservationId) {
  const reservation = data.reservations.find((item) => item.id === reservationId)
  if (!reservation) throw new Error('La reserva seleccionada ya no existe.')

  if (reservation.status !== 'cancelada' && reservation.status !== 'rechazada') {
    throw new Error('Solo se pueden eliminar reservas canceladas o rechazadas.')
  }

  return {
    ...data,
    reservations: data.reservations.filter((item) => item.id !== reservation.id),
    payments: data.payments.filter((payment) => payment.reservationId !== reservation.id),
  }
}

function createPaymentId() {
  return crypto.randomUUID ? `payment-${crypto.randomUUID()}` : `payment-${Date.now()}`
}

function normalizePaymentInput(data, input, paymentId = null, now = new Date()) {
  const reservation = findReservationByNumber(
    data.reservations,
    input.reservationNumber ?? input.reservationCode,
  )

  if (!reservation) {
    throw new Error('No existe una reserva con ese número. Verifica el código e intenta de nuevo.')
  }

  const duplicate = data.payments.find(
    (payment) => payment.reservationId === reservation.id && payment.id !== paymentId,
  )
  if (duplicate) {
    throw new Error(
      `La reserva ${reservation.code} ya tiene un pago registrado (${duplicate.code}).`,
    )
  }

  if (!PAYMENT_METHOD_VALUES.has(input.method)) {
    throw new Error('Selecciona un método de pago válido.')
  }

  if (!PAYMENT_STATUS_VALUES.has(input.status)) {
    throw new Error('Selecciona un estado de pago válido.')
  }

  const paidOn = String(input.paidAt ?? '')
  if (!isValidDateKey(paidOn)) {
    throw new Error('Ingresa una fecha de pago válida.')
  }

  if (paidOn > toDateKey(now)) {
    throw new Error('La fecha de pago no puede ser posterior a hoy.')
  }

  return {
    reservation,
    method: input.method,
    status: input.status,
    paidAt:
      paidOn === toDateKey(now)
        ? now.toISOString()
        : new Date(`${paidOn}T12:00:00`).toISOString(),
  }
}

export function addPaymentToData(data, input, now = new Date()) {
  const fields = normalizePaymentInput(data, input, null, now)
  paymentSequence = nextSequence('payment', data)

  const payment = {
    id: createPaymentId(),
    code: `PAG-${String(paymentSequence).padStart(4, '0')}`,
    reservationId: fields.reservation.id,
    amount: fields.reservation.total,
    method: fields.method,
    status: fields.status,
    paidAt: fields.paidAt,
    createdAt: now.toISOString(),
  }

  return { ...data, payments: [payment, ...data.payments] }
}

export function updatePaymentInData(data, input, now = new Date()) {
  const existing = data.payments.find((payment) => payment.id === input.id)
  if (!existing) throw new Error('El pago que intentas editar ya no existe.')

  const fields = normalizePaymentInput(data, input, existing.id, now)
  const payment = {
    ...existing,
    reservationId: fields.reservation.id,
    amount: fields.reservation.total,
    method: fields.method,
    status: fields.status,
    paidAt: fields.paidAt,
    updatedAt: now.toISOString(),
  }

  return {
    ...data,
    payments: data.payments.map((item) => (item.id === existing.id ? payment : item)),
  }
}

export function deletePaymentFromData(data, paymentId) {
  const payment = data.payments.find((item) => item.id === paymentId)
  if (!payment) throw new Error('El pago que intentas eliminar ya no existe.')

  if ((payment.status ?? 'pagado') !== 'pagado') {
    throw new Error('Solo se pueden eliminar pagos con estado Pagado.')
  }

  return {
    ...data,
    payments: data.payments.filter((item) => item.id !== payment.id),
  }
}

function createServiceId() {
  return crypto.randomUUID ? `service-${crypto.randomUUID()}` : `service-${Date.now()}`
}

function normalizeServiceInput(data, input, serviceId = null) {
  const name = String(input.name ?? '').trim()
  if (!name) throw new Error('Ingresa el nombre del servicio.')
  if (name.length > 80) throw new Error('El nombre no puede superar los 80 caracteres.')

  if (
    data.services.some(
      (service) => service.id !== serviceId && service.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw new Error(`Ya existe un servicio llamado "${name}".`)
  }

  if (!SERVICE_CATEGORY_VALUES.has(input.category)) {
    throw new Error('Selecciona una categoría válida.')
  }

  const price = Number(input.price)
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('El precio debe ser mayor a 0.')
  }

  const description = String(input.description ?? '').trim()
  if (!description) throw new Error('Ingresa una descripción del servicio.')
  if (description.length > 240) {
    throw new Error('La descripción no puede superar los 240 caracteres.')
  }

  if (!SERVICE_STATUS_VALUES.has(input.status)) {
    throw new Error('Selecciona un estado válido.')
  }

  const image = String(input.image ?? '').trim()
  if (image && !image.startsWith('data:image/') && !/^https?:\/\//i.test(image) && !image.startsWith('/')) {
    throw new Error('La foto del servicio no es válida.')
  }

  return {
    name,
    category: input.category,
    price: Math.round(price * 100) / 100,
    description,
    status: input.status,
    image,
  }
}

export function addServiceToData(data, input, now = new Date()) {
  const fields = normalizeServiceInput(data, input)
  const service = {
    id: createServiceId(),
    ...fields,
    createdAt: now.toISOString(),
  }

  return { ...data, services: [service, ...data.services] }
}

export function updateServiceInData(data, input, now = new Date()) {
  const existing = data.services.find((service) => service.id === input.id)
  if (!existing) throw new Error('El servicio que intentas editar ya no existe.')

  const fields = normalizeServiceInput(data, input, existing.id)
  const service = { ...existing, ...fields, updatedAt: now.toISOString() }

  return {
    ...data,
    services: data.services.map((item) => (item.id === existing.id ? service : item)),
  }
}

export function deleteServiceFromData(data, serviceId) {
  if (!data.services.some((service) => service.id === serviceId)) {
    throw new Error('El servicio que intentas eliminar ya no existe.')
  }

  return {
    ...data,
    services: data.services.filter((service) => service.id !== serviceId),
  }
}

function createPromotionId() {
  return crypto.randomUUID ? `promotion-${crypto.randomUUID()}` : `promotion-${Date.now()}`
}

function normalizePromotionInput(data, input) {
  const name = String(input.name ?? '').trim()
  if (!name) throw new Error('Ingresa el nombre de la promoción.')
  if (name.length > 80) throw new Error('El nombre no puede superar los 80 caracteres.')

  const description = String(input.description ?? '').trim()
  if (!description) throw new Error('Ingresa una descripción de la promoción.')
  if (description.length > 240) {
    throw new Error('La descripción no puede superar los 240 caracteres.')
  }

  const rawReservationNumber = String(input.reservationNumber ?? '').trim().toUpperCase()
  let reservationNumber = ''

  if (rawReservationNumber) {
    if (rawReservationNumber.length > 20) {
      throw new Error('El número de reserva no puede superar los 20 caracteres.')
    }

    const reservation = findReservationByNumber(data.reservations, rawReservationNumber)
    if (!reservation) {
      throw new Error(`No se encontró la reserva "${rawReservationNumber}".`)
    }

    reservationNumber = reservation.code
  }

  if (!PROMOTION_TYPE_VALUES.has(input.type)) {
    throw new Error('Selecciona un tipo de promoción válido.')
  }

  if (!PROMOTION_CATEGORY_VALUES.has(input.category)) {
    throw new Error('Selecciona una categoría válida.')
  }

  const discount = Number(input.discount)
  if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
    throw new Error('El descuento debe ser mayor a 0 y como máximo 100%.')
  }

  const startDate = String(input.startDate ?? '').trim()
  const endDate = String(input.endDate ?? '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error('Selecciona la fecha de inicio de la vigencia.')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw new Error('Selecciona la fecha de fin de la vigencia.')
  }
  if (endDate < startDate) {
    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.')
  }

  if (!PROMOTION_STATUS_VALUES.has(input.status)) {
    throw new Error('Selecciona un estado válido.')
  }

  const image = String(input.image ?? '').trim()
  if (
    image &&
    !image.startsWith('data:image/') &&
    !/^https?:\/\//i.test(image) &&
    !image.startsWith('/')
  ) {
    throw new Error('La imagen de la promoción no es válida.')
  }

  return {
    name,
    description,
    reservationNumber,
    type: input.type,
    category: input.category,
    discount: Math.round(discount * 100) / 100,
    startDate,
    endDate,
    status: input.status,
    visibleOnWeb: input.visibleOnWeb !== false,
    image,
  }
}

export function addPromotionToData(data, input, now = new Date()) {
  const fields = normalizePromotionInput(data, input)
  promotionSequence = nextSequence('promotion', data)

  const promotion = {
    id: createPromotionId(),
    code: `PROM-${String(promotionSequence).padStart(4, '0')}`,
    ...fields,
    createdAt: now.toISOString(),
  }

  return { ...data, promotions: [promotion, ...data.promotions] }
}

export function updatePromotionInData(data, input, now = new Date()) {
  const existing = data.promotions.find((promotion) => promotion.id === input.id)
  if (!existing) throw new Error('La promoción que intentas editar ya no existe.')

  const fields = normalizePromotionInput(data, input)
  const promotion = { ...existing, ...fields, updatedAt: now.toISOString() }

  return {
    ...data,
    promotions: data.promotions.map((item) => (item.id === existing.id ? promotion : item)),
  }
}

export function deletePromotionFromData(data, promotionId) {
  if (!data.promotions.some((promotion) => promotion.id === promotionId)) {
    throw new Error('La promoción que intentas eliminar ya no existe.')
  }

  return {
    ...data,
    promotions: data.promotions.filter((promotion) => promotion.id !== promotionId),
  }
}

export function buildPromotionSummary(promotions, now = new Date()) {
  const summary = {
    total: promotions.length,
    active: 0,
    expired: 0,
    scheduled: 0,
    inactive: 0,
  }

  promotions.forEach((promotion) => {
    const status = promotionEffectiveStatus(promotion, now)

    if (status === 'activa') summary.active += 1
    else if (status === 'vencida') summary.expired += 1
    else if (status === 'programada') summary.scheduled += 1
    else summary.inactive += 1
  })

  return summary
}

export function roomStatusLabel(status) {
  return ROOM_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

function createRoomId() {
  return crypto.randomUUID ? `room-${crypto.randomUUID()}` : `room-${Date.now()}`
}

function normalizeRoomInput(data, input, roomId = null) {
  const number = String(input.number ?? '').trim()

  if (!number) throw new Error('Ingresa el número de habitación.')
  if (
    data.rooms.some(
      (room) => room.id !== roomId && room.number.toLowerCase() === number.toLowerCase(),
    )
  ) {
    throw new Error(`La habitación ${number} ya está registrada.`)
  }

  if (!ROOM_TYPES.includes(input.type)) {
    throw new Error('Selecciona un tipo de habitación válido.')
  }

  const capacity = Number(input.capacity)
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new Error('La capacidad debe ser un número entero mayor a 0.')
  }

  const price = Number(input.price)
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('El precio por noche debe ser mayor a 0.')
  }

  const status = ROOM_STATUS_OPTIONS.some((option) => option.value === input.status)
    ? input.status
    : 'disponible'

  return {
    number,
    floor: Number(number.charAt(0)) || null,
    type: input.type,
    capacity,
    price: Math.round(price * 100) / 100,
    status,
    image: input.image || defaultRoomImage(input.type),
    description: String(input.description ?? '').trim() || roomDescription(input.type),
  }
}

export function addRoomToData(data, input) {
  const room = {
    id: createRoomId(),
    ...normalizeRoomInput(data, input),
    createdAt: new Date().toISOString(),
  }

  return { ...data, rooms: [...data.rooms, room] }
}

export function updateRoomInData(data, input) {
  const existing = data.rooms.find((room) => room.id === input.id)
  if (!existing) throw new Error('La habitación que intentas editar ya no existe.')

  const fields = normalizeRoomInput(data, input, existing.id)
  const room = { ...existing, ...fields, updatedAt: new Date().toISOString() }

  return {
    ...data,
    rooms: data.rooms.map((item) => (item.id === existing.id ? room : item)),
  }
}

export function deleteRoomFromData(data, roomId) {
  if (!data.rooms.some((room) => room.id === roomId)) {
    throw new Error('La habitación que intentas eliminar ya no existe.')
  }

  return { ...data, rooms: data.rooms.filter((room) => room.id !== roomId) }
}

export function updateRoomStatusInData(data, roomId, status) {
  if (!ROOM_STATUS_OPTIONS.some((option) => option.value === status)) {
    throw new Error('Selecciona un estado válido.')
  }

  if (!data.rooms.some((room) => room.id === roomId)) {
    throw new Error('La habitación seleccionada ya no existe.')
  }

  return {
    ...data,
    rooms: data.rooms.map((room) =>
      room.id === roomId ? { ...room, status, updatedAt: new Date().toISOString() } : room,
    ),
  }
}

const CLIENT_DOCUMENT_RULES = new Map([
  ['DNI', { pattern: /^\d{8}$/, message: 'El DNI debe tener 8 dígitos.' }],
  ['RUC', { pattern: /^\d{11}$/, message: 'El RUC debe tener 11 dígitos.' }],
  [
    'CE',
    {
      pattern: /^[A-Za-z0-9]{9,12}$/,
      message: 'El carné de extranjería debe tener entre 9 y 12 caracteres.',
    },
  ],
])

const CLIENT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CLIENT_PHONE_PATTERN = /^\d{9}$/

function createClientId() {
  return crypto.randomUUID ? `client-${crypto.randomUUID()}` : `client-${Date.now()}`
}

function normalizeClientInput(data, input, clientId = null) {
  const firstName = String(input.firstName ?? '').trim()
  const lastName = String(input.lastName ?? '').trim()

  if (!firstName) throw new Error('Ingresa los nombres del cliente.')
  if (!lastName) throw new Error('Ingresa los apellidos del cliente.')

  const documentType = CLIENT_DOCUMENT_TYPES.some((option) => option.value === input.documentType)
    ? input.documentType
    : 'DNI'
  const document = String(input.document ?? '').trim()
  const documentRule = CLIENT_DOCUMENT_RULES.get(documentType)

  if (!documentRule || !documentRule.pattern.test(document)) {
    throw new Error(documentRule?.message ?? 'Ingresa un documento válido.')
  }

  if (
    data.clients.some(
      (client) =>
        client.id !== clientId &&
        String(client.document ?? '').toLowerCase() === document.toLowerCase(),
    )
  ) {
    throw new Error(`El documento ${document} ya está registrado.`)
  }

  const email = String(input.email ?? '').trim().toLowerCase()
  if (!CLIENT_EMAIL_PATTERN.test(email)) {
    throw new Error('Ingresa un correo electrónico válido.')
  }

  if (
    data.clients.some(
      (client) =>
        client.id !== clientId &&
        String(client.email ?? '').toLowerCase() === email,
    )
  ) {
    throw new Error(`El correo ${email} ya está registrado.`)
  }

  const phone = String(input.phone ?? '').trim()
  if (!CLIENT_PHONE_PATTERN.test(phone)) {
    throw new Error('El teléfono debe tener 9 dígitos.')
  }

  return {
    name: `${firstName} ${lastName}`.trim(),
    documentType,
    document,
    email,
    phone,
    active: input.active !== false,
  }
}

export function addClientToData(data, input, now = new Date()) {
  const fields = normalizeClientInput(data, input)
  const source = input.source === 'web' ? 'web' : 'admin'

  return {
    ...data,
    clients: [
      ...data.clients,
      {
        id: createClientId(),
        ...fields,
        source,
        createdAt: now.toISOString(),
      },
    ],
  }
}

export function updateClientInData(data, input) {
  const existing = data.clients.find((client) => client.id === input.id)
  if (!existing) throw new Error('El cliente que intentas editar ya no existe.')

  const fields = normalizeClientInput(data, input, existing.id)
  const client = { ...existing, ...fields, updatedAt: new Date().toISOString() }

  return {
    ...data,
    clients: data.clients.map((item) => (item.id === existing.id ? client : item)),
  }
}

export function updateClientStatusInData(data, clientId, active) {
  if (typeof active !== 'boolean') {
    throw new Error('Selecciona un estado válido.')
  }

  if (!data.clients.some((client) => client.id === clientId)) {
    throw new Error('El cliente seleccionado ya no existe.')
  }

  return {
    ...data,
    clients: data.clients.map((client) =>
      client.id === clientId ? { ...client, active, updatedAt: new Date().toISOString() } : client,
    ),
  }
}

const SEQUENCE_CONFIG = new Map([
  ['reservation', { collection: 'reservations', idPrefix: 'reservation-', codePrefix: 'HES-' }],
  ['payment', { collection: 'payments', idPrefix: 'payment-', codePrefix: 'PAG-' }],
  ['promotion', { collection: 'promotions', idPrefix: 'promotion-', codePrefix: 'PROM-' }],
])

function sequenceItems(data, collection) {
  if (!data) return []
  if (collection === 'reservations') {
    return Array.isArray(data.reservations) ? data.reservations : []
  }
  if (collection === 'payments') {
    return Array.isArray(data.payments) ? data.payments : []
  }
  if (collection === 'promotions') {
    return Array.isArray(data.promotions) ? data.promotions : []
  }
  return []
}

function numericSuffix(value, prefix) {
  if (typeof value !== 'string' || !value.startsWith(prefix)) return 0
  const suffix = value.slice(prefix.length)
  if (!/^\d+$/.test(suffix)) return 0
  return Number(suffix)
}

export function nextSequence(kind, data) {
  const config = SEQUENCE_CONFIG.get(kind)
  if (!config) throw new Error('Tipo de secuencia no válido.')

  const items = sequenceItems(data, config.collection)
  const highest = items.reduce(
    (current, item) =>
      Math.max(
        current,
        numericSuffix(item?.id, config.idPrefix),
        numericSuffix(item?.code, config.codePrefix),
      ),
    0,
  )

  return highest + 1
}
