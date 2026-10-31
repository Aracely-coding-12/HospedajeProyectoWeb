import { useRef, useState } from 'react'
import {
  RESERVATION_STATUS_OPTIONS,
  ROOM_TYPES,
  hasReservationConflict,
  nightsBetween,
  reservationCancellationPolicy,
  reservationStatusLabel,
} from '../data/hestiaData.js'
import {
  addDaysKey,
  formatLongDate,
  formatShortDate,
  formatSoles,
  todayKey,
} from '../lib/format.js'

const STATUS_STYLES = new Map([
  ['pendiente', 'border-amber-400/60 bg-amber-400/10 text-amber-200'],
  ['confirmada', 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'],
  ['finalizada', 'border-sky-400/50 bg-sky-400/10 text-sky-200'],
  ['cancelada', 'border-rose-500/50 bg-rose-500/10 text-rose-200'],
  ['rechazada', 'border-stone-500/60 bg-stone-500/10 text-stone-300'],
])

function statusStyle(status) {
  return STATUS_STYLES.get(status) ?? STATUS_STYLES.get('rechazada')
}

const ACTION_CONFIG = new Map([
  [
    'reject',
    (reservation) => ({
      title: `Rechazar solicitud ${reservation.code}`,
      description:
        'La solicitud pasará a Rechazada y la habitación quedará libre para esas fechas. Esta acción no se puede deshacer.',
      confirmLabel: 'Rechazar solicitud',
    }),
  ],
  [
    'cancel',
    (reservation) => ({
      title: `Cancelar reserva ${reservation.code}`,
      description:
        'La reserva pasará a Cancelada y la habitación se liberará para esas fechas. Esta acción no se puede deshacer.',
      confirmLabel: 'Cancelar reserva',
    }),
  ],
  [
    'delete',
    (reservation) => ({
      title: `Eliminar reserva ${reservation.code}`,
      description:
        'Se eliminará el registro del historial. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
    }),
  ],
])

const ACTION_MESSAGES = new Map([
  ['reject', (reservation) => `Solicitud ${reservation.code} rechazada.`],
  ['cancel', (reservation) => `Reserva ${reservation.code} cancelada.`],
  ['delete', (reservation) => `Reserva ${reservation.code} eliminada.`],
])

const FORM_STATUS_OPTIONS = RESERVATION_STATUS_OPTIONS.filter(
  (option) => option.value === 'pendiente' || option.value === 'confirmada',
)

const fieldClass =
  'w-full rounded-md border border-amber-400/55 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15'

const labelClass = 'mb-1.5 block text-[11px] font-medium tracking-wide text-amber-100/90'

function SearchIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true" className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  )
}

function EyeIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M2.5 12S5.5 6.5 12 6.5 21.5 12 21.5 12 18.5 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}

function PencilIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" strokeLinejoin="round" />
      <path d="m13.5 6.5 4 4" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className={className}>
      <path d="m5 12.5 4.2 4.2L19 6.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true" className={className}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function BanIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m6 6 12 12" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M5 7h14M9 7V4.8A.8.8 0 0 1 9.8 4h4.4a.8.8 0 0 1 .8.8V7m-8 0 1 12.2a1 1 0 0 0 1 .8h6.4a1 1 0 0 0 1-.8L17 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" strokeLinecap="round" />
    </svg>
  )
}

function AlertIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className={className}>
      <path d="M12 7v6" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function UsersIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
      <path d="M16 5.8a3 3 0 0 1 0 5.4M17.5 14.3a5 5 0 0 1 3 4.7" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
    </svg>
  )
}

function tableDate(dateKey) {
  if (!dateKey) return '—'
  const [year, month, day] = dateKey.split('-')
  return `${day}/${month}/${year.slice(2)}`
}

function searchableDate(dateKey) {
  if (!dateKey) return ''
  const [year, month, day] = dateKey.split('-')
  return `${day}/${month}/${year}`
}

function isEditableStatus(status) {
  return status === 'pendiente' || status === 'confirmada'
}

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-md border border-amber-400 bg-[#080705] px-5 py-4">
      <dt className="text-xs font-medium tracking-wide text-stone-100">{label}</dt>
      <dd>
        <span className="mt-2 block text-[30px] font-bold leading-none tracking-tight text-white">
          {value}
        </span>
        {note && <span className="mt-2 block text-[11px] leading-4 text-stone-500">{note}</span>}
      </dd>
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusStyle(status)}`}
    >
      {reservationStatusLabel(status)}
    </span>
  )
}

function PageNotice({ notice, onClose }) {
  const success = notice.type === 'success'

  return (
    <div
      role="status"
      className={`mt-5 flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${
        success
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
          : 'border-rose-500/40 bg-rose-500/10 text-rose-100'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          success ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'
        }`}
      >
        {success ? <CheckIcon className="h-3 w-3" /> : <AlertIcon className="h-3 w-3" />}
      </span>
      <p className="flex-1">{notice.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar aviso"
        className="rounded p-0.5 opacity-80 transition hover:bg-white/5 hover:opacity-100"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

function RowAction({ label, onClick, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 ${className}`}
    >
      {children}
    </button>
  )
}

function ReservationDetail({
  reservation,
  onClose,
  onEdit,
  onConfirm,
  onReject,
  onCancel,
  onDelete,
}) {
  const { client, room, payment } = reservation
  const policy = reservationCancellationPolicy(reservation)
  const editable = isEditableStatus(reservation.status)
  const removable = reservation.status === 'cancelada' || reservation.status === 'rechazada'

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-amber-500/50 bg-[#0b0a07] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-amber-400/20 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">
              Detalle de la reserva
            </p>
            <h2 id="reservation-detail-title" className="mt-1 text-xl font-bold text-white">
              {reservation.code}
            </h2>
            <div className="mt-2">
              <StatusBadge status={reservation.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="rounded-md p-1.5 text-stone-400 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <section className="rounded-md border border-amber-400/20 bg-black/25 p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
              <UsersIcon className="h-4 w-4" />
              Cliente
            </h3>
            <dl className="mt-3 space-y-2 text-xs">
              <div>
                <dt className="text-stone-500">Nombres</dt>
                <dd className="mt-0.5 font-medium text-amber-50">
                  {client?.name ?? reservation.guestName}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Documento</dt>
                <dd className="mt-0.5 text-stone-200">{client?.document ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Correo electrónico</dt>
                <dd className="mt-0.5 break-all text-stone-200">{client?.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Celular</dt>
                <dd className="mt-0.5 text-stone-200">{client?.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Cliente desde</dt>
                <dd className="mt-0.5 text-stone-300">
                  {client ? formatShortDate(client.createdAt.slice(0, 10)) : '—'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-md border border-amber-400/20 bg-black/25 p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
              <CalendarIcon className="h-4 w-4" />
              Estadía
            </h3>
            <dl className="mt-3 space-y-2 text-xs">
              <div>
                <dt className="text-stone-500">Habitación</dt>
                <dd className="mt-0.5 font-medium text-amber-50">
                  {room ? `${room.number} · ${room.type}` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Fechas</dt>
                <dd className="mt-0.5 text-stone-200">
                  {formatShortDate(reservation.checkIn)} – {formatShortDate(reservation.checkOut)}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Noches</dt>
                <dd className="mt-0.5 text-stone-200">{reservation.nights}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Total</dt>
                <dd className="mt-0.5 font-semibold text-amber-300">
                  {formatSoles(reservation.total)}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Pago</dt>
                <dd className="mt-0.5 text-stone-300">
                  {payment ? `Registrado · ${formatSoles(payment.amount)}` : 'Sin pago registrado'}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <footer className="border-t border-amber-400/20 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {reservation.status === 'pendiente' && (
              <>
                <button
                  type="button"
                  onClick={() => onConfirm(reservation)}
                  className="rounded-md bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400"
                >
                  Confirmar solicitud
                </button>
                <button
                  type="button"
                  onClick={() => onReject(reservation)}
                  className="rounded-md border border-rose-500/60 px-3.5 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10"
                >
                  Rechazar
                </button>
              </>
            )}
            {editable && (
              <button
                type="button"
                onClick={() => onEdit(reservation)}
                className="rounded-md border border-amber-400/60 px-3.5 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/10"
              >
                Editar reserva
              </button>
            )}
            {policy.allowed && (
              <button
                type="button"
                onClick={() => onCancel(reservation)}
                className="rounded-md border border-stone-600 px-3.5 py-2 text-xs font-medium text-stone-300 transition hover:border-rose-400/60 hover:text-rose-200"
              >
                Cancelar reserva
              </button>
            )}
            {removable && (
              <button
                type="button"
                onClick={() => onDelete(reservation)}
                className="rounded-md border border-rose-500/50 px-3.5 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/10"
              >
                Eliminar registro
              </button>
            )}
          </div>
          {policy.allowed && (
            <p
              className={`mt-3 text-[11px] leading-5 ${
                policy.late ? 'text-amber-300/90' : 'text-stone-500'
              }`}
            >
              {policy.message}
            </p>
          )}
        </footer>
      </div>
    </div>
  )
}

function ActionDialog({ action, onCancel, onConfirm }) {
  const { type, reservation } = action
  const policy = type === 'cancel' ? reservationCancellationPolicy(reservation) : null

  const config = ACTION_CONFIG.get(type)?.(reservation)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reservation-action-title"
        aria-describedby="reservation-action-description"
        className="w-full max-w-md rounded-xl border border-rose-500/50 bg-[#0b0a07] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300">
          {type === 'delete' ? <TrashIcon className="h-5 w-5" /> : <AlertIcon className="h-5 w-5" />}
        </span>
        <h2 id="reservation-action-title" className="mt-4 text-lg font-semibold text-white">
          {config.title}
        </h2>
        <p id="reservation-action-description" className="mt-2 text-sm leading-6 text-stone-400">
          {config.description}
        </p>
        {policy?.allowed && (
          <p
            className={`mt-3 rounded-md border px-3 py-2 text-xs leading-5 ${
              policy.late
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                : 'border-stone-600/60 bg-black/30 text-stone-400'
            }`}
          >
            {policy.message}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-stone-600 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-stone-400 hover:text-white"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReservationForm({
  reservation,
  clients,
  rooms,
  reservations,
  onSave,
  onCancelEdit,
  formRef,
}) {
  const today = todayKey()
  const editing = Boolean(reservation)
  const [form, setForm] = useState(() =>
    reservation
      ? {
          clientId: reservation.clientId,
          roomId: reservation.roomId,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          status: reservation.status,
          registerPayment: false,
        }
      : {
          clientId: '',
          roomId: '',
          checkIn: today,
          checkOut: addDaysKey(today, 1),
          status: 'pendiente',
          registerPayment: false,
        },
  )
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)

  const clientOptions = [...clients].sort((first, second) =>
    first.name.localeCompare(second.name, 'es'),
  )

  const roomOptions = rooms
    .map((room) => ({
      ...room,
      unavailable: room.status === 'mantenimiento' || room.status === 'inactiva',
      conflict: hasReservationConflict(reservations, {
        roomId: room.id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        excludeId: reservation?.id,
      }),
    }))
    .sort((first, second) => first.number.localeCompare(second.number, 'es', { numeric: true }))

  const selectedRoom = roomOptions.find((room) => room.id === form.roomId) ?? null
  const nights = nightsBetween(form.checkIn, form.checkOut)
  const total = selectedRoom ? selectedRoom.price * nights : 0
  const hasValidDates = form.checkIn && form.checkOut && form.checkOut > form.checkIn
  const availabilityState = !selectedRoom
    ? 'idle'
    : selectedRoom.unavailable
      ? 'unavailable'
      : selectedRoom.conflict
        ? 'conflict'
        : hasValidDates
          ? 'available'
          : 'idle'

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm((current) => {
      const next = { ...current, [name]: type === 'checkbox' ? checked : value }
      if (name === 'checkIn' && next.checkOut <= value) {
        next.checkOut = addDaysKey(value, 1)
      }
      return next
    })
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFormError(null)
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.clientId) nextErrors.clientId = 'Selecciona al cliente.'
    if (!form.roomId) nextErrors.roomId = 'Selecciona una habitación.'
    if (!form.checkIn) nextErrors.checkIn = 'Ingresa la fecha de entrada.'
    else if (!editing && form.checkIn < today) {
      nextErrors.checkIn = 'La fecha de entrada no puede ser anterior a hoy.'
    }
    if (!form.checkOut) nextErrors.checkOut = 'Ingresa la fecha de salida.'
    else if (form.checkOut <= form.checkIn) {
      nextErrors.checkOut = 'La salida debe ser posterior a la entrada.'
    }
    if (selectedRoom?.unavailable) {
      nextErrors.roomId = 'La habitación no está disponible para reservas.'
    } else if (selectedRoom?.conflict) {
      nextErrors.roomId = 'La habitación ya tiene una reserva en esas fechas.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      onSave(form)
      if (!editing) {
        setForm({
          clientId: '',
          roomId: '',
          checkIn: today,
          checkOut: addDaysKey(today, 1),
          status: 'pendiente',
          registerPayment: false,
        })
        setErrors({})
        setFormError(null)
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'No se pudo guardar la reserva.',
      )
    }
  }

  return (
    <section
      ref={formRef}
      className="scroll-mt-6 rounded-md border border-amber-400 bg-[#080705] p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-white">
          {editing ? 'Editar reserva' : 'Reserva nueva'}
        </h2>
        {editing && (
          <span className="text-[11px] text-amber-400">Modificando {reservation.code}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <div>
          <label htmlFor="reservation-client" className={labelClass}>
            Cliente:
          </label>
          <select
            id="reservation-client"
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            className={fieldClass}
            aria-invalid={Boolean(errors.clientId)}
            aria-describedby={errors.clientId ? 'reservation-client-error' : undefined}
          >
            <option value="">Selecciona un cliente</option>
            {clientOptions.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} — Doc. {client.document}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p id="reservation-client-error" role="alert" className="mt-1 text-[11px] text-rose-400">
              {errors.clientId}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reservation-room" className={labelClass}>
            Habitación:
          </label>
          <select
            id="reservation-room"
            name="roomId"
            value={form.roomId}
            onChange={handleChange}
            className={fieldClass}
            aria-invalid={Boolean(errors.roomId)}
            aria-describedby={errors.roomId ? 'reservation-room-error' : undefined}
          >
            <option value="">Selecciona una habitación</option>
            {roomOptions.map((room) => (
              <option
                key={room.id}
                value={room.id}
                disabled={room.unavailable || room.conflict}
              >
                Hab. {room.number} · {room.type} · {formatSoles(room.price)} / noche
                {room.unavailable
                  ? ' — Fuera de servicio'
                  : room.conflict
                    ? ' — Ocupada en esas fechas'
                    : ''}
              </option>
            ))}
          </select>
          {errors.roomId && (
            <p id="reservation-room-error" role="alert" className="mt-1 text-[11px] text-rose-400">
              {errors.roomId}
            </p>
          )}
          {availabilityState === 'available' && (
            <p className="mt-1 text-[11px] text-emerald-300">
              Disponible para las fechas seleccionadas.
            </p>
          )}
          {availabilityState === 'conflict' && (
            <p className="mt-1 text-[11px] text-rose-300">
              Esta habitación ya tiene una reserva en esas fechas.
            </p>
          )}
          {availabilityState === 'unavailable' && (
            <p className="mt-1 text-[11px] text-rose-300">
              Esta habitación está fuera de servicio.
            </p>
          )}
          {availabilityState === 'idle' && !selectedRoom && (
            <p className="mt-1 text-[11px] text-stone-600">
              Elige las fechas y una habitación para verificar la disponibilidad.
            </p>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <div>
            <label htmlFor="reservation-checkin" className={labelClass}>
              F. entrada:
            </label>
            <input
              id="reservation-checkin"
              name="checkIn"
              type="date"
              value={form.checkIn}
              min={editing ? undefined : today}
              onChange={handleChange}
              className={fieldClass}
              aria-invalid={Boolean(errors.checkIn)}
              aria-describedby={errors.checkIn ? 'reservation-checkin-error' : undefined}
            />
            {errors.checkIn && (
              <p id="reservation-checkin-error" role="alert" className="mt-1 text-[11px] text-rose-400">
                {errors.checkIn}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="reservation-checkout" className={labelClass}>
              F. salida:
            </label>
            <input
              id="reservation-checkout"
              name="checkOut"
              type="date"
              value={form.checkOut}
              min={addDaysKey(form.checkIn || today, 1)}
              onChange={handleChange}
              className={fieldClass}
              aria-invalid={Boolean(errors.checkOut)}
              aria-describedby={errors.checkOut ? 'reservation-checkout-error' : undefined}
            />
            {errors.checkOut && (
              <p id="reservation-checkout-error" role="alert" className="mt-1 text-[11px] text-rose-400">
                {errors.checkOut}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="reservation-price" className={labelClass}>
            Precio total:
          </label>
          <input
            id="reservation-price"
            type="text"
            readOnly
            value={selectedRoom && hasValidDates ? formatSoles(total) : ''}
            placeholder="Se calcula automáticamente"
            className={`${fieldClass} cursor-not-allowed border-amber-400/30 bg-black/30 text-amber-200`}
          />
          <p className="mt-1 text-[10px] text-stone-600">
            {selectedRoom && hasValidDates
              ? `${formatSoles(selectedRoom.price)} × ${nights} noche${nights === 1 ? '' : 's'}`
              : 'Tarifa de la habitación por las noches de la estadía.'}
          </p>
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
            className={fieldClass}
          >
            {FORM_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {!editing && (
          <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-amber-400/25 bg-black/30 px-3 py-2.5 text-xs text-stone-300 transition hover:border-amber-400/50">
            <input
              type="checkbox"
              name="registerPayment"
              checked={form.registerPayment}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 shrink-0 accent-amber-400"
            />
            <span>
              Registrar pago hoy
              <span className="mt-0.5 block text-[10px] text-stone-500">
                {total > 0
                  ? `Se sumarán ${formatSoles(total)} al ingreso del día.`
                  : 'Selecciona una habitación para calcular el monto.'}
              </span>
            </span>
          </label>
        )}

        {formError && (
          <p
            role="alert"
            className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
          >
            {formError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-amber-400/15 pt-3">
          {editing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-md border border-stone-600 px-3 py-2 text-xs font-medium text-stone-300 transition hover:border-stone-400 hover:text-white"
            >
              Cancelar edición
            </button>
          )}
          <button
            type="submit"
            className="rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-4 py-2.5 text-sm font-bold text-black shadow-[0_12px_30px_-14px_rgba(245,200,66,0.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
          >
            {editing ? 'Guardar cambios' : 'Guardar reserva'}
          </button>
        </div>
      </form>
    </section>
  )
}

function Reservas({
  reservations,
  rooms,
  clients,
  payments,
  summary,
  onCreateReservation,
  onUpdateReservation,
  onConfirmReservation,
  onRejectReservation,
  onCancelReservation,
  onDeleteReservation,
}) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formVersion, setFormVersion] = useState(0)
  const [detailId, setDetailId] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [notice, setNotice] = useState(null)
  const formRef = useRef(null)

  const paymentByReservation = new Map(
    payments.map((payment) => [payment.reservationId, payment]),
  )

  const presentedReservations = reservations
    .map((reservation) => ({
      ...reservation,
      room: rooms.find((room) => room.id === reservation.roomId) ?? null,
      client: clients.find((client) => client.id === reservation.clientId) ?? null,
      payment: paymentByReservation.get(reservation.id) ?? null,
    }))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))

  const normalizedQuery = query.trim().toLowerCase()
  const filteredReservations = presentedReservations.filter((reservation) => {
    const searchable = [
      reservation.code,
      reservation.guestName,
      reservation.client?.name,
      reservation.client?.document,
      reservation.client?.email,
      reservation.client?.phone,
      reservation.room?.number,
      reservation.room?.type,
      reservation.checkIn,
      reservation.checkOut,
      searchableDate(reservation.checkIn),
      searchableDate(reservation.checkOut),
      formatShortDate(reservation.checkIn),
      formatShortDate(reservation.checkOut),
      reservationStatusLabel(reservation.status),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
    const matchesType = !typeFilter || reservation.room?.type === typeFilter
    const matchesStatus = !statusFilter || reservation.status === statusFilter

    return matchesQuery && matchesType && matchesStatus
  })

  const editingReservation =
    reservations.find((reservation) => reservation.id === editingId) ?? null
  const detailReservation =
    presentedReservations.find((reservation) => reservation.id === detailId) ?? null
  const filtersActive = Boolean(query || typeFilter || statusFilter)

  function scrollToForm() {
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function startCreate() {
    setEditingId(null)
    setFormVersion((version) => version + 1)
    setDetailId(null)
    scrollToForm()
  }

  function startEdit(reservation) {
    if (!isEditableStatus(reservation.status)) return
    setEditingId(reservation.id)
    setFormVersion((version) => version + 1)
    setDetailId(null)
    scrollToForm()
  }

  function cancelEdit() {
    setEditingId(null)
    setFormVersion((version) => version + 1)
  }

  function handleSave(input) {
    if (editingId) {
      onUpdateReservation({ id: editingId, ...input })
      setNotice({ type: 'success', message: 'Reserva actualizada correctamente.' })
      setEditingId(null)
    } else {
      onCreateReservation(input)
      setNotice({ type: 'success', message: 'Reserva registrada correctamente.' })
    }
  }

  function handleConfirm(reservation) {
    try {
      onConfirmReservation(reservation.id)
      setNotice({
        type: 'success',
        message: `Reserva ${reservation.code} confirmada correctamente.`,
      })
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'No se pudo confirmar la reserva.',
      })
    }
  }

  function openAction(type, reservation) {
    if (type === 'cancel') {
      const policy = reservationCancellationPolicy(reservation)
      if (!policy.allowed) {
        setNotice({ type: 'error', message: policy.message })
        return
      }
    }

    setPendingAction({ type, reservation })
    setDetailId(null)
  }

  function runAction() {
    if (!pendingAction) return

    const { type, reservation } = pendingAction
    try {
      if (type === 'reject') onRejectReservation(reservation.id)
      else if (type === 'cancel') onCancelReservation(reservation.id)
      else if (type === 'delete') onDeleteReservation(reservation.id)

      setNotice({
        type: 'success',
        message: ACTION_MESSAGES.get(type)?.(reservation),
      })

      if (editingId === reservation.id) {
        setEditingId(null)
        setFormVersion((version) => version + 1)
      }
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'No se pudo completar la acción.',
      })
    } finally {
      setPendingAction(null)
    }
  }

  function clearFilters() {
    setQuery('')
    setTypeFilter('')
    setStatusFilter('')
  }

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            Gestión de reservas
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Consulta, confirma, modifica y cancela las reservas. {formatLongDate()}
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="self-start rounded-md border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 sm:self-auto"
        >
          + Registrar nueva reserva
        </button>
      </header>

      {notice && <PageNotice notice={notice} onClose={() => setNotice(null)} />}

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total de reservas (mes):"
          value={summary.totalMonth}
          note={
            summary.totalMonth === 0
              ? 'Sin reservas registradas este mes'
              : `${summary.cancelled} cancelada${summary.cancelled === 1 ? '' : 's'} este mes`
          }
        />
        <StatCard
          label="Tasa de cancelación:"
          value={`${summary.cancellationRate}%`}
          note="Sobre las reservas del mes"
        />
        <StatCard
          label="Reservas próximas:"
          value={summary.upcoming}
          note={`${summary.pending} solicitud${summary.pending === 1 ? '' : 'es'} pendiente${summary.pending === 1 ? '' : 's'}`}
        />
      </dl>

      <section className="mt-6 rounded-md border border-amber-400/60 bg-[#080705] p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/70" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por código, cliente o fecha"
              aria-label="Buscar reservas por código, cliente, fecha o estado"
              className="w-full rounded-md border border-amber-400/45 bg-black/40 py-2 pl-9 pr-3 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filtrar por tipo de habitación"
            className="rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
          >
            <option value="">Tipos de habitación</option>
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar por estado de la reserva"
            className="rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
          >
            <option value="">Todos los estados</option>
            {RESERVATION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {filtersActive && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-medium text-amber-400 underline underline-offset-4 transition hover:text-amber-300"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_270px] xl:items-start">
        <section className="overflow-hidden rounded-md border border-amber-400 bg-[#070605] xl:col-start-1 xl:row-start-1">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <h2 className="text-base font-semibold text-white">Historial</h2>
            <div className="text-right">
              <span className="block text-[11px] text-stone-500">
                {filteredReservations.length} de {reservations.length} reservas
              </span>
              <span className="mt-0.5 block text-[9px] text-stone-600 min-[768px]:hidden">
                Desliza la tabla para ver todas las columnas →
              </span>
            </div>
          </div>

          <div className="max-h-[600px] overflow-auto border-t border-amber-400/20">
            <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-[11px]">
              <colgroup>
                <col className="w-[76px]" />
                <col className="w-[140px]" />
                <col className="hidden w-[88px] min-[1366px]:table-column" />
                <col className="w-[78px]" />
                <col className="w-[78px]" />
                <col className="w-[68px]" />
                <col className="w-[94px]" />
                <col className="w-[112px]" />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 text-black">
                <tr>
                  <th scope="col" className="px-2 py-2.5 text-[10px] font-semibold leading-tight">
                    N° Habitación
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-[10px] font-semibold leading-tight">
                    Cliente
                  </th>
                  <th scope="col" className="hidden px-2 py-2.5 text-[10px] font-semibold leading-tight min-[1366px]:table-cell">
                    Habitación
                  </th>
                  <th scope="col" className="whitespace-nowrap px-2 py-2.5 text-[10px] font-semibold leading-tight">
                    F. Entrada
                  </th>
                  <th scope="col" className="whitespace-nowrap px-2 py-2.5 text-[10px] font-semibold leading-tight">
                    F. Salida
                  </th>
                  <th scope="col" className="whitespace-nowrap px-2 py-2.5 text-[10px] font-semibold leading-tight">
                    P. Total
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-[10px] font-semibold leading-tight">
                    Estado
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-right text-[10px] font-semibold leading-tight">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-14 text-center text-sm text-stone-500">
                      No se encontraron reservas con esos filtros.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => {
                    const editable = isEditableStatus(reservation.status)
                    const pending = reservation.status === 'pendiente'
                    const removable =
                      reservation.status === 'cancelada' || reservation.status === 'rechazada'
                    const policy = reservationCancellationPolicy(reservation)

                    return (
                      <tr
                        key={reservation.id}
                        className={`border-b border-amber-400/10 transition hover:bg-amber-400/[0.04] ${
                          detailId === reservation.id ? 'bg-amber-400/[0.05]' : ''
                        }`}
                      >
                        <td className="px-2 py-2.5">
                          <button
                            type="button"
                            onClick={() => setDetailId(reservation.id)}
                            className="font-semibold text-amber-300 transition hover:text-amber-200"
                            title="Ver detalle"
                          >
                            {reservation.room?.number ?? '—'}
                          </button>
                          <p className="mt-0.5 text-[9px] text-stone-500">{reservation.code}</p>
                        </td>
                        <td className="px-2 py-2.5">
                          <button
                            type="button"
                            onClick={() => setDetailId(reservation.id)}
                            className="block w-full min-w-0 text-left"
                            title="Ver datos del cliente"
                          >
                            <span className="block truncate text-stone-200">
                              {reservation.guestName}
                            </span>
                            <span className="mt-0.5 block truncate text-[9px] text-stone-500">
                              Doc. {reservation.client?.document ?? '—'}
                            </span>
                          </button>
                        </td>
                        <td className="hidden truncate whitespace-nowrap px-2 py-2.5 text-stone-300 min-[1366px]:table-cell">
                          {reservation.room?.type ?? '—'}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-stone-300">
                          {tableDate(reservation.checkIn)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-stone-300">
                          {tableDate(reservation.checkOut)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5 font-medium text-amber-200">
                          {formatSoles(reservation.total)}
                        </td>
                        <td className="px-2 py-2.5">
                          <StatusBadge status={reservation.status} />
                        </td>
                        <td className="px-2 py-2.5">
                          <div className="flex flex-wrap items-center justify-end gap-0.5">
                            <RowAction
                              label={`Ver detalle de la reserva ${reservation.code}`}
                              onClick={() => setDetailId(reservation.id)}
                              className="text-stone-400 hover:bg-amber-400/10 hover:text-amber-200"
                            >
                              <EyeIcon className="h-3.5 w-3.5" />
                            </RowAction>

                            {editable && (
                              <RowAction
                                label={`Editar reserva ${reservation.code}`}
                                onClick={() => startEdit(reservation)}
                                className="text-amber-300/80 hover:bg-amber-400/10 hover:text-amber-200"
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                              </RowAction>
                            )}

                            {pending && (
                              <RowAction
                                label={`Confirmar reserva ${reservation.code}`}
                                onClick={() => handleConfirm(reservation)}
                                className="text-emerald-300/80 hover:bg-emerald-400/10 hover:text-emerald-200"
                              >
                                <CheckIcon className="h-3.5 w-3.5" />
                              </RowAction>
                            )}

                            {pending && (
                              <RowAction
                                label={`Rechazar solicitud ${reservation.code}`}
                                onClick={() => openAction('reject', reservation)}
                                className="text-rose-300/80 hover:bg-rose-500/10 hover:text-rose-200"
                              >
                                <XIcon className="h-3.5 w-3.5" />
                              </RowAction>
                            )}

                            {policy.allowed && (
                              <RowAction
                                label={`Cancelar reserva ${reservation.code}`}
                                onClick={() => openAction('cancel', reservation)}
                                className="text-stone-400 hover:bg-rose-500/10 hover:text-rose-300"
                              >
                                <BanIcon className="h-3.5 w-3.5" />
                              </RowAction>
                            )}

                            {removable && (
                              <RowAction
                                label={`Eliminar reserva ${reservation.code}`}
                                onClick={() => openAction('delete', reservation)}
                                className="text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-300"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </RowAction>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="xl:sticky xl:top-6 xl:col-start-2 xl:row-start-1">
          <ReservationForm
            key={`${editingId ?? 'new'}-${formVersion}`}
            reservation={editingReservation}
            clients={clients}
            rooms={rooms}
            reservations={reservations}
            onSave={handleSave}
            onCancelEdit={cancelEdit}
            formRef={formRef}
          />
        </aside>
      </div>

      {detailReservation && (
        <ReservationDetail
          reservation={detailReservation}
          onClose={() => setDetailId(null)}
          onEdit={startEdit}
          onConfirm={handleConfirm}
          onReject={(reservation) => openAction('reject', reservation)}
          onCancel={(reservation) => openAction('cancel', reservation)}
          onDelete={(reservation) => openAction('delete', reservation)}
        />
      )}

      {pendingAction && (
        <ActionDialog
          action={pendingAction}
          onCancel={() => setPendingAction(null)}
          onConfirm={runAction}
        />
      )}
    </>
  )
}

export default Reservas
