import { useRef, useState } from 'react'
import {
  CLIENT_DOCUMENT_TYPES,
  CLIENT_SOURCE_OPTIONS,
} from '../data/hestiaData.js'
import { formatShortDate } from '../lib/format.js'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  documentType: 'DNI',
  document: '',
  email: '',
  phone: '',
  active: true,
}

const fieldClass =
  'w-full rounded-md border border-amber-400/55 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15'

const labelClass = 'mb-1.5 block text-[11px] font-medium tracking-wide text-amber-100/90'
const filterLabelClass = 'mb-1 block text-[10px] font-medium tracking-wide text-stone-500'

function sourceLabel(source) {
  return CLIENT_SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? 'No definido'
}

function getDocumentHint(documentType) {
  if (documentType === 'DNI') return '8 dígitos'
  if (documentType === 'RUC') return '11 dígitos'
  return '9 a 12 caracteres'
}

function getDocumentMaxLength(documentType) {
  if (documentType === 'DNI') return 8
  if (documentType === 'RUC') return 11
  return 12
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

function PowerIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true" className={className}>
      <path d="M12 3v8" strokeLinecap="round" />
      <path d="M6.7 6.7a8 8 0 1 0 10.6 0" strokeLinecap="round" />
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

function ClientStatCard({ label, value, note }) {
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

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        active
          ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'
          : 'border-stone-500/60 bg-stone-500/10 text-stone-300'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-stone-400'}`}
      />
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function SourceBadge({ source }) {
  const web = source === 'web'

  return (
    <span
      title={
        web
          ? 'Registrado desde la página para clientes'
          : 'Registrado por administración'
      }
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        web
          ? 'border-amber-400/50 bg-amber-400/10 text-amber-200'
          : 'border-stone-600/60 bg-stone-600/10 text-stone-400'
      }`}
    >
      {web ? 'Web' : 'Admin'}
    </span>
  )
}

function ClientDetailDialog({ client, canManage, onClose, onEdit }) {
  const registeredAt = client.createdAt ? formatShortDate(client.createdAt.slice(0, 10)) : '—'
  const updatedAt = client.updatedAt ? formatShortDate(client.updatedAt.slice(0, 10)) : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-detail-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-amber-500/50 bg-[#0b0a07] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-amber-500">
              Ficha del cliente
            </p>
            <h2 id="client-detail-title" className="mt-1 text-lg font-semibold text-white">
              {client.name}
            </h2>
          </div>
          <StatusPill active={client.active} />
        </div>

        <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-stone-500">Documento</dt>
            <dd className="mt-0.5 text-stone-200">
              {client.documentType ?? 'DNI'} · {client.document}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-stone-500">Teléfono</dt>
            <dd className="mt-0.5 text-stone-200">{client.phone}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] uppercase tracking-wide text-stone-500">Correo</dt>
            <dd className="mt-0.5 break-all text-stone-200">{client.email}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-stone-500">Origen</dt>
            <dd className="mt-0.5 text-stone-200">{sourceLabel(client.source)}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-stone-500">
              Fecha de registro
            </dt>
            <dd className="mt-0.5 text-stone-200">{registeredAt}</dd>
          </div>
          {updatedAt && (
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-stone-500">
                Última actualización
              </dt>
              <dd className="mt-0.5 text-stone-200">{updatedAt}</dd>
            </div>
          )}
        </dl>

        {client.source === 'web' && (
          <p className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-[11px] leading-5 text-amber-100/80">
            Este cliente se registró desde la página para clientes.
          </p>
        )}

        {!client.active && (
          <p className="mt-3 rounded-md border border-stone-600/60 bg-black/30 px-3 py-2 text-[11px] leading-5 text-stone-400">
            La cuenta está inactiva. El cliente no podrá iniciar sesión hasta que se reactive.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-600 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-stone-400 hover:text-white"
          >
            Volver
          </button>
          {canManage && (
            <button
              type="button"
              onClick={() => onEdit(client)}
              className="rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
            >
              Editar cliente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusDialog({ client, onCancel, onConfirm }) {
  const deactivating = client.active

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="client-status-title"
        aria-describedby="client-status-description"
        className={`w-full max-w-md rounded-xl border bg-[#0b0a07] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)] ${
          deactivating ? 'border-rose-500/50' : 'border-emerald-500/50'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full border ${
            deactivating
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          <PowerIcon className="h-5 w-5" />
        </span>
        <h2 id="client-status-title" className="mt-4 text-lg font-semibold text-white">
          {deactivating ? 'Desactivar cuenta' : 'Reactivar cuenta'} de {client.name}
        </h2>
        <p id="client-status-description" className="mt-2 text-sm leading-6 text-stone-400">
          {deactivating
            ? 'La cuenta pasará a Inactiva. El cliente no podrá iniciar sesión en la página para clientes, pero su historial de reservas se conservará.'
            : 'La cuenta volverá a estar Activa y el cliente podrá iniciar sesión nuevamente en la página para clientes.'}
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
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus-visible:ring-2 ${
              deactivating
                ? 'bg-rose-500 hover:bg-rose-400 focus-visible:ring-rose-300/60'
                : 'bg-emerald-500 hover:bg-emerald-400 focus-visible:ring-emerald-300/60'
            }`}
          >
            {deactivating ? 'Desactivar cuenta' : 'Reactivar cuenta'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Clientes({
  clients,
  canManage = true,
  onCreateClient,
  onUpdateClient,
  onStatusChange,
}) {
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [viewingClientId, setViewingClientId] = useState(null)
  const [statusClientId, setStatusClientId] = useState(null)
  const formRef = useRef(null)

  const activeCount = clients.filter((client) => client.active).length
  const inactiveCount = clients.length - activeCount
  const webCount = clients.filter((client) => client.source === 'web').length
  const activeShare =
    clients.length === 0 ? 0 : Math.round((activeCount / clients.length) * 100)

  const normalizedQuery = query.trim().toLowerCase()
  const filteredClients = clients
    .filter((client) => {
      const matchesQuery =
        !normalizedQuery ||
        [client.name, client.document, client.email].some((value) =>
          String(value ?? '').toLowerCase().includes(normalizedQuery),
        )
      const matchesSource = !sourceFilter || client.source === sourceFilter
      const matchesStatus =
        !statusFilter || (statusFilter === 'active' ? client.active : !client.active)

      return matchesQuery && matchesSource && matchesStatus
    })
    .sort((first, second) => first.name.localeCompare(second.name, 'es'))

  const viewingClient = clients.find((client) => client.id === viewingClientId) ?? null
  const statusClient = clients.find((client) => client.id === statusClientId) ?? null
  const filtersActive = Boolean(query || sourceFilter || statusFilter)

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
    setForm((current) => ({ ...current, [name]: value }))
    setFormError(null)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)

    try {
      if (editingId) {
        onUpdateClient({ id: editingId, ...form })
        setNotice({ type: 'success', message: 'Cliente actualizado correctamente.' })
      } else {
        onCreateClient(form)
        setNotice({ type: 'success', message: 'Cliente registrado correctamente.' })
      }
      resetForm()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el cliente.')
    }
  }

  function startCreate() {
    resetForm()
    scrollToForm()
  }

  function startEdit(client) {
    const [firstName, ...lastNameParts] = client.name.trim().split(/\s+/)

    setEditingId(client.id)
    setForm({
      firstName: firstName ?? '',
      lastName: lastNameParts.join(' '),
      documentType: client.documentType ?? 'DNI',
      document: client.document ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      active: client.active !== false,
    })
    setFormError(null)
    setViewingClientId(null)
    setStatusClientId(null)
    scrollToForm()
  }

  function confirmStatusChange() {
    if (!statusClient) return

    const nextActive = !statusClient.active

    try {
      onStatusChange(statusClient.id, nextActive)
      setNotice({
        type: 'success',
        message: `Cuenta de ${statusClient.name} ${
          nextActive ? 'reactivada' : 'desactivada'
        } correctamente.`,
      })
      if (editingId === statusClient.id) {
        setForm((current) => ({ ...current, active: nextActive }))
      }
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'No se pudo actualizar la cuenta.',
      })
    }

    setStatusClientId(null)
  }

  function clearFilters() {
    setQuery('')
    setSourceFilter('')
    setStatusFilter('')
  }

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            Gestión de clientes
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Consulta, actualiza y controla el estado de las cuentas registradas.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          disabled={!canManage}
          className="self-start rounded-md border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
        >
          + Registrar cliente
        </button>
      </header>

      {notice && <PageNotice notice={notice} onClose={() => setNotice(null)} />}

      {!canManage && (
        <div className="mt-5 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Tu cuenta no tiene permisos para editar clientes. Puedes consultar la información
          registrada.
        </div>
      )}

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ClientStatCard
          label="Total de clientes:"
          value={clients.length}
          note={`${webCount} registrados desde la web`}
        />
        <ClientStatCard
          label="Clientes activos:"
          value={activeCount}
          note={`${activeShare}% del total`}
        />
        <ClientStatCard
          label="Clientes inactivos:"
          value={inactiveCount}
          note="Cuentas desactivadas"
        />
      </dl>

      <section className="mt-6 rounded-md border border-amber-400/60 bg-[#080705] p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
          <div>
            <label htmlFor="client-search" className={filterLabelClass}>
              Buscar
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/70" />
              <input
                id="client-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre, documento o correo"
                aria-label="Buscar clientes por nombre, documento o correo"
                className="w-full rounded-md border border-amber-400/45 bg-black/40 py-2 pl-9 pr-3 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
              />
            </div>
          </div>
          <div>
            <label htmlFor="client-source" className={filterLabelClass}>
              Origen
            </label>
            <select
              id="client-source"
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              aria-label="Filtrar por origen del cliente"
              className="w-full rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
            >
              <option value="">Todos</option>
              {CLIENT_SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="client-status" className={filterLabelClass}>
              Estado
            </label>
            <select
              id="client-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrar por estado de la cuenta"
              className="w-full rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
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

      <section className="mt-6 overflow-hidden rounded-md border border-amber-400 bg-[#070605]">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <h2 className="text-base font-semibold text-white">Historial</h2>
          <span className="text-[11px] text-stone-500">
            {filteredClients.length} de {clients.length} clientes
          </span>
        </div>

        <div className="max-h-[540px] overflow-auto border-t border-amber-400/20">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 text-black">
              <tr>
                <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">N°</th>
                <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">Nombre completo</th>
                <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">Documento</th>
                <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">Correo</th>
                <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">Teléfono</th>
                <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">Origen</th>
                <th scope="col" className="whitespace-nowrap px-3 py-2.5 font-semibold">Estado</th>
                <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-14 text-center text-sm text-stone-500">
                    No se encontraron clientes con esos filtros.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, index) => (
                  <tr
                    key={client.id}
                    className="border-b border-amber-400/10 transition hover:bg-amber-400/[0.04]"
                  >
                    <td className="px-3 py-2.5 text-stone-500">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setViewingClientId(client.id)}
                        className="text-left font-semibold text-amber-100 transition hover:text-amber-200"
                        title="Ver ficha del cliente"
                      >
                        {client.name}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-stone-300">
                      <span className="block text-[9px] uppercase tracking-wide text-stone-500">
                        {client.documentType ?? 'DNI'}
                      </span>
                      {client.document}
                    </td>
                    <td className="px-3 py-2.5 text-stone-300">{client.email}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-stone-300">{client.phone}</td>
                    <td className="px-3 py-2.5">
                      <SourceBadge source={client.source} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill active={client.active} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          onClick={() => setViewingClientId(client.id)}
                          aria-label={`Ver ficha de ${client.name}`}
                          title="Ver ficha"
                          className="rounded p-1.5 text-stone-400 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(client)}
                          disabled={!canManage}
                          aria-label={`Editar cliente ${client.name}`}
                          title="Editar"
                          className="rounded p-1.5 text-amber-300/80 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusClientId(client.id)}
                          disabled={!canManage}
                          aria-label={`${client.active ? 'Desactivar' : 'Reactivar'} cuenta de ${client.name}`}
                          title={client.active ? 'Desactivar cuenta' : 'Reactivar cuenta'}
                          className={`rounded p-1.5 transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                            client.active
                              ? 'text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:ring-rose-300/40'
                              : 'text-emerald-400/80 hover:bg-emerald-500/10 hover:text-emerald-300 focus-visible:ring-emerald-300/40'
                          }`}
                        >
                          <PowerIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {canManage && (
        <section
          ref={formRef}
          className="mt-6 scroll-mt-6 rounded-md border border-amber-400 bg-[#080705] p-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-white">
              {editingId ? 'Editar cliente' : 'Agregar cliente'}
            </h2>
            {editingId && (
              <span className="text-[11px] text-amber-400">
                Modificando a {form.firstName} {form.lastName}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_180px]">
              <div>
                <label htmlFor="client-first-name" className={labelClass}>
                  Nombres:
                </label>
                <input
                  id="client-first-name"
                  name="firstName"
                  type="text"
                  required
                  maxLength="60"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Ej. Carmen"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="client-last-name" className={labelClass}>
                  Apellidos:
                </label>
                <input
                  id="client-last-name"
                  name="lastName"
                  type="text"
                  required
                  maxLength="80"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Ej. Ticona Quispe"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="client-email" className={labelClass}>
                  Correo:
                </label>
                <input
                  id="client-email"
                  name="email"
                  type="email"
                  required
                  maxLength="120"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="cliente@correo.com"
                  className={fieldClass}
                />
              </div>

              <div className="sm:col-span-2 xl:col-span-1 xl:row-span-2">
                <span className={labelClass}>Estado:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.active}
                    aria-label="Estado de la cuenta del cliente"
                    onClick={() => {
                      setForm((current) => ({ ...current, active: !current.active }))
                      setFormError(null)
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 ${
                      form.active
                        ? 'border-emerald-400/60 bg-emerald-400/20'
                        : 'border-stone-600 bg-stone-700/40'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`ml-0.5 h-4 w-4 rounded-full transition ${
                        form.active ? 'translate-x-4 bg-emerald-400' : 'translate-x-0 bg-stone-400'
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs font-medium ${
                      form.active ? 'text-emerald-300' : 'text-stone-400'
                    }`}
                  >
                    {form.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full rounded-md border border-stone-600 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-stone-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-4 py-2 text-sm font-bold text-black shadow-[0_12px_30px_-14px_rgba(245,200,66,0.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
                  >
                    {editingId ? 'Guardar cambios' : 'Guardar'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="client-document-type" className={labelClass}>
                  Tipo de documento:
                </label>
                <select
                  id="client-document-type"
                  name="documentType"
                  value={form.documentType}
                  onChange={handleChange}
                  className={fieldClass}
                >
                  {CLIENT_DOCUMENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="client-document" className={labelClass}>
                  Número del documento:
                </label>
                <input
                  id="client-document"
                  name="document"
                  type="text"
                  required
                  inputMode={form.documentType === 'CE' ? 'text' : 'numeric'}
                  maxLength={getDocumentMaxLength(form.documentType)}
                  value={form.document}
                  onChange={handleChange}
                  placeholder={getDocumentHint(form.documentType)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="client-phone" className={labelClass}>
                  Teléfono:
                </label>
                <input
                  id="client-phone"
                  name="phone"
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength="9"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="958401496"
                  className={fieldClass}
                />
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
          </form>
        </section>
      )}

      {viewingClient && (
        <ClientDetailDialog
          client={viewingClient}
          canManage={canManage}
          onClose={() => setViewingClientId(null)}
          onEdit={startEdit}
        />
      )}

      {statusClient && (
        <StatusDialog
          client={statusClient}
          onCancel={() => setStatusClientId(null)}
          onConfirm={confirmStatusChange}
        />
      )}
    </>
  )
}

export default Clientes
