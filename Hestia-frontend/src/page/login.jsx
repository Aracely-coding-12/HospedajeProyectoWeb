import { useState } from 'react'
import hestiaEmblem from '../assets/hestia-emblem.png'
import { isValidEmail } from '../lib/adminAuth.js'
import {
  AlertIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
} from '../components/cliente/icons.jsx'
import {
  fieldErrorClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../components/cliente/ui.jsx'

function Login({ onLogin, onBackToClient }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [failure, setFailure] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFailure('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!form.email.trim()) nextErrors.email = 'Ingresa tu correo electrónico.'
    else if (!isValidEmail(form.email)) nextErrors.email = 'Ingresa un correo válido.'
    if (!form.password) nextErrors.password = 'Ingresa tu contraseña.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setFailure('')
    try {
      await onLogin({ email: form.email, password: form.password })
    } catch (error) {
      setFailure(
        error instanceof Error
          ? error.message
          : 'No pudimos validar tus credenciales de administrador.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#050505] text-stone-300">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/50 to-transparent" />
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <img src={hestiaEmblem} alt="" className="h-24 w-auto object-contain" />
            <p className="brand-font brand-glow mt-1 bg-linear-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-[42px] leading-none text-transparent">
              Hestia
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-stone-500">
              Hospedaje Cusco
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-amber-400/50 bg-[#080705] p-6 shadow-[0_30px_90px_-24px_rgba(0,0,0,0.95)] sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-400/50 bg-amber-400/10 text-amber-300">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white">Administración de Hestia</h1>
                <p className="mt-1 text-xs leading-5 text-stone-400">
                  Acceso exclusivo del administrador del hospedaje.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label htmlFor="admin-login-email" className={labelClass}>
                  Correo del administrador:
                </label>
                <div className="relative">
                  <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
                  <input
                    id="admin-login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={`${inputClass} pl-9`}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'admin-login-email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="admin-login-email-error" className={fieldErrorClass}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="admin-login-password" className={labelClass}>
                  Contraseña:
                </label>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
                  <input
                    id="admin-login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className={`${inputClass} pl-9 pr-11`}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? 'admin-login-password-error' : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-md text-amber-400/80 transition hover:bg-amber-400/10 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="admin-login-password-error" className={fieldErrorClass}>
                    {errors.password}
                  </p>
                )}
              </div>

              {failure && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-xs leading-5 text-rose-100"
                >
                  <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{failure}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`${primaryButtonClass} w-full py-3`}
              >
                {submitting ? 'Validando acceso…' : 'Entrar al panel'}
                {!submitting && <ArrowRightIcon className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2.5 text-[10px] leading-4 text-stone-400">
              <ShieldIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
              <p>
                Las cuentas de cliente no tienen acceso a esta sección. El panel se cierra
                automáticamente tras un periodo de inactividad.
              </p>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onBackToClient}
              className={`${secondaryButtonClass} text-xs`}
            >
              Volver al sitio de clientes
            </button>
          </div>

          <p className="mt-6 text-center text-[10px] text-stone-600">
            © {new Date().getFullYear()} Hestia Hospedaje Cusco · Acceso administrativo
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
