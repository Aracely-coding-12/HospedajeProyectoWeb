import { useRef, useState } from 'react'
import {
  PROMOTION_CATEGORY_OPTIONS,
  PROMOTION_STATUS_OPTIONS,
  PROMOTION_TYPE_OPTIONS,
  buildPromotionSummary,
  promotionCategoryLabel,
  promotionEffectiveStatus,
  promotionStatusLabel,
  promotionTypeLabel,
} from '../data/hestiaData.js'
import { addDaysKey, formatLongDate, todayKey } from '../lib/format.js'

const CATEGORY_STYLES = new Map([
  ['bebidas', 'border-sky-400/40 bg-sky-400/10 text-sky-200'],
  ['habitacion', 'border-amber-400/50 bg-amber-400/10 text-amber-200'],
  ['desayunos', 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'],
  ['combos', 'border-violet-400/40 bg-violet-400/10 text-violet-200'],
])

const CATEGORY_ICON_STYLES = new Map([
  ['bebidas', 'border-sky-400/30 bg-sky-400/10 text-sky-300'],
  ['habitacion', 'border-amber-400/30 bg-amber-400/10 text-amber-300'],
  ['desayunos', 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'],
  ['combos', 'border-violet-400/30 bg-violet-400/10 text-violet-300'],
])

const STATUS_STYLES = new Map([
  ['activa', 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'],
  ['programada', 'border-amber-400/50 bg-amber-400/10 text-amber-200'],
  ['vencida', 'border-rose-500/50 bg-rose-500/10 text-rose-200'],
  ['inactiva', 'border-stone-500/50 bg-stone-500/10 text-stone-300'],
])

const STATUS_DOT_STYLES = new Map([
  ['activa', 'bg-emerald-400'],
  ['programada', 'bg-amber-400'],
  ['vencida', 'bg-rose-400'],
  ['inactiva', 'bg-stone-400'],
])

const STATUS_FILTER_OPTIONS = [
  { value: 'activa', label: 'Activas' },
  { value: 'programada', label: 'Próximas' },
  { value: 'vencida', label: 'Vencidas' },
  { value: 'inactiva', label: 'Inactivas' },
]

const SUMMARY_TONES = {
  amber: {
    card: 'border-amber-400/60',
    icon: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  },
  emerald: {
    card: 'border-emerald-500/40',
    icon: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  },
  rose: {
    card: 'border-rose-500/40',
    icon: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  },
}

const fieldClass =
  'w-full rounded-md border border-amber-400/55 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15'

const readOnlyFieldClass =
  'w-full cursor-not-allowed rounded-md border border-amber-400/30 bg-black/30 px-3 py-2 text-sm text-amber-100 outline-none'

const labelClass = 'mb-1.5 block text-[11px] font-medium tracking-wide text-amber-100/90'
const filterLabelClass = 'mb-1 block text-[10px] font-medium tracking-wide text-stone-500'

function categoryStyle(category) {
  return CATEGORY_STYLES.get(category) ?? CATEGORY_STYLES.get('bebidas')
}

function categoryIconStyle(category) {
  return CATEGORY_ICON_STYLES.get(category) ?? CATEGORY_ICON_STYLES.get('bebidas')
}

function statusStyle(status) {
  return STATUS_STYLES.get(status) ?? STATUS_STYLES.get('inactiva')
}

function statusDotStyle(status) {
  return STATUS_DOT_STYLES.get(status) ?? STATUS_DOT_STYLES.get('inactiva')
}

function formatDateKey(value) {
  if (!value) return '—'

  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year.slice(2)}`
}

function formatDiscount(value) {
  const amount = Number(value) || 0
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)}%`
}

function promotionDiscountLabel(promotion) {
  if (promotion.type === 'dosxuno') return '2x1'
  if (promotion.type === 'cortesia') return 'Gratis'
  return formatDiscount(promotion.discount)
}

function emptyForm() {
  const startDate = todayKey()

  return {
    name: '',
    type: PROMOTION_TYPE_OPTIONS[0].value,
    category: PROMOTION_CATEGORY_OPTIONS[0].value,
    discount: '',
    startDate,
    endDate: addDaysKey(startDate, 30),
    description: '',
    status: 'activa',
    visibleOnWeb: true,
    reservationNumber: '',
    image: '',
  }
}

function CategoryIcon({ category, className = '' }) {
  if (category === 'habitacion') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
        <path d="M4 18v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7M4 18h16M4 18v2M20 18v2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 9V7.5A1.5 1.5 0 0 1 9.5 6h5A1.5 1.5 0 0 1 16 7.5V9" strokeLinecap="round" />
      </svg>
    )
  }

  if (category === 'desayunos') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
        <path d="M4.5 9h11v5.5a4.5 4.5 0 0 1-4.5 4.5H9a4.5 4.5 0 0 1-4.5-4.5V9Z" strokeLinejoin="round" />
        <path d="M15.5 10.5h1.8a2.5 2.5 0 0 1 0 5h-1.8M7.5 3.5v2.5M11.5 3.5v2.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (category === 'combos') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
        <path d="M4 9.5h16V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V9.5Z" strokeLinejoin="round" />
        <path d="M3 5.5h18V9.5H3zM12 5.5V20.5" strokeLinejoin="round" />
        <path d="M12 5.5H8.8a2.3 2.3 0 1 1 2.3-2.3v2.3Zm0 0h3.2a2.3 2.3 0 1 0-2.3-2.3v2.3Z" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M5.5 8h13l-1.2 12.2a1 1 0 0 1-1 .8H7.7a1 1 0 0 1-1-.8L5.5 8Z" strokeLinejoin="round" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8M8.5 13h7" strokeLinecap="round" />
    </svg>
  )
}

function PercentDiamondIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className={className}>
      <path d="M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5Z" strokeLinejoin="round" />
      <path d="m9 15 6-6" strokeLinecap="round" />
      <circle cx="9.2" cy="9.2" r="1.3" />
      <circle cx="14.8" cy="14.8" r="1.3" />
    </svg>
  )
}

function TagIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M20.5 13.5 13.5 20.5a2 2 0 0 1-2.8 0L3.5 13.3V4.5a1 1 0 0 1 1-1h8.8l7.2 7.2a2 2 0 0 1 0 2.8Z" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  )
}

function CheckCircleIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.4 2.4 4.6-4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ClockIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExpiredIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9 9 6 6M15 9l-6 6" strokeLinecap="round" />
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

function FilterIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
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

function ImageIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="9.5" r="1.6" />
      <path d="m4.5 17 4.2-4.2 3 3 2.6-2.6 5.2 5.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GlobeIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.4 3.4 5.4 3.4 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.4-5.4-3.4-8.5S9.8 5.9 12 3.5Z" />
    </svg>
  )
}

function InfoIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
    </svg>
  )
}

function CategoryBadge({ category }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${categoryStyle(category)}`}
    >
      <CategoryIcon category={category} className="h-2.5 w-2.5" />
      {promotionCategoryLabel(category)}
    </span>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusStyle(status)}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${statusDotStyle(status)}`} />
      {promotionStatusLabel(status)}
    </span>
  )
}

function PromotionPhoto({ promotion, className = '', iconClassName = '' }) {
  if (promotion.image) {
    return (
      <img
        src={promotion.image}
        alt={`Imagen de ${promotion.name}`}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <span className={`flex h-full w-full items-center justify-center ${categoryIconStyle(promotion.category)}`}>
      <CategoryIcon category={promotion.category} className={iconClassName} />
    </span>
  )
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  const styles = SUMMARY_TONES[tone]

  return (
    <div
      className={`flex items-center gap-3 rounded-md border bg-[#080705] px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(245,200,66,0.06)] ${styles.card}`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${styles.icon}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <dt className="text-[10px] font-medium tracking-wide text-stone-300">{label}</dt>
        <dd className="mt-0.5 text-[26px] font-bold leading-none text-white">{value}</dd>
      </div>
    </div>
  )
}

function PageNotice({ notice, onClose }) {
  const success = notice.type === 'success'

  return (
    <div
      role="status"
      className={`mt-4 flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${
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

function PromotionDetail({ promotion, onClose, onEdit, onDelete }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promotion-detail-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-amber-500/50 bg-[#0b0a07] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-amber-400/20 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">
              Detalle de la promoción
            </p>
            <h2 id="promotion-detail-title" className="mt-1 text-xl font-bold text-white">
              {promotion.name}
            </h2>
            <p className="mt-0.5 text-[10px] text-stone-500">{promotion.code}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <CategoryBadge category={promotion.category} />
              <StatusBadge status={promotion.effectiveStatus} />
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
          <div className="relative h-48 overflow-hidden rounded-md border border-amber-400/25">
            <PromotionPhoto promotion={promotion} iconClassName="h-10 w-10" />
            <span className="absolute left-3 top-3 rounded-md border border-amber-300/30 bg-black/75 px-3 py-1 text-lg font-black text-amber-200 backdrop-blur-sm">
              {promotionDiscountLabel(promotion)}
            </span>
            <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-stone-200 backdrop-blur-sm">
              {promotionTypeLabel(promotion.type)}
            </span>
          </div>

          <section className="mt-4 rounded-md border border-amber-400/20 bg-black/25 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
              Descripción
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-300">{promotion.description}</p>
          </section>

          <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
            <div className="rounded-md border border-amber-400/20 bg-black/25 p-3">
              <dt className="text-stone-500">N° de reserva</dt>
              <dd className="mt-1 font-semibold text-amber-100">
                {promotion.reservationNumber || 'Todas las reservas'}
              </dd>
            </div>
            <div className="rounded-md border border-amber-400/20 bg-black/25 p-3">
              <dt className="text-stone-500">Categoría</dt>
              <dd className="mt-1">
                <CategoryBadge category={promotion.category} />
              </dd>
            </div>
            <div className="rounded-md border border-amber-400/20 bg-black/25 p-3">
              <dt className="text-stone-500">Vigencia</dt>
              <dd className="mt-1 font-semibold text-amber-100">
                {formatDateKey(promotion.startDate)} – {formatDateKey(promotion.endDate)}
              </dd>
            </div>
            <div className="rounded-md border border-amber-400/20 bg-black/25 p-3">
              <dt className="text-stone-500">Estado</dt>
              <dd className="mt-1">
                <StatusBadge status={promotion.effectiveStatus} />
              </dd>
            </div>
            <div className="rounded-md border border-amber-400/20 bg-black/25 p-3">
              <dt className="text-stone-500">Visible en la web</dt>
              <dd className="mt-1 flex items-center gap-1.5 font-semibold text-amber-100">
                <GlobeIcon className="h-3.5 w-3.5 text-amber-400/80" />
                {promotion.visibleOnWeb ? 'Sí' : 'No'}
              </dd>
            </div>
            <div className="rounded-md border border-amber-400/20 bg-black/25 p-3">
              <dt className="text-stone-500">Tipo</dt>
              <dd className="mt-1 font-semibold text-amber-100">
                {promotionTypeLabel(promotion.type)}
              </dd>
            </div>
          </dl>

          {promotion.effectiveStatus === 'vencida' && (
            <p className="mt-4 rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-[11px] leading-5 text-rose-100/90">
              Esta promoción ya venció. Puedes editar la vigencia para reactivarla o eliminarla
              del catálogo.
            </p>
          )}

          {promotion.effectiveStatus === 'programada' && (
            <p className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-[11px] leading-5 text-amber-100/90">
              Esta promoción comenzará a mostrarse a los clientes a partir del{' '}
              {formatDateKey(promotion.startDate)}.
            </p>
          )}

          {promotion.effectiveStatus === 'inactiva' && (
            <p className="mt-4 rounded-md border border-stone-500/30 bg-stone-500/5 px-3 py-2 text-[11px] leading-5 text-stone-300">
              Esta promoción está desactivada. Puedes editarla para volver a ofrecerla a tus
              clientes.
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
            onClick={() => onDelete(promotion)}
            className="rounded-md border border-rose-500/50 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
          >
            Eliminar promoción
          </button>
          <button
            type="button"
            onClick={() => onEdit(promotion)}
            className="rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-4 py-2 text-sm font-bold text-black transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
          >
            Editar promoción
          </button>
        </footer>
      </div>
    </div>
  )
}

function DeletePromotionDialog({ promotion, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="promotion-delete-title"
        aria-describedby="promotion-delete-description"
        className="w-full max-w-md rounded-xl border border-rose-500/50 bg-[#0b0a07] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300">
          <TrashIcon className="h-5 w-5" />
        </span>
        <h2 id="promotion-delete-title" className="mt-4 text-lg font-semibold text-white">
          Eliminar {promotion.name}
        </h2>
        <p id="promotion-delete-description" className="mt-2 text-sm leading-6 text-stone-400">
          Se eliminará la promoción {promotion.code} de{' '}
          {promotionCategoryLabel(promotion.category)} con{' '}
          {promotionDiscountLabel(promotion)} de beneficio. Esta acción no se puede deshacer.
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
            Eliminar promoción
          </button>
        </div>
      </div>
    </div>
  )
}

function PromotionForm({ promotion, onSave, onCancelEdit, formRef }) {
  const editing = Boolean(promotion)
  const [tab, setTab] = useState('general')
  const [form, setForm] = useState(() =>
    promotion
      ? {
          name: promotion.name ?? '',
          type: promotion.type,
          category: promotion.category,
          discount: String(promotion.discount),
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          description: promotion.description ?? '',
          status: promotion.status ?? 'activa',
          visibleOnWeb: promotion.visibleOnWeb !== false,
          reservationNumber: promotion.reservationNumber ?? '',
          image: promotion.image ?? '',
        }
      : emptyForm(),
  )
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)

  function resetForm() {
    setForm(emptyForm())
    setErrors({})
    setFormError(null)
    setTab('general')
  }

  function handleChange(event) {
    const { name, value } = event.target

    switch (name) {
      case 'name':
        setForm((current) => ({ ...current, name: value }))
        break
      case 'type':
        setForm((current) => ({ ...current, type: value }))
        break
      case 'category':
        setForm((current) => ({ ...current, category: value }))
        break
      case 'discount':
        setForm((current) => ({ ...current, discount: value }))
        break
      case 'startDate':
        setForm((current) => ({ ...current, startDate: value }))
        break
      case 'endDate':
        setForm((current) => ({ ...current, endDate: value }))
        break
      case 'description':
        setForm((current) => ({ ...current, description: value }))
        break
      case 'status':
        setForm((current) => ({ ...current, status: value }))
        break
      case 'reservationNumber':
        setForm((current) => ({ ...current, reservationNumber: value }))
        break
      default:
        break
    }

    setErrors({})
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
      setFormError('La imagen no debe superar los 2 MB.')
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
      setFormError('No se pudo leer la imagen seleccionada.')
      input.value = ''
    }
    reader.readAsDataURL(file)
  }

  function handleCancel() {
    if (editing) {
      onCancelEdit()
    } else {
      resetForm()
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.name.trim()) {
      nextErrors.name = 'Ingresa el nombre de la promoción.'
    } else if (form.name.trim().length > 80) {
      nextErrors.name = 'El nombre no puede superar los 80 caracteres.'
    }

    if (!PROMOTION_TYPE_OPTIONS.some((option) => option.value === form.type)) {
      nextErrors.type = 'Selecciona un tipo de promoción.'
    }

    if (!PROMOTION_CATEGORY_OPTIONS.some((option) => option.value === form.category)) {
      nextErrors.category = 'Selecciona una categoría.'
    }

    const discount = Number(form.discount)
    if (!form.discount || !Number.isFinite(discount) || discount <= 0 || discount > 100) {
      nextErrors.discount = 'Ingresa un descuento mayor a 0 y máximo de 100%.'
    }

    if (!form.startDate) {
      nextErrors.startDate = 'Selecciona la fecha de inicio.'
    }
    if (!form.endDate) {
      nextErrors.endDate = 'Selecciona la fecha de fin.'
    } else if (form.startDate && form.endDate < form.startDate) {
      nextErrors.endDate = 'La fecha de fin no puede ser anterior al inicio.'
    }

    if (!form.description.trim()) {
      nextErrors.description = 'Ingresa una descripción de la promoción.'
    } else if (form.description.trim().length > 240) {
      nextErrors.description = 'La descripción no puede superar los 240 caracteres.'
    }

    if (!form.status) {
      nextErrors.status = 'Selecciona un estado.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    try {
      onSave({
        name: form.name,
        type: form.type,
        category: form.category,
        discount: form.discount,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
        status: form.status,
        visibleOnWeb: form.visibleOnWeb,
        reservationNumber: form.reservationNumber,
        image: form.image,
      })
      if (!editing) {
        resetForm()
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar la promoción.')
    }
  }

  return (
    <section
      ref={formRef}
      className="scroll-mt-6 overflow-hidden rounded-md border border-amber-400/70 bg-[#080705]"
    >
      <header className="flex items-center justify-between gap-3 border-b border-amber-400/20 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/50 bg-amber-400/10 text-amber-300">
            <PercentDiamondIcon className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-semibold text-white">
            {editing ? 'Editar promoción' : 'Crear promoción'}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Cerrar formulario"
          className="rounded-md p-1 text-stone-500 transition hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </header>

      <div className="flex border-b border-amber-400/15 px-2">
        <button
          type="button"
          onClick={() => setTab('general')}
          aria-pressed={tab === 'general'}
          className={`inline-flex items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-[11px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 ${
            tab === 'general'
              ? 'border-amber-400 text-amber-200'
              : 'border-transparent text-stone-500 hover:text-amber-100'
          }`}
        >
          <InfoIcon className="h-3.5 w-3.5" />
          Información general
        </button>
        <button
          type="button"
          onClick={() => setTab('imagen')}
          aria-pressed={tab === 'imagen'}
          className={`inline-flex items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-[11px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40 ${
            tab === 'imagen'
              ? 'border-amber-400 text-amber-200'
              : 'border-transparent text-stone-500 hover:text-amber-100'
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Imagen
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3 p-4">
        {tab === 'general' ? (
          <>
            <div>
              <label htmlFor="promotion-code" className={labelClass}>
                Código:
              </label>
              <input
                id="promotion-code"
                type="text"
                readOnly
                value={editing ? promotion.code : 'Se generará automáticamente'}
                className={`${readOnlyFieldClass} text-amber-200`}
              />
            </div>

            <div>
              <label htmlFor="promotion-name" className={labelClass}>
                Nombre de la promoción: *
              </label>
              <input
                id="promotion-name"
                name="name"
                type="text"
                required
                maxLength="80"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Escapada romántica"
                className={fieldClass}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && (
                <p role="alert" className="mt-1 text-[11px] text-rose-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="promotion-type" className={labelClass}>
                Tipo de promoción: *
              </label>
              <select
                id="promotion-type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className={fieldClass}
                aria-invalid={Boolean(errors.type)}
              >
                {PROMOTION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p role="alert" className="mt-1 text-[11px] text-rose-400">
                  {errors.type}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="promotion-category" className={labelClass}>
                Categoría: *
              </label>
              <select
                id="promotion-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={fieldClass}
                aria-invalid={Boolean(errors.category)}
              >
                {PROMOTION_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p role="alert" className="mt-1 text-[11px] text-rose-400">
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="promotion-reservation" className={labelClass}>
                N° de reserva:
              </label>
              <input
                id="promotion-reservation"
                name="reservationNumber"
                type="text"
                maxLength="20"
                value={form.reservationNumber}
                onChange={handleChange}
                placeholder="Ej. HES-0001"
                className={`${fieldClass} uppercase placeholder:normal-case`}
                aria-invalid={Boolean(errors.reservationNumber)}
              />
              <p className="mt-1 text-[10px] text-stone-600">
                Opcional. Déjalo vacío para aplicar a todas las reservas.
              </p>
            </div>

            <div>
              <label htmlFor="promotion-discount" className={labelClass}>
                Descuento: *
              </label>
              <div className="relative">
                <input
                  id="promotion-discount"
                  name="discount"
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  inputMode="decimal"
                  value={form.discount}
                  onChange={handleChange}
                  placeholder="Ej. 15"
                  className={`${fieldClass} pr-8`}
                  aria-invalid={Boolean(errors.discount)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500">
                  %
                </span>
              </div>
              {errors.discount ? (
                <p role="alert" className="mt-1 text-[11px] text-rose-400">
                  {errors.discount}
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-stone-600">Entre 1% y 100%.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="promotion-start-date" className={labelClass}>
                  Fecha de inicio: *
                </label>
                <input
                  id="promotion-start-date"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  className={fieldClass}
                  aria-invalid={Boolean(errors.startDate)}
                />
                {errors.startDate && (
                  <p role="alert" className="mt-1 text-[11px] text-rose-400">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="promotion-end-date" className={labelClass}>
                  Fecha de fin: *
                </label>
                <input
                  id="promotion-end-date"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  className={fieldClass}
                  aria-invalid={Boolean(errors.endDate)}
                />
                {errors.endDate && (
                  <p role="alert" className="mt-1 text-[11px] text-rose-400">
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="promotion-description" className={labelClass}>
                Descripción: *
              </label>
              <textarea
                id="promotion-description"
                name="description"
                required
                rows="4"
                maxLength="240"
                value={form.description}
                onChange={handleChange}
                placeholder="Ingresa la descripción de la promoción..."
                className={`${fieldClass} resize-y`}
                aria-invalid={Boolean(errors.description)}
              />
              <div className="mt-1 flex items-start justify-between gap-2">
                {errors.description ? (
                  <p role="alert" className="text-[11px] text-rose-400">
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
              <label htmlFor="promotion-status" className={labelClass}>
                Estado: *
              </label>
              <select
                id="promotion-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={fieldClass}
                aria-invalid={Boolean(errors.status)}
              >
                {PROMOTION_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-stone-600">
                Las fechas determinan si está programada, activa o vencida.
              </p>
              {errors.status && (
                <p role="alert" className="mt-1 text-[11px] text-rose-400">
                  {errors.status}
                </p>
              )}
            </div>

            <div className="rounded-md border border-amber-400/25 bg-black/25 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-amber-100/90">
                    <GlobeIcon className="h-3.5 w-3.5 text-amber-400/80" />
                    Mostrar en la web
                  </p>
                  <p className="mt-0.5 text-[9px] leading-4 text-stone-500">
                    La promoción será visible para los clientes.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label="Mostrar en la web"
                  aria-checked={form.visibleOnWeb}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      visibleOnWeb: !current.visibleOnWeb,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 ${
                    form.visibleOnWeb
                      ? 'border-amber-300 bg-amber-400'
                      : 'border-stone-600 bg-stone-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-[#080705] transition ${
                      form.visibleOnWeb ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className={`flex h-48 w-full items-center justify-center overflow-hidden rounded-md border border-amber-400/30 ${
                form.image ? 'bg-black/40' : categoryIconStyle(form.category)
              }`}
            >
              {form.image ? (
                <img
                  src={form.image}
                  alt="Vista previa de la promoción"
                  className="h-full w-full object-cover"
                />
              ) : (
                <CategoryIcon category={form.category} className="h-10 w-10" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="promotion-image"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-amber-400/50 px-2.5 py-1.5 text-[11px] font-medium text-amber-100 transition hover:bg-amber-400/10"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Subir imagen
              </label>
              <input
                id="promotion-image"
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
                  Quitar imagen
                </button>
              )}
              <p className="w-full text-[9px] text-stone-600">JPG, PNG o WEBP · máx. 2 MB</p>
            </div>

            <p className="rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[10px] leading-5 text-amber-100/70">
              Esta imagen se mostrará en la tabla de promociones y en el detalle de la promoción.
            </p>
          </>
        )}

        {formError && (
          <p
            role="alert"
            className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
          >
            {formError}
          </p>
        )}

        <div className="flex gap-2 border-t border-amber-400/15 pt-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded-md border border-amber-400/50 px-3 py-2.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-400/10"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-3 py-2.5 text-xs font-bold text-black shadow-[0_12px_30px_-14px_rgba(245,200,66,0.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
          >
            {editing ? 'Guardar cambios' : 'Guardar'}
          </button>
        </div>
      </form>
    </section>
  )
}

function Promociones({ promotions, onCreatePromotion, onUpdatePromotion, onDeletePromotion }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formVersion, setFormVersion] = useState(0)
  const [detailId, setDetailId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [notice, setNotice] = useState(null)
  const formRef = useRef(null)

  const summary = buildPromotionSummary(promotions)
  const presentedPromotions = promotions.map((promotion) => ({
    ...promotion,
    effectiveStatus: promotionEffectiveStatus(promotion),
  }))

  const normalizedQuery = query.trim().toLowerCase().replace(/^#/, '')
  const filteredPromotions = presentedPromotions.filter((promotion) => {
    const searchable = [
      promotion.name,
      promotion.description,
      promotion.code,
      promotion.reservationNumber || 'todas las reservas',
      promotionTypeLabel(promotion.type),
      promotionCategoryLabel(promotion.category),
      promotionStatusLabel(promotion.effectiveStatus),
      promotionDiscountLabel(promotion),
    ]
      .join(' ')
      .toLowerCase()

    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
    const matchesStatus = !statusFilter || promotion.effectiveStatus === statusFilter
    const matchesType = !typeFilter || promotion.type === typeFilter
    const matchesCategory = !categoryFilter || promotion.category === categoryFilter

    return matchesQuery && matchesStatus && matchesType && matchesCategory
  })

  const editingPromotion = promotions.find((promotion) => promotion.id === editingId) ?? null
  const detailPromotion =
    presentedPromotions.find((promotion) => promotion.id === detailId) ?? null
  const deletingPromotion =
    presentedPromotions.find((promotion) => promotion.id === deletingId) ?? null
  const filtersActive = Boolean(query || statusFilter || typeFilter || categoryFilter)

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

  function startEdit(promotion) {
    setEditingId(promotion.id)
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
      onUpdatePromotion({ id: editingId, ...input })
      setNotice({ type: 'success', message: 'Promoción actualizada correctamente.' })
      setEditingId(null)
    } else {
      onCreatePromotion(input)
      setNotice({ type: 'success', message: 'Promoción creada correctamente.' })
    }
  }

  function openDelete(promotion) {
    setDeletingId(promotion.id)
    setDetailId(null)
  }

  function confirmDelete() {
    if (!deletingPromotion) return

    try {
      onDeletePromotion(deletingPromotion.id)
      setNotice({
        type: 'success',
        message: `Promoción ${deletingPromotion.name} eliminada correctamente.`,
      })
      if (editingId === deletingPromotion.id) {
        setEditingId(null)
        setFormVersion((version) => version + 1)
      }
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo eliminar la promoción.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  function clearFilters() {
    setQuery('')
    setStatusFilter('')
    setTypeFilter('')
    setCategoryFilter('')
  }

  function handleQueryChange(event) {
    setQuery(event.target.value)
  }

  function handleStatusChange(event) {
    setStatusFilter(event.target.value)
  }

  function handleTypeChange(event) {
    setTypeFilter(event.target.value)
  }

  function handleCategoryChange(event) {
    setCategoryFilter(event.target.value)
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="min-w-0">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-400/70 bg-amber-400/10 text-amber-300">
                <PercentDiamondIcon className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
                  Promociones
                </h1>
                <p className="mt-1 text-xs text-stone-500">
                  Gestiona las promociones y descuentos del hotel. {formatLongDate()}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center justify-center gap-1.5 self-start rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-4 py-2.5 text-sm font-bold text-black shadow-[0_12px_30px_-14px_rgba(245,200,66,0.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 sm:self-auto"
            >
              <PlusIcon className="h-4 w-4" />
              Crear promoción
            </button>
          </header>

          {notice && <PageNotice notice={notice} onClose={() => setNotice(null)} />}

          <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={TagIcon}
              label="Total de promociones"
              value={summary.total}
              tone="amber"
            />
            <SummaryCard
              icon={CheckCircleIcon}
              label="Promociones activas"
              value={summary.active}
              tone="emerald"
            />
            <SummaryCard
              icon={ClockIcon}
              label="Promociones próximas"
              value={summary.scheduled}
              tone="amber"
            />
            <SummaryCard
              icon={ExpiredIcon}
              label="Promociones vencidas"
              value={summary.expired}
              tone="rose"
            />
          </dl>

          <section className="mt-4 rounded-md border border-amber-400/60 bg-[#080705] p-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_160px_160px_160px_auto]">
              <div>
                <label htmlFor="promotion-search" className={filterLabelClass}>
                  Buscar
                </label>
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/70" />
                  <input
                    id="promotion-search"
                    type="search"
                    value={query}
                    onChange={handleQueryChange}
                    placeholder="Buscar por nombre, tipo o descripción..."
                    aria-label="Buscar promociones"
                    className="w-full rounded-md border border-amber-400/45 bg-black/40 py-2 pl-9 pr-3 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="promotion-status-filter" className={filterLabelClass}>
                  Estado
                </label>
                <select
                  id="promotion-status-filter"
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="w-full rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
                >
                  <option value="">Todos</option>
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="promotion-type-filter" className={filterLabelClass}>
                  Tipo
                </label>
                <select
                  id="promotion-type-filter"
                  value={typeFilter}
                  onChange={handleTypeChange}
                  className="w-full rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
                >
                  <option value="">Todos</option>
                  {PROMOTION_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="promotion-category-filter" className={filterLabelClass}>
                  Categoría
                </label>
                <select
                  id="promotion-category-filter"
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                  className="w-full rounded-md border border-amber-400/45 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15"
                >
                  <option value="">Todas</option>
                  {PROMOTION_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!filtersActive}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-amber-400/60 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
                >
                  <FilterIcon className="h-3.5 w-3.5" />
                  Limpiar
                </button>
              </div>
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-md border border-amber-400/40 bg-[#080705]">
            {filteredPromotions.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                <p className="text-sm font-medium text-stone-300">
                  No se encontraron promociones con esos filtros.
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Prueba con otra categoría, tipo o limpia los filtros.
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
              <>
                <div className="max-h-[600px] overflow-auto">
                  <table className="w-full min-w-[860px] table-fixed border-collapse text-left text-xs">
                    <colgroup>
                      <col style={{ width: '44px' }} />
                      <col style={{ width: '84px' }} />
                      <col />
                      <col style={{ width: '104px' }} />
                      <col style={{ width: '86px' }} />
                      <col style={{ width: '104px' }} />
                      <col style={{ width: '108px' }} />
                      <col style={{ width: '108px' }} />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-amber-400/20 text-[10px] uppercase tracking-[0.14em] text-stone-500">
                        <th scope="col" className="sticky top-0 z-10 bg-[#0b0a07] px-2 py-3 font-semibold">
                          N°
                        </th>
                        <th scope="col" className="sticky top-0 z-10 bg-[#0b0a07] px-2 py-3 font-semibold">
                          Imagen
                        </th>
                        <th scope="col" className="sticky top-0 z-10 bg-[#0b0a07] px-2 py-3 font-semibold">
                          Nombre
                        </th>
                        <th scope="col" className="sticky top-0 z-10 bg-[#0b0a07] px-2 py-3 font-semibold">
                          Tipo
                        </th>
                        <th scope="col" className="sticky top-0 z-10 bg-[#0b0a07] px-2 py-3 font-semibold">
                          Descuento
                        </th>
                        <th scope="col" className="sticky top-0 z-10 bg-[#0b0a07] px-2 py-3 font-semibold">
                          Vigencia
                        </th>
                        <th scope="col" className="sticky top-0 z-10 bg-[#0b0a07] px-2 py-3 font-semibold">
                          Estado
                        </th>
                        <th scope="col" className="sticky top-0 z-10 bg-[#0b0a07] px-2 py-3 text-right font-semibold">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPromotions.map((promotion, index) => (
                        <tr
                          key={promotion.id}
                          className={`border-b border-amber-400/10 transition last:border-b-0 hover:bg-amber-400/[0.04] ${
                            editingId === promotion.id ? 'bg-amber-400/[0.05]' : ''
                          }`}
                        >
                          <td className="px-2 py-3 text-stone-500">
                            {index + 1}
                          </td>
                          <td className="px-2 py-3">
                            <button
                              type="button"
                              onClick={() => setDetailId(promotion.id)}
                              aria-label={`Ver detalle de ${promotion.name}`}
                              className="block h-12 w-16 overflow-hidden rounded-md border border-amber-400/25 bg-black/40 transition hover:border-amber-300/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
                            >
                              <PromotionPhoto promotion={promotion} iconClassName="h-5 w-5" />
                            </button>
                          </td>
                          <td className="px-2 py-3">
                            <button
                              type="button"
                              onClick={() => setDetailId(promotion.id)}
                              className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
                            >
                              <span className="block truncate text-sm font-semibold leading-snug text-white">
                                {promotion.name}
                              </span>
                              <span className="mt-0.5 block truncate text-[10px] text-stone-500">
                                {promotion.description}
                              </span>
                              <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <CategoryBadge category={promotion.category} />
                                <span className="truncate text-[9px] text-stone-500">
                                  {promotion.reservationNumber || 'Todas las reservas'}
                                </span>
                              </span>
                            </button>
                          </td>
                          <td className="px-2 py-3">
                            <span className="block text-stone-300">
                              {promotionTypeLabel(promotion.type)}
                            </span>
                            <span className="mt-0.5 block text-[10px] text-stone-500">
                              en {promotionCategoryLabel(promotion.category)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-2 py-3">
                            <span className="text-base font-bold text-amber-200">
                              {promotionDiscountLabel(promotion)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-2 py-3">
                            <span className="block text-stone-300">
                              {formatDateKey(promotion.startDate)}
                            </span>
                            <span className="mt-0.5 block text-[10px] text-stone-500">
                              al {formatDateKey(promotion.endDate)}
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            <StatusBadge status={promotion.effectiveStatus} />
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <RowAction
                                label={`Ver detalle de la promoción ${promotion.name}`}
                                onClick={() => setDetailId(promotion.id)}
                                className="text-stone-400 hover:bg-white/5 hover:text-amber-200"
                              >
                                <EyeIcon className="h-3.5 w-3.5" />
                              </RowAction>
                              <RowAction
                                label={`Editar promoción ${promotion.name}`}
                                onClick={() => startEdit(promotion)}
                                className="text-amber-300/80 hover:bg-amber-400/10 hover:text-amber-200"
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                              </RowAction>
                              <RowAction
                                label={`Eliminar promoción ${promotion.name}`}
                                onClick={() => openDelete(promotion)}
                                className="text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-300"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </RowAction>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-amber-400/20 px-4 py-2.5">
                  <p className="text-[11px] text-stone-500">
                    {filtersActive
                      ? `${filteredPromotions.length} de ${promotions.length} promociones`
                      : `${promotions.length} promociones en total`}
                  </p>
                </div>
              </>
            )}
          </section>
        </div>

        <aside className="xl:sticky xl:top-6 xl:max-h-[calc(100svh-3rem)] xl:overflow-y-auto xl:pr-1">
          <PromotionForm
            key={`${editingId ?? 'new'}-${formVersion}`}
            promotion={editingPromotion}
            onSave={handleSave}
            onCancelEdit={cancelEdit}
            formRef={formRef}
          />
        </aside>
      </div>

      {detailPromotion && (
        <PromotionDetail
          promotion={detailPromotion}
          onClose={() => setDetailId(null)}
          onEdit={startEdit}
          onDelete={openDelete}
        />
      )}

      {deletingPromotion && (
        <DeletePromotionDialog
          promotion={deletingPromotion}
          onCancel={() => setDeletingId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  )
}

export default Promociones
