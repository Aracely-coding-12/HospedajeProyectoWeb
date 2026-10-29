import { formatLongDate, formatShortDate, formatSoles } from '../lib/format.js'

const datePartsFormatter = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' })

function dateParts(dateKey) {
  const parts = datePartsFormatter.formatToParts(new Date(`${dateKey}T12:00:00`))
  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value?.replace('.', '') ?? ''

  return { day, month }
}

function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className={className}>
      <path d="m5 12.5 4.2 4.2L19 6.8" strokeLinecap="round" strokeLinejoin="round" />
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
        <span className="mt-2 block text-[11px] leading-4 text-stone-500">{note}</span>
      </dd>
    </div>
  )
}

function StatusBadge({ status }) {
  const pending = status === 'pendiente'

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        pending
          ? 'border-stone-500/60 bg-stone-500/10 text-stone-300'
          : 'border-amber-400/50 bg-amber-400/10 text-amber-200'
      }`}
    >
      {status === 'pendiente' ? 'Pendiente' : 'Confirmada'}
    </span>
  )
}

function ReservationRow({ reservation, showCreatedAt = false }) {
  const { day, month } = dateParts(reservation.checkIn)

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="flex w-12 shrink-0 flex-col items-center rounded-md border border-amber-400/40 bg-amber-400/5 px-1 py-1.5">
        <span className="text-base font-bold leading-none text-amber-200">{day}</span>
        <span className="mt-1 text-[9px] uppercase tracking-wide text-stone-400">{month}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-amber-50">{reservation.guestName}</p>
        <p className="mt-0.5 truncate text-[11px] text-stone-500">
          Hab. {reservation.roomNumber} · {formatShortDate(reservation.checkIn)} –{' '}
          {formatShortDate(reservation.checkOut)}
        </p>
        {showCreatedAt && (
          <p className="mt-0.5 text-[10px] text-stone-600">
            Registrada el {formatShortDate(reservation.createdAt.slice(0, 10))}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-semibold text-amber-200">{formatSoles(reservation.total)}</span>
        <StatusBadge status={reservation.status} />
      </div>
    </li>
  )
}

function ReservationsPanel({ title, emptyMessage, reservations, showCreatedAt = false }) {
  return (
    <section className="overflow-hidden rounded-md border border-amber-400 bg-[#070605]">
      <div className="px-4 py-3">
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div
        aria-hidden="true"
        className="h-6 w-full bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500"
      />
      <div className="px-4 py-2">
        {reservations.length === 0 ? (
          <p className="flex min-h-[120px] items-center justify-center text-center text-sm text-stone-400">
            {emptyMessage}
          </p>
        ) : (
          <ul className="divide-y divide-amber-400/10">
            {reservations.map((reservation) => (
              <ReservationRow
                key={reservation.id}
                reservation={reservation}
                showCreatedAt={showCreatedAt}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function Inicio({ summary, notice, onDismissNotice, onCreateReservation }) {
  const { rooms, reservationsToday, clients, revenueToday, upcomingReservations, recentReservations } =
    summary

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            Bienvenido Administrador/a
          </h1>
          <p className="mt-1 text-xs text-stone-500">{formatLongDate()}</p>
        </div>
        <button
          type="button"
          onClick={onCreateReservation}
          className="self-start rounded-md border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 sm:self-auto"
        >
          + Crear reserva
        </button>
      </header>

      {notice && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
            <CheckIcon className="h-3 w-3" />
          </span>
          <p className="flex-1">{notice}</p>
          <button
            type="button"
            onClick={onDismissNotice}
            aria-label="Cerrar aviso"
            className="rounded p-0.5 text-emerald-300 transition hover:bg-emerald-400/10 hover:text-emerald-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-4 w-4">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Habitaciones ocupadas:"
          value={`${rooms.occupied}/${rooms.total}`}
          note={`${rooms.total} habitaciones registradas`}
        />
        <StatCard
          label="Reservas de hoy:"
          value={reservationsToday}
          note="Reservas registradas en el día"
        />
        <StatCard
          label="Clientes registrados:"
          value={clients}
          note="Huéspedes en el sistema"
        />
        <StatCard
          label="Ingreso de hoy:"
          value={formatSoles(revenueToday)}
          note="Pagos registrados hoy"
        />
      </dl>

      <div className="mt-10 space-y-6">
        <ReservationsPanel
          title="Próximas reservas"
          emptyMessage="No hay reservas próximas"
          reservations={upcomingReservations}
        />
        <ReservationsPanel
          title="Reservas recientes"
          emptyMessage="No hay reservas recientes"
          reservations={recentReservations}
          showCreatedAt
        />
      </div>
    </>
  )
}

export default Inicio
