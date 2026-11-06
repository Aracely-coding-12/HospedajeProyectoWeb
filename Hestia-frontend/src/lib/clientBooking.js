import {
  hasReservationConflict,
  nightsBetween,
  promotionEffectiveStatus,
} from '../data/hestiaData.js'

const STAY_PROMOTION_CATEGORIES = new Set(['habitacion', 'combos'])

export function roomIsReservable(room) {
  return Boolean(room) && room.status !== 'mantenimiento' && room.status !== 'inactiva'
}

export function roomForReservation(data, reservation) {
  if (!reservation) return null
  return data.rooms.find((room) => room.id === reservation.roomId) ?? null
}

export function paymentForReservation(data, reservationId) {
  return data.payments.find((payment) => payment.reservationId === reservationId) ?? null
}

export function clientReservations(data, clientId) {
  return data.reservations
    .filter((reservation) => reservation.clientId === clientId)
    .map((reservation) => ({
      ...reservation,
      room: roomForReservation(data, reservation),
      payment: paymentForReservation(data, reservation.id),
    }))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
}

export function pendingClientReservations(data, clientId) {
  return clientReservations(data, clientId).filter(
    (reservation) =>
      (reservation.status === 'pendiente' || reservation.status === 'confirmada') &&
      !reservation.payment,
  )
}

export function clientPayments(data, clientId) {
  const reservationIds = new Set(
    data.reservations
      .filter((reservation) => reservation.clientId === clientId)
      .map((reservation) => reservation.id),
  )

  return data.payments
    .filter((payment) => reservationIds.has(payment.reservationId))
    .map((payment) => ({
      ...payment,
      reservation:
        data.reservations.find((reservation) => reservation.id === payment.reservationId) ?? null,
    }))
    .sort((first, second) => {
      const firstDate = first.paidAt ?? first.createdAt ?? ''
      const secondDate = second.paidAt ?? second.createdAt ?? ''
      return secondDate.localeCompare(firstDate)
    })
}

export function resolveStayPromotion(data, code, now = new Date()) {
  const normalized = String(code ?? '').trim().toUpperCase()
  if (!normalized) return null

  const promotion = data.promotions.find(
    (item) => String(item.code ?? '').toUpperCase() === normalized,
  )

  if (!promotion) {
    throw new Error('El código promocional no existe. Revisa el código e inténtalo de nuevo.')
  }
  if (promotion.visibleOnWeb === false) {
    throw new Error('Esta promoción no está disponible en la web.')
  }
  if (promotionEffectiveStatus(promotion, now) !== 'activa') {
    throw new Error('El código promocional no está vigente.')
  }
  if (!STAY_PROMOTION_CATEGORIES.has(promotion.category)) {
    throw new Error('Esta promoción no aplica a reservas de habitación.')
  }

  return promotion
}

export function calculateStayTotals(room, checkIn, checkOut, promotion = null) {
  const nights = nightsBetween(checkIn, checkOut)
  const pricePerNight = Number(room?.price) || 0
  const subtotal = pricePerNight * Math.max(0, nights)
  const discountPercent = promotion ? Number(promotion.discount) || 0 : 0
  const discountAmount = Math.round(subtotal * discountPercent) / 100

  return {
    nights,
    pricePerNight,
    subtotal,
    discountPercent,
    discountAmount,
    total: Math.max(0, subtotal - discountAmount),
  }
}

export function roomsForStay(data, { checkIn, checkOut, excludeId = null }) {
  return data.rooms.filter((room) => {
    if (!roomIsReservable(room)) return false
    if (!checkIn || !checkOut || checkOut <= checkIn) return true

    return !hasReservationConflict(data.reservations, {
      roomId: room.id,
      checkIn,
      checkOut,
      excludeId,
    })
  })
}

export function visiblePromotions(data, now = new Date()) {
  return data.promotions
    .filter((promotion) => promotion.visibleOnWeb !== false)
    .map((promotion) => ({
      ...promotion,
      effectiveStatus: promotionEffectiveStatus(promotion, now),
    }))
    .filter((promotion) => promotion.effectiveStatus !== 'inactiva')
    .sort((first, second) => {
      const order = { activa: 0, programada: 1, vencida: 2 }
      return (order[first.effectiveStatus] ?? 9) - (order[second.effectiveStatus] ?? 9)
    })
}
