import { useState } from 'react'
import hestiaEmblem from '../assets/hestia-emblem.png'
import { visiblePromotions, roomIsReservable } from '../lib/clientBooking.js'
import { formatLongDate, formatSoles } from '../lib/format.js'
import AccesoCliente from './accesoCliente.jsx'
import HabitacionCliente from './HabitacionCliente.jsx'
import PagoCliente from './PagoCliente.jsx'
import ReservaCliente from './ReservaCliente.jsx'
import ServicisCliente from './ServicisCliente.jsx'
import PerfilCliente from './perfilCliente.jsx'
import PromocionesCliente from './promocionesCliente.jsx'
import { PromotionCard, RoomCard, ServiceCard } from '../components/cliente/cards.jsx'
import {
  ArrowRightIcon,
  BedIcon,
  CalendarIcon,
  CheckIcon,
  CoffeeIcon,
  LogoutIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  PhoneIcon,
  ShieldIcon,
  SparklesIcon,
  StarIcon,
  UserIcon,
  WifiIcon,
  CloseIcon,
} from '../components/cliente/icons.jsx'
import {
  ghostButtonClass,
  Modal,
  Notice,
  primaryButtonClass,
  secondaryButtonClass,
} from '../components/cliente/ui.jsx'

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'habitaciones', label: 'Habitaciones' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'promociones', label: 'Promociones' },
]

const SESSION_NAV_ITEMS = [
  { id: 'reserva', label: 'Mis reservas' },
  { id: 'pago', label: 'Pagos' },
  { id: 'perfil', label: 'Mi perfil' },
]

function initials(name) {
  return String(name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function copyText(value) {
  try {
    return navigator.clipboard.writeText(value).then(
      () => true,
      () => copyTextFallback(value),
    )
  } catch {
    return Promise.resolve(copyTextFallback(value))
  }
}

function copyTextFallback(value) {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    textarea.remove()
    return copied
  } catch {
    return false
  }
}

function SiteHeader({
  view,
  session,
  profile,
  mobileOpen,
  onToggleMobile,
  onNavigate,
  onOpenAuth,
  onLogout,
}) {
  const navItems = session ? [...NAV_ITEMS, ...SESSION_NAV_ITEMS] : NAV_ITEMS

  return (
    <header className="sticky top-0 z-40 border-b border-amber-400/20 bg-[#050505]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate('inicio')}
          className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
          aria-label="Ir al inicio de Hestia"
        >
          <img src={hestiaEmblem} alt="" className="h-11 w-auto object-contain" />
          <span className="text-left">
            <span className="brand-font brand-glow block bg-linear-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-[27px] leading-none text-transparent">
              Hestia
            </span>
            <span className="block text-[8px] uppercase tracking-[0.22em] text-stone-500">
              Hospedaje Cusco
            </span>
          </span>
        </button>

        <nav aria-label="Navegación principal" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={view === item.id ? 'page' : undefined}
              className={`rounded-md px-3 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 ${
                view === item.id
                  ? 'bg-amber-400/15 text-amber-200'
                  : 'text-stone-400 hover:bg-white/5 hover:text-amber-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate('perfil')}
                className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-black/30 py-1.5 pl-1.5 pr-3 text-left transition hover:border-amber-300/60"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-bold text-amber-200">
                  {initials(profile?.name ?? session.name)}
                </span>
                <span className="max-w-[120px] truncate text-[11px] font-semibold text-amber-100">
                  {profile?.name ?? session.name}
                </span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-md p-2 text-stone-500 transition hover:bg-white/5 hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogoutIcon className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className={`${ghostButtonClass} text-xs`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className={`${primaryButtonClass} px-4 py-2 text-xs`}
              >
                Crear cuenta
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleMobile}
          className="rounded-md border border-amber-400/30 p-2 text-amber-200 lg:hidden"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-amber-400/15 bg-[#080705] px-4 py-4 lg:hidden">
          <nav aria-label="Navegación móvil" className="grid gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={view === item.id ? 'page' : undefined}
                className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition ${
                  view === item.id
                    ? 'bg-amber-400/15 text-amber-200'
                    : 'text-stone-300 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          {session ? (
            <button
              type="button"
              onClick={onLogout}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-rose-500/40 bg-rose-500/5 px-3 py-2.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10"
            >
              <LogoutIcon className="h-4 w-4" /> Cerrar sesión
            </button>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className={`${secondaryButtonClass} text-xs`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className={`${primaryButtonClass} text-xs`}
              >
                Crear cuenta
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

function SiteFooter({ onNavigate, onOpenAuth, onAdminAccess, session }) {
  return (
    <footer className="border-t border-amber-400/20 bg-[#070605]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={hestiaEmblem} alt="" className="h-14 w-auto object-contain" />
            <div>
              <p className="brand-font bg-linear-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-[30px] leading-none text-transparent">
                Hestia
              </p>
              <p className="text-[9px] uppercase tracking-[0.22em] text-stone-500">
                Hospedaje Cusco
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-xs leading-6 text-stone-400">
            Un hospedaje boutique en el corazón de Cusco. Habitaciones cómodas, desayuno
            andino y atención cercana para que solo te preocupes por descubrir la ciudad.
          </p>
        </div>

        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
            Explora
          </h2>
          <ul className="mt-3 grid gap-2 text-xs text-stone-400">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className="transition hover:text-amber-200"
                >
                  {item.label}
                </button>
              </li>
            ))}
            {!session && (
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="transition hover:text-amber-200"
                >
                  Crear cuenta
                </button>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
            Contacto
          </h2>
          <ul className="mt-3 grid gap-2.5 text-xs text-stone-400">
            <li className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-amber-400/70" /> Cusco, Perú
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 text-amber-400/70" /> +51 984 123 456
            </li>
            <li className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-amber-400/70" /> reservas@hestia.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 text-[10px] text-stone-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Hestia Hospedaje Cusco. Todos los derechos reservados.</p>
          <button
            type="button"
            onClick={onAdminAccess}
            className="inline-flex items-center gap-1.5 transition hover:text-amber-400"
          >
            <ShieldIcon className="h-3 w-3" /> Acceso administrador
          </button>
        </div>
      </div>
    </footer>
  )
}

function Landing({
  data,
  session,
  onNavigate,
  onOpenAuth,
  onReserveRoom,
  onUsePromotion,
  onCopyPromotion,
  notice,
  onDismissNotice,
}) {
  const availableRooms = data.rooms.filter(roomIsReservable)
  const featuredRooms = availableRooms.slice(0, 3)
  const promotions = visiblePromotions(data).filter(
    (promotion) => promotion.effectiveStatus === 'activa',
  )
  const featuredPromotions = promotions.slice(0, 3)
  const availableServices = data.services
    .filter((service) => service.status === 'disponible')
    .slice(0, 4)
  const lowestPrice = availableRooms.length
    ? Math.min(...availableRooms.map((room) => room.price))
    : 120

  return (
    <>
      <section className="relative overflow-hidden border-b border-amber-400/15">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/50 to-transparent" />
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">
              <SparklesIcon className="h-3.5 w-3.5" /> Hospedaje boutique en Cusco
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Tu refugio en el{' '}
              <span className="brand-font brand-glow bg-linear-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                corazón de Cusco
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-stone-400 sm:text-base">
              Despierta entre montañas, camina hacia la Plaza de Armas y vuelve a un espacio
              pensado para descansar. Habitaciones acogedoras, desayuno andino y la atención
              de una casa.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onNavigate('habitaciones')}
                className={`${primaryButtonClass} px-6 py-3 text-sm`}
              >
                Ver habitaciones <ArrowRightIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate(session ? 'reserva' : 'habitaciones')}
                className={`${secondaryButtonClass} px-6 py-3 text-sm`}
              >
                <CalendarIcon className="h-4 w-4" />
                {session ? 'Hacer una reserva' : 'Planear mi estadía'}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[11px] text-stone-400">
              <span className="inline-flex items-center gap-2">
                <WifiIcon className="h-4 w-4 text-amber-400/80" /> Wi-Fi en todo el hospedaje
              </span>
              <span className="inline-flex items-center gap-2">
                <CoffeeIcon className="h-4 w-4 text-amber-400/80" /> Desayuno incluido
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-amber-400/80" /> Reserva segura
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-5 -top-5 h-24 w-24 rounded-full border border-amber-400/25 bg-amber-400/5" />
            <div className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-[#080705] shadow-[0_30px_90px_-24px_rgba(0,0,0,0.95)]">
              <img
                src="/rooms/suite.svg"
                alt="Suite de Hestia Hospedaje"
                className="h-[330px] w-full object-cover sm:h-[390px]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/70 to-transparent p-5 pt-16">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">
                      Suite Hestia
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Vista al jardín · Cama king
                    </p>
                  </div>
                  <p className="shrink-0 text-right">
                    <span className="block text-[10px] text-stone-400">desde</span>
                    <span className="text-xl font-bold text-amber-200">
                      {formatSoles(lowestPrice)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-3 rounded-xl border border-amber-400/40 bg-[#0b0a07] px-4 py-3 shadow-xl sm:-right-6">
              <div className="flex items-center gap-2">
                <StarIcon className="h-4 w-4 text-amber-300" />
                <span className="text-sm font-bold text-white">4.9</span>
                <span className="text-[10px] text-stone-500">· 320 huéspedes</span>
              </div>
              <p className="mt-0.5 text-[9px] uppercase tracking-wide text-stone-500">
                Experiencias reales
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {notice && (
          <Notice
            type={notice.type}
            message={notice.message}
            onClose={onDismissNotice}
            className="mb-2"
          />
        )}
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Habitaciones', value: data.rooms.length, note: 'Para todos los estilos de viaje' },
            { label: 'Tipos de habitación', value: 4, note: 'Simple, doble, matrimonial y suite' },
            { label: 'Atención', value: '24/7', note: 'Recepción y asistencia cercana' },
            { label: 'Promociones', value: promotions.length, note: 'Beneficios vigentes para huéspedes' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-amber-400/30 bg-[#080705] px-4 py-4 shadow-[inset_0_1px_0_rgba(245,200,66,0.08)]"
            >
              <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
                {item.label}
              </dt>
              <dd>
                <span className="mt-1.5 block text-2xl font-bold text-white">{item.value}</span>
                <span className="mt-1 block text-[10px] leading-4 text-stone-500">{item.note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
              Descansa bien
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Habitaciones pensadas para volver
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-stone-400">
              Elige el espacio que mejor acompaña tu viaje. Todas incluyen ropa de cama,
              limpieza diaria y el desayuno de la casa.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('habitaciones')}
            className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-amber-400 transition hover:text-amber-300 sm:self-auto"
          >
            Ver todas <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onView={() => onNavigate('habitaciones')}
              onReserve={onReserveRoom}
            />
          ))}
        </div>
      </section>

      {featuredPromotions.length > 0 && (
        <section className="border-y border-amber-400/15 bg-[#070605]">
          <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
                  Beneficios de temporada
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Promociones para tu próxima estadía
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('promociones')}
                className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-amber-400 transition hover:text-amber-300 sm:self-auto"
              >
                Ver promociones <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredPromotions.map((promotion) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                  onUse={onUsePromotion}
                  onCopy={onCopyPromotion}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
              Sabores de la casa
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Servicios adicionales
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Desde un café de Quillabamba hasta una cena tranquila después de recorrer la
              ciudad. Puedes solicitar estos servicios durante tu estadía.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('servicios')}
              className={`${secondaryButtonClass} mt-5 text-xs`}
            >
              Ver catálogo completo <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onRequest={() => onNavigate('servicios')}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-amber-400/15 bg-[#070605]">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
              Así de simple
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Reserva en tres pasos
            </h2>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: UserIcon,
                title: 'Crea tu cuenta',
                text: 'Regístrate con tus datos para reservar y revisar tus estadías.',
              },
              {
                icon: BedIcon,
                title: 'Elige tu habitación',
                text: 'Selecciona fechas y la habitación que mejor se adapte a tu viaje.',
              },
              {
                icon: CheckIcon,
                title: 'Confirma y paga',
                text: 'Recibe la confirmación y registra tu pago desde tu cuenta.',
              },
            ].map((step, index) => (
              <li
                key={step.title}
                className="rounded-xl border border-amber-400/30 bg-[#080705] p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/50 bg-amber-400/10 text-amber-300">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Paso {index + 1}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-xs leading-5 text-stone-400">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-[#080705] px-6 py-10 text-center shadow-[0_30px_90px_-30px_rgba(0,0,0,0.95)] sm:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-400/10 via-transparent to-yellow-500/5"
          />
          <div className="relative">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/50 bg-amber-400/10 text-amber-300">
              <MapPinIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Cusco te espera. Nosotros te recibimos.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-400">
              Reserva con anticipación y asegura tu habitación para las fechas de tu viaje.
              {!session && ' Crear tu cuenta toma menos de un minuto.'}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onNavigate(session ? 'reserva' : 'habitaciones')}
                className={`${primaryButtonClass} px-6 py-3 text-sm`}
              >
                {session ? 'Reservar ahora' : 'Ver habitaciones'}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              {!session && (
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className={`${secondaryButtonClass} px-6 py-3 text-sm`}
                >
                  Crear mi cuenta
                </button>
              )}
            </div>
            <p className="mt-4 text-[10px] text-stone-600">{formatLongDate()}</p>
          </div>
        </div>
      </section>
    </>
  )
}

function VistaPrincipalCliente({
  session,
  profile,
  data,
  serviceRequests = [],
  onLogin,
  onRegister,
  onLogout,
  onCreateReservation,
  onCancelReservation,
  onCreatePayment,
  onUpdateProfile,
  onChangePassword,
  onRequestService,
  onAdminAccess,
}) {
  const [view, setView] = useState('inicio')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authNext, setAuthNext] = useState(null)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [bookingDraft, setBookingDraft] = useState({})
  const [notice, setNotice] = useState(null)

  function navigate(nextView, options = {}) {
    setView(nextView)
    setBookingDraft(options)
    setMobileOpen(false)
    setNotice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openAuth(mode = 'login', next = null) {
    setAuthMode(mode)
    setAuthNext(next)
    setAuthOpen(true)
    setMobileOpen(false)
  }

  function requireAuth(next) {
    openAuth('login', next)
  }

  async function handleLogin(credentials) {
    const nextSession = await onLogin(credentials)
    if (authNext) {
      navigate(authNext.view, authNext)
      setAuthNext(null)
    }
    return nextSession
  }

  async function handleRegister(form) {
    const nextSession = await onRegister(form)
    if (authNext) {
      navigate(authNext.view, authNext)
      setAuthNext(null)
    }
    return nextSession
  }

  function handleReserveRoom(room) {
    if (!session) {
      requireAuth({ view: 'reserva', roomId: room.id })
      return
    }
    navigate('reserva', { roomId: room.id })
  }

  function handleUsePromotion(promotion) {
    if (!session) {
      requireAuth({ view: 'reserva', promotionCode: promotion.code })
      return
    }
    navigate('reserva', { promotionCode: promotion.code })
  }

  function handleCopyPromotion(promotion) {
    copyText(promotion.code)
      .then((copied) => {
        setNotice({
          type: copied ? 'success' : 'error',
          message: copied
            ? `Código ${promotion.code} copiado. Puedes usarlo al reservar.`
            : `No se pudo copiar el código. Anota el código ${promotion.code}.`,
        })
      })
      .catch(() => {
        setNotice({
          type: 'error',
          message: `No se pudo copiar el código. Anota el código ${promotion.code}.`,
        })
      })
  }

  function requestLogout() {
    setMobileOpen(false)
    setLogoutOpen(true)
  }

  function confirmLogout() {
    setLogoutOpen(false)
    setMobileOpen(false)
    setView('inicio')
    onLogout()
  }

  let content

  if (view === 'habitaciones') {
    content = <HabitacionCliente data={data} onReserveRoom={handleReserveRoom} />
  } else if (view === 'reserva') {
    content = (
      <ReservaCliente
        key={`reserva-${bookingDraft.roomId ?? ''}-${bookingDraft.promotionCode ?? ''}`}
        session={session}
        profile={profile}
        data={data}
        initialRoomId={bookingDraft.roomId}
        initialPromotionCode={bookingDraft.promotionCode}
        initialTab={
          bookingDraft.roomId || bookingDraft.promotionCode ? 'nueva' : 'mis-reservas'
        }
        onCreateReservation={onCreateReservation}
        onCancelReservation={onCancelReservation}
        onGoToPayment={(reservationId) => navigate('pago', { reservationId })}
        onRequireAuth={(mode = 'login') => openAuth(mode)}
      />
    )
  } else if (view === 'pago') {
    content = (
      <PagoCliente
        key={`pago-${bookingDraft.reservationId ?? ''}`}
        session={session}
        profile={profile}
        data={data}
        initialReservationId={bookingDraft.reservationId}
        onCreatePayment={onCreatePayment}
        onGoToReservations={() => navigate('reserva')}
        onRequireAuth={(mode = 'login') => openAuth(mode)}
      />
    )
  } else if (view === 'servicios') {
    content = (
      <ServicisCliente
        session={session}
        profile={profile}
        data={data}
        serviceRequests={serviceRequests}
        onRequestService={onRequestService}
        onRequireAuth={(mode = 'login') => openAuth(mode)}
      />
    )
  } else if (view === 'promociones') {
    content = (
      <PromocionesCliente
        data={data}
        notice={notice}
        onDismissNotice={() => setNotice(null)}
        onUsePromotion={handleUsePromotion}
        onCopyPromotion={handleCopyPromotion}
      />
    )
  } else if (view === 'perfil') {
    content = (
      <PerfilCliente
        session={session}
        profile={profile}
        data={data}
        onUpdateProfile={onUpdateProfile}
        onChangePassword={onChangePassword}
        onGoToReservations={() => navigate('reserva')}
        onGoToPayment={() => navigate('pago')}
        onLogout={requestLogout}
        onRequireAuth={(mode = 'login') => openAuth(mode)}
      />
    )
  } else {
    content = (
      <Landing
        data={data}
        session={session}
        onNavigate={navigate}
        onOpenAuth={openAuth}
        onReserveRoom={handleReserveRoom}
        onUsePromotion={handleUsePromotion}
        onCopyPromotion={handleCopyPromotion}
        notice={notice}
        onDismissNotice={() => setNotice(null)}
      />
    )
  }

  return (
    <div className="min-h-svh bg-[#050505] text-stone-300">
      <SiteHeader
        view={view}
        session={session}
        profile={profile}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen((current) => !current)}
        onNavigate={navigate}
        onOpenAuth={openAuth}
        onLogout={requestLogout}
      />

      <main>{content}</main>

      <SiteFooter
        session={session}
        onNavigate={navigate}
        onOpenAuth={openAuth}
        onAdminAccess={onAdminAccess}
      />

      <AccesoCliente
        key={`${authMode}-${authOpen ? 'open' : 'closed'}`}
        open={authOpen}
        initialMode={authMode}
        onClose={() => {
          setAuthOpen(false)
          setAuthNext(null)
        }}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onAdminAccess={() => {
          setAuthOpen(false)
          setAuthNext(null)
          onAdminAccess()
        }}
      />

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="¿Estás seguro de cerrar sesión?"
        description="Tu cuenta seguirá disponible cuando quieras volver."
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setLogoutOpen(false)}
              className={`${secondaryButtonClass} text-xs`}
            >
              Cancelar
            </button>
            <button type="button" onClick={confirmLogout} className={`${primaryButtonClass} text-xs`}>
              <LogoutIcon className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
          </>
        }
      >
        <p className="text-sm leading-6 text-stone-400">
          Se cerrará la sesión de{' '}
          <span className="font-semibold text-amber-100">{profile?.name ?? session?.name ?? 'tu cuenta'}</span>.
          Podrás volver a ingresar con tu correo y contraseña.
        </p>
      </Modal>
    </div>
  )
}

export default VistaPrincipalCliente
