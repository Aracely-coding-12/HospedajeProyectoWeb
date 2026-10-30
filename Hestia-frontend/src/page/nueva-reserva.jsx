import { useState } from 'react'
import { nightsBetween } from '../data/hestiaData.js'
import { addDaysKey, formatLongDate, formatShortDate, formatSoles, todayKey } from '../lib/format.js'

function BackIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-amber-100/90'

function fieldClass(hasError = false) {
  return [
    'w-full rounded-md border bg-[#0b0a07] px-3.5 py-2.5 text-sm text-amber-50 outline-none transition',
    'placeholder:text-stone-600 focus:ring-2',
    hasError
      ? 'border-rose-500/80 focus:border-rose-400 focus:ring-rose-500/15'
      : 'border-amber-400/55 focus:border-amber-300 focus:ring-amber-400/15',
  ].join(' ')
}

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-[11px] leading-4 text-rose-400">
      {children}
    </p>
  )
}

function NuevaReserva({ clients, rooms, onCancel, onSave }) {
  const currentToday = todayKey()
  const availableRooms = rooms.filter((room) => room.status === 'disponible')
  const [form, setForm] = useState({
    clientId: '',
    roomId: '',
    checkIn: currentToday,
    checkOut: addDaysKey(currentToday, 1),
    status: 'confirmada',
    registerPayment: true,
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)

  const selectedRoom = rooms.find((room) => room.id === form.roomId)
  const nights = nightsBetween(form.checkIn, form.checkOut)
  const total = selectedRoom ? selectedRoom.price * nights : 0

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox' ? checked : value

    setForm((current) => {
      const next = { ...current, [name]: nextValue }
      if (name === 'checkIn' && next.checkOut <= nextValue) {
        next.checkOut = addDaysKey(nextValue, 1)
      }
      return next
    })
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFormError(null)
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.clientId) nextErrors.clientId = 'Selecciona al huésped.'
    if (!form.roomId) nextErrors.roomId = 'Selecciona una habitación disponible.'
    if (!form.checkIn) nextErrors.checkIn = 'Ingresa la fecha de ingreso.'
    else if (form.checkIn < currentToday) nextErrors.checkIn = 'La fecha de ingreso no puede ser anterior a hoy.'
    if (!form.checkOut) nextErrors.checkOut = 'Ingresa la fecha de salida.'
    else if (form.checkOut <= form.checkIn) nextErrors.checkOut = 'La salida debe ser posterior al ingreso.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      onSave(form)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar la reserva.')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="group inline-flex items-center gap-2 text-xs font-medium text-stone-400 transition hover:text-amber-300"
      >
        <BackIcon className="h-4 w-4 transition group-hover:-translate-x-0.5" />
        Volver al inicio
      </button>

      <header className="mt-5">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">Nueva reserva</h1>
        <p className="mt-1 text-xs text-stone-500">
          Completa los datos para registrar la reserva. {formatLongDate()}
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-md border border-amber-400 bg-[#080705] p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
            Datos de la reserva
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="reservation-client" className={labelClass}>
                Huésped registrado:
              </label>
              <select
                id="reservation-client"
                name="clientId"
                value={form.clientId}
                onChange={handleChange}
                className={fieldClass(Boolean(errors.clientId))}
                aria-invalid={Boolean(errors.clientId)}
                aria-describedby={errors.clientId ? 'reservation-client-error' : undefined}
              >
                <option value="">Selecciona un huésped</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} — Doc. {client.document}
                  </option>
                ))}
              </select>
              {errors.clientId && <FieldError id="reservation-client-error">{errors.clientId}</FieldError>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="reservation-room" className={labelClass}>
                Habitación:
              </label>
              <select
                id="reservation-room"
                name="roomId"
                value={form.roomId}
                onChange={handleChange}
                disabled={availableRooms.length === 0}
                className={fieldClass(Boolean(errors.roomId))}
                aria-invalid={Boolean(errors.roomId)}
                aria-describedby={errors.roomId ? 'reservation-room-error' : undefined}
              >
                <option value="">Selecciona una habitación disponible</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Hab. {room.number} · {room.type} · {formatSoles(room.price)} / noche
                  </option>
                ))}
              </select>
              {errors.roomId && <FieldError id="reservation-room-error">{errors.roomId}</FieldError>}
              {availableRooms.length === 0 && (
                <p className="mt-1.5 text-[11px] leading-4 text-amber-300/80">
                  No hay habitaciones disponibles en este momento.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reservation-checkin" className={labelClass}>
                Fecha de ingreso:
              </label>
              <input
                id="reservation-checkin"
                name="checkIn"
                type="date"
                min={currentToday}
                value={form.checkIn}
                onChange={handleChange}
                className={fieldClass(Boolean(errors.checkIn))}
                aria-invalid={Boolean(errors.checkIn)}
                aria-describedby={errors.checkIn ? 'reservation-checkin-error' : undefined}
              />
              {errors.checkIn && <FieldError id="reservation-checkin-error">{errors.checkIn}</FieldError>}
            </div>

            <div>
              <label htmlFor="reservation-checkout" className={labelClass}>
                Fecha de salida:
              </label>
              <input
                id="reservation-checkout"
                name="checkOut"
                type="date"
                min={addDaysKey(form.checkIn || currentToday, 1)}
                value={form.checkOut}
                onChange={handleChange}
                className={fieldClass(Boolean(errors.checkOut))}
                aria-invalid={Boolean(errors.checkOut)}
                aria-describedby={errors.checkOut ? 'reservation-checkout-error' : undefined}
              />
              {errors.checkOut && <FieldError id="reservation-checkout-error">{errors.checkOut}</FieldError>}
            </div>

            <div>
              <label htmlFor="reservation-status" className={labelClass}>
                Estado:
              </label>
              <select
                id="reservation-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={fieldClass()}
              >
                <option value="confirmada">Confirmada</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-amber-400/25 bg-black/30 px-3.5 py-2.5 text-xs text-stone-300 transition hover:border-amber-400/50">
                <input
                  type="checkbox"
                  name="registerPayment"
                  checked={form.registerPayment}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-amber-400"
                />
                <span>
                  Registrar el pago hoy
                  <span className="mt-0.5 block text-[10px] text-stone-500">
                    {total > 0 ? `Se registrará ${formatSoles(total)} en los ingresos.` : 'Selecciona una habitación para calcular el monto.'}
                  </span>
                </span>
              </label>
            </div>
          </div>

          {formError && (
            <p role="alert" className="mt-5 rounded-md border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
              {formError}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-amber-400/15 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-stone-600 px-4 py-2.5 text-sm font-medium text-stone-300 transition hover:border-stone-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-5 py-2.5 text-sm font-bold text-black shadow-[0_12px_30px_-14px_rgba(245,200,66,0.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
            >
              Guardar reserva
            </button>
          </div>
        </section>

        <aside className="rounded-md border border-amber-400/60 bg-[#080705] p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Resumen</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-stone-500">Habitación</dt>
              <dd className="text-right font-medium text-amber-50">
                {selectedRoom ? `Hab. ${selectedRoom.number}` : 'Sin seleccionar'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-stone-500">Tipo</dt>
              <dd className="text-right text-stone-300">{selectedRoom?.type ?? '—'}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-stone-500">Capacidad</dt>
              <dd className="text-right text-stone-300">
                {selectedRoom ? `${selectedRoom.capacity} huésped${selectedRoom.capacity > 1 ? 'es' : ''}` : '—'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-stone-500">Tarifa por noche</dt>
              <dd className="text-right text-stone-300">
                {selectedRoom ? formatSoles(selectedRoom.price) : '—'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-stone-500">Noches</dt>
              <dd className="text-right font-medium text-amber-50">{nights}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-stone-500">Ingreso</dt>
              <dd className="text-right text-stone-300">{formatShortDate(form.checkIn)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-stone-500">Salida</dt>
              <dd className="text-right text-stone-300">{formatShortDate(form.checkOut)}</dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-amber-400/20 pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Total</span>
              <span className="text-2xl font-bold text-amber-300">{formatSoles(total)}</span>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-stone-500">
              {form.registerPayment
                ? 'El pago se sumará al ingreso del día al guardar la reserva.'
                : 'No se registrará ningún pago hoy.'}
            </p>
          </div>
        </aside>
      </form>
    </>
  )
}

export default NuevaReserva
