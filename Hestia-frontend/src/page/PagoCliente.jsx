import { useState } from 'react'
import {
  PAYMENT_METHOD_OPTIONS,
  paymentMethodLabel,
  paymentStatusLabel,
  reservationStatusLabel,
} from '../data/hestiaData.js'
import {
  clientPayments,
  pendingClientReservations,
} from '../lib/clientBooking.js'
import { downloadClientReceipt } from '../lib/clientReceipt.js'
import { formatShortDate, formatLongDate, formatSoles } from '../lib/format.js'
import {
  BedIcon,
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  DownloadIcon,
  LockIcon,
  ReceiptIcon,
  ShieldIcon,
  TagIcon,
  UsersIcon,
} from '../components/cliente/icons.jsx'
import {
  EmptyState,
  inputClass,
  labelClass,
  Notice,
  PageHeading,
  primaryButtonClass,
  secondaryButtonClass,
  StatusBadge,
} from '../components/cliente/ui.jsx'

function AuthRequired({ onRequireAuth }) {
  return (
    <EmptyState
      icon={LockIcon}
      title="Inicia sesión para ver tus pagos"
      description="Ingresa a tu cuenta de cliente para registrar pagos, descargar comprobantes y revisar el historial de tus reservas."
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

function SummaryTile({ label, value, note }) {
  return (
    <div className="rounded-xl border border-amber-400/30 bg-[#080705] px-4 py-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold text-white">{value}</p>
      {note && <p className="mt-1 text-[10px] text-stone-500">{note}</p>}
    </div>
  )
}

function ReservationSummary({ reservation }) {
  return (
    <div className="rounded-lg border border-amber-400/25 bg-black/25 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-semibold tracking-wider text-amber-200">
            {reservation.code}
          </p>
          <p className="mt-1 text-[10px] text-stone-500">
            Solicitud registrada para {reservation.guestName}
          </p>
        </div>
        <StatusBadge
          status={reservation.status}
          label={reservationStatusLabel(reservation.status)}
        />
      </div>

      <dl className="mt-3 grid gap-2.5 text-xs sm:grid-cols-2">
        <div>
          <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-stone-500">
            <BedIcon className="h-3.5 w-3.5" /> Habitación
          </dt>
          <dd className="mt-0.5 font-semibold text-stone-200">
            {reservation.room
              ? `${reservation.room.number} · ${reservation.room.type}`
              : '—'}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-stone-500">
            <CalendarIcon className="h-3.5 w-3.5" /> Estadía
          </dt>
          <dd className="mt-0.5 font-semibold text-stone-200">
            {formatShortDate(reservation.checkIn)} – {formatShortDate(reservation.checkOut)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-stone-500">
            <UsersIcon className="h-3.5 w-3.5" /> Huéspedes
          </dt>
          <dd className="mt-0.5 font-semibold text-stone-200">
            {reservation.guests ?? 1}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-stone-500">
            <TagIcon className="h-3.5 w-3.5" /> Noches
          </dt>
          <dd className="mt-0.5 font-semibold text-stone-200">{reservation.nights}</dd>
        </div>
      </dl>
    </div>
  )
}

function PagoCliente({
  session,
  profile,
  data,
  initialReservationId = '',
  onCreatePayment,
  onGoToReservations,
  onRequireAuth,
}) {
  const [selectedId, setSelectedId] = useState(initialReservationId ?? '')
  const [method, setMethod] = useState('Tarjeta')
  const [notice, setNotice] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [receiptPayment, setReceiptPayment] = useState(null)

  if (!session) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Pagos"
          title="Pagos y comprobantes"
          description="Registra el pago de tus reservas y descarga tus comprobantes."
        />
        <div className="mt-6">
          <AuthRequired onRequireAuth={onRequireAuth} />
        </div>
      </section>
    )
  }

  const pending = pendingClientReservations(data, session.id)
  const payments = clientPayments(data, session.id)
  const selected = pending.find((reservation) => reservation.id === selectedId) ?? pending[0] ?? null
  const pendingTotal = pending.reduce((sum, reservation) => sum + reservation.total, 0)
  const paidTotal = payments
    .filter((payment) => payment.status === 'pagado')
    .reduce((sum, payment) => sum + payment.amount, 0)

  function receiptInput(payment) {
    const reservation =
      data.reservations.find((item) => item.id === payment.reservationId) ?? null
    const room = reservation
      ? data.rooms.find((item) => item.id === reservation.roomId) ?? null
      : null

    return {
      payment,
      reservation: reservation ? { ...reservation, room } : null,
      client: data.clients.find((item) => item.id === session.id) ?? {
        name: profile?.name ?? session.name,
        email: profile?.email ?? session.email,
      },
    }
  }

  function handleDownload(payment) {
    downloadClientReceipt(receiptInput(payment))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice(null)
    setReceiptPayment(null)

    if (!selected) {
      setNotice({ type: 'error', message: 'No tienes reservas pendientes de pago.' })
      return
    }

    setSubmitting(true)
    try {
      const payment = await onCreatePayment({
        reservationId: selected.id,
        method,
      })
      setReceiptPayment(payment)
      setNotice({
        type: 'success',
        message: `Pago ${payment.code} registrado por ${formatSoles(payment.amount)}. El administrador ya recibió la actualización.`,
      })
      setSelectedId('')
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo registrar el pago.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section className="border-b border-amber-400/15 bg-[#070605]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            eyebrow="Pagos"
            title="Pagos y comprobantes"
            description={`Hola, ${profile?.name ?? session.name}. Registra el pago de tus reservas y descarga el comprobante de cada transacción.`}
            action={
              <button
                type="button"
                onClick={onGoToReservations}
                className={secondaryButtonClass}
              >
                <CalendarIcon className="h-4 w-4" /> Ver mis reservas
              </button>
            }
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryTile
              label="Pagos pendientes"
              value={pending.length}
              note={
                pending.length > 0
                  ? `${formatSoles(pendingTotal)} por registrar`
                  : 'Estás al día'
              }
            />
            <SummaryTile
              label="Total pagado"
              value={formatSoles(paidTotal)}
              note={`${payments.filter((payment) => payment.status === 'pagado').length} pagos registrados`}
            />
            <SummaryTile
              label="Hoy"
              value={formatLongDate()}
              note="Fecha de operación"
            />
          </div>

          {notice && (
            <Notice
              type={notice.type}
              message={notice.message}
              onClose={() => setNotice(null)}
              className="mt-5"
            />
          )}

          {notice?.type === 'success' && receiptPayment && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownload(receiptPayment)}
                className={secondaryButtonClass}
              >
                <DownloadIcon className="h-4 w-4" /> Descargar comprobante
              </button>
              <span className="text-[11px] text-stone-500">
                Comprobante {receiptPayment.code}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {pending.length === 0 ? (
          <EmptyState
            icon={CheckIcon}
            title="No tienes pagos pendientes"
            description="Todas tus reservas activas tienen un pago registrado. Puedes revisar el historial y descargar tus comprobantes."
            action={
              <button
                type="button"
                onClick={onGoToReservations}
                className={primaryButtonClass}
              >
                Ir a mis reservas
              </button>
            }
          />
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-amber-400/30 bg-[#080705] p-5"
            >
              <h2 className="text-lg font-semibold text-white">Registrar un pago</h2>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                Elige la reserva y el método de pago. El pago se registra de forma simulada
                en este prototipo y el administrador recibe la actualización al instante.
              </p>

              <div className="mt-5">
                <label htmlFor="client-payment-reservation" className={labelClass}>
                  Reserva pendiente de pago: *
                </label>
                <select
                  id="client-payment-reservation"
                  value={selected?.id ?? ''}
                  onChange={(event) => {
                    setSelectedId(event.target.value)
                    setReceiptPayment(null)
                    setNotice(null)
                  }}
                  className={inputClass}
                >
                  {pending.map((reservation) => (
                    <option
                      key={reservation.id}
                      value={reservation.id}
                      className="bg-[#0b0a07]"
                    >
                      {reservation.code} · Hab. {reservation.room?.number ?? '—'} ·{' '}
                      {formatSoles(reservation.total)}
                    </option>
                  ))}
                </select>
              </div>

              {selected && (
                <div className="mt-4">
                  <ReservationSummary reservation={selected} />
                </div>
              )}

              <fieldset className="mt-5">
                <legend className={labelClass}>Método de pago: *</legend>
                <div className="mt-1 grid gap-2 sm:grid-cols-2">
                  {PAYMENT_METHOD_OPTIONS.map((option) => {
                    const active = method === option.value
                    return (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-xs transition ${
                          active
                            ? 'border-amber-300 bg-amber-400/15 text-amber-100'
                            : 'border-amber-400/25 bg-black/25 text-stone-300 hover:border-amber-400/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="client-payment-method"
                          value={option.value}
                          checked={active}
                          onChange={() => setMethod(option.value)}
                          className="h-3.5 w-3.5 accent-amber-400"
                        />
                        {option.label}
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2.5">
                <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <p className="text-[10px] leading-4 text-stone-400">
                  No ingreses datos reales de tarjetas. Este prototipo no procesa cobros:
                  solo registra el pago para que el administrador confirme tu reserva.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !selected}
                className={`${primaryButtonClass} mt-5 w-full sm:w-auto`}
              >
                <CreditCardIcon className="h-4 w-4" />
                {submitting
                  ? 'Registrando pago…'
                  : selected
                    ? `Pagar ${formatSoles(selected.total)}`
                    : 'Registrar pago'}
              </button>
            </form>

            <aside className="rounded-xl border border-amber-400/40 bg-[#080705] p-5 xl:sticky xl:top-20">
              <h2 className="text-base font-semibold text-white">Resumen a pagar</h2>
              {selected ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-stone-500">Reserva</span>
                    <span className="text-right font-mono text-xs text-stone-200">
                      {selected.code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-stone-500">Noches</span>
                    <span className="text-stone-200">{selected.nights}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="text-stone-200">
                      {formatSoles(selected.subtotal ?? selected.total)}
                    </span>
                  </div>
                  {(selected.discountAmount ?? 0) > 0 && (
                    <div className="flex items-center justify-between gap-3 text-emerald-300">
                      <span>Descuento {selected.discountPercent}%</span>
                      <span>- {formatSoles(selected.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 border-t border-amber-400/20 pt-3">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-amber-200">
                      {formatSoles(selected.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-stone-500">Método</span>
                    <span className="text-stone-200">{paymentMethodLabel(method)}</span>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs leading-5 text-stone-500">
                  Selecciona una reserva pendiente para ver el resumen.
                </p>
              )}
            </aside>
          </div>
        )}

        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Historial de pagos</h2>
              <p className="mt-0.5 text-xs text-stone-500">
                Descarga el comprobante de cada pago registrado.
              </p>
            </div>
            <span className="text-[11px] text-stone-500">{payments.length} pagos</span>
          </div>

          {payments.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={ReceiptIcon}
                title="Aún no tienes pagos registrados"
                description="Cuando registres el pago de una reserva, aparecerá aquí con su comprobante descargable."
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {payments.map((payment) => (
                <article
                  key={payment.id}
                  className="flex flex-col gap-3 rounded-xl border border-amber-400/25 bg-[#080705] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
                      <ReceiptIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-mono text-sm font-semibold tracking-wider text-amber-200">
                        {payment.code}
                      </p>
                      <p className="mt-0.5 text-[11px] text-stone-400">
                        Reserva {payment.reservation?.code ?? '—'} ·{' '}
                        {paymentMethodLabel(payment.method)} ·{' '}
                        {payment.paidAt
                          ? formatShortDate(payment.paidAt.slice(0, 10))
                          : 'Sin fecha'}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <StatusBadge
                          status={payment.status}
                          label={paymentStatusLabel(payment.status)}
                        />
                        <span className="text-sm font-bold text-white">
                          {formatSoles(payment.amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(payment)}
                    className={`${secondaryButtonClass} shrink-0`}
                  >
                    <DownloadIcon className="h-4 w-4" /> Comprobante
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default PagoCliente
