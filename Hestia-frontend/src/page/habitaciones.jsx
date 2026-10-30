import { useRef, useState } from 'react'
import {
  DEFAULT_ROOM_IMAGES,
  ROOM_STATUS_OPTIONS,
  ROOM_TYPES,
  roomStatusLabel,
} from '../data/hestiaData.js'
import { formatSoles } from '../lib/format.js'

const EMPTY_FORM = {
  number: '',
  type: '',
  capacity: '',
  price: '',
  status: 'disponible',
  image: '',
  description: '',
}

const STATUS_STYLES = {
  disponible: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200',
  ocupada: 'border-amber-400/60 bg-amber-400/10 text-amber-200',
  mantenimiento: 'border-sky-400/50 bg-sky-400/10 text-sky-200',
  inactiva: 'border-stone-500/60 bg-stone-500/10 text-stone-400',
}

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

function ChevronDownIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
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

function UsersIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
      <path d="M16 5.8a3 3 0 0 1 0 5.4M17.5 14.3a5 5 0 0 1 3 4.7" strokeLinecap="round" />
    </svg>
  )
}

function PriceIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.3 9.2h4a2 2 0 0 1 0 4h-2.6a2 2 0 0 0 0 4h4.3" strokeLinecap="round" />
    </svg>
  )
}

function ImageIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="9.5" r="1.6" />
      <path d="m4.5 17 4.2-4.2 3 3 2.6-2.6 5.2 5.2" strokeLinecap="round" strokeLinejoin="round" />
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

function RoomStatCard({ label, value, note }) {
  return (
    <div className="rounded-md border border-amber-400 bg-[#080705] px-4 py-3">
      <dt className="text-[11px] font-medium tracking-wide text-stone-100">{label}</dt>
      <dd>
        <span className="mt-1 block text-[26px] font-bold leading-none text-white">{value}</span>
        {note && <span className="mt-1.5 block text-[10px] text-stone-500">{note}</span>}
      </dd>
    </div>
  )
}

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status] ?? STATUS_STYLES.inactiva}`}
    >
      {roomStatusLabel(status)}
    </span>
  )
}

function StatusSelect({ room, onChange }) {
  return (
    <div
      className={`relative inline-flex items-center rounded-full border transition focus-within:ring-2 focus-within:ring-amber-300/30 ${STATUS_STYLES[room.status] ?? STATUS_STYLES.inactiva}`}
    >
      <select
        value={room.status}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`Cambiar estado de la habitación ${room.number}`}
        title="Cambiar estado"
        className="cursor-pointer appearance-none rounded-full bg-transparent py-1 pl-2.5 pr-7 text-[10px] font-semibold uppercase tracking-wide outline-none"
      >
        {ROOM_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0b0a07] text-stone-100">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 h-3 w-3" />
    </div>
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

function DeleteRoomDialog({ room, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-room-title"
        aria-describedby="delete-room-description"
        className="w-full max-w-sm rounded-xl border border-rose-500/50 bg-[#0b0a07] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300">
          <TrashIcon className="h-5 w-5" />
        </span>
        <h2 id="delete-room-title" className="mt-4 text-lg font-semibold text-white">
          Eliminar habitación {room.number}
        </h2>
        <p id="delete-room-description" className="mt-2 text-sm leading-6 text-stone-400">
          Esta acción quitará la habitación del listado y no se puede deshacer. Si solo dejará de
          ofrecerse temporalmente, puedes cambiar su estado a <strong className="text-stone-200">Inactiva</strong>.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-stone-600 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-stone-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

function Habitaciones({ rooms, onCreateRoom, onUpdateRoom, onDeleteRoom, onStatusChange }) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState(() => rooms[0]?.id ?? null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [deletingRoom, setDeletingRoom] = useState(null)
  const formRef = useRef(null)

  const available = rooms.filter((room) => room.status === 'disponible').length
  const occupied = rooms.filter((room) => room.status === 'ocupada').length
  const maintenance = rooms.filter((room) => room.status === 'mantenimiento').length
  const inactive = rooms.filter((room) => room.status === 'inactiva').length

  const normalizedQuery = query.trim().toLowerCase()
  const filteredRooms = rooms
    .filter((room) => {
      const matchesQuery =
        !normalizedQuery ||
        [room.number, room.type, roomStatusLabel(room.status)].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        )
      const matchesType = !typeFilter || room.type === typeFilter
      const matchesStatus = !statusFilter || room.status === statusFilter

      return matchesQuery && matchesType && matchesStatus
    })
    .sort((first, second) => first.number.localeCompare(second.number, 'es', { numeric: true }))

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? null
  const previewImage = form.image || (form.type ? DEFAULT_ROOM_IMAGES[form.type] : '')

  function resetForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  function scrollToForm() {
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => {
      if (name !== 'type') return { ...current, [name]: value }

      const defaultImages = Object.values(DEFAULT_ROOM_IMAGES)
      const hasCustomImage = Boolean(current.image) && !defaultImages.includes(current.image)

      return {
        ...current,
        type: value,
        image: hasCustomImage ? current.image : DEFAULT_ROOM_IMAGES[value] || '',
      }
    })
    setFormError(null)
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFormError('Selecciona un archivo de imagen válido (JPG, PNG o WEBP).')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError('La imagen no debe superar los 2 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({ ...current, image: String(reader.result) }))
      setFormError(null)
    }
    reader.onerror = () => setFormError('No se pudo leer la imagen seleccionada.')
    reader.readAsDataURL(file)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)

    try {
      if (editingId) {
        onUpdateRoom({ id: editingId, ...form })
        setNotice({ type: 'success', message: 'Habitación actualizada correctamente.' })
      } else {
        onCreateRoom(form)
        setNotice({ type: 'success', message: 'Habitación registrada correctamente.' })
      }
      resetForm()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar la habitación.')
    }
  }

  function startCreate() {
    resetForm()
    scrollToForm()
  }

  function startEdit(room) {
    setEditingId(room.id)
    setForm({
      number: room.number,
      type: room.type,
      capacity: String(room.capacity),
      price: String(room.price),
      status: room.status,
      image: room.image,
      description: room.description,
    })
    setFormError(null)
    setSelectedRoomId(room.id)
    scrollToForm()
  }

  function handleStatusChange(room, status) {
    try {
      onStatusChange(room.id, status)
      setNotice({
        type: 'success',
        message: `Estado de la habitación ${room.number} actualizado a ${roomStatusLabel(status).toLowerCase()}.`,
      })
      if (editingId === room.id) {
        setForm((current) => ({ ...current, status }))
      }
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo actualizar el estado.',
      })
    }
  }

  function confirmDelete() {
    try {
      onDeleteRoom(deletingRoom.id)
      if (editingId === deletingRoom.id) resetForm()
      if (selectedRoomId === deletingRoom.id) setSelectedRoomId(null)
      setNotice({
        type: 'success',
        message: `Habitación ${deletingRoom.number} eliminada correctamente.`,
      })
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo eliminar la habitación.',
      })
    }
    setDeletingRoom(null)
  }

  function clearFilters() {
    setQuery('')
    setTypeFilter('')
    setStatusFilter('')
  }

  const filtersActive = Boolean(query || typeFilter || statusFilter)

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            Gestión de habitaciones
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Registra, actualiza y controla la disponibilidad de las habitaciones.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="self-start rounded-md border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 sm:self-auto"
        >
          + Registrar habitación
        </button>
      </header>

      {notice && <PageNotice notice={notice} onClose={() => setNotice(null)} />}

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RoomStatCard
          label="Total de habitaciones:"
          value={rooms.length}
          note={inactive > 0 ? `${inactive} inactiva${inactive === 1 ? '' : 's'}` : undefined}
        />
        <RoomStatCard label="Disponibles:" value={available} />
        <RoomStatCard label="Ocupados:" value={occupied} />
        <RoomStatCard label="En mantenimiento:" value={maintenance} />
      </dl>

      <section className="mt-6 rounded-md border border-amber-400/60 bg-[#080705] p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/70" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por número, tipo o estado"
              aria-label="Buscar habitaciones por número, tipo o estado"
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
            aria-label="Filtrar por estado"
            className="rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
          >
            <option value="">Todos los estados</option>
            {ROOM_STATUS_OPTIONS.map((option) => (
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_296px] xl:items-start">
        <section className="overflow-hidden rounded-md border border-amber-400 bg-[#070605] xl:col-start-1 xl:row-start-1">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <h2 className="text-base font-semibold text-white">Historial</h2>
            <span className="text-[11px] text-stone-500">
              {filteredRooms.length} de {rooms.length} habitaciones
            </span>
          </div>

          <div className="max-h-[540px] overflow-auto border-t border-amber-400/20">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 text-black">
                <tr>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">N° Habitación</th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">Imagen</th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">Tipo</th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">Capacidad</th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">Precio por noche</th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">Estado</th>
                  <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-14 text-center text-sm text-stone-500">
                      No se encontraron habitaciones con esos filtros.
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => {
                    const selected = selectedRoom?.id === room.id

                    return (
                      <tr
                        key={room.id}
                        className={`border-b border-amber-400/10 transition hover:bg-amber-400/[0.04] ${
                          selected ? 'bg-amber-400/[0.05]' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRoomId(room.id)}
                            className="font-semibold text-amber-300 transition hover:text-amber-200"
                            title="Ver descripción"
                          >
                            {room.number}
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRoomId(room.id)}
                            aria-label={`Ver imagen de la habitación ${room.number}`}
                            className="block overflow-hidden rounded border border-amber-400/20"
                          >
                            <img
                              src={room.image || DEFAULT_ROOM_IMAGES[room.type]}
                              alt={`Habitación ${room.number}`}
                              loading="lazy"
                              className="h-9 w-14 object-cover"
                            />
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-stone-200">{room.type}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-stone-300">
                          {room.capacity} {room.capacity === 1 ? 'persona' : 'personas'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-stone-300">
                          {formatSoles(room.price)}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusSelect
                            room={room}
                            onChange={(status) => handleStatusChange(room, status)}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              type="button"
                              onClick={() => setSelectedRoomId(room.id)}
                              aria-label={`Ver descripción de la habitación ${room.number}`}
                              title="Ver descripción"
                              className="rounded p-1.5 text-stone-400 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
                            >
                              <EyeIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(room)}
                              aria-label={`Editar habitación ${room.number}`}
                              title="Editar"
                              className="rounded p-1.5 text-amber-300/80 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingRoom(room)}
                              aria-label={`Eliminar habitación ${room.number}`}
                              title="Eliminar"
                              className="rounded p-1.5 text-rose-400/80 transition hover:bg-rose-500/10 hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
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

        <aside className="rounded-md border border-amber-400 bg-[#080705] p-4 xl:sticky xl:top-6 xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <h2 className="text-base font-semibold text-white">Descripción:</h2>

          {selectedRoom ? (
            <div className="mt-3">
              <img
                src={selectedRoom.image || DEFAULT_ROOM_IMAGES[selectedRoom.type]}
                alt={`Habitación ${selectedRoom.number}`}
                className="aspect-[4/3] w-full rounded border border-amber-400/30 object-cover"
              />
              <div className="mt-3 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-amber-100">
                  Habitación {selectedRoom.type.toLowerCase()}
                </h3>
                <StatusPill status={selectedRoom.status} />
              </div>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-stone-500">
                N° {selectedRoom.number}
              </p>

              <ul className="mt-3 space-y-1.5 text-xs text-stone-300">
                <li className="flex items-center gap-2">
                  <UsersIcon className="h-3.5 w-3.5 text-amber-400/80" />
                  {selectedRoom.capacity} {selectedRoom.capacity === 1 ? 'persona' : 'personas'}
                </li>
                <li className="flex items-center gap-2">
                  <PriceIcon className="h-3.5 w-3.5 text-amber-400/80" />
                  {formatSoles(selectedRoom.price)} la noche
                </li>
              </ul>

              <p className="mt-3 border-t border-amber-400/15 pt-3 text-xs leading-5 text-stone-400">
                {selectedRoom.description}
              </p>

              <button
                type="button"
                onClick={() => startEdit(selectedRoom)}
                className="mt-4 w-full rounded-md border border-amber-400/60 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/10"
              >
                Editar habitación
              </button>
              <button
                type="button"
                onClick={() =>
                  handleStatusChange(
                    selectedRoom,
                    selectedRoom.status === 'inactiva' ? 'disponible' : 'inactiva',
                  )
                }
                className="mt-2 w-full rounded-md border border-stone-700 px-3 py-2 text-xs font-medium text-stone-400 transition hover:border-amber-400/40 hover:text-amber-200"
              >
                {selectedRoom.status === 'inactiva' ? 'Reactivar habitación' : 'Desactivar habitación'}
              </button>
            </div>
          ) : (
            <p className="mt-6 rounded-md border border-dashed border-amber-400/25 px-4 py-8 text-center text-xs leading-5 text-stone-500">
              Selecciona una habitación del historial para ver su descripción.
            </p>
          )}
        </aside>

        <section
          ref={formRef}
          className="scroll-mt-6 rounded-md border border-amber-400 bg-[#080705] p-5 xl:col-start-1 xl:row-start-2"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-white">
              {editingId ? 'Editar habitación' : 'Nueva habitación'}
            </h2>
            {editingId && (
              <span className="text-[11px] text-amber-400">
                Modificando la habitación {form.number}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="room-number" className={labelClass}>
                  N° Habitación:
                </label>
                <input
                  id="room-number"
                  name="number"
                  type="text"
                  required
                  maxLength="10"
                  value={form.number}
                  onChange={handleChange}
                  placeholder="Ej. 301"
                  className={fieldClass}
                />
              </div>

              <div>
                <span className={labelClass}>Imagen:</span>
                <div className="flex items-center gap-2">
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-amber-400/30 bg-black/40">
                    {previewImage ? (
                      <img src={previewImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-amber-400/40" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <label
                      htmlFor="room-image"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-amber-400/50 px-2.5 py-1.5 text-[11px] font-medium text-amber-100 transition hover:bg-amber-400/10"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      Subir imagen
                    </label>
                    <input
                      id="room-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                    {form.image.startsWith('data:') && (
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, image: '' }))}
                        className="ml-2 text-[10px] text-stone-500 underline underline-offset-2 transition hover:text-rose-300"
                      >
                        Quitar
                      </button>
                    )}
                    <p className="mt-1 text-[9px] text-stone-600">JPG, PNG o WEBP · máx. 2 MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="room-type" className={labelClass}>
                  Tipo:
                </label>
                <select
                  id="room-type"
                  name="type"
                  required
                  value={form.type}
                  onChange={handleChange}
                  className={fieldClass}
                >
                  <option value="">Selecciona un tipo</option>
                  {ROOM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="room-capacity" className={labelClass}>
                  Capacidad:
                </label>
                <input
                  id="room-capacity"
                  name="capacity"
                  type="number"
                  required
                  min="1"
                  max="10"
                  step="1"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="2"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="room-price" className={labelClass}>
                  Precio por noche:
                </label>
                <input
                  id="room-price"
                  name="price"
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="180"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="room-status" className={labelClass}>
                  Estado:
                </label>
                <select
                  id="room-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={fieldClass}
                >
                  {ROOM_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label htmlFor="room-description" className={labelClass}>
                  Descripción:
                </label>
                <textarea
                  id="room-description"
                  name="description"
                  rows="3"
                  maxLength="300"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe las características y comodidades de la habitación."
                  className={`${fieldClass} resize-y`}
                />
                <p className="mt-1 text-right text-[10px] text-stone-600">
                  {form.description.length}/300
                </p>
              </div>
            </div>

            {formError && (
              <p
                role="alert"
                className="mt-4 rounded-md border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200"
              >
                {formError}
              </p>
            )}

            <div className="mt-4 flex flex-col-reverse gap-2 border-t border-amber-400/15 pt-4 sm:flex-row sm:justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-stone-600 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-stone-400 hover:text-white"
                >
                  Cancelar edición
                </button>
              )}
              <button
                type="submit"
                className="rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-black shadow-[0_12px_30px_-14px_rgba(245,200,66,0.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
              >
                {editingId ? 'Guardar cambios' : 'Guardar habitación'}
              </button>
            </div>
          </form>
        </section>
      </div>

      {deletingRoom && (
        <DeleteRoomDialog
          room={deletingRoom}
          onCancel={() => setDeletingRoom(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  )
}

export default Habitaciones
