const ROOM_TOTAL = 30
const OCCUPIED_ROOMS = 17
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

const ROOM_TYPES = ['Simple', 'Doble', 'Matrimonial', 'Suite']
const PAYMENT_AMOUNTS = [40, 60, 50, 80, 70, 90, 60, 50, 70, 80, 60, 50, 80, 70, 90]
const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
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

  return {
    id: `room-${index + 1}`,
    number,
    floor,
    type,
    capacity: type === 'Simple' ? 1 : type === 'Suite' ? 4 : 2,
    price: 120 + (index % 4) * 40,
    status: index < OCCUPIED_ROOMS ? 'ocupada' : 'disponible',
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
      reservation.status !== 'cancelada' && toDateKey(new Date(reservation.createdAt)) === todayKey,
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
    .filter((reservation) => reservation.status !== 'cancelada')
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, 4)
    .map((reservation) => presentReservation(reservation, data.rooms))

  return {
    rooms: {
      total: data.rooms.length,
      occupied: occupiedRooms,
      available: data.rooms.length - occupiedRooms,
    },
    reservationsToday,
    clients: data.clients.length,
    revenueToday,
    upcomingReservations,
    recentReservations,
  }
}

export function addReservationToData(data, input, now = new Date()) {
  const room = data.rooms.find((item) => item.id === input.roomId)
  const client = data.clients.find((item) => item.id === input.clientId)

  if (!room) throw new Error('La habitación seleccionada no existe.')
  if (!client) throw new Error('El huésped seleccionado no existe.')

  const nights = nightsBetween(input.checkIn, input.checkOut)
  if (nights < 1) throw new Error('La fecha de salida debe ser posterior a la de ingreso.')

  const todayKey = toDateKey(now)
  const status = input.status === 'pendiente' ? 'pendiente' : 'confirmada'
  const coversToday =
    status === 'confirmada' && input.checkIn <= todayKey && input.checkOut > todayKey
  const total = room.price * nights
  reservationSequence += 1

  const reservation = {
    id: `reservation-${reservationSequence}`,
    code: `HES-${String(reservationSequence).padStart(4, '0')}`,
    roomId: room.id,
    clientId: client.id,
    guestName: client.name,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    status,
    nights,
    total,
    createdAt: now.toISOString(),
    paymentIndex: null,
  }

  const payment = input.registerPayment
    ? {
        id: `payment-${reservation.id}`,
        reservationId: reservation.id,
        amount: total,
        method: 'Efectivo',
        paidAt: now.toISOString(),
      }
    : null

  return {
    ...data,
    rooms: data.rooms.map((item) =>
      item.id === room.id && coversToday ? { ...item, status: 'ocupada' } : item,
    ),
    reservations: [reservation, ...data.reservations],
    payments: payment ? [payment, ...data.payments] : data.payments,
  }
}
