const ROOM_TOTAL = 30
const OCCUPIED_ROOMS = 18
const MAINTENANCE_ROOMS = 2
const CLIENT_TOTAL = 320
const TODAY_RESERVATIONS = 15

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

const PAYMENT_AMOUNTS = [40, 60, 50, 80, 70, 90, 60, 50, 70, 80, 60, 50, 80, 70, 90]
const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
  rechazada: 'Rechazada',
}

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

function createRandom(seed) {
  let state = seed

  return function random() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const random = createRandom(20261028)

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
  return Math.max(0, Math.round((end - start) / 86400000))
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
    image: DEFAULT_ROOM_IMAGES[type],
    description: ROOM_DESCRIPTIONS[type],
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
    document: String(10000000 + Math.floor(random() * 9000000)),
    email: `${slugify(firstName)}.${slugify(lastName)}${index + 1}@correo.com`,
    phone: `9${String(Math.floor(random() * 100000000)).padStart(8, '0')}`,
    createdAt: addDays(today, -Math.floor(random() * 720)).toISOString(),
  }
})

let reservationSequence = 0

function createReservation({ index, roomIndex, checkIn, checkOut, createdOn, status, paymentIndex = null }) {
  const room = rooms[roomIndex]
  const client = clients[index]
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

    return {
      id: `payment-${reservation.id}`,
      reservationId: reservation.id,
      amount: PAYMENT_AMOUNTS[reservation.paymentIndex],
      method: 'Tarjeta',
      paidAt: paidAt.toISOString(),
    }
  })

function presentReservation(reservation, roomList) {
  const room = roomList.find((item) => item.id === reservation.roomId)

  return {
    ...reservation,
    roomNumber: room?.number ?? '—',
    roomType: room?.type ?? '',
    statusLabel: STATUS_LABELS[reservation.status] ?? reservation.status,
  }
}

export function createInitialData() {
  return {
    rooms: rooms.map((room) => ({ ...room })),
    clients: clients.map((client) => ({ ...client })),
    reservations: reservations.map((reservation) => ({ ...reservation })),
    payments: payments.map((payment) => ({ ...payment })),
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
    .filter((payment) => toDateKey(new Date(payment.paidAt)) === todayKey)
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

  const status =
    input.status === 'pendiente' || input.status === 'confirmada' ? input.status : 'pendiente'

  return {
    room,
    client,
    checkIn,
    checkOut,
    nights,
    status,
    total: room.price * nights,
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

export function addReservationToData(data, input, now = new Date()) {
  const fields = normalizeReservationInput(data, input, { now })

  reservationSequence += 1
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
    total: fields.total,
    createdAt: now.toISOString(),
    paymentIndex: null,
  }

  const payment = input.registerPayment
    ? {
        id: `payment-${reservation.id}`,
        reservationId: reservation.id,
        amount: fields.total,
        method: 'Efectivo',
        paidAt: now.toISOString(),
      }
    : null

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

  const fields = normalizeReservationInput(data, input, {
    excludeId: existing.id,
    allowPast: true,
    now,
  })

  const reservation = {
    ...existing,
    roomId: fields.room.id,
    clientId: fields.client.id,
    guestName: fields.client.name,
    checkIn: fields.checkIn,
    checkOut: fields.checkOut,
    status: fields.status,
    nights: fields.nights,
    total: fields.total,
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
  }
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
    image: input.image || DEFAULT_ROOM_IMAGES[input.type],
    description: String(input.description ?? '').trim() || ROOM_DESCRIPTIONS[input.type],
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
