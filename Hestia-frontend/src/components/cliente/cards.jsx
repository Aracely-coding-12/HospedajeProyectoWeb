import {
  defaultRoomImage,
  promotionCategoryLabel,
  promotionStatusLabel,
  promotionTypeLabel,
  roomStatusLabel,
  serviceCategoryLabel,
  serviceStatusLabel,
} from '../../data/hestiaData.js'
import { formatShortDate, formatSoles } from '../../lib/format.js'
import { roomIsReservable } from '../../lib/clientBooking.js'
import {
  ArrowRightIcon,
  BedIcon,
  ClockIcon,
  CoffeeIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
} from './icons.jsx'
import {
  primaryButtonClass,
  secondaryButtonClass,
  StatusBadge,
} from './ui.jsx'

function CategoryGlyph({ category, className = '' }) {
  if (category === 'bebidas') return <CoffeeIcon className={className} />
  if (category === 'desayuno' || category === 'desayunos') {
    return <SparklesIcon className={className} />
  }
  if (category === 'almuerzo') return <StarIcon className={className} />
  if (category === 'cena') return <ClockIcon className={className} />
  return <TagIcon className={className} />
}

function applyRoomImageFallback(event, type) {
  const fallback = defaultRoomImage(type)
  if (!fallback || event.currentTarget.getAttribute('src') === fallback) return
  event.currentTarget.onerror = null
  event.currentTarget.src = fallback
}

export function RoomCard({ room, onView, onReserve }) {
  const available = roomIsReservable(room)

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-amber-400/35 bg-[#080705] transition hover:border-amber-300/70 hover:bg-amber-400/[0.03]">
      <div className="relative h-44 overflow-hidden border-b border-amber-400/20 bg-[#0b0a07]">
        <img
          src={room.image || defaultRoomImage(room.type)}
          alt={`Habitación ${room.number} · ${room.type}`}
          onError={(event) => applyRoomImageFallback(event, room.type)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3">
          <StatusBadge status={room.status} label={roomStatusLabel(room.status)} />
        </span>
        <span className="absolute bottom-3 left-3 rounded-full border border-amber-400/50 bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200 backdrop-blur-sm">
          {room.type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-white">Habitación {room.number}</h3>
          <p className="shrink-0 text-right">
            <span className="block text-base font-bold text-amber-200">{formatSoles(room.price)}</span>
            <span className="text-[10px] text-stone-500">por noche</span>
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-stone-400">
          <span className="inline-flex items-center gap-1">
            <BedIcon className="h-3.5 w-3.5 text-amber-400/80" /> Piso {room.floor}
          </span>
          <span className="inline-flex items-center gap-1">
            <UsersIcon className="h-3.5 w-3.5 text-amber-400/80" /> Hasta {room.capacity} huéspedes
          </span>
        </div>

        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-stone-400">
          {room.description || 'Una estancia cómoda y acogedora en el corazón de Cusco.'}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={() => onView(room)} className={`${secondaryButtonClass} flex-1 px-3 py-2 text-xs`}>
            Ver detalle
          </button>
          <button
            type="button"
            onClick={() => onReserve(room)}
            disabled={!available}
            className={`${primaryButtonClass} flex-1 px-3 py-2 text-xs`}
          >
            Reservar
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        {!available && (
          <p className="mt-2 text-center text-[10px] text-rose-300">
            Esta habitación no está disponible para reservas en este momento.
          </p>
        )}
      </div>
    </article>
  )
}

export function PromotionCard({ promotion, onUse, onCopy }) {
  const active = promotion.effectiveStatus === 'activa'

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-amber-400/35 bg-[#080705]">
      <div className="relative h-36 overflow-hidden border-b border-amber-400/20 bg-linear-to-br from-amber-400/15 via-[#0b0a07] to-black">
        {promotion.image ? (
          <img
            src={promotion.image}
            alt={promotion.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-amber-300/80">
            <TagIcon className="h-12 w-12" />
          </div>
        )}
        <span className="absolute right-3 top-3">
          <StatusBadge
            status={promotion.effectiveStatus}
            label={promotionStatusLabel(promotion.effectiveStatus)}
          />
        </span>
        <span className="absolute bottom-3 left-3 rounded-full border border-amber-400/50 bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200 backdrop-blur-sm">
          {promotionCategoryLabel(promotion.category)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">{promotion.name}</h3>
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-amber-500">
              {promotionTypeLabel(promotion.type)}
            </p>
          </div>
          <span className="shrink-0 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-lg font-bold text-amber-200">
            {promotion.discount}%
          </span>
        </div>

        <p className="mt-2 line-clamp-3 flex-1 text-xs leading-5 text-stone-400">
          {promotion.description}
        </p>

        <p className="mt-3 text-[10px] text-stone-500">
          Vigencia: {formatShortDate(promotion.startDate)} – {formatShortDate(promotion.endDate)}
        </p>

        <div className="mt-3 rounded-md border border-dashed border-amber-400/40 bg-black/30 px-3 py-2 text-center">
          <span className="text-[9px] uppercase tracking-[0.2em] text-stone-500">Código</span>
          <p className="font-mono text-sm font-semibold tracking-wider text-amber-200">
            {promotion.code}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCopy(promotion)}
            className={`${secondaryButtonClass} flex-1 px-3 py-2 text-xs`}
          >
            Copiar código
          </button>
          <button
            type="button"
            onClick={() => onUse(promotion)}
            disabled={!active}
            className={`${primaryButtonClass} flex-1 px-3 py-2 text-xs`}
          >
            Usar
          </button>
        </div>
      </div>
    </article>
  )
}

export function ServiceCard({ service, onRequest }) {
  const available = service.status === 'disponible'

  return (
    <article className="flex flex-col rounded-xl border border-amber-400/30 bg-[#080705] p-4 transition hover:border-amber-300/60">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
          <CategoryGlyph category={service.category} className="h-5 w-5" />
        </span>
        <div className="text-right">
          <p className="text-base font-bold text-amber-200">{formatSoles(service.price)}</p>
          <StatusBadge status={service.status} label={serviceStatusLabel(service.status)} />
        </div>
      </div>

      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-500">
        {serviceCategoryLabel(service.category)}
      </p>
      <h3 className="mt-1 text-base font-semibold text-white">{service.name}</h3>
      <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-5 text-stone-400">
        {service.description}
      </p>

      <button
        type="button"
        onClick={() => onRequest(service)}
        disabled={!available}
        className={`${primaryButtonClass} mt-4 w-full px-3 py-2 text-xs`}
      >
        {available ? 'Solicitar servicio' : 'No disponible'}
      </button>
    </article>
  )
}
