import { useEffect, useId, useRef } from 'react'
import { AlertIcon, CheckIcon, CloseIcon, SparklesIcon } from './icons.jsx'

export const inputClass =
  'w-full rounded-md border border-amber-400/45 bg-black/40 px-3.5 py-2.5 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15'

export const labelClass =
  'mb-1.5 block text-[11px] font-medium tracking-wide text-amber-100/90'

export const fieldErrorClass = 'mt-1.5 text-[11px] leading-4 text-rose-400'

export const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-4 py-2.5 text-sm font-bold text-black shadow-[0_12px_30px_-14px_rgba(245,200,66,0.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-50'

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-md border border-amber-400/60 bg-black/20 px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-300 hover:bg-amber-400/10 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 disabled:cursor-not-allowed disabled:opacity-40'

export const dangerButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-md bg-rose-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 disabled:cursor-not-allowed disabled:opacity-50'

export const ghostButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-stone-400 transition hover:bg-white/5 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50'

export function chipClass(active) {
  return [
    'rounded-full border px-3 py-1.5 text-[11px] font-semibold transition',
    active
      ? 'border-amber-300 bg-amber-400/15 text-amber-200'
      : 'border-white/10 bg-black/30 text-stone-400 hover:border-amber-400/40 hover:text-amber-200',
  ].join(' ')
}

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-[30px]">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-stone-400">{description}</p>}
      </div>
      {action}
    </header>
  )
}

export function Notice({ type = 'success', message, onClose, className = '' }) {
  const success = type === 'success'

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${
        success
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
          : 'border-rose-500/40 bg-rose-500/10 text-rose-100'
      } ${className}`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          success ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'
        }`}
      >
        {success ? <CheckIcon className="h-3 w-3" /> : <AlertIcon className="h-3 w-3" />}
      </span>
      <p className="flex-1 leading-5">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar aviso"
          className="rounded p-0.5 opacity-70 transition hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon = SparklesIcon, title, description, action }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-amber-400/30 bg-black/20 px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-stone-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

function statusTone(status) {
  if (status === 'confirmada' || status === 'pagado' || status === 'disponible' || status === 'activa') {
    return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
  }
  if (status === 'pendiente' || status === 'programada') {
    return 'border-amber-400/45 bg-amber-400/10 text-amber-200'
  }
  if (status === 'cancelada' || status === 'rechazada' || status === 'vencida' || status === 'no-disponible') {
    return 'border-rose-500/40 bg-rose-500/10 text-rose-200'
  }
  if (status === 'finalizada' || status === 'reembolsado') {
    return 'border-sky-500/40 bg-sky-500/10 text-sky-200'
  }
  return 'border-stone-500/40 bg-stone-500/10 text-stone-300'
}

export function StatusBadge({ status, label, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusTone(
        status,
      )} ${className}`}
    >
      {label}
    </span>
  )
}

function modalSize(size) {
  if (size === 'lg') return 'max-w-2xl'
  if (size === 'xl') return 'max-w-3xl'
  if (size === 'sm') return 'max-w-sm'
  return 'max-w-lg'
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const previousActive = document.activeElement
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousActive instanceof HTMLElement) previousActive.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 px-4 py-6 backdrop-blur-sm"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`my-auto w-full ${modalSize(size)} overflow-hidden rounded-2xl border border-amber-400/60 bg-[#080705] shadow-[0_30px_90px_-24px_rgba(0,0,0,0.95)]`}
      >
        <div className="relative border-b border-amber-400/20 px-6 py-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-amber-300/80 to-transparent"
          />
          <div className="flex items-start justify-between gap-4">
            <div>
              {title && (
                <h2 id={titleId} className="text-lg font-bold text-white">
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-xs leading-5 text-stone-400">{description}</p>}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-md p-1.5 text-stone-400 transition hover:bg-white/5 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="max-h-[calc(90vh-9rem)] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-amber-400/20 bg-black/25 px-6 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
