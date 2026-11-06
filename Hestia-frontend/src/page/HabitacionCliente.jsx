import { useState } from 'react'
import {
  ROOM_TYPES,
  defaultRoomImage,
  roomDescription,
  roomStatusLabel,
} from '../data/hestiaData.js'
import { roomIsReservable } from '../lib/clientBooking.js'
import { formatSoles } from '../lib/format.js'
import { RoomCard } from '../components/cliente/cards.jsx'
import {
  BedIcon,
  CheckIcon,
  CoffeeIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
  WifiIcon,
} from '../components/cliente/icons.jsx'
import {
  EmptyState,
  inputClass,
  labelClass,
  Modal,
  PageHeading,
  primaryButtonClass,
  secondaryButtonClass,
  StatusBadge,
} from '../components/cliente/ui.jsx'

const CAPACITY_OPTIONS = [
  { value: '', label: 'Cualquier capacidad' },
  { value: '1', label: '1 huésped' },
  { value: '2', label: '2 huéspedes' },
  { value: '3', label: '3 huéspedes' },
  { value: '4', label: '4 huéspedes' },
]

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recomendadas' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'number', label: 'Número de habitación' },
]

function HabitacionCliente({ data, onReserveRoom }) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [capacityFilter, setCapacityFilter] = useState('')
  const [sort, setSort] = useState('recommended')
  const [selectedRoom, setSelectedRoom] = useState(null)

  const catalog = data.rooms.filter((room) => room.status !== 'inactiva')
  const normalizedQuery = query.trim().toLowerCase()
  const minCapacity = Number(capacityFilter) || 0

  let filtered = catalog.filter((room) => {
    if (typeFilter && room.type !== typeFilter) return false
    if (minCapacity && room.capacity < minCapacity) return false
    if (!normalizedQuery) return true

    return [room.number, room.type, room.description]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery))
  })

  if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  else if (sort === 'number') {
    filtered = [...filtered].sort((a, b) => a.number.localeCompare(b.number))
  }

  const availableCount = catalog.filter(roomIsReservable).length
  const filtersActive = Boolean(query || typeFilter || capacityFilter || sort !== 'recommended')

  function clearFilters() {
    setQuery('')
    setTypeFilter('')
    setCapacityFilter('')
    setSort('recommended')
  }

  return (
    <>
      <section className="border-b border-amber-400/15 bg-[#070605]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            eyebrow="Elige tu espacio"
            title="Habitaciones"
            description="Cada habitación tiene su propio carácter. Encuentra la que mejor acompaña tu viaje a Cusco."
            action={
              <div className="rounded-lg border border-amber-400/30 bg-black/30 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                  Disponibles
                </p>
                <p className="text-xl font-bold text-amber-200">
                  {availableCount}
                  <span className="ml-1 text-xs font-medium text-stone-500">
                    de {catalog.length}
                  </span>
                </p>
              </div>
            }
          />

          <div className="mt-6 rounded-xl border border-amber-400/30 bg-[#080705] p-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_180px_200px_190px]">
              <div>
                <label htmlFor="client-room-search" className={labelClass}>
                  Buscar
                </label>
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/70" />
                  <input
                    id="client-room-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Número, tipo o descripción..."
                    aria-label="Buscar habitaciones"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="client-room-type" className={labelClass}>
                  Tipo
                </label>
                <select
                  id="client-room-type"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className={inputClass}
                >
                  <option value="" className="bg-[#0b0a07]">
                    Todos
                  </option>
                  {ROOM_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#0b0a07]">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="client-room-capacity" className={labelClass}>
                  Capacidad
                </label>
                <select
                  id="client-room-capacity"
                  value={capacityFilter}
                  onChange={(event) => setCapacityFilter(event.target.value)}
                  className={inputClass}
                >
                  {CAPACITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#0b0a07]">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="client-room-sort" className={labelClass}>
                  Ordenar por
                </label>
                <select
                  id="client-room-sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className={inputClass}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#0b0a07]">
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
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Nuestras habitaciones</h2>
          <span className="text-[11px] text-stone-500">
            {filtered.length} de {catalog.length} opciones
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={BedIcon}
              title="No encontramos habitaciones con esos filtros"
              description="Prueba con otro tipo de habitación, una capacidad menor o limpia los filtros."
              action={
                <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
                  Limpiar filtros
                </button>
              }
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onView={setSelectedRoom}
                onReserve={onReserveRoom}
              />
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: WifiIcon, title: 'Wi-Fi incluido', text: 'Conexión en todas las áreas.' },
            { icon: CoffeeIcon, title: 'Desayuno de la casa', text: 'Sabores andinos cada mañana.' },
            { icon: ShieldIcon, title: 'Reserva segura', text: 'Tus datos y tu estadía protegidos.' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-lg border border-white/5 bg-black/20 px-4 py-3"
            >
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80" />
              <div>
                <p className="text-xs font-semibold text-stone-200">{item.title}</p>
                <p className="mt-0.5 text-[10px] text-stone-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal
        open={Boolean(selectedRoom)}
        onClose={() => setSelectedRoom(null)}
        title={selectedRoom ? `Habitación ${selectedRoom.number}` : 'Habitación'}
        description={selectedRoom ? `${selectedRoom.type} · Piso ${selectedRoom.floor}` : ''}
        size="lg"
        footer={
          selectedRoom && (
            <>
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className={secondaryButtonClass}
              >
                Volver al catálogo
              </button>
              <button
                type="button"
                onClick={() => {
                  onReserveRoom(selectedRoom)
                  setSelectedRoom(null)
                }}
                disabled={!roomIsReservable(selectedRoom)}
                className={primaryButtonClass}
              >
                Reservar esta habitación
              </button>
            </>
          )
        }
      >
        {selectedRoom && (
          <div>
            <div className="relative overflow-hidden rounded-xl border border-amber-400/30">
              <img
                src={selectedRoom.image || defaultRoomImage(selectedRoom.type)}
                alt={`Habitación ${selectedRoom.number}`}
                onError={(event) => {
                  const fallback = defaultRoomImage(selectedRoom.type)
                  if (!fallback || event.currentTarget.getAttribute('src') === fallback) return
                  event.currentTarget.onerror = null
                  event.currentTarget.src = fallback
                }}
                className="h-64 w-full object-cover sm:h-80"
              />
              <span className="absolute right-3 top-3">
                <StatusBadge
                  status={selectedRoom.status}
                  label={roomStatusLabel(selectedRoom.status)}
                />
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedRoom.type} · Habitación {selectedRoom.number}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  {selectedRoom.description || roomDescription(selectedRoom.type)}
                </p>
              </div>
              <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                  Por noche
                </p>
                <p className="text-2xl font-bold text-amber-200">
                  {formatSoles(selectedRoom.price)}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2.5">
                <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-stone-500">
                  <UsersIcon className="h-3.5 w-3.5" /> Capacidad
                </dt>
                <dd className="mt-1 text-sm font-semibold text-stone-200">
                  Hasta {selectedRoom.capacity} huéspedes
                </dd>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2.5">
                <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-stone-500">
                  <BedIcon className="h-3.5 w-3.5" /> Tipo
                </dt>
                <dd className="mt-1 text-sm font-semibold text-stone-200">{selectedRoom.type}</dd>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2.5">
                <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-stone-500">
                  <CheckIcon className="h-3.5 w-3.5" /> Incluye
                </dt>
                <dd className="mt-1 text-sm font-semibold text-stone-200">Desayuno y Wi-Fi</dd>
              </div>
            </dl>

            <div className="mt-5 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-[11px] leading-5 text-stone-400">
              La disponibilidad se valida al elegir las fechas de tu estadía. Si la habitación
              está ocupada hoy, aún puedes reservarla para fechas futuras.
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default HabitacionCliente
