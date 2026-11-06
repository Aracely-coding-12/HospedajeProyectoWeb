import { useState } from 'react'
import hestiaEmblem from '../assets/hestia-emblem.png'
import {
  addClientToData,
  addPaymentToData,
  addPromotionToData,
  addReservationToData,
  addRoomToData,
  addServiceToData,
  buildDashboardSummary,
  buildPaymentSummary,
  buildReservationSummary,
  cancelReservationInData,
  confirmReservationInData,
  deletePaymentFromData,
  deletePromotionFromData,
  deleteReservationFromData,
  deleteRoomFromData,
  deleteServiceFromData,
  rejectReservationInData,
  updateClientInData,
  updateClientStatusInData,
  updatePaymentInData,
  updatePromotionInData,
  updateReservationInData,
  updateRoomInData,
  updateRoomStatusInData,
  updateServiceInData,
} from '../data/hestiaData.js'
import {
  DEFAULT_SESSION_TIMEOUT_MINUTES,
  getAdminProfile,
  updateAdminProfile,
} from '../lib/adminAuth.js'
import { formatNotificationTime } from '../lib/hestiaStore.js'
import { useInactivityLogout } from '../lib/useInactivityLogout.js'
import CerrarSesion from './cerrarSesion.jsx'
import Clientes from './cliente.jsx'
import Cuenta from './cuenta.jsx'
import Habitaciones from './habitaciones.jsx'
import Inicio from './inicio.jsx'
import Pagos from './pago.jsx'
import Promociones from './promociones.jsx'
import Reservas from './reserva.jsx'
import Servicios from './servicios.jsx'

function BellIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z"
        strokeLinejoin="round"
      />
      <path d="M9.8 19a2.4 2.4 0 0 0 4.4 0" strokeLinecap="round" />
    </svg>
  )
}

function notificationTone(type) {
  if (type === 'cliente') return 'bg-sky-400'
  if (type === 'pagos') return 'bg-emerald-400'
  if (type === 'servicios') return 'bg-violet-400'
  if (type === 'reserva') return 'bg-amber-400'
  return 'bg-stone-400'
}

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', view: 'inicio' },
  { id: 'reserva', label: 'Reserva', view: 'reserva' },
  { id: 'habitaciones', label: 'Habitaciones', view: 'habitaciones' },
  { id: 'clientes', label: 'Clientes', view: 'clientes' },
  { id: 'pagos', label: 'Pagos', view: 'pagos' },
  { id: 'adicionales', label: 'S. Adicionales', view: 'servicios' },
  { id: 'promociones', label: 'Promociones', view: 'promociones' },
  { id: 'cuenta', label: 'Mi cuenta', view: 'cuenta' },
]

function Sidebar({ view, onNavigate, onLogout }) {
  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-amber-500/70 bg-[#080705] px-5 py-6 lg:sticky lg:top-0 lg:h-svh lg:w-[232px] lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
      <div>
        <div className="flex items-center justify-center gap-4 lg:flex-col lg:gap-0">
          <img
            src={hestiaEmblem}
            alt=""
            className="h-16 w-auto object-contain lg:h-[92px]"
          />
          <div className="text-center lg:mt-1">
            <p className="brand-font brand-glow bg-linear-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-[36px] leading-none text-transparent lg:text-[42px]">
              Hestia
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-stone-400">
              Hospedaje Cusco
            </p>
          </div>
        </div>

        <nav
          aria-label="Secciones del panel"
          className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:mt-8 lg:flex lg:flex-col lg:items-center lg:gap-2.5"
        >
          {NAV_ITEMS.map((item) => {
            const active = item.view === view
            const available = Boolean(item.view)

            return (
              <button
                key={item.id}
                type="button"
                disabled={!available}
                onClick={available ? () => onNavigate(item.view) : undefined}
                title={available ? undefined : 'Disponible próximamente'}
                aria-current={active ? 'page' : undefined}
                className={[
                  'w-full rounded-md border px-3 py-2 text-center text-[13px] transition lg:max-w-[176px]',
                  active
                    ? 'border-transparent bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 font-semibold text-black shadow-[0_0_22px_-10px_rgba(245,200,66,0.9)]'
                    : 'border-amber-500/80 bg-black/40 font-medium text-stone-200',
                  available
                    ? active
                      ? 'hover:brightness-110'
                      : 'hover:border-amber-300 hover:bg-amber-400/10 hover:text-amber-100'
                    : 'cursor-not-allowed',
                ].join(' ')}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-7 self-center rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 transition hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 lg:mt-0 lg:self-end"
      >
        Cerrar sesión
      </button>
    </aside>
  )
}

function Admin({
  session,
  onLogout,
  data,
  onDataChange,
  notifications = [],
  onNotificationsChange,
}) {
  const setData = onDataChange
  const [view, setView] = useState('inicio')
  const [notice, setNotice] = useState(null)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profile, setProfile] = useState(() => getAdminProfile(session))

  const sessionTimeout =
    Number(profile.sessionTimeout) || DEFAULT_SESSION_TIMEOUT_MINUTES
  const unreadCount = notifications.filter((notification) => !notification.read).length

  useInactivityLogout({
    timeoutMinutes: sessionTimeout,
    onTimeout: onLogout,
  })

  const summary = buildDashboardSummary(data)
  const reservationSummary = buildReservationSummary(data)
  const paymentSummary = buildPaymentSummary(data)

  function navigate(nextView) {
    setNotice(null)
    setNotificationsOpen(false)
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function markAllNotificationsRead() {
    onNotificationsChange(
      notifications.map((notification) => ({ ...notification, read: true })),
    )
  }

  function openNotification(notification) {
    onNotificationsChange(
      notifications.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item,
      ),
    )

    if (notification.target) navigate(notification.target)
    else setNotificationsOpen(false)
  }

  function handleUpdateProfile(patch) {
    const updated = updateAdminProfile(
      profile,
      patch,
      data.clients.map((client) => client.email),
    )
    setProfile(updated)
    return updated
  }

  function handleConfirmLogout() {
    setLogoutOpen(false)
    onLogout()
  }

  function handleCreateReservation(input) {
    setData(addReservationToData(data, input))
  }

  function handleUpdateReservation(input) {
    setData(updateReservationInData(data, input))
  }

  function handleConfirmReservation(reservationId) {
    setData(confirmReservationInData(data, reservationId))
  }

  function handleRejectReservation(reservationId) {
    setData(rejectReservationInData(data, reservationId))
  }

  function handleCancelReservation(reservationId) {
    setData(cancelReservationInData(data, reservationId))
  }

  function handleDeleteReservation(reservationId) {
    setData(deleteReservationFromData(data, reservationId))
  }

  function handleCreateRoom(input) {
    setData(addRoomToData(data, input))
  }

  function handleUpdateRoom(input) {
    setData(updateRoomInData(data, input))
  }

  function handleDeleteRoom(roomId) {
    setData(deleteRoomFromData(data, roomId))
  }

  function handleRoomStatusChange(roomId, status) {
    setData(updateRoomStatusInData(data, roomId, status))
  }

  function handleCreateClient(input) {
    setData(addClientToData(data, input))
  }

  function handleUpdateClient(input) {
    setData(updateClientInData(data, input))
  }

  function handleClientStatusChange(clientId, active) {
    setData(updateClientStatusInData(data, clientId, active))
  }

  function handleCreatePayment(input) {
    setData(addPaymentToData(data, input))
  }

  function handleUpdatePayment(input) {
    setData(updatePaymentInData(data, input))
  }

  function handleDeletePayment(paymentId) {
    setData(deletePaymentFromData(data, paymentId))
  }

  function handleCreateService(input) {
    setData(addServiceToData(data, input))
  }

  function handleUpdateService(input) {
    setData(updateServiceInData(data, input))
  }

  function handleDeleteService(serviceId) {
    setData(deleteServiceFromData(data, serviceId))
  }

  function handleCreatePromotion(input) {
    setData(addPromotionToData(data, input))
  }

  function handleUpdatePromotion(input) {
    setData(updatePromotionInData(data, input))
  }

  function handleDeletePromotion(promotionId) {
    setData(deletePromotionFromData(data, promotionId))
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#050505] lg:flex-row">
      <Sidebar
        view={view}
        onNavigate={navigate}
        onLogout={() => setLogoutOpen(true)}
      />

      <div className="relative flex min-h-svh flex-1 flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/50 to-transparent"
        />

        <div className="flex items-center justify-end gap-3 px-4 pt-5 sm:px-8 lg:px-12">
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((current) => !current)}
              aria-label={
                unreadCount > 0
                  ? `Notificaciones, ${unreadCount} sin leer`
                  : 'Notificaciones'
              }
              aria-expanded={notificationsOpen}
              className="relative rounded-md border border-amber-400/30 bg-black/30 p-2 text-stone-300 transition hover:border-amber-300 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
            >
              <BellIcon className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold leading-none text-black">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <>
                <button
                  type="button"
                  aria-label="Cerrar notificaciones"
                  onClick={() => setNotificationsOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div className="absolute right-0 z-50 mt-2 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-amber-400/50 bg-[#080705] shadow-[0_24px_70px_-20px_rgba(0,0,0,0.95)]">
                  <div className="flex items-center justify-between gap-3 border-b border-amber-400/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Notificaciones</p>
                      <p className="text-[10px] text-stone-500">
                        {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      disabled={unreadCount === 0}
                      className="text-[10px] font-semibold text-amber-400 transition hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Marcar todas
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-xs text-stone-500">
                        Aún no hay novedades de los clientes.
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => openNotification(notification)}
                          className={`flex w-full items-start gap-2.5 border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-amber-400/5 ${
                            notification.read ? 'bg-transparent' : 'bg-amber-400/[0.04]'
                          }`}
                        >
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notificationTone(
                              notification.type,
                            )}`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span
                                className={`text-xs ${
                                  notification.read
                                    ? 'font-medium text-stone-300'
                                    : 'font-semibold text-white'
                                }`}
                              >
                                {notification.title}
                              </span>
                              {!notification.read && (
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                              )}
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-4 text-stone-500">
                              {notification.message}
                            </span>
                            <span className="mt-1 block text-[9px] uppercase tracking-wide text-stone-600">
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                  <p className="border-t border-amber-400/10 px-4 py-2 text-[9px] text-stone-600">
                    Las novedades se sincronizan entre las pestañas abiertas.
                  </p>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('cuenta')}
            aria-current={view === 'cuenta' ? 'page' : undefined}
            className="rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 transition hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
          >
            Mi cuenta
          </button>
        </div>

        <main className="flex-1 px-4 pb-12 pt-5 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-6xl">
            {view === 'reserva' ? (
              <Reservas
                reservations={data.reservations}
                rooms={data.rooms}
                clients={data.clients}
                payments={data.payments}
                summary={reservationSummary}
                onCreateReservation={handleCreateReservation}
                onUpdateReservation={handleUpdateReservation}
                onConfirmReservation={handleConfirmReservation}
                onRejectReservation={handleRejectReservation}
                onCancelReservation={handleCancelReservation}
                onDeleteReservation={handleDeleteReservation}
              />
            ) : view === 'habitaciones' ? (
              <Habitaciones
                rooms={data.rooms}
                onCreateRoom={handleCreateRoom}
                onUpdateRoom={handleUpdateRoom}
                onDeleteRoom={handleDeleteRoom}
                onStatusChange={handleRoomStatusChange}
              />
            ) : view === 'clientes' ? (
              <Clientes
                clients={data.clients}
                canManage={session?.role === 'admin' && Boolean(session?.authorized)}
                onCreateClient={handleCreateClient}
                onUpdateClient={handleUpdateClient}
                onStatusChange={handleClientStatusChange}
              />
            ) : view === 'pagos' ? (
              <Pagos
                payments={data.payments}
                reservations={data.reservations}
                rooms={data.rooms}
                clients={data.clients}
                summary={paymentSummary}
                onCreatePayment={handleCreatePayment}
                onUpdatePayment={handleUpdatePayment}
                onDeletePayment={handleDeletePayment}
              />
            ) : view === 'servicios' ? (
              <Servicios
                services={data.services}
                onCreateService={handleCreateService}
                onUpdateService={handleUpdateService}
                onDeleteService={handleDeleteService}
              />
            ) : view === 'promociones' ? (
              <Promociones
                promotions={data.promotions}
                onCreatePromotion={handleCreatePromotion}
                onUpdatePromotion={handleUpdatePromotion}
                onDeletePromotion={handleDeletePromotion}
              />
            ) : view === 'cuenta' ? (
              <Cuenta profile={profile} onUpdateProfile={handleUpdateProfile} />
            ) : (
              <Inicio
                summary={summary}
                notice={notice}
                onDismissNotice={() => setNotice(null)}
                onCreateReservation={() => navigate('reserva')}
              />
            )}
          </div>
        </main>
      </div>

      <CerrarSesion
        open={logoutOpen}
        profile={profile}
        timeoutMinutes={sessionTimeout}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  )
}

export default Admin
