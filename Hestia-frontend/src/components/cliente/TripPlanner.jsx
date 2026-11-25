import { useState } from 'react'
import { buildCuscoItinerary } from '../../data/cuscoItinerary.js'
import CuscoMap from './CuscoMap.jsx'
import { ClockIcon, MapPinIcon, SparklesIcon } from './icons.jsx'

// Color de fondo del Modal (ui.jsx: bg-[#080705]) — las muescas del boleto
// se "recortan" con este mismo color para que se vean como perforaciones.
const TICKET_BG = '#080705'

function TicketNotches() {
  return (
    <div className="relative w-0 shrink-0 self-stretch">
      <span
        className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: TICKET_BG }}
        aria-hidden="true"
      />
      <div className="h-full border-l-2 border-dashed border-amber-400/30" />
      <span
        className="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: TICKET_BG }}
        aria-hidden="true"
      />
    </div>
  )
}

function DayTicket({ day, active, onSelect }) {
  const hero = day.pois[0]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-36 w-full overflow-hidden rounded-2xl border text-left transition ${
        active
          ? 'border-amber-400 shadow-[0_0_0_1px_rgba(245,158,11,0.4),0_14px_32px_-14px_rgba(245,158,11,0.4)]'
          : 'border-amber-400/20 hover:border-amber-400/45'
      }`}
    >
      {/* Talón principal: foto + info del día */}
      <div className="relative min-w-0 flex-1">
        {hero?.image && (
          <img
            src={hero.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/15" />
        <div className="relative flex h-full flex-col justify-between gap-6 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-400/70 bg-black/50 text-sm font-black text-amber-300">
              {day.day}
            </span>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-300">
              Hestia · Pase Cusco
            </p>
          </div>
          <div>
            <h3 className="text-base font-bold leading-tight text-white drop-shadow-sm">
              {day.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-stone-300">
              {day.description}
            </p>
          </div>
        </div>
      </div>

      <TicketNotches />

      {/* Talón desprendible: paradas del día + tip */}
      <div className="flex w-[34%] shrink-0 flex-col justify-between bg-black/30 p-3 sm:w-40">
        <div>
          <p className="text-[8px] uppercase tracking-[0.18em] text-stone-500">Paradas</p>
          <p className="text-sm font-bold text-stone-100">{day.pois.length}</p>
          <div className="mt-2 flex -space-x-2">
            {day.pois.slice(0, 4).map((poi) =>
              poi.image ? (
                <img
                  key={poi.id}
                  src={poi.image}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover"
                  style={{ boxShadow: `0 0 0 2px ${TICKET_BG}` }}
                />
              ) : (
                <span
                  key={poi.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/15"
                  style={{ boxShadow: `0 0 0 2px ${TICKET_BG}` }}
                >
                  <MapPinIcon className="h-3 w-3 text-amber-400/80" />
                </span>
              ),
            )}
            {day.pois.length > 4 && (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-[9px] font-bold text-amber-200"
                style={{ boxShadow: `0 0 0 2px ${TICKET_BG}` }}
              >
                +{day.pois.length - 4}
              </span>
            )}
          </div>
        </div>

        {day.tip && (
          <p className="mt-3 line-clamp-4 flex items-start gap-1 text-[9.5px] leading-[1.1] text-amber-100/80">
            <SparklesIcon className="mt-0.5 h-3 w-3 shrink-0 text-amber-300" />
            {day.tip}
          </p>
        )}
      </div>
    </button>
  )
}

function TripPlanner({ reservation }) {
  const itinerary = buildCuscoItinerary({
    nights: reservation.nights,
    guests: reservation.guests,
  })
  const [activeDay, setActiveDay] = useState(0)

  return (
    <div>
      <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
          {itinerary.travelerLabel} · {reservation.nights} {reservation.nights === 1 ? 'noche' : 'noches'}
        </p>
        <p className="mt-1.5 text-xs leading-5 text-stone-300">{itinerary.intro}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {itinerary.days.map((day, index) => (
          <button
            key={day.day}
            type="button"
            onClick={() => setActiveDay(index)}
            aria-current={activeDay === index}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
              activeDay === index
                ? 'border-amber-400 bg-amber-400 text-black'
                : 'border-amber-400/25 text-stone-300 hover:border-amber-400/50'
            }`}
          >
            Día {day.day}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <CuscoMap days={itinerary.days} activeIndex={activeDay} />
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-stone-500">
          <ClockIcon className="h-3 w-3" /> Mapa: © colaboradores de OpenStreetMap. Fotos: Wikimedia Commons.
          Ubicaciones referenciales.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {itinerary.days.map((day, index) => (
          <DayTicket
            key={day.day}
            day={day}
            active={activeDay === index}
            onSelect={() => setActiveDay(index)}
          />
        ))}
      </div>

      {itinerary.extraNights > 0 && (
        <p className="mt-3 text-[11px] text-stone-500">
          Tu estadía tiene {itinerary.extraNights} {itinerary.extraNights === 1 ? 'noche adicional' : 'noches adicionales'} —
          buen momento para repetir tu lugar favorito o descansar antes del viaje de regreso.
        </p>
      )}
    </div>
  )
}

export default TripPlanner
