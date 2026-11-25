import { lazy, Suspense, useMemo, useState } from 'react'
import {
  buildCuscoItinerary,
  HOTEL,
  POI_CATALOG,
  poiById,
} from '../../data/cuscoItinerary.js'
import { buildDayStops } from '../../lib/tripRoute.js'
import CuscoMap from './CuscoMap.jsx'
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  MapPinIcon,
  PlusIcon,
  SparklesIcon,
} from './icons.jsx'

// MapLibre pesa ~1 MB: se carga solo cuando el huésped abre su plan.
const CuscoMap3D = lazy(() => import('./CuscoMap3D.jsx'))

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

function StopsEditor({ poiIds, onChange }) {
  const available = POI_CATALOG.filter((poi) => !poiIds.includes(poi.id))

  function move(index, delta) {
    const next = [...poiIds]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/5 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
        Edita las paradas del día
      </p>
      <ol className="mt-2 grid gap-1.5">
        {poiIds.map((id, index) => {
          const poi = poiById(id)
          if (!poi) return null
          return (
            <li
              key={id}
              className="flex items-center gap-2 rounded-lg border border-amber-400/15 bg-black/30 px-2 py-1.5"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-black">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-stone-100">{poi.name}</span>
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Subir ${poi.name}`}
                className="rounded px-1.5 text-xs text-stone-300 hover:text-amber-200 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === poiIds.length - 1}
                aria-label={`Bajar ${poi.name}`}
                className="rounded px-1.5 text-xs text-stone-300 hover:text-amber-200 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onChange(poiIds.filter((item) => item !== id))}
                aria-label={`Quitar ${poi.name}`}
                className="rounded p-1 text-stone-400 hover:text-rose-300"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </li>
          )
        })}
      </ol>
      {poiIds.length === 0 && (
        <p className="mt-2 text-[11px] text-stone-400">Agrega al menos una parada para armar tu ruta.</p>
      )}
      {available.length > 0 && (
        <label className="mt-2 flex items-center gap-2 text-[11px] text-stone-300">
          <PlusIcon className="h-3.5 w-3.5 text-amber-300" />
          <select
            value=""
            onChange={(event) => event.target.value && onChange([...poiIds, event.target.value])}
            className="min-w-0 flex-1 rounded-md border border-amber-400/25 bg-black/50 px-2 py-1.5 text-xs text-stone-100"
          >
            <option value="">Agregar una parada…</option>
            {available.map((poi) => (
              <option key={poi.id} value={poi.id}>
                {poi.name} · {poi.category}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}

function TripPlanner({ reservation, onSavePlan }) {
  const [plan, setPlan] = useState(reservation.tripPlan ?? null)
  const itinerary = useMemo(
    () => buildCuscoItinerary({ nights: reservation.nights, guests: reservation.guests, plan }),
    [reservation.nights, reservation.guests, plan],
  )
  const [activeDay, setActiveDay] = useState(0)
  const [activeStop, setActiveStop] = useState(0)
  const [draft, setDraft] = useState(null) // poiIds del día en edición, o null
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' })

  const day = itinerary.days[activeDay]
  const editing = draft !== null
  const dayPois = useMemo(
    () => (editing ? draft.map(poiById).filter(Boolean) : (day?.pois ?? [])),
    [editing, draft, day],
  )
  const stops = useMemo(() => buildDayStops(HOTEL, dayPois), [dayPois])

  function selectDay(index) {
    setActiveDay(index)
    setActiveStop(0)
    setDraft(null)
    setSaveState({ status: 'idle', message: '' })
  }

  async function persist(nextPlan, message) {
    setPlan(nextPlan)
    setDraft(null)
    if (!onSavePlan) {
      setSaveState({ status: 'saved', message })
      return
    }
    setSaveState({ status: 'saving', message: 'Guardando tu ruta…' })
    try {
      await onSavePlan(reservation.id, nextPlan)
      setSaveState({ status: 'saved', message })
    } catch (error) {
      setSaveState({ status: 'error', message: error.message ?? 'No se pudo guardar la ruta.' })
    }
  }

  function saveDraft() {
    // Solo se guardan los días que el huésped editó; el resto sigue la sugerencia.
    const otherDays = (plan?.days ?? []).filter((item) => item.day !== day.day)
    const nextPlan = {
      version: 1,
      days: [...otherDays, { day: day.day, poiIds: draft }].sort((a, b) => a.day - b.day),
    }
    void persist(nextPlan, `Ruta del día ${day.day} guardada en tu reserva.`)
  }

  function restoreSuggested() {
    if (!plan) return
    const nextDays = plan.days.filter((item) => item.day !== day.day)
    void persist(nextDays.length ? { ...plan, days: nextDays } : null, `Día ${day.day}: volviste a la ruta sugerida.`)
  }

  return (
    <div>
      <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
          {itinerary.travelerLabel} · {reservation.nights} {reservation.nights === 1 ? 'noche' : 'noches'}
        </p>
        <p className="mt-1.5 text-xs leading-5 text-stone-300">{itinerary.intro}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {itinerary.days.map((item, index) => (
          <button
            key={item.day}
            type="button"
            onClick={() => selectDay(index)}
            aria-current={activeDay === index}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
              activeDay === index
                ? 'border-amber-400 bg-amber-400 text-black'
                : 'border-amber-400/25 text-stone-300 hover:border-amber-400/50'
            }`}
          >
            Día {item.day}
            {item.custom && ' ✎'}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <Suspense
          fallback={
            <div className="flex h-[26rem] items-center justify-center rounded-xl border border-amber-400/30 text-xs text-stone-500">
              Cargando mapa 3D…
            </div>
          }
        >
          <CuscoMap3D
            stops={stops}
            onStopChange={setActiveStop}
            fallback={<CuscoMap days={itinerary.days} activeIndex={activeDay} />}
          />
        </Suspense>
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-stone-500">
          <ClockIcon className="h-3 w-3" /> Mapa: © OpenFreeMap, © colaboradores de OpenStreetMap. Relieve: AWS
          Terrain Tiles. Rutas: OSRM. Fotos: Wikimedia Commons. Ubicaciones y tiempos referenciales.
        </p>
      </div>

      {day && (
        <div className="mt-3 rounded-xl border border-amber-400/20 bg-black/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-stone-100">
              Día {day.day} · {day.title}
              {day.custom && !editing && (
                <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-200">
                  Tu ruta
                </span>
              )}
            </p>
            {editing ? (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="rounded-full border border-amber-400/30 px-3 py-1 text-[11px] text-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={draft.length === 0}
                  className="flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold text-black disabled:opacity-40"
                >
                  <CheckIcon className="h-3 w-3" /> Guardar ruta
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                {day.custom && (
                  <button
                    type="button"
                    onClick={restoreSuggested}
                    className="rounded-full border border-amber-400/30 px-3 py-1 text-[11px] text-stone-300"
                  >
                    Volver a la sugerida
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDraft(day.pois.map((poi) => poi.id))}
                  className="rounded-full border border-amber-400 px-3 py-1 text-[11px] font-semibold text-amber-200"
                >
                  ✎ Personalizar mi ruta
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <StopsEditor poiIds={draft} onChange={setDraft} />
          ) : (
            <ol className="mt-2 flex flex-wrap items-center gap-1 text-[11px]">
              {stops.map((stop, index) => (
                <li key={`${stop.id}-${index}`} className="flex items-center gap-1">
                  {index > 0 && <ArrowRightIcon className="h-3 w-3 text-stone-600" />}
                  <span
                    className={`rounded-full px-2 py-0.5 transition ${
                      index === activeStop
                        ? 'bg-amber-400 font-semibold text-black'
                        : 'bg-white/5 text-stone-300'
                    }`}
                  >
                    {stop.id === HOTEL.id ? '🏨 ' : ''}
                    {stop.name}
                  </span>
                </li>
              ))}
            </ol>
          )}

          {saveState.message && (
            <p
              role="status"
              className={`mt-2 text-[11px] ${
                saveState.status === 'error' ? 'text-rose-300' : 'text-emerald-300'
              }`}
            >
              {saveState.message}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3">
        {itinerary.days.map((item, index) => (
          <DayTicket
            key={item.day}
            day={item}
            active={activeDay === index}
            onSelect={() => selectDay(index)}
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
