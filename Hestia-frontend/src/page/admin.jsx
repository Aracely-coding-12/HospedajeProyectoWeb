import { useState } from 'react'
import hestiaEmblem from '../assets/hestia-emblem.png'
import { addReservationToData, buildDashboardSummary, createInitialData } from '../data/hestiaData.js'
import Inicio from './inicio.jsx'
import NuevaReserva from './nueva-reserva.jsx'

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', view: 'inicio' },
  { id: 'reserva', label: 'Reserva', view: 'nueva-reserva' },
  { id: 'habitaciones', label: 'Habitaciones' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'adicionales', label: 'S. Adicionales' },
  { id: 'promociones', label: 'Promociones' },
]

function UserBadgeIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="9.4" r="2.9" />
      <path d="M6.6 19a5.7 5.7 0 0 1 10.8 0" strokeLinecap="round" />
    </svg>
  )
}

function Sidebar({ view, onNavigate, onLogout }) {
  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-amber-500/70 bg-[#080705] px-5 py-6 lg:sticky lg:top-0 lg:h-svh lg:w-[232px] lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
      <div>
        <div className="flex items-center justify-center gap-4 lg:flex-col lg:gap-0">
          <img
            src={hestiaEmblem}
            alt=""
            className="emblem-mask h-16 w-auto [clip-path:inset(0_0_6%_0)] mix-blend-screen lg:h-[92px]"
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

function AccountMenu({ session, onLogout }) {
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full px-1 py-1 text-sm text-stone-200 transition hover:text-amber-200 [&::-webkit-details-marker]:hidden">
        Mi cuenta
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-[#080705]">
          <UserBadgeIcon className="h-4 w-4" />
        </span>
      </summary>

      <div className="absolute right-0 z-30 mt-3 w-64 overflow-hidden rounded-lg border border-amber-500/60 bg-[#0b0a07] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.95)]">
        <div className="border-b border-amber-400/20 px-4 py-3">
          <p className="truncate text-sm font-semibold text-amber-100">
            {session?.name ?? 'Administrador/a'}
          </p>
          <p className="mt-0.5 truncate text-xs text-stone-400">
            {session?.email ?? 'admin@hestia.com'}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-amber-500">
            Administrador
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full px-4 py-3 text-left text-sm text-stone-300 transition hover:bg-amber-400/10 hover:text-amber-200"
        >
          Cerrar sesión
        </button>
      </div>
    </details>
  )
}

function Admin({ session, onLogout }) {
  const [data, setData] = useState(createInitialData)
  const [view, setView] = useState('inicio')
  const [notice, setNotice] = useState(null)

  const summary = buildDashboardSummary(data)

  function navigate(nextView) {
    setNotice(null)
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaveReservation(input) {
    const nextData = addReservationToData(data, input)
    setData(nextData)
    setView('inicio')
    setNotice('Reserva registrada correctamente. El resumen se actualizó.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#050505] lg:flex-row">
      <Sidebar view={view} onNavigate={navigate} onLogout={onLogout} />

      <div className="relative flex min-h-svh flex-1 flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/50 to-transparent"
        />

        <div className="flex justify-end px-4 pt-5 sm:px-8 lg:px-12">
          <AccountMenu session={session} onLogout={onLogout} />
        </div>

        <main className="flex-1 px-4 pb-12 pt-5 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-6xl">
            {view === 'nueva-reserva' ? (
              <NuevaReserva
                clients={data.clients}
                rooms={data.rooms}
                onCancel={() => navigate('inicio')}
                onSave={handleSaveReservation}
              />
            ) : (
              <Inicio
                summary={summary}
                notice={notice}
                onDismissNotice={() => setNotice(null)}
                onCreateReservation={() => navigate('nueva-reserva')}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Admin
