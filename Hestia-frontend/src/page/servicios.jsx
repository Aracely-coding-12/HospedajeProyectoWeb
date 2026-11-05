import { useRef, useState } from 'react'
import {
  SERVICE_CATEGORY_OPTIONS,
  SERVICE_STATUS_OPTIONS,
  serviceCategoryLabel,
  serviceStatusLabel,
} from '../data/hestiaData.js'
import { formatLongDate } from '../lib/format.js'

const CATEGORY_STYLES = new Map([
  ['bebidas', 'border-sky-400/40 bg-sky-400/10 text-sky-200'],
  ['desayuno', 'border-amber-400/50 bg-amber-400/10 text-amber-200'],
  ['almuerzo', 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'],
  ['cena', 'border-violet-400/40 bg-violet-400/10 text-violet-200'],
])

const CATEGORY_ICON_STYLES = new Map([
  ['bebidas', 'border-sky-400/30 bg-sky-400/10 text-sky-300'],
  ['desayuno', 'border-amber-400/30 bg-amber-400/10 text-amber-300'],
  ['almuerzo', 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'],
  ['cena', 'border-violet-400/30 bg-violet-400/10 text-violet-300'],
])

const fieldClass =
  'w-full rounded-md border border-amber-400/55 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15'

const labelClass = 'mb-1.5 block text-[11px] font-medium tracking-wide text-amber-100/90'
const filterLabelClass = 'mb-1 block text-[10px] font-medium tracking-wide text-stone-500'

function formatServicePrice(amount) {
  const value = Math.round((Number(amount) || 0) * 100) / 100
  const [integerPart, decimalPart] = value.toFixed(2).split('.')
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  return `S/ ${grouped}${decimalPart === '00' ? '' : `.${decimalPart}`}`
}

function categoryStyle(category) {
  return CATEGORY_STYLES.get(category) ?? CATEGORY_STYLES.get('bebidas')
}

function categoryIconStyle(category) {
  return CATEGORY_ICON_STYLES.get(category) ?? CATEGORY_ICON_STYLES.get('bebidas')
}

function emptyForm() {
  return {
    name: '',
    category: SERVICE_CATEGORY_OPTIONS[0].value,
    price: '',
    description: '',
    status: 'disponible',
    image: '',
  }
}

function CategoryIcon({ category, className = '' }) {
  if (category === 'desayuno') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" strokeLinecap="round" />
      </svg>
    )
  }

  if (category === 'almuerzo') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3.8" />
        <path d="M4 4v4M6.5 4v4M4 8h2.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (category === 'cena') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M5.5 8h13l-1.2 12.2a1 1 0 0 1-1 .8H7.7a1 1 0 0 1-1-.8L5.5 8Z" strokeLinejoin="round" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
      <path d="M8.5 13h7" strokeLinecap="round" />
    </svg>
  )
}

function ServicePhoto({ service, className = '', iconClassName = '' }) {
  if (service.image) {
    return (
      <img
        src={service.image}
        alt={`Foto de ${service.name}`}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return <CategoryIcon category={service.category} className={iconClassName} />
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

function GridIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  )
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

function CategoryBadge({ category }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${categoryStyle(category)}`}
    >
      <CategoryIcon category={category} className="h-2.5 w-2.5" />
      {serviceCategoryLabel(category)}
    </span>
  )
}

function AvailabilityBadge({ status = 'disponible' }) {
  const available = status === 'disponible'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
        available
          ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'
          : 'border-rose-500/50 bg-rose-500/10 text-rose-200'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${available ? 'bg-emerald-400' : 'bg-rose-400'}`}
      />
      {serviceStatusLabel(status)}
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

function RowAction({ label, onClick, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 ${className}`}
    >
      {children}
    </button>
  )
}

function ServiceCard({ service, onView, onEdit, onDelete }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-amber-400/35 bg-[#080705] transition hover:border-amber-300/70 hover:bg-amber-400/[0.03]">
      <div
        className={`relative flex h-44 w-full items-center justify-center overflow-hidden border-b border-amber-400/20 ${categoryIconStyle(service.category)}`}
      >
        <ServicePhoto service={service} iconClassName="h-10 w-10" />
        <span className="absolute right-3 top-3 rounded-full bg-[#080705]/80 p-0.5 backdrop-blur-sm">
          <AvailabilityBadge status={service.status} />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <CategoryBadge category={service.category} />
          <h3 className="mt-2 text-base font-semibold leading-snug text-white">{service.name}</h3>
          <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-stone-400">
            {service.description}
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-amber-400/15 pt-3">
          <div>
            <span className="block text-[9px] uppercase tracking-[0.16em] text-stone-500">
              Precio
            </span>
            <span className="mt-0.5 block text-lg font-bold text-amber-200">
              {formatServicePrice(service.price)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onView(service)}
              className="inline-flex items-center gap-1 rounded-md border border-amber-400/50 px-2 py-1.5 text-[10px] font-semibold text-amber-200 transition hover:bg-amber-400/10"
            >
              <EyeIcon className="h-3 w-3" />
              Ver detalle
            </button>
            <RowAction
              label={`Editar servicio ${service.name}`}
              onClick={() => onEdit(service)}
              className="text-amber-300/80 hover:bg-amber-400/10 hover:text-amber-200"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </RowAction>
            <RowAction
              label={`Eliminar servicio ${service.name}`}
              onClick={() => onDelete(service)}
              className="text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </RowAction>
          </div>
        </div>
      </div>
    </article>
  )
}

function ServiceDetail({ service, onClose, onEdit, onDelete }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-detail-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-amber-500/50 bg-[#0b0a07] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-amber-400/20 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">
              Detalle del servicio
            </p>
            <h2 id="service-detail-title" className="mt-1 text-xl font-bold text-white">
              {service.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <CategoryBadge category={service.category} />
              <AvailabilityBadge status={service.status} />
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

        <div className="p-5">
          <div className={`overflow-hidden rounded-md border ${categoryIconStyle(service.category)}`}>
            {service.image && (
              <img
                src={service.image}
                alt={`Foto de ${service.name}`}
                className="h-48 w-full object-cover"
              />
            )}
            <div className="flex items-center gap-3 p-4">
              {!service.image && (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/20">
                  <CategoryIcon category={service.category} className="h-6 w-6" />
                </span>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] opacity-80">
                  {serviceCategoryLabel(service.category)}
                </p>
                <p className="mt-1 text-2xl font-bold">{formatServicePrice(service.price)}</p>
              </div>
            </div>
          </div>

          <section className="mt-4 rounded-md border border-amber-400/20 bg-black/25 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
              Descripción
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-300">{service.description}</p>
          </section>

          <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
            <div className="rounded-md border border-amber-400/20 bg-black/25 p-3">
              <dt className="text-stone-500">Precio</dt>
              <dd className="mt-1 font-semibold text-amber-200">{formatServicePrice(service.price)}</dd>
            </div>
            <div className="rounded-md border border-amber-400/20 bg-black/25 p-3">
              <dt className="text-stone-500">Estado</dt>
              <dd className="mt-1">
                <AvailabilityBadge status={service.status} />
              </dd>
            </div>
          </dl>

          {service.status !== 'disponible' && (
            <p className="mt-4 rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-[11px] leading-5 text-rose-100/90">
              Este servicio se muestra a los clientes como No disponible. Puedes editarlo para
              volver a ofrecerlo o eliminarlo del catálogo.
            </p>
          )}
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
            onClick={() => onDelete(service)}
            className="rounded-md border border-rose-500/50 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
          >
            Eliminar servicio
          </button>
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
          >
            Editar servicio
          </button>
        </footer>
      </div>
    </div>
  )
}

function DeleteServiceDialog({ service, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="service-delete-title"
        aria-describedby="service-delete-description"
        className="w-full max-w-md rounded-xl border border-rose-500/50 bg-[#0b0a07] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300">
          <TrashIcon className="h-5 w-5" />
        </span>
        <h2 id="service-delete-title" className="mt-4 text-lg font-semibold text-white">
          Eliminar {service.name}
        </h2>
        <p id="service-delete-description" className="mt-2 text-sm leading-6 text-stone-400">
          El servicio dejará de aparecer en las opciones que ven los clientes, evitando
          malentendidos sobre su disponibilidad. Esta acción no se puede deshacer.
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
            Eliminar servicio
          </button>
        </div>
      </div>
    </div>
  )
}

function ServiceForm({ service, onSave, onCancelEdit, formRef }) {
  const editing = Boolean(service)
  const [form, setForm] = useState(() =>
    service
      ? {
          name: service.name,
          category: service.category,
          price: String(service.price),
          description: service.description,
          status: service.status,
          image: service.image ?? '',
        }
      : emptyForm(),
  )
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFormError(null)
  }

  function handleImageChange(event) {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFormError('Selecciona un archivo de imagen válido (JPG, PNG o WEBP).')
      input.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError('La foto no debe superar los 2 MB.')
      input.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({ ...current, image: String(reader.result) }))
      setFormError(null)
      input.value = ''
    }
    reader.onerror = () => {
      setFormError('No se pudo leer la foto seleccionada.')
      input.value = ''
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Ingresa el nombre del servicio.'
    if (!form.category) nextErrors.category = 'Selecciona una categoría.'

    const price = Number(form.price)
    if (!form.price || !Number.isFinite(price) || price <= 0) {
      nextErrors.price = 'Ingresa un precio mayor a 0.'
    }

    if (!form.description.trim()) {
      nextErrors.description = 'Ingresa una descripción del servicio.'
    }
    if (!form.status) nextErrors.status = 'Selecciona un estado.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      onSave({
        name: form.name,
        category: form.category,
        price: form.price,
        description: form.description,
        status: form.status,
        image: form.image,
      })
      if (!editing) {
        setForm(emptyForm())
        setErrors({})
        setFormError(null)
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el servicio.')
    }
  }

  return (
    <section
      ref={formRef}
      className="scroll-mt-6 rounded-md border border-amber-400 bg-[#080705] p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-white">
          {editing ? 'Editar servicio' : 'Nuevo servicio'}
        </h2>
        {editing && <span className="text-[11px] text-amber-400">Modificando {service.name}</span>}
      </div>

      <p className="mt-2 rounded-md border border-amber-400/25 bg-amber-400/5 px-3 py-2 text-[11px] leading-5 text-amber-100/80">
        Completa la información que verán los clientes en el catálogo de servicios.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <div>
          <label htmlFor="service-name" className={labelClass}>
            Nombre del servicio:
          </label>
          <input
            id="service-name"
            name="name"
            type="text"
            required
            maxLength="80"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej. Desayuno andino"
            className={fieldClass}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'service-name-error' : undefined}
          />
          {errors.name && (
            <p id="service-name-error" role="alert" className="mt-1 text-[11px] text-rose-400">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <span className={labelClass}>Foto del servicio:</span>
          <div className="overflow-hidden rounded-md border border-amber-400/30 bg-black/40">
            <div className="flex h-40 w-full items-center justify-center">
              {form.image ? (
                <img
                  src={form.image}
                  alt="Vista previa de la foto del servicio"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-9 w-9 text-amber-400/40" />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-400/15 px-2.5 py-2">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="service-image"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-amber-400/50 px-2.5 py-1.5 text-[11px] font-medium text-amber-100 transition hover:bg-amber-400/10"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Subir foto
                </label>
                <input
                  id="service-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
                {form.image && (
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, image: '' }))}
                    className="text-[10px] text-stone-500 underline underline-offset-2 transition hover:text-rose-300"
                  >
                    Quitar
                  </button>
                )}
              </div>
              <p className="text-[9px] text-stone-600">JPG, PNG o WEBP · máx. 2 MB</p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="service-category" className={labelClass}>
            Categoría:
          </label>
          <select
            id="service-category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className={fieldClass}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? 'service-category-error' : undefined}
          >
            {SERVICE_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p id="service-category-error" role="alert" className="mt-1 text-[11px] text-rose-400">
              {errors.category}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="service-price" className={labelClass}>
            Precio:
          </label>
          <input
            id="service-price"
            name="price"
            type="number"
            required
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={form.price}
            onChange={handleChange}
            placeholder="Ej. 18"
            className={fieldClass}
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? 'service-price-error' : undefined}
          />
          {errors.price ? (
            <p id="service-price-error" role="alert" className="mt-1 text-[11px] text-rose-400">
              {errors.price}
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-stone-600">Puedes usar hasta dos decimales.</p>
          )}
        </div>

        <div>
          <label htmlFor="service-description" className={labelClass}>
            Descripción:
          </label>
          <textarea
            id="service-description"
            name="description"
            required
            rows="4"
            maxLength="240"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe el servicio y lo que incluye."
            className={`${fieldClass} resize-y`}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'service-description-error' : undefined}
          />
          <div className="mt-1 flex items-start justify-between gap-2">
            {errors.description ? (
              <p id="service-description-error" role="alert" className="text-[11px] text-rose-400">
                {errors.description}
              </p>
            ) : (
              <span className="text-[10px] text-stone-600">Máximo 240 caracteres.</span>
            )}
            <span className="shrink-0 text-[10px] text-stone-600">
              {form.description.length}/240
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="service-status" className={labelClass}>
            Estado:
          </label>
          <select
            id="service-status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className={fieldClass}
            aria-invalid={Boolean(errors.status)}
            aria-describedby={errors.status ? 'service-status-error' : undefined}
          >
            {SERVICE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p id="service-status-error" role="alert" className="mt-1 text-[11px] text-rose-400">
              {errors.status}
            </p>
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
            {editing ? 'Guardar cambios' : 'Agregar servicio'}
          </button>
        </div>
      </form>
    </section>
  )
}

function Servicios({ services, onCreateService, onUpdateService, onDeleteService }) {
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formVersion, setFormVersion] = useState(0)
  const [detailId, setDetailId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [notice, setNotice] = useState(null)
  const formRef = useRef(null)

  const categoryOrder = new Map(
    SERVICE_CATEGORY_OPTIONS.map((option, index) => [option.value, index]),
  )

  const normalizedQuery = query.trim().toLowerCase()
  const filteredServices = services
    .filter((service) => {
      const searchable = [service.name, service.description, serviceCategoryLabel(service.category)]
        .join(' ')
        .toLowerCase()

      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
      const matchesCategory = !categoryFilter || service.category === categoryFilter
      const matchesStatus = !statusFilter || service.status === statusFilter

      return matchesQuery && matchesCategory && matchesStatus
    })
    .sort(
      (first, second) =>
        (categoryOrder.get(first.category) ?? 99) - (categoryOrder.get(second.category) ?? 99) ||
        first.name.localeCompare(second.name, 'es'),
    )

  const availableCount = services.filter((service) => service.status === 'disponible').length
  const unavailableCount = services.length - availableCount
  const editingService = services.find((service) => service.id === editingId) ?? null
  const detailService = services.find((service) => service.id === detailId) ?? null
  const deletingService = services.find((service) => service.id === deletingId) ?? null
  const filtersActive = Boolean(query || categoryFilter || statusFilter)

  function scrollToForm() {
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function startCreate() {
    setEditingId(null)
    setFormVersion((version) => version + 1)
    setDetailId(null)
    scrollToForm()
  }

  function startEdit(service) {
    setEditingId(service.id)
    setFormVersion((version) => version + 1)
    setDetailId(null)
    scrollToForm()
  }

  function cancelEdit() {
    setEditingId(null)
    setFormVersion((version) => version + 1)
  }

  function handleSave(input) {
    if (editingId) {
      onUpdateService({ id: editingId, ...input })
      setNotice({ type: 'success', message: 'Servicio actualizado correctamente.' })
      setEditingId(null)
    } else {
      onCreateService(input)
      setNotice({ type: 'success', message: 'Servicio agregado correctamente.' })
    }
  }

  function openDelete(service) {
    setDeletingId(service.id)
    setDetailId(null)
  }

  function confirmDelete() {
    if (!deletingService) return

    try {
      onDeleteService(deletingService.id)
      setNotice({
        type: 'success',
        message: `Servicio ${deletingService.name} eliminado correctamente.`,
      })
      if (editingId === deletingService.id) {
        setEditingId(null)
        setFormVersion((version) => version + 1)
      }
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo eliminar el servicio.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  function clearFilters() {
    setQuery('')
    setCategoryFilter('')
    setStatusFilter('')
  }

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            Servicios adicionales
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Administra bebidas, desayunos, almuerzos y cenas. {formatLongDate()}
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="self-start rounded-md border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 sm:self-auto"
        >
          + Nuevo servicio
        </button>
      </header>

      {notice && <PageNotice notice={notice} onClose={() => setNotice(null)} />}

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total de servicios:"
          value={services.length}
          note={`${SERVICE_CATEGORY_OPTIONS.length} categorías disponibles`}
        />
        <StatCard
          label="Disponibles:"
          value={availableCount}
          note="Opciones que el cliente puede solicitar"
        />
        <StatCard
          label="No disponibles:"
          value={unavailableCount}
          note="Opciones visibles sin disponibilidad"
        />
      </dl>

      <section className="mt-6 rounded-md border border-amber-400/60 bg-[#080705] p-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter('')}
            aria-pressed={!categoryFilter}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 ${
              !categoryFilter
                ? 'border-transparent bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 text-black'
                : 'border-amber-400/50 bg-black/30 text-stone-300 hover:border-amber-300 hover:text-amber-100'
            }`}
          >
            <GridIcon className="h-3.5 w-3.5" />
            Todos
          </button>
          {SERVICE_CATEGORY_OPTIONS.map((option) => {
            const active = categoryFilter === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategoryFilter(option.value)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 ${
                  active
                    ? 'border-transparent bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 text-black'
                    : 'border-amber-400/50 bg-black/30 text-stone-300 hover:border-amber-300 hover:text-amber-100'
                }`}
              >
                <CategoryIcon category={option.value} className="h-3.5 w-3.5" />
                {option.label}
              </button>
            )
          })}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_190px]">
          <div>
            <label htmlFor="service-search" className={filterLabelClass}>
              Buscar
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/70" />
              <input
                id="service-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre de bebida o comida"
                aria-label="Buscar servicios por nombre"
                className="w-full rounded-md border border-amber-400/45 bg-black/40 py-2 pl-9 pr-3 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
              />
            </div>
          </div>
          <div>
            <label htmlFor="service-status-filter" className={filterLabelClass}>
              Disponibilidad
            </label>
            <select
              id="service-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
            >
              <option value="">Todos los estados</option>
              {SERVICE_STATUS_OPTIONS.map((option) => (
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

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <section className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white">Catálogo de servicios</h2>
            <span className="text-[11px] text-stone-500">
              {filteredServices.length} de {services.length} opciones
            </span>
          </div>

          {filteredServices.length === 0 ? (
            <div className="mt-3 flex min-h-[240px] flex-col items-center justify-center rounded-md border border-dashed border-amber-400/30 bg-[#080705] px-6 text-center">
              <p className="text-sm font-medium text-stone-300">
                No se encontraron servicios con esos filtros.
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Prueba con otro nombre, categoría o limpia los filtros.
              </p>
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 rounded-md border border-amber-400/60 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/10"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onView={(selected) => setDetailId(selected.id)}
                  onEdit={startEdit}
                  onDelete={openDelete}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="xl:sticky xl:top-6 xl:col-start-2 xl:row-start-1 xl:max-h-[calc(100svh-3rem)] xl:overflow-y-auto xl:pr-1">
          <ServiceForm
            key={`${editingId ?? 'new'}-${formVersion}`}
            service={editingService}
            onSave={handleSave}
            onCancelEdit={cancelEdit}
            formRef={formRef}
          />
        </aside>
      </div>

      {detailService && (
        <ServiceDetail
          service={detailService}
          onClose={() => setDetailId(null)}
          onEdit={startEdit}
          onDelete={openDelete}
        />
      )}

      {deletingService && (
        <DeleteServiceDialog
          service={deletingService}
          onCancel={() => setDeletingId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  )
}

export default Servicios
