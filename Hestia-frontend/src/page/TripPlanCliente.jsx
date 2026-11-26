import TripPlanner from '../components/cliente/TripPlanner.jsx'
import { ArrowRightIcon, MapPinIcon } from '../components/cliente/icons.jsx'
import { EmptyState, PageHeading, secondaryButtonClass } from '../components/cliente/ui.jsx'
import { formatShortDate } from '../lib/format.js'

function TripPlanCliente({ session, data, reservationId, onSavePlan, onBack }) {
  const reservation = session
    ? data.reservations.find(
        (item) => item.id === reservationId && item.clientId === session.id,
      )
    : null

  if (!session || !reservation) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          icon={MapPinIcon}
          title="No encontramos esa reserva"
          description="Vuelve a tus reservas y abre tu plan desde ahí."
          action={
            <button type="button" onClick={onBack} className={secondaryButtonClass}>
              Volver a mis reservas
            </button>
          }
        />
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeading
        eyebrow={reservation.code}
        title="Tu plan en Cusco"
        description={`${formatShortDate(reservation.checkIn)} al ${formatShortDate(reservation.checkOut)}`}
        action={
          <button type="button" onClick={onBack} className={secondaryButtonClass}>
            <ArrowRightIcon className="h-4 w-4 rotate-180" /> Volver a mis reservas
          </button>
        }
      />

      <div className="mt-6">
        <TripPlanner reservation={reservation} onSavePlan={onSavePlan} />
      </div>
    </section>
  )
}

export default TripPlanCliente
