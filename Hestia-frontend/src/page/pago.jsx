import { useRef, useState } from 'react'
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  findReservationByNumber,
  paymentDateKey,
  paymentMethodLabel,
  paymentStatusLabel,
} from '../data/hestiaData.js'
import { formatLongDate, formatSoles, todayKey } from '../lib/format.js'

const STATUS_STYLES = new Map([
  ['pagado', 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'],
  ['pendiente', 'border-amber-400/60 bg-amber-400/10 text-amber-200'],
  ['reembolsado', 'border-rose-500/50 bg-rose-500/10 text-rose-200'],
])

const fieldClass =
  'w-full rounded-md border border-amber-400/55 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15'

const readOnlyFieldClass =
  'w-full cursor-not-allowed rounded-md border border-amber-400/30 bg-black/30 px-3 py-2 text-sm text-amber-100 outline-none'

const labelClass = 'mb-1.5 block text-[11px] font-medium tracking-wide text-amber-100/90'
const filterLabelClass = 'mb-1 block text-[10px] font-medium tracking-wide text-stone-500'

const fullDateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function statusStyle(status) {
  return STATUS_STYLES.get(status) ?? STATUS_STYLES.get('pendiente')
}

function tableDate(dateKeyValue) {
  if (!dateKeyValue) return '—'
  const [year, month, day] = dateKeyValue.split('-')
  return `${day}/${month}/${year.slice(2)}`
}

function formatFullDate(dateKeyValue) {
  if (!dateKeyValue) return '—'
  return fullDateFormatter.format(new Date(`${dateKeyValue}T12:00:00`)).replace(/\./g, '')
}

function emptyForm() {
  return {
    reservationNumber: '',
    method: PAYMENT_METHOD_OPTIONS[0].value,
    paidAt: todayKey(),
    status: 'pagado',
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  )
}

function buildReceiptHtml(payment) {
  const clientName = payment.client?.name ?? payment.reservation?.guestName ?? '—'
  const document = payment.client?.document
    ? `${payment.client.documentType ?? 'DNI'} ${payment.client.document}`
    : '—'
  const room = payment.room ? `${payment.room.number} · ${payment.room.type}` : '—'
  const status = paymentStatusLabel(payment.status ?? 'pagado')
  const issuedAt = formatFullDate(
    payment.createdAt ? payment.createdAt.slice(0, 10) : payment.paidOn,
  )

  const rows = [
    ['Cliente', clientName],
    ['Documento', document],
    ['N° de reserva', payment.reservation?.code ?? '—'],
    ['Habitación', room],
    ['Método de pago', paymentMethodLabel(payment.method)],
    ['Fecha de pago', formatFullDate(payment.paidOn)],
    ['Estado', status],
    ['Fecha de registro', issuedAt],
  ]

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Comprobante ${escapeHtml(payment.code)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px 16px; background: #f5f1e8; color: #1c1917; font-family: Georgia, 'Times New Roman', serif; }
    .receipt { width: min(100%, 640px); margin: 0 auto; background: #fffdf8; border: 1px solid #c9a227; border-radius: 12px; overflow: hidden; box-shadow: 0 18px 50px -24px rgba(60, 45, 10, .5); }
    header { padding: 28px 32px; border-bottom: 2px solid #c9a227; background: #120f08; color: #fef3c7; }
    header p { margin: 0; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: #d6b45c; }
    header h1 { margin: 8px 0 2px; font-size: 30px; letter-spacing: .02em; }
    header span { font-size: 13px; color: #d6d3d1; }
    .body { padding: 28px 32px 32px; }
    .amount { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding: 18px 20px; border: 1px solid #e6d8a9; border-radius: 8px; background: #fbf6e8; }
    .amount small { display: block; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: #78716c; }
    .amount strong { display: block; margin-top: 4px; font-size: 30px; color: #854d0e; }
    .badge { display: inline-block; border: 1px solid #c9a227; border-radius: 999px; padding: 3px 10px; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #713f12; }
    table { width: 100%; margin-top: 24px; border-collapse: collapse; font-family: system-ui, 'Segoe UI', sans-serif; font-size: 13px; }
    th, td { padding: 10px 0; border-bottom: 1px solid #ede9df; text-align: left; vertical-align: top; }
    th { width: 42%; font-weight: 500; color: #78716c; }
    td { color: #292524; font-weight: 600; }
    .note { margin: 22px 0 0; font-family: system-ui, 'Segoe UI', sans-serif; font-size: 11px; line-height: 1.6; color: #78716c; }
    footer { padding: 16px 32px; border-top: 1px solid #e7e5e4; background: #faf8f2; font-family: system-ui, 'Segoe UI', sans-serif; font-size: 10px; color: #a8a29e; display: flex; justify-content: space-between; gap: 12px; }
  </style>
</head>
<body>
  <main class="receipt">
    <header>
      <p>Hestia · Hospedaje Cusco</p>
      <h1>Comprobante de pago</h1>
      <span>${escapeHtml(payment.code)}</span>
    </header>
    <div class="body">
      <div class="amount">
        <div>
          <small>Monto pagado</small>
          <strong>${escapeHtml(formatSoles(payment.amount))}</strong>
        </div>
        <span class="badge">${escapeHtml(status)}</span>
      </div>
      <table>
        <tbody>
          ${rows
            .map(
              ([label, value]) =>
                `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`,
            )
            .join('')}
        </tbody>
      </table>
      <p class="note">Este comprobante acredita el pago registrado en el sistema de Hestia. Consérvalo como constancia de la transacción.</p>
    </div>
    <footer>
      <span>Hospedaje Cusco · Hestia</span>
      <span>Documento generado por el sistema</span>
    </footer>
  </main>
</body>
</html>`
}

function downloadReceipt(payment) {
  const blob = new Blob([buildReceiptHtml(payment)], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `comprobante-${payment.code}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

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

function TrashIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M5 7h14M9 7V4.8A.8.8 0 0 1 9.8 4h4.4a.8.8 0 0 1 .8.8V7m-8 0 1 12.2a1 1 0 0 0 1 .8h6.4a1 1 0 0 0 1-.8L17 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" strokeLinecap="round" />
    </svg>
  )
}

function DownloadIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M12 4v11" strokeLinecap="round" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" strokeLinecap="round" />
    </svg>
  )
}

function ReceiptIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className={className}>
      <path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4v-17Z" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
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

function HashIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M9 4 7.5 20M16.5 4 15 20M4 9h16M3.5 15h16" strokeLinecap="round" />
    </svg>
  )
}

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-md border border-amber-400 bg-[#080705] px-5 py-4 shadow-[inset_0_1px_0_rgba(245,200,66,0.08)]">
      <dt className="text-xs font-medium tracking-wide text-stone-100">{label}</dt>
      <dd>
        <span className="mt-2 block text-[30px] font-bold leading-none tracking-tight text-white">
          {value}
        </span>
        {note && <span className="mt-2 block text-[10px] leading-4 text-stone-500">{note}</span>}
      </dd>
    </div>
  )
}

function StatusBadge({ status = 'pagado' }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusStyle(status)}`}
    >
      {paymentStatusLabel(status)}
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

function RowAction({ label, onClick, className = '', disabled = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 disabled:cursor-not-allowed disabled:opacity-30 ${className}`}
    >
      {children}
    </button>
  )
}

function PaymentDetail({ payment, onClose, onEdit, onViewReceipt, onDelete }) {
  const { client, reservation, room } = payment
  const removable = (payment.status ?? 'pagado') === 'pagado'

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-amber-500/50 bg-[#0b0a07] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-amber-400/20 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">
              Detalle del pago
            </p>
            <h2 id="payment-detail-title" className="mt-1 text-xl font-bold text-white">
              {payment.code}
            </h2>
            <div className="mt-2">
              <StatusBadge status={payment.status ?? 'pagado'} />
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
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
              Cliente
            </h3>
            <dl className="mt-3 space-y-2 text-xs">
              <div>
                <dt className="text-stone-500">Nombre</dt>
                <dd className="mt-0.5 font-medium text-amber-50">
                  {client?.name ?? reservation?.guestName ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Documento</dt>
                <dd className="mt-0.5 text-stone-200">
                  {client ? `${client.documentType ?? 'DNI'} · ${client.document}` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Correo electrónico</dt>
                <dd className="mt-0.5 break-all text-stone-200">{client?.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Celular</dt>
                <dd className="mt-0.5 text-stone-200">{client?.phone ?? '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-md border border-amber-400/20 bg-black/25 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
              Reserva
            </h3>
            <dl className="mt-3 space-y-2 text-xs">
              <div>
                <dt className="text-stone-500">N° de reserva</dt>
                <dd className="mt-0.5 font-medium text-amber-50">
                  {reservation?.code ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Habitación</dt>
                <dd className="mt-0.5 text-stone-200">
                  {room ? `${room.number} · ${room.type}` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Estadía</dt>
                <dd className="mt-0.5 text-stone-200">
                  {reservation
                    ? `${tableDate(reservation.checkIn)} – ${tableDate(reservation.checkOut)}`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Total de la reserva</dt>
                <dd className="mt-0.5 text-stone-200">
                  {reservation ? formatSoles(reservation.total) : '—'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-md border border-amber-400/20 bg-black/25 p-4 sm:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
              Pago
            </h3>
            <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-stone-500">Método de pago</dt>
                <dd className="mt-0.5 text-stone-200">{paymentMethodLabel(payment.method)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Fecha de pago</dt>
                <dd className="mt-0.5 text-stone-200">{formatFullDate(payment.paidOn)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Monto</dt>
                <dd className="mt-0.5 font-semibold text-amber-300">
                  {formatSoles(payment.amount)}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Estado</dt>
                <dd className="mt-0.5">
                  <StatusBadge status={payment.status ?? 'pagado'} />
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <footer className="border-t border-amber-400/20 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onViewReceipt(payment)}
              className="inline-flex items-center gap-1.5 rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-3.5 py-2 text-xs font-bold text-black transition hover:brightness-110"
            >
              <ReceiptIcon className="h-3.5 w-3.5" />
              Ver comprobante
            </button>
            <button
              type="button"
              onClick={() => onEdit(payment)}
              className="rounded-md border border-amber-400/60 px-3.5 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/10"
            >
              Editar pago
            </button>
            <button
              type="button"
              onClick={() => onDelete(payment)}
              disabled={!removable}
              title={
                removable
                  ? 'Eliminar pago'
                  : 'Solo se pueden eliminar pagos con estado Pagado'
              }
              className="rounded-md border border-rose-500/50 px-3.5 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Eliminar pago
            </button>
          </div>
          {!removable && (
            <p className="mt-3 text-[11px] leading-5 text-stone-500">
              Solo se pueden eliminar pagos con estado Pagado.
            </p>
          )}
        </footer>
      </div>
    </div>
  )
}

function ReceiptDialog({ payment, onClose, onDownload }) {
  const clientName = payment.client?.name ?? payment.reservation?.guestName ?? '—'
  const document = payment.client?.document
    ? `${payment.client.documentType ?? 'DNI'} ${payment.client.document}`
    : '—'
  const room = payment.room ? `${payment.room.number} · ${payment.room.type}` : '—'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-receipt-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-amber-500/50 bg-[#0b0a07] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-amber-400/20 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-amber-500">
              Hestia · Hospedaje Cusco
            </p>
            <h2 id="payment-receipt-title" className="mt-1 text-lg font-bold text-white">
              Comprobante de pago
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">{payment.code}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar comprobante"
            className="rounded-md p-1.5 text-stone-400 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="p-5">
          <div className="flex items-end justify-between gap-4 rounded-md border border-amber-400/40 bg-amber-400/5 px-4 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                Monto pagado
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-200">
                {formatSoles(payment.amount)}
              </p>
            </div>
            <StatusBadge status={payment.status ?? 'pagado'} />
          </div>

          <dl className="mt-4 divide-y divide-amber-400/10 text-xs">
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-stone-500">Cliente</dt>
              <dd className="text-right font-medium text-stone-200">{clientName}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-stone-500">Documento</dt>
              <dd className="text-right text-stone-300">{document}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-stone-500">N° de reserva</dt>
              <dd className="text-right text-stone-300">{payment.reservation?.code ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-stone-500">Habitación</dt>
              <dd className="text-right text-stone-300">{room}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-stone-500">Método de pago</dt>
              <dd className="text-right text-stone-300">
                {paymentMethodLabel(payment.method)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-stone-500">Fecha de pago</dt>
              <dd className="text-right text-stone-300">{formatFullDate(payment.paidOn)}</dd>
            </div>
          </dl>

          <p className="mt-4 rounded-md border border-amber-400/20 bg-black/30 px-3 py-2 text-[11px] leading-5 text-stone-400">
            Este comprobante acredita el pago registrado en el sistema de Hestia. Consérvalo
            como constancia de la transacción.
          </p>
        </div>

        <footer className="flex flex-wrap justify-end gap-3 border-t border-amber-400/20 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-600 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-stone-400 hover:text-white"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => onDownload(payment)}
            className="inline-flex items-center gap-1.5 rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
          >
            <DownloadIcon className="h-4 w-4" />
            Descargar comprobante
          </button>
        </footer>
      </div>
    </div>
  )
}

function DeletePaymentDialog({ payment, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="payment-delete-title"
        aria-describedby="payment-delete-description"
        className="w-full max-w-md rounded-xl border border-rose-500/50 bg-[#0b0a07] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300">
          <TrashIcon className="h-5 w-5" />
        </span>
        <h2 id="payment-delete-title" className="mt-4 text-lg font-semibold text-white">
          Eliminar pago {payment.code}
        </h2>
        <p id="payment-delete-description" className="mt-2 text-sm leading-6 text-stone-400">
          Se eliminará el pago de {formatSoles(payment.amount)} registrado a nombre de{' '}
          <span className="text-stone-200">
            {payment.client?.name ?? payment.reservation?.guestName ?? '—'}
          </span>
          . El pago figura como Pagado, por lo que ya fue cubierto por el cliente. Esta
          acción no se puede deshacer.
        </p>
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
            Eliminar pago
          </button>
        </div>
      </div>
    </div>
  )
}

function PaymentForm({
  payment,
  reservations,
  payments,
  clients,
  rooms,
  onSave,
  onCancelEdit,
  formRef,
}) {
  const editing = Boolean(payment)
  const [form, setForm] = useState(() =>
    payment
      ? {
          reservationNumber:
            reservations.find((reservation) => reservation.id === payment.reservationId)?.code ?? '',
          method: payment.method,
          paidAt: paymentDateKey(payment),
          status: payment.status ?? 'pagado',
        }
      : emptyForm(),
  )
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)

  const selectedReservation = findReservationByNumber(reservations, form.reservationNumber)
  const selectedClient = selectedReservation
    ? clients.find((client) => client.id === selectedReservation.clientId) ?? null
    : null
  const selectedRoom = selectedReservation
    ? rooms.find((room) => room.id === selectedReservation.roomId) ?? null
    : null
  const duplicatePayment = selectedReservation
    ? payments.find(
        (item) => item.reservationId === selectedReservation.id && item.id !== payment?.id,
      ) ?? null
    : null

  const availableReservations = reservations
    .filter(
      (reservation) =>
        reservation.status !== 'cancelada' &&
        reservation.status !== 'rechazada' &&
        !payments.some(
          (item) => item.reservationId === reservation.id && item.id !== payment?.id,
        ),
    )
    .sort((first, second) => second.code.localeCompare(first.code))

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFormError(null)
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.reservationNumber.trim()) {
      nextErrors.reservationNumber = 'Ingresa el número de reserva.'
    } else if (!selectedReservation) {
      nextErrors.reservationNumber = 'No se encontró una reserva con ese número.'
    } else if (duplicatePayment) {
      nextErrors.reservationNumber = `Esta reserva ya tiene el pago ${duplicatePayment.code} registrado.`
    }
    if (!form.method) nextErrors.method = 'Selecciona el método de pago.'
    if (!form.paidAt) nextErrors.paidAt = 'Ingresa la fecha de pago.'
    else if (form.paidAt > todayKey()) {
      nextErrors.paidAt = 'La fecha de pago no puede ser posterior a hoy.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      onSave({
        reservationNumber: selectedReservation.code,
        method: form.method,
        paidAt: form.paidAt,
        status: form.status,
      })
      if (!editing) {
        setForm(emptyForm())
        setErrors({})
        setFormError(null)
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el pago.')
    }
  }

  return (
    <section
      ref={formRef}
      className="scroll-mt-6 rounded-md border border-amber-400 bg-[#080705] p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-white">
          {editing ? 'Editar pago' : 'Registrar pago'}
        </h2>
        {editing && <span className="text-[11px] text-amber-400">Modificando {payment.code}</span>}
      </div>

      <p className="mt-2 rounded-md border border-amber-400/25 bg-amber-400/5 px-3 py-2 text-[11px] leading-5 text-amber-100/80">
        Solo completa el N° de reserva, el método y la fecha de pago. El cliente, la
        habitación y el monto se cargan automáticamente.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <div>
          <label htmlFor="payment-code" className={labelClass}>
            N° de pago:
          </label>
          <input
            id="payment-code"
            type="text"
            readOnly
            value={editing ? payment.code : 'Se generará automáticamente'}
            className={`${readOnlyFieldClass} text-amber-200`}
          />
        </div>

        <div>
          <label htmlFor="payment-reservation" className={labelClass}>
            N° de reserva:
          </label>
          <div className="relative">
            <HashIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-400/70" />
            <input
              id="payment-reservation"
              name="reservationNumber"
              type="text"
              list="payment-reservation-options"
              value={form.reservationNumber}
              onChange={handleChange}
              placeholder="Ej. HES-0016"
              autoComplete="off"
              className={`${fieldClass} pl-9 uppercase placeholder:normal-case`}
              aria-invalid={Boolean(errors.reservationNumber)}
              aria-describedby={errors.reservationNumber ? 'payment-reservation-error' : undefined}
            />
            <datalist id="payment-reservation-options">
              {availableReservations.map((reservation) => (
                <option key={reservation.id} value={reservation.code}>
                  {reservation.guestName}
                </option>
              ))}
            </datalist>
          </div>
          {errors.reservationNumber && (
            <p id="payment-reservation-error" role="alert" className="mt-1 text-[11px] text-rose-400">
              {errors.reservationNumber}
            </p>
          )}
          {!errors.reservationNumber && form.reservationNumber && selectedReservation && (
            <p className="mt-1 text-[11px] text-emerald-300">
              Reserva encontrada para {selectedClient?.name ?? selectedReservation.guestName}.
            </p>
          )}
          {!form.reservationNumber && (
            <p className="mt-1 text-[10px] text-stone-600">
              Acepta códigos como HES-0016, #HES-0016 o R0016.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="payment-client" className={labelClass}>
            Nombre del cliente:
          </label>
          <input
            id="payment-client"
            type="text"
            readOnly
            value={selectedClient?.name ?? selectedReservation?.guestName ?? ''}
            placeholder="Se completa automáticamente"
            className={readOnlyFieldClass}
          />
        </div>

        <div>
          <label htmlFor="payment-room" className={labelClass}>
            Habitación:
          </label>
          <input
            id="payment-room"
            type="text"
            readOnly
            value={selectedRoom ? `${selectedRoom.number} · ${selectedRoom.type}` : ''}
            placeholder="Se completa automáticamente"
            className={readOnlyFieldClass}
          />
          {selectedReservation && (
            <p className="mt-1 text-[10px] text-stone-600">
              {tableDate(selectedReservation.checkIn)} – {tableDate(selectedReservation.checkOut)} ·{' '}
              {selectedReservation.nights} noche{selectedReservation.nights === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="payment-amount" className={labelClass}>
            Monto a pagar:
          </label>
          <input
            id="payment-amount"
            type="text"
            readOnly
            value={selectedReservation ? formatSoles(selectedReservation.total) : ''}
            placeholder="Se completa automáticamente"
            className={`${readOnlyFieldClass} font-semibold text-amber-200`}
          />
          {selectedRoom && selectedReservation && (
            <p className="mt-1 text-[10px] text-stone-600">
              {formatSoles(selectedRoom.price)} × {selectedReservation.nights} noche
              {selectedReservation.nights === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="payment-method" className={labelClass}>
            Método de pago:
          </label>
          <select
            id="payment-method"
            name="method"
            value={form.method}
            onChange={handleChange}
            className={fieldClass}
            aria-invalid={Boolean(errors.method)}
            aria-describedby={errors.method ? 'payment-method-error' : undefined}
          >
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.method && (
            <p id="payment-method-error" role="alert" className="mt-1 text-[11px] text-rose-400">
              {errors.method}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="payment-date" className={labelClass}>
            Fecha de pago:
          </label>
          <input
            id="payment-date"
            name="paidAt"
            type="date"
            value={form.paidAt}
            max={todayKey()}
            onChange={handleChange}
            className={fieldClass}
            aria-invalid={Boolean(errors.paidAt)}
            aria-describedby={errors.paidAt ? 'payment-date-error' : undefined}
          />
          {errors.paidAt && (
            <p id="payment-date-error" role="alert" className="mt-1 text-[11px] text-rose-400">
              {errors.paidAt}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="payment-status" className={labelClass}>
            Estado:
          </label>
          {editing ? (
            <select
              id="payment-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={fieldClass}
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input
                id="payment-status"
                type="text"
                readOnly
                value="Pagado"
                className={`${readOnlyFieldClass} text-emerald-200`}
              />
              <p className="mt-1 text-[10px] text-stone-600">
                El pago se registra como Pagado. Puedes cambiarlo al editarlo.
              </p>
            </>
          )}
        </div>

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
            {editing ? 'Guardar cambios' : 'Registrar pago'}
          </button>
        </div>
      </form>
    </section>
  )
}

function Pagos({
  payments,
  reservations,
  rooms,
  clients,
  summary,
  onCreatePayment,
  onUpdatePayment,
  onDeletePayment,
}) {
  const [query, setQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formVersion, setFormVersion] = useState(0)
  const [detailId, setDetailId] = useState(null)
  const [receiptId, setReceiptId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [notice, setNotice] = useState(null)
  const formRef = useRef(null)

  const reservationById = new Map(
    reservations.map((reservation) => [reservation.id, reservation]),
  )
  const clientById = new Map(clients.map((client) => [client.id, client]))
  const roomById = new Map(rooms.map((room) => [room.id, room]))

  const presentedPayments = payments
    .map((payment) => {
      const reservation = reservationById.get(payment.reservationId) ?? null
      const client = reservation ? clientById.get(reservation.clientId) ?? null : null
      const room = reservation ? roomById.get(reservation.roomId) ?? null : null

      return {
        ...payment,
        reservation,
        client,
        room,
        paidOn: paymentDateKey(payment),
      }
    })
    .sort(
      (first, second) =>
        String(second.paidAt ?? '').localeCompare(String(first.paidAt ?? '')) ||
        String(second.code ?? '').localeCompare(String(first.code ?? '')),
    )

  const normalizedQuery = query.trim().toLowerCase().replace(/^#/, '')
  const filteredPayments = presentedPayments.filter((payment) => {
    const searchable = [
      payment.code,
      payment.reservation?.code,
      payment.client?.name ?? payment.reservation?.guestName,
      payment.client?.document,
      payment.client?.email,
      paymentMethodLabel(payment.method),
      paymentStatusLabel(payment.status ?? 'pagado'),
      payment.paidOn,
      tableDate(payment.paidOn),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
    const matchesMethod = !methodFilter || payment.method === methodFilter
    const matchesDate = !dateFilter || payment.paidOn === dateFilter
    const matchesStatus = !statusFilter || (payment.status ?? 'pagado') === statusFilter

    return matchesQuery && matchesMethod && matchesDate && matchesStatus
  })

  const editingPayment = payments.find((payment) => payment.id === editingId) ?? null
  const detailPayment = presentedPayments.find((payment) => payment.id === detailId) ?? null
  const receiptPayment = presentedPayments.find((payment) => payment.id === receiptId) ?? null
  const deletingPayment =
    presentedPayments.find((payment) => payment.id === deletingId) ?? null
  const filtersActive = Boolean(query || methodFilter || dateFilter || statusFilter)

  function scrollToForm() {
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function startCreate() {
    setEditingId(null)
    setFormVersion((version) => version + 1)
    setDetailId(null)
    setReceiptId(null)
    scrollToForm()
  }

  function startEdit(payment) {
    setEditingId(payment.id)
    setFormVersion((version) => version + 1)
    setDetailId(null)
    setReceiptId(null)
    scrollToForm()
  }

  function cancelEdit() {
    setEditingId(null)
    setFormVersion((version) => version + 1)
  }

  function handleSave(input) {
    if (editingId) {
      onUpdatePayment({ id: editingId, ...input })
      setNotice({ type: 'success', message: 'Pago actualizado correctamente.' })
      setEditingId(null)
    } else {
      onCreatePayment(input)
      setNotice({ type: 'success', message: 'Pago registrado correctamente.' })
    }
  }

  function openDelete(payment) {
    if ((payment.status ?? 'pagado') !== 'pagado') {
      setNotice({
        type: 'error',
        message: 'Solo se pueden eliminar pagos con estado Pagado.',
      })
      return
    }

    setDeletingId(payment.id)
    setDetailId(null)
  }

  function confirmDelete() {
    if (!deletingPayment) return

    try {
      onDeletePayment(deletingPayment.id)
      setNotice({
        type: 'success',
        message: `Pago ${deletingPayment.code} eliminado correctamente.`,
      })
      if (editingId === deletingPayment.id) {
        setEditingId(null)
        setFormVersion((version) => version + 1)
      }
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo eliminar el pago.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  function handleDownload(payment) {
    try {
      downloadReceipt(payment)
      setNotice({
        type: 'success',
        message: `Comprobante ${payment.code} descargado.`,
      })
    } catch {
      setNotice({
        type: 'error',
        message: 'No se pudo descargar el comprobante.',
      })
    }
  }

  function clearFilters() {
    setQuery('')
    setMethodFilter('')
    setDateFilter('')
    setStatusFilter('')
  }

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            Gestión de pagos
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Registra y consulta los pagos de las reservas. {formatLongDate()}
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="self-start rounded-md border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 sm:self-auto"
        >
          + Registrar nuevo pago
        </button>
      </header>

      {notice && <PageNotice notice={notice} onClose={() => setNotice(null)} />}

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total de pagos:"
          value={summary.total}
          note={`${summary.paid} pagados · ${summary.pending} pendientes · ${summary.refunded} reembolsados`}
        />
        <StatCard
          label="Monto recaudado:"
          value={formatSoles(summary.collected)}
          note={`${summary.paid} de ${summary.total} pagos con estado Pagado`}
        />
        <StatCard
          label="Pagos de hoy:"
          value={summary.todayCount}
          note="Pagos que ingresaron en el día"
        />
        <StatCard
          label="Ingreso de hoy:"
          value={formatSoles(summary.todayAmount)}
          note="Solo pagos de hoy con estado Pagado"
        />
      </dl>

      <section className="mt-6 rounded-md border border-amber-400/60 bg-[#080705] p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_180px_170px_170px]">
          <div>
            <label htmlFor="payment-search" className={filterLabelClass}>
              Buscar
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/70" />
              <input
                id="payment-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por N° de pago o cliente"
                aria-label="Buscar pagos por número de pago o nombre del cliente"
                className="w-full rounded-md border border-amber-400/45 bg-black/40 py-2 pl-9 pr-3 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
              />
            </div>
          </div>
          <div>
            <label htmlFor="payment-method-filter" className={filterLabelClass}>
              Método de pago
            </label>
            <select
              id="payment-method-filter"
              value={methodFilter}
              onChange={(event) => setMethodFilter(event.target.value)}
              className="w-full rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
            >
              <option value="">Todos los métodos</option>
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="payment-date-filter" className={filterLabelClass}>
              Fecha de pago
            </label>
            <input
              id="payment-date-filter"
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="w-full rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
            />
          </div>
          <div>
            <label htmlFor="payment-status-filter" className={filterLabelClass}>
              Estado
            </label>
            <select
              id="payment-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
            >
              <option value="">Todos los estados</option>
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <section className="overflow-hidden rounded-md border border-amber-400 bg-[#070605] xl:col-start-1 xl:row-start-1">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <h2 className="text-base font-semibold text-white">Historial de pagos</h2>
            <div className="text-right">
              <span className="block text-[11px] text-stone-500">
                {filteredPayments.length} de {payments.length} pagos
              </span>
              <span className="mt-0.5 block text-[9px] text-stone-600 min-[768px]:hidden">
                Desliza la tabla para ver todas las columnas →
              </span>
            </div>
          </div>

          <div className="max-h-[600px] overflow-auto border-t border-amber-400/20">
            <table className="w-full min-w-[960px] border-collapse text-left text-[11px]">
              <thead className="sticky top-0 z-10 bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 text-black">
                <tr>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-[10px] font-semibold">
                    N° de pago
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-[10px] font-semibold">
                    Cliente
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-[10px] font-semibold">
                    N° de reserva
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-[10px] font-semibold">
                    Método
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-[10px] font-semibold">
                    Fecha de pago
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-[10px] font-semibold">
                    Monto
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-[10px] font-semibold">
                    Estado
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-right text-[10px] font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-14 text-center text-sm text-stone-500">
                      No se encontraron pagos con esos filtros.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => {
                    const status = payment.status ?? 'pagado'
                    const removable = status === 'pagado'

                    return (
                      <tr
                        key={payment.id}
                        className={`border-b border-amber-400/10 transition hover:bg-amber-400/[0.04] ${
                          detailId === payment.id ? 'bg-amber-400/[0.05]' : ''
                        }`}
                      >
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => setDetailId(payment.id)}
                            className="font-semibold text-amber-300 transition hover:text-amber-200"
                            title="Ver detalle del pago"
                          >
                            {payment.code}
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => setDetailId(payment.id)}
                            className="block w-full min-w-0 max-w-[190px] text-left"
                            title="Ver detalle del pago"
                          >
                            <span className="block truncate text-stone-200">
                              {payment.client?.name ?? payment.reservation?.guestName ?? '—'}
                            </span>
                            <span className="mt-0.5 block truncate text-[9px] text-stone-500">
                              Doc. {payment.client?.document ?? '—'}
                            </span>
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <span className="block text-stone-300">
                            {payment.reservation?.code ?? '—'}
                          </span>
                          <span className="mt-0.5 block text-[9px] text-stone-500">
                            {payment.room ? `Hab. ${payment.room.number}` : 'Sin habitación'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-stone-300">
                          {paymentMethodLabel(payment.method)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-stone-300">
                          {tableDate(payment.paidOn)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-medium text-amber-200">
                          {formatSoles(payment.amount)}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-0.5">
                            <RowAction
                              label={`Ver detalle del pago ${payment.code}`}
                              onClick={() => setDetailId(payment.id)}
                              className="text-stone-400 hover:bg-amber-400/10 hover:text-amber-200"
                            >
                              <EyeIcon className="h-3.5 w-3.5" />
                            </RowAction>
                            <RowAction
                              label={`Ver comprobante del pago ${payment.code}`}
                              onClick={() => setReceiptId(payment.id)}
                              className="text-amber-300/80 hover:bg-amber-400/10 hover:text-amber-200"
                            >
                              <ReceiptIcon className="h-3.5 w-3.5" />
                            </RowAction>
                            <RowAction
                              label={`Descargar comprobante del pago ${payment.code}`}
                              onClick={() => handleDownload(payment)}
                              className="text-sky-300/80 hover:bg-sky-400/10 hover:text-sky-200"
                            >
                              <DownloadIcon className="h-3.5 w-3.5" />
                            </RowAction>
                            <RowAction
                              label={`Editar pago ${payment.code}`}
                              onClick={() => startEdit(payment)}
                              className="text-amber-300/80 hover:bg-amber-400/10 hover:text-amber-200"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                            </RowAction>
                            <RowAction
                              label={
                                removable
                                  ? `Eliminar pago ${payment.code}`
                                  : 'Solo se pueden eliminar pagos con estado Pagado'
                              }
                              onClick={() => openDelete(payment)}
                              disabled={!removable}
                              className="text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-300"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </RowAction>
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

        <aside className="xl:sticky xl:top-6 xl:col-start-2 xl:row-start-1 xl:max-h-[calc(100svh-3rem)] xl:overflow-y-auto xl:pr-1">
          <PaymentForm
            key={`${editingId ?? 'new'}-${formVersion}`}
            payment={editingPayment}
            reservations={reservations}
            payments={payments}
            clients={clients}
            rooms={rooms}
            onSave={handleSave}
            onCancelEdit={cancelEdit}
            formRef={formRef}
          />
        </aside>
      </div>

      {detailPayment && (
        <PaymentDetail
          payment={detailPayment}
          onClose={() => setDetailId(null)}
          onEdit={startEdit}
          onViewReceipt={(payment) => {
            setDetailId(null)
            setReceiptId(payment.id)
          }}
          onDelete={openDelete}
        />
      )}

      {receiptPayment && (
        <ReceiptDialog
          payment={receiptPayment}
          onClose={() => setReceiptId(null)}
          onDownload={handleDownload}
        />
      )}

      {deletingPayment && (
        <DeletePaymentDialog
          payment={deletingPayment}
          onCancel={() => setDeletingId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  )
}

export default Pagos
