import { useState } from 'react'
import {
  paymentStatusLabel,
  reservationCancellationPolicy,
  reservationStatusLabel,
} from '../data/hestiaData.js'
import {
  calculateStayTotals,
  clientReservations,
  roomIsReservable,
  roomsForStay,
  resolveStayPromotion,
} from '../lib/clientBooking.js'
import { addDaysKey, formatShortDate, formatSoles, todayKey } from '../lib/format.js'
import {
  AlertIcon,
  BedIcon,
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  TagIcon,
  UsersIcon,
} from '../components/cliente/icons.jsx'
import {
  dangerButtonClass,
  EmptyState,
  fieldErrorClass,
  inputClass,
  labelClass,
  Modal,
  Notice,
  PageHeading,
  primaryButtonClass,
  secondaryButtonClass,
  StatusBadge,
} from '../components/cliente/ui.jsx'

function AuthRequired({ onRequireAuth }) {
  return (
    <EmptyState
      icon={UsersIcon}
      title="Inicia sesión para reservar"
      description="Crea tu cuenta de cliente o ingresa con tu correo para elegir fechas, reservar y revisar tus estadías."
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => onRequireAuth('login')}
            className={secondaryButtonClass}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => onRequireAuth('register')}
            className={primaryButtonClass}
          >
            Crear cuenta
          </button>
        </div>
      }
    />
  )
}

function ReservationCard({ reservation, onPay, onCancel }) {
  const policy = reservationCancellationPolicy(reservation)
  const canCancel =
    policy.allowed &&
    (reservation.status === 'pendiente' || reservation.status === 'confirmada')
  const canPay =
    !reservation.payment &&
    (reservation.status === 'pendiente' || reservation.status === 'confirmada')

  return (
    <article className="rounded-xl border border-amber-400/30 bg-[#080705] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold tracking-wider text-amber-200">
            {reservation.code}
          </p>
          <p className="mt-1 text-[11px] text-stone-500">
            Registrada el {formatShortDate(reservation.createdAt.slice(0, 10))}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            status={reservation.status}
            label={reservationStatusLabel(reservation.status)}
          />
          {reservation.payment ? (
            <StatusBadge
              status={reservation.payment.status}
              label={paymentStatusLabel(reservation.payment.status)}
            />
          ) : (
            <StatusBadge status="pendiente" label="Pago pendiente" />
          )}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-stone-500">
            <BedIcon className="h-3.5 w-3.5" /> Habitación
          </dt>
          <dd className="mt-1 text-sm font-semibold text-stone-200">
            {reservation.room ? `${reservation.room.number} · ${reservation.room.type}` : '—'}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-stone-500">
            <CalendarIcon className="h-3.5 w-3.5" /> Estadía
          </dt>
          <dd className="mt-1 text-sm font-semibold text-stone-200">
            {formatShortDate(reservation.checkIn)} – {formatShortDate(reservation.checkOut)}
          </dd>
          <p className="text-[10px] text-stone-500">
            {reservation.nights} {reservation.nights === 1 ? 'noche' : 'noches'}
          </p>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-stone-500">
            <UsersIcon className="h-3.5 w-3.5" /> Huéspedes
          </dt>
          <dd className="mt-1 text-sm font-semibold text-stone-200">
            {reservation.guests ?? 1}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-stone-500">Total</dt>
          <dd className="mt-1 text-base font-bold text-amber-200">
            {formatSoles(reservation.total)}
          </dd>
          {reservation.discountAmount > 0 && (
            <p className="text-[10px] text-emerald-300">
              Descuento {reservation.discountPercent}% · {reservation.promotionCode}
            </p>
          )}
        </div>
      </dl>

      {(canPay || canCancel || reservation.payment) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-amber-400/10 pt-3">
          {canPay && (
            <button type="button" onClick={() => onPay(reservation)} className={primaryButtonClass}>
              <CreditCardIcon className="h-4 w-4" /> Pagar ahora
            </button>
          )}
          {reservation.payment && (
            <button
              type="button"
              onClick={() => onPay(reservation)}
              className={secondaryButtonClass}
            >
              Ver pago
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel(reservation)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-500/50 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/50"
            >
              Cancelar reserva
            </button>
          )}
          {!canCancel && (reservation.status === 'cancelada' || reservation.status === 'rechazada') && (
            <p className="self-center text-[10px] text-stone-500">{policy.message}</p>
          )}
        </div>
      )}
    </article>
  )
}

function ReservaCliente({
  session,
  profile,
  data,
  initialRoomId = '',
  initialPromotionCode = '',
  initialTab = 'nueva',
  onCreateReservation,
  onCancelReservation,
  onGoToPayment,
  onRequireAuth,
}) {
  const [tab, setTab] = useState(initialTab)
  const [form, setForm] = useState(() => ({
    roomId: initialRoomId,
    checkIn: todayKey(),
    checkOut: addDaysKey(todayKey(), 1),
    guests: '2',
    promotionCode: initialPromotionCode ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [promoError, setPromoError] = useState('')
  const [appliedPromotion, setAppliedPromotion] = useState(() => {
    if (!initialPromotionCode) return null
    try {
      return resolveStayPromotion(data, initialPromotionCode)
    } catch {
      return null
    }
  })
  const [notice, setNotice] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  if (!session) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Tu estadía"
          title="Reservas"
          description="Elige tus fechas y la habitación que quieres disfrutar en Cusco."
        />
        <div className="mt-6">
          <AuthRequired onRequireAuth={onRequireAuth} />
        </div>
      </section>
    )
  }

  const reservations = clientReservations(data, session.id)
  const roomOptions = data.rooms.filter(roomIsReservable)
  const availableIds = new Set(
    roomsForStay(data, { checkIn: form.checkIn, checkOut: form.checkOut }).map(
      (room) => room.id,
    ),
  )
  const selectedRoom = data.rooms.find((room) => room.id === form.roomId) ?? null
  const totals = calculateStayTotals(
    selectedRoom,
    form.checkIn,
    form.checkOut,
    appliedPromotion,
  )

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => {
      if (name === 'checkIn') {
        const nextCheckOut =
          current.checkOut <= value ? addDaysKey(value, 1) : current.checkOut
        return { ...current, checkIn: value, checkOut: nextCheckOut }
      }
      if (name === 'roomId') {
        const room = data.rooms.find((item) => item.id === value)
        const guests = room
          ? String(Math.min(Number(current.guests) || 1, room.capacity))
          : current.guests
        return { ...current, roomId: value, guests }
      }
      return { ...current, [name]: value }
    })
    setErrors((current) => ({ ...current, [name]: undefined }))
    setNotice(null)
  }

  function handleApplyPromotion() {
    setPromoError('')
    setNotice(null)
    if (!form.promotionCode.trim()) {
      setAppliedPromotion(null)
      return
    }

    try {
      const promotion = resolveStayPromotion(data, form.promotionCode)
      setAppliedPromotion(promotion)
    } catch (error) {
      setAppliedPromotion(null)
      setPromoError(error instanceof Error ? error.message : 'Código promocional no válido.')
    }
  }

  function validate() {
    const nextErrors = {}
    if (!form.roomId) nextErrors.roomId = 'Selecciona una habitación.'
    if (!form.checkIn) nextErrors.checkIn = 'Selecciona la fecha de ingreso.'
    else if (form.checkIn < todayKey()) {
      nextErrors.checkIn = 'La fecha de ingreso no puede ser anterior a hoy.'
    }
    if (!form.checkOut) nextErrors.checkOut = 'Selecciona la fecha de salida.'
    else if (form.checkOut <= form.checkIn) {
      nextErrors.checkOut = 'La fecha de salida debe ser posterior a la de ingreso.'
    }

    const guests = Number(form.guests)
    if (!Number.isInteger(guests) || guests < 1) {
      nextErrors.guests = 'Indica al menos un huésped.'
    } else if (selectedRoom && guests > selectedRoom.capacity) {
      nextErrors.guests = `La habitación admite hasta ${selectedRoom.capacity} huéspedes.`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice(null)
    setPromoError('')

    let promotion = appliedPromotion
    if (form.promotionCode.trim() && !promotion) {
      try {
        promotion = resolveStayPromotion(data, form.promotionCode)
        setAppliedPromotion(promotion)
      } catch (error) {
        setPromoError(error instanceof Error ? error.message : 'Código promocional no válido.')
        return
      }
    }

    if (!validate()) return

    setSubmitting(true)
    try {
      const reservation = await onCreateReservation({
        roomId: form.roomId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
        promotionCode: promotion?.code ?? '',
      })

      setNotice({
        type: 'success',
        message: `Reserva ${reservation.code} recibida. El administrador revisará y confirmará tu solicitud.`,
      })
      setTab('mis-reservas')
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo crear la reserva.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) return

    setCancelling(true)
    setCancelError('')
    try {
      await onCancelReservation(cancelTarget.id)
      setNotice({
        type: 'success',
        message: `Reserva ${cancelTarget.code} cancelada correctamente.`,
      })
      setCancelTarget(null)
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : 'No se pudo cancelar la reserva.')
    } finally {
      setCancelling(false)
    }
  }

  const pendingCount = reservations.filter(
    (reservation) => reservation.status === 'pendiente' || reservation.status === 'confirmada',
  ).length

  return (
    <>
      <section className="border-b border-amber-400/15 bg-[#070605]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            eyebrow="Tu estadía"
            title="Reservas"
            description={`Hola, ${profile?.name ?? session.name}. Elige tus fechas y la habitación que quieres disfrutar en Cusco.`}
            action={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTab('nueva')}
                  className={tab === 'nueva' ? primaryButtonClass : secondaryButtonClass}
                >
                  Nueva reserva
                </button>
                <button
                  type="button"
                  onClick={() => setTab('mis-reservas')}
                  className={tab === 'mis-reservas' ? primaryButtonClass : secondaryButtonClass}
                >
                  Mis reservas ({pendingCount})
                </button>
              </div>
            }
          />

          {notice && (
            <Notice
              type={notice.type}
              message={notice.message}
              onClose={() => setNotice(null)}
              className="mt-5"
            />
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === 'nueva' ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-xl border border-amber-400/30 bg-[#080705] p-5"
            >
              <h2 className="text-lg font-semibold text-white">Datos de la reserva</h2>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                La disponibilidad se valida con las fechas que elijas. La solicitud queda
                pendiente hasta que el administrador la confirme.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="client-booking-room" className={labelClass}>
                    Habitación: *
                  </label>
                  <select
                    id="client-booking-room"
                    name="roomId"
                    value={form.roomId}
                    onChange={handleChange}
                    className={inputClass}
                    aria-invalid={Boolean(errors.roomId)}
                    aria-describedby={errors.roomId ? 'client-booking-room-error' : undefined}
                  >
                    <option value="" className="bg-[#0b0a07]">
                      Selecciona una habitación
                    </option>
                    {roomOptions.map((room) => {
                      const conflict = !availableIds.has(room.id)
                      return (
                        <option
                          key={room.id}
                          value={room.id}
                          disabled={conflict}
                          className="bg-[#0b0a07]"
                        >
                          Hab. {room.number} · {room.type} · {formatSoles(room.price)} / noche ·{' '}
                          {room.capacity} huéspedes{conflict ? ' · no disponible en estas fechas' : ''}
                        </option>
                      )
                    })}
                  </select>
                  {errors.roomId && (
                    <p id="client-booking-room-error" className={fieldErrorClass}>
                      {errors.roomId}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="client-booking-check-in" className={labelClass}>
                    Fecha de ingreso: *
                  </label>
                  <input
                    id="client-booking-check-in"
                    name="checkIn"
                    type="date"
                    min={todayKey()}
                    value={form.checkIn}
                    onChange={handleChange}
                    className={inputClass}
                    aria-invalid={Boolean(errors.checkIn)}
                    aria-describedby={errors.checkIn ? 'client-booking-check-in-error' : undefined}
                  />
                  {errors.checkIn && (
                    <p id="client-booking-check-in-error" className={fieldErrorClass}>
                      {errors.checkIn}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="client-booking-check-out" className={labelClass}>
                    Fecha de salida: *
                  </label>
                  <input
                    id="client-booking-check-out"
                    name="checkOut"
                    type="date"
                    min={addDaysKey(form.checkIn || todayKey(), 1)}
                    value={form.checkOut}
                    onChange={handleChange}
                    className={inputClass}
                    aria-invalid={Boolean(errors.checkOut)}
                    aria-describedby={errors.checkOut ? 'client-booking-check-out-error' : undefined}
                  />
                  {errors.checkOut && (
                    <p id="client-booking-check-out-error" className={fieldErrorClass}>
                      {errors.checkOut}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="client-booking-guests" className={labelClass}>
                    Huéspedes: *
                  </label>
                  <input
                    id="client-booking-guests"
                    name="guests"
                    type="number"
                    min="1"
                    max={selectedRoom?.capacity ?? 4}
                    step="1"
                    value={form.guests}
                    onChange={handleChange}
                    className={inputClass}
                    aria-invalid={Boolean(errors.guests)}
                    aria-describedby={errors.guests ? 'client-booking-guests-error' : undefined}
                  />
                  {errors.guests && (
                    <p id="client-booking-guests-error" className={fieldErrorClass}>
                      {errors.guests}
                    </p>
                  )}
                  {selectedRoom && (
                    <p className="mt-1.5 text-[10px] text-stone-500">
                      Capacidad máxima: {selectedRoom.capacity} huéspedes.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="client-booking-promo" className={labelClass}>
                    Código promocional (opcional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="client-booking-promo"
                      name="promotionCode"
                      type="text"
                      value={form.promotionCode}
                      onChange={(event) => {
                        handleChange(event)
                        setAppliedPromotion(null)
                        setPromoError('')
                      }}
                      placeholder="PROM-0001"
                      className={`${inputClass} font-mono uppercase tracking-wider`}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromotion}
                      className={`${secondaryButtonClass} shrink-0 px-3 text-xs`}
                    >
                      Aplicar
                    </button>
                  </div>
                  {promoError && <p className={fieldErrorClass}>{promoError}</p>}
                  {appliedPromotion && (
                    <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-emerald-300">
                      <CheckIcon className="h-3 w-3" />
                      {appliedPromotion.name} · {appliedPromotion.discount}% de descuento
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-[11px] leading-5 text-stone-400">
                Al enviar la solicitud, el administrador recibirá una notificación con tus
                datos y fechas. Podrás pagar en línea después de que la reserva sea revisada.
              </div>

              <button
                type="submit"
                disabled={submitting || roomOptions.length === 0}
                className={`${primaryButtonClass} mt-5 w-full sm:w-auto`}
              >
                {submitting ? 'Enviando solicitud…' : 'Solicitar reserva'}
              </button>
            </form>

            <aside className="rounded-xl border border-amber-400/40 bg-[#080705] p-5 xl:sticky xl:top-20">
              <h2 className="text-base font-semibold text-white">Resumen</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-stone-500">Habitación</span>
                  <span className="text-right text-stone-200">
                    {selectedRoom
                      ? `${selectedRoom.number} · ${selectedRoom.type}`
                      : 'Sin seleccionar'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-stone-500">Fechas</span>
                  <span className="text-right text-stone-200">
                    {form.checkIn ? formatShortDate(form.checkIn) : '—'} –{' '}
                    {form.checkOut ? formatShortDate(form.checkOut) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-500">Noches</span>
                  <span className="text-stone-200">{totals.nights}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-500">Huéspedes</span>
                  <span className="text-stone-200">{form.guests || 0}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-500">Precio por noche</span>
                  <span className="text-stone-200">{formatSoles(totals.pricePerNight)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-amber-400/10 pt-3">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-stone-200">{formatSoles(totals.subtotal)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex items-center justify-between gap-3 text-emerald-300">
                    <span>Descuento {totals.discountPercent}%</span>
                    <span>- {formatSoles(totals.discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 border-t border-amber-400/20 pt-3">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-xl font-bold text-amber-200">
                    {formatSoles(totals.total)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-400/20 bg-black/30 px-3 py-2.5">
                <TagIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80" />
                <p className="text-[10px] leading-4 text-stone-500">
                  Las promociones de habitación o combos se aplican al subtotal de la estadía.
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Mis reservas</h2>
              <button
                type="button"
                onClick={() => setTab('nueva')}
                className={primaryButtonClass}
              >
                Nueva reserva
              </button>
            </div>

            {reservations.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={CalendarIcon}
                  title="Aún no tienes reservas"
                  description="Elige tus fechas y la habitación que quieres disfrutar. Tu solicitud llegará al administrador."
                  action={
                    <button
                      type="button"
                      onClick={() => setTab('nueva')}
                      className={primaryButtonClass}
                    >
                      Hacer mi primera reserva
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                {reservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onPay={() => onGoToPayment(reservation.id)}
                    onCancel={setCancelTarget}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => {
          if (!cancelling) {
            setCancelTarget(null)
            setCancelError('')
          }
        }}
        title="Cancelar reserva"
        description={
          cancelTarget
            ? `${cancelTarget.code} · ${formatShortDate(cancelTarget.checkIn)} al ${formatShortDate(
                cancelTarget.checkOut,
              )}`
            : ''
        }
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              disabled={cancelling}
              className={secondaryButtonClass}
            >
              Volver
            </button>
            <button
              type="button"
              onClick={confirmCancel}
              disabled={cancelling}
              className={dangerButtonClass}
            >
              {cancelling ? 'Cancelando…' : 'Confirmar cancelación'}
            </button>
          </>
        }
      >
        {cancelTarget && (
          <div>
            <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs leading-5 text-rose-100">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{reservationCancellationPolicy(cancelTarget).message}</p>
            </div>
            {cancelError && (
              <p className="mt-3 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                {cancelError}
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

export default ReservaCliente
