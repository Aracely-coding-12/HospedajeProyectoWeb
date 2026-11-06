import { useState } from 'react'
import {
  SERVICE_CATEGORY_OPTIONS,
  serviceCategoryLabel,
} from '../data/hestiaData.js'
import { formatShortDate, formatSoles } from '../lib/format.js'
import { ServiceCard } from '../components/cliente/cards.jsx'
import {
  ClockIcon,
  CoffeeIcon,
  MinusIcon,
  PlusIcon,
  ReceiptIcon,
  SearchIcon,
  SparklesIcon,
  TagIcon,
} from '../components/cliente/icons.jsx'
import {
  chipClass,
  EmptyState,
  fieldErrorClass,
  inputClass,
  labelClass,
  Modal,
  Notice,
  PageHeading,
  primaryButtonClass,
  secondaryButtonClass,
  StatusBadge,
} from '../components/cliente/ui.jsx'

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'name', label: 'Nombre' },
]

function ServicisCliente({
  session,
  profile,
  data,
  serviceRequests = [],
  onRequestService,
  onRequireAuth,
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('recommended')
  const [requestTarget, setRequestTarget] = useState(null)
  const [form, setForm] = useState({ quantity: '1', notes: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const availableServices = data.services.filter(
    (service) => service.status === 'disponible',
  )
  const normalizedQuery = query.trim().toLowerCase()

  let filtered = data.services.filter((service) => {
    if (category && service.category !== category) return false
    if (!normalizedQuery) return true

    return [service.name, service.description, serviceCategoryLabel(service.category)]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery))
  })

  if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  else if (sort === 'name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
  }

  const myRequests = session
    ? serviceRequests
        .filter((request) => request.clientId === session.id)
        .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    : []

  function openRequest(service) {
    if (!session) {
      onRequireAuth('login')
      return
    }

    setRequestTarget(service)
    setForm({ quantity: '1', notes: '' })
    setErrors({})
    setNotice(null)
  }

  function closeRequest() {
    if (submitting) return
    setRequestTarget(null)
    setErrors({})
  }

  function changeQuantity(amount) {
    const current = Number(form.quantity) || 1
    const next = Math.min(10, Math.max(1, current + amount))
    setForm((value) => ({ ...value, quantity: String(next) }))
    setErrors((value) => ({ ...value, quantity: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!requestTarget) return

    const quantity = Number(form.quantity)
    const nextErrors = {}
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      nextErrors.quantity = 'Indica una cantidad entre 1 y 10.'
    }
    if (form.notes.trim().length > 240) {
      nextErrors.notes = 'Las indicaciones no pueden superar los 240 caracteres.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      const request = await onRequestService({
        serviceId: requestTarget.id,
        quantity,
        notes: form.notes.trim(),
      })
      setRequestTarget(null)
      setErrors({})
      setNotice({
        type: 'success',
        message: `Solicitud enviada: ${request.serviceName} × ${request.quantity}. El administrador ya recibió la actualización.`,
      })
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo enviar la solicitud.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const requestTotal = requestTarget
    ? requestTarget.price * (Number(form.quantity) || 0)
    : 0

  function clearFilters() {
    setQuery('')
    setCategory('')
    setSort('recommended')
  }

  return (
    <>
      <section className="border-b border-amber-400/15 bg-[#070605]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            eyebrow="Sabores y comodidad"
            title="Servicios adicionales"
            description="Pide bebidas, desayunos, almuerzos o cenas durante tu estadía. El administrador recibirá tu solicitud y coordinará la atención."
            action={
              <div className="rounded-lg border border-amber-400/30 bg-black/30 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                  Disponibles
                </p>
                <p className="text-xl font-bold text-amber-200">
                  {availableServices.length}
                  <span className="ml-1 text-xs font-medium text-stone-500">
                    de {data.services.length}
                  </span>
                </p>
              </div>
            }
          />

          {notice && (
            <Notice
              type={notice.type}
              message={notice.message}
              onClose={() => setNotice(null)}
              className="mt-5"
            />
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-amber-400/30 bg-[#080705] p-3">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_190px]">
            <div>
              <label htmlFor="client-service-search" className={labelClass}>
                Buscar servicio
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/70" />
                <input
                  id="client-service-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Café, desayuno, cena..."
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="client-service-category" className={labelClass}>
                Categoría
              </label>
              <select
                id="client-service-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-[#0b0a07]">
                  Todas
                </option>
                {SERVICE_CATEGORY_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-[#0b0a07]"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="client-service-sort" className={labelClass}>
                Ordenar por
              </label>
              <select
                id="client-service-sort"
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

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={chipClass(category === '')}
            >
              Todas
            </button>
            {SERVICE_CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                className={chipClass(category === option.value)}
              >
                {option.label}
              </button>
            ))}
            {(query || category || sort !== 'recommended') && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-[11px] font-medium text-amber-400 underline underline-offset-4 transition hover:text-amber-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Catálogo</h2>
          <span className="text-[11px] text-stone-500">
            {filtered.length} de {data.services.length} servicios
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={CoffeeIcon}
              title="No encontramos servicios con esos filtros"
              description="Prueba con otra categoría, otro término de búsqueda o limpia los filtros."
              action={
                <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
                  Limpiar filtros
                </button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onRequest={openRequest}
              />
            ))}
          </div>
        )}

        {session && (
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Mis solicitudes</h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  Seguimiento de los servicios que pediste al hospedaje.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-500">
                <ReceiptIcon className="h-3.5 w-3.5" /> {myRequests.length} solicitudes
              </span>
            </div>

            {myRequests.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-amber-400/25 bg-black/20 px-5 py-8 text-center">
                <p className="text-sm text-stone-400">
                  Aún no has solicitado servicios adicionales.
                </p>
                <p className="mt-1 text-[11px] text-stone-600">
                  Elige un servicio del catálogo y el administrador lo recibirá al instante.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {myRequests.map((request) => (
                  <article
                    key={request.id}
                    className="flex flex-col gap-3 rounded-xl border border-amber-400/25 bg-[#080705] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
                        <TagIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {request.serviceName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-stone-500">
                          {request.quantity} × {formatSoles(request.price)} ·{' '}
                          {formatShortDate(request.createdAt.slice(0, 10))}
                        </p>
                        {request.notes && (
                          <p className="mt-1 text-[11px] leading-5 text-stone-400">
                            “{request.notes}”
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <StatusBadge status="pendiente" label="Pendiente" />
                      <span className="text-sm font-bold text-amber-200">
                        {formatSoles(request.total)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <Modal
        open={Boolean(requestTarget)}
        onClose={closeRequest}
        title={requestTarget ? `Solicitar ${requestTarget.name}` : 'Solicitar servicio'}
        description={
          requestTarget
            ? `${serviceCategoryLabel(requestTarget.category)} · ${formatSoles(requestTarget.price)} por unidad`
            : ''
        }
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={closeRequest}
              disabled={submitting}
              className={secondaryButtonClass}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="client-service-request-form"
              disabled={submitting}
              className={primaryButtonClass}
            >
              {submitting ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </>
        }
      >
        {requestTarget && (
          <form id="client-service-request-form" onSubmit={handleSubmit} noValidate>
            <div className="flex items-start gap-3 rounded-lg border border-amber-400/25 bg-black/25 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{requestTarget.name}</p>
                <p className="mt-1 text-xs leading-5 text-stone-400">
                  {requestTarget.description}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <span className={labelClass}>Cantidad: *</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeQuantity(-1)}
                  disabled={Number(form.quantity) <= 1}
                  aria-label="Disminuir cantidad"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-amber-400/40 text-amber-200 transition hover:bg-amber-400/10 disabled:opacity-40"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <input
                  id="client-service-quantity"
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={form.quantity}
                  onChange={(event) => {
                    setForm((value) => ({ ...value, quantity: event.target.value }))
                    setErrors((value) => ({ ...value, quantity: undefined }))
                  }}
                  className={`${inputClass} text-center`}
                  aria-invalid={Boolean(errors.quantity)}
                  aria-describedby={
                    errors.quantity ? 'client-service-quantity-error' : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => changeQuantity(1)}
                  disabled={Number(form.quantity) >= 10}
                  aria-label="Aumentar cantidad"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-amber-400/40 text-amber-200 transition hover:bg-amber-400/10 disabled:opacity-40"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              {errors.quantity && (
                <p id="client-service-quantity-error" className={fieldErrorClass}>
                  {errors.quantity}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="client-service-notes" className={labelClass}>
                Indicaciones (opcional)
              </label>
              <textarea
                id="client-service-notes"
                rows="3"
                maxLength="240"
                value={form.notes}
                onChange={(event) => {
                  setForm((value) => ({ ...value, notes: event.target.value }))
                  setErrors((value) => ({ ...value, notes: undefined }))
                }}
                placeholder="Horario, preferencias o alguna indicación para el servicio..."
                className={`${inputClass} resize-y`}
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={errors.notes ? 'client-service-notes-error' : undefined}
              />
              {errors.notes ? (
                <p id="client-service-notes-error" className={fieldErrorClass}>
                  {errors.notes}
                </p>
              ) : (
                <p className="mt-1.5 text-[10px] text-stone-500">
                  {form.notes.length}/240 caracteres
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg border border-amber-400/30 bg-amber-400/5 px-4 py-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">
                  Total estimado
                </p>
                <p className="text-[10px] text-stone-500">
                  El pago se coordina con recepción.
                </p>
              </div>
              <p className="text-xl font-bold text-amber-200">{formatSoles(requestTotal)}</p>
            </div>

            <p className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-stone-500">
              <ClockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/70" />
              El administrador recibirá tu solicitud con tus datos de contacto
              {profile?.name ? ` (${profile.name})` : ''}.
            </p>
          </form>
        )}
      </Modal>
    </>
  )
}

export default ServicisCliente
