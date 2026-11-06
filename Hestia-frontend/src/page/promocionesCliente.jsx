import { useState } from 'react'
import { PROMOTION_CATEGORY_OPTIONS, promotionCategoryLabel } from '../data/hestiaData.js'
import { visiblePromotions } from '../lib/clientBooking.js'
import { PromotionCard } from '../components/cliente/cards.jsx'
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  SearchIcon,
  SparklesIcon,
  TagIcon,
} from '../components/cliente/icons.jsx'
import {
  chipClass,
  EmptyState,
  inputClass,
  labelClass,
  Notice,
  PageHeading,
  secondaryButtonClass,
} from '../components/cliente/ui.jsx'

const STATUS_FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'activa', label: 'Activas' },
  { value: 'programada', label: 'Próximas' },
  { value: 'vencida', label: 'Vencidas' },
]

function PromocionesCliente({
  data,
  notice,
  onDismissNotice,
  onUsePromotion,
  onCopyPromotion,
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('todas')

  const catalog = visiblePromotions(data)
  const activeCount = catalog.filter(
    (promotion) => promotion.effectiveStatus === 'activa',
  ).length
  const scheduledCount = catalog.filter(
    (promotion) => promotion.effectiveStatus === 'programada',
  ).length
  const normalizedQuery = query.trim().toLowerCase()

  const filtered = catalog.filter((promotion) => {
    if (status !== 'todas' && promotion.effectiveStatus !== status) return false
    if (category && promotion.category !== category) return false
    if (!normalizedQuery) return true

    return [
      promotion.name,
      promotion.description,
      promotion.code,
      promotionCategoryLabel(promotion.category),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery))
  })

  const filtersActive = Boolean(query || category || status !== 'todas')

  function clearFilters() {
    setQuery('')
    setCategory('')
    setStatus('todas')
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-amber-400/15 bg-[#070605]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-400/5 via-transparent to-transparent"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <PageHeading
            eyebrow="Beneficios de temporada"
            title="Promociones"
            description="Aprovecha los beneficios vigentes para tu próxima estadía. Copia un código y úsalo al reservar tu habitación."
            action={
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-amber-400/30 bg-black/30 px-4 py-3 text-right">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                    Activas
                  </p>
                  <p className="text-xl font-bold text-amber-200">{activeCount}</p>
                </div>
                <div className="rounded-lg border border-amber-400/30 bg-black/30 px-4 py-3 text-right">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                    Próximas
                  </p>
                  <p className="text-xl font-bold text-white">{scheduledCount}</p>
                </div>
              </div>
            }
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: TagIcon,
                title: 'Copia el código',
                text: 'Cada promoción tiene un código único que puedes pegar en tu reserva.',
              },
              {
                icon: SparklesIcon,
                title: 'Elige tu habitación',
                text: 'Las promociones de habitación y combos se descuentan del subtotal.',
              },
              {
                icon: CheckIcon,
                title: 'Confirma tu reserva',
                text: 'El administrador valida la disponibilidad y confirma tu estadía.',
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-[#080705] p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
                  <step.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Paso {index + 1}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-stone-400">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {notice && (
          <Notice
            type={notice.type}
            message={notice.message}
            onClose={onDismissNotice}
            className="mb-3"
          />
        )}
        <div className="rounded-xl border border-amber-400/30 bg-[#080705] p-3">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_210px]">
            <div>
              <label htmlFor="client-promotion-search" className={labelClass}>
                Buscar promoción
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/70" />
                <input
                  id="client-promotion-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nombre, código o beneficio..."
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="client-promotion-category" className={labelClass}>
                Categoría
              </label>
              <select
                id="client-promotion-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-[#0b0a07]">
                  Todas
                </option>
                {PROMOTION_CATEGORY_OPTIONS.map((option) => (
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
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={chipClass(status === filter.value)}
              >
                {filter.label}
              </button>
            ))}
            {filtersActive && (
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
          <h2 className="text-lg font-semibold text-white">
            {status === 'todas'
              ? 'Todas las promociones'
              : status === 'activa'
                ? 'Promociones activas'
                : status === 'programada'
                  ? 'Próximas promociones'
                  : 'Promociones vencidas'}
          </h2>
          <span className="text-[11px] text-stone-500">
            {filtered.length} de {catalog.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={TagIcon}
              title="No encontramos promociones"
              description="Prueba con otra categoría, otro estado o limpia los filtros para ver todos los beneficios."
              action={
                <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
                  Ver todas las promociones
                </button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onUse={onUsePromotion}
                onCopy={onCopyPromotion}
              />
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-4 rounded-xl border border-amber-400/25 bg-[#080705] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
              <ClockIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">¿Cómo aplico mi código?</p>
              <p className="mt-1 text-xs leading-5 text-stone-400">
                Copia el código, entra a <span className="text-amber-200">Mis reservas</span> y
                pégalo en el campo “Código promocional” antes de enviar tu solicitud. Las
                promociones de bebidas, desayunos y combos se coordinan con recepción.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const firstActive = catalog.find(
                (promotion) => promotion.effectiveStatus === 'activa',
              )
              if (firstActive) onUsePromotion(firstActive)
            }}
            disabled={activeCount === 0}
            className={`${secondaryButtonClass} shrink-0`}
          >
            Usar una promoción <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </section>
    </>
  )
}

export default PromocionesCliente
