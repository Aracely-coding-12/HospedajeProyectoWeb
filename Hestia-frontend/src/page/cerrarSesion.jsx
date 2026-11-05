import { useEffect, useId, useRef } from 'react'

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-md border border-stone-600 px-4 py-2.5 text-xs font-semibold text-stone-300 transition hover:border-stone-400 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50'

const primaryButtonClass =
  'inline-flex items-center justify-center gap-1.5 rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-4 py-2.5 text-xs font-bold text-black shadow-[0_12px_30px_-14px_rgba(245,200,66,0.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60'

function ShieldIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.3-7 9-4.1-1.7-7-4.7-7-9V6l7-2.5Z" strokeLinejoin="round" />
      <path d="m8.8 12 2.1 2.1 4.4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoutIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true" className={className}>
      <path d="M10 4.5H6.5A2.5 2.5 0 0 0 4 7v10a2.5 2.5 0 0 0 2.5 2.5H10" strokeLinecap="round" />
      <path d="M14.5 8.5 18 12l-3.5 3.5M9 12h9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CerrarSesion({ open, profile, timeoutMinutes = 15, onCancel, onConfirm }) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const onCancelRef = useRef(onCancel)

  useEffect(() => {
    onCancelRef.current = onCancel
  }, [onCancel])

  useEffect(() => {
    if (!open) return undefined

    const previousActiveElement = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancelRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus()
      }
    }
  }, [open])

  if (!open) return null

  const displayName = profile?.name?.trim() || 'tu cuenta'
  const displayEmail = profile?.email?.trim() || 'cuenta de administrador'
  const minutes = Number(timeoutMinutes) || 15

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 px-4 py-6 backdrop-blur-sm"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="my-auto w-full max-w-md overflow-hidden rounded-xl border border-amber-400/70 bg-[#080705] shadow-[0_30px_90px_-24px_rgba(0,0,0,0.95)]"
      >
        <div className="relative border-b border-amber-400/20 px-6 pb-5 pt-6 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-amber-300/80 to-transparent"
          />
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/60 bg-amber-400/10 text-amber-300 shadow-[0_0_30px_-10px_rgba(245,200,66,0.75)]">
            <LogoutIcon className="h-6 w-6" />
          </span>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
            Seguridad de la cuenta
          </p>
          <h2 id={titleId} className="mt-1 text-xl font-bold text-white">
            ¿Estás seguro de cerrar sesión?
          </h2>
        </div>

        <div className="px-6 py-5">
          <p id={descriptionId} className="text-sm leading-6 text-stone-400">
            Se cerrará la sesión de{' '}
            <span className="font-semibold text-amber-100">{displayName}</span>{' '}
            (<span className="text-stone-300">{displayEmail}</span>) y se bloqueará el acceso
            a los datos de los clientes hasta que vuelvas a ingresar.
          </p>

          <div className="mt-4 flex items-start gap-2.5 rounded-md border border-amber-400/25 bg-amber-400/5 px-3 py-2.5">
            <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-[11px] leading-5 text-stone-400">
              Por seguridad, la sesión también se cierra automáticamente después de{' '}
              <span className="font-semibold text-amber-200">{minutes} minutos</span> sin
              actividad.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-amber-400/20 bg-black/25 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className={secondaryButtonClass}
          >
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className={primaryButtonClass}>
            <LogoutIcon className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default CerrarSesion
