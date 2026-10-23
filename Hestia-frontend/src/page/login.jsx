import { useState } from 'react'

const ADMINS_KEY = 'hestia_admins_v1'

const DEFAULT_ADMIN = {
  id: 'hestia-default-admin',
  name: 'Administrador Hestia',
  email: 'admin@hestia.com',
  password: 'Admin123!',
  role: 'admin',
  authorized: true,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PASSWORD_RULES = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (value) => value.length >= 8 },
  { id: 'uppercase', label: 'Al menos una mayúscula', test: (value) => /[A-Z]/.test(value) },
  { id: 'lowercase', label: 'Al menos una minúscula', test: (value) => /[a-z]/.test(value) },
  { id: 'number', label: 'Al menos un número', test: (value) => /\d/.test(value) },
  { id: 'special', label: 'Al menos un carácter especial', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

const inputClass =
  'w-full rounded-xl border border-amber-400/20 bg-black/50 px-4 py-3 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-400/70 focus:bg-black/70 focus:ring-4 focus:ring-amber-400/10'

const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400'

const primaryButtonClass =
  'w-full rounded-xl bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-black shadow-[0_12px_35px_-12px_rgba(245,200,66,0.65)] transition hover:from-amber-100 hover:via-yellow-300 hover:to-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/25 disabled:cursor-not-allowed disabled:opacity-60'

function FlameIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177A7.547 7.547 0 0 1 6.648 6.61a.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <path d="m5 10 3.2 3.2L15 6.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowLeftIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <path d="M10 4 4 10l6 6M4 10h12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogOutIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <path d="M8 4H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3M13 6l4 4-4 4M17 10H8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function readStore(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(`hestia:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim())
}

function isStrongPassword(value) {
  return PASSWORD_RULES.every((rule) => rule.test(value))
}

function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

async function authenticate(email, password) {
  const normalizedEmail = normalizeEmail(email)
  const passwordHash = await hashPassword(password)

  if (normalizedEmail === DEFAULT_ADMIN.email && passwordHash === (await hashPassword(DEFAULT_ADMIN.password))) {
    return DEFAULT_ADMIN
  }

  return (
    readStore(ADMINS_KEY).find(
      (admin) =>
        admin.email === normalizedEmail &&
        admin.passwordHash === passwordHash &&
        admin.role === 'admin' &&
        admin.authorized,
    ) ?? null
  )
}

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `admin-${Date.now()}`
}

function StatusMessage({ status }) {
  if (!status) return null

  const isSuccess = status.type === 'success'

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
        isSuccess
          ? 'border-amber-400/30 bg-amber-400/10 text-amber-200'
          : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
      }`}
    >
      {status.text}
    </div>
  )
}

function AuthLayout({ children }) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#070707] px-4 py-10 text-left">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-amber-400/20 bg-[#0b0b0b] shadow-[0_40px_120px_-40px_rgba(212,175,55,0.35)] md:grid-cols-[1.05fr_1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-amber-400/20 bg-[#080808] p-10 md:flex">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/70 to-transparent" />
          <div className="absolute -right-20 top-12 h-56 w-56 rounded-full border border-amber-400/20" />
          <div className="absolute -right-10 top-24 h-40 w-40 rounded-full border border-amber-400/10" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-amber-500/5 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
                <FlameIcon className="h-7 w-7" />
              </span>
              <div>
                <p className="font-serif text-2xl font-semibold tracking-wide text-amber-100">Hestia</p>
                <p className="text-[10px] uppercase tracking-[0.35em] text-amber-500/70">Gestión</p>
              </div>
            </div>

            <h1 className="mt-16 font-serif text-4xl font-medium leading-tight text-amber-50">
              Tu hogar,
              <br />
              <span className="bg-linear-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
                en buenas manos.
              </span>
            </h1>
            <p className="mt-5 max-w-xs text-sm leading-6 text-stone-400">
              Accede al panel de administración para gestionar el sistema de forma segura.
            </p>
            <div className="mt-6 h-px w-16 bg-amber-400/50" />
          </div>

          <ul className="relative mt-10 space-y-4 text-sm text-stone-400">
            {[
              'Acceso exclusivo para administradores',
              'Contraseñas con validación reforzada',
              'Autorización previa para nuevas cuentas',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <section className="relative p-7 sm:p-10">
          <div className="absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-amber-400/30 to-transparent md:hidden" />

          <div className="mb-8 flex items-center gap-3 md:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
              <FlameIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-serif text-xl font-semibold tracking-wide text-amber-100">Hestia</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500/70">Gestión</p>
            </div>
          </div>

          {children}
        </section>
      </div>
    </main>
  )
}

function LoginForm({ onLogin, onCreateAccount }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setStatus(null)
  }

  function fillDemoCredentials() {
    setForm({ email: DEFAULT_ADMIN.email, password: DEFAULT_ADMIN.password })
    setErrors({})
    setStatus({ type: 'success', text: 'Credenciales de demostración cargadas. Pulsa «Iniciar sesión».' })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Ingresa tu correo electrónico.'
    else if (!isValidEmail(form.email)) nextErrors.email = 'El correo electrónico no es válido.'

    if (!form.password) nextErrors.password = 'Ingresa tu contraseña.'
    else if (!isStrongPassword(form.password)) {
      nextErrors.password = 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setStatus({ type: 'error', text: 'Revisa los campos marcados antes de continuar.' })
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      const admin = await authenticate(form.email, form.password)
      if (!admin) {
        setStatus({ type: 'error', text: 'Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.' })
        return
      }
      onLogin(admin)
    } catch {
      setStatus({ type: 'error', text: 'No fue posible validar las credenciales. Inténtalo de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-500">Acceso administrador</p>
        <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-amber-50">Inicia sesión</h2>
        <div className="mt-4 h-px w-12 bg-amber-400/60" />
        <p className="mt-4 text-sm leading-6 text-stone-400">
          Usa tu correo electrónico y contraseña autorizados para entrar al sistema.
        </p>
      </div>

      <StatusMessage status={status} />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="login-email" className={labelClass}>
            Correo electrónico
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@hestia.com"
            className={inputClass}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />
          {errors.email && (
            <p id="login-email-error" className="mt-2 text-xs text-rose-400">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className={labelClass}>
            Contraseña
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`${inputClass} pr-24`}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-3 my-auto h-8 rounded-lg px-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-400/10"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" className="mt-2 text-xs text-rose-400">
              {errors.password}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? 'Validando credenciales…' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        ¿No tienes una cuenta?{' '}
        <button
          type="button"
          onClick={onCreateAccount}
          className="font-semibold text-amber-300 underline-offset-4 hover:text-amber-200 hover:underline"
        >
          Crear una cuenta
        </button>
      </p>

      <details className="mt-6 rounded-2xl border border-dashed border-amber-400/25 bg-amber-400/5 p-4">
        <summary className="cursor-pointer text-xs font-semibold text-amber-300/80">
          Credenciales de demostración
        </summary>
        <div className="mt-3 space-y-1 text-xs text-stone-400">
          <p>
            Correo: <span className="font-mono font-semibold text-amber-200">admin@hestia.com</span>
          </p>
          <p>
            Contraseña: <span className="font-mono font-semibold text-amber-200">Admin123!</span>
          </p>
        </div>
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="mt-3 text-xs font-semibold text-amber-300 underline-offset-4 hover:text-amber-200 hover:underline"
        >
          Usar estas credenciales
        </button>
      </details>
    </AuthLayout>
  )
}

function RegisterForm({ onBack, onRegistered }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setStatus(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Ingresa tu nombre.'
    else if (form.name.trim().length < 2) nextErrors.name = 'El nombre debe tener al menos 2 caracteres.'

    if (!form.email.trim()) nextErrors.email = 'Ingresa tu correo electrónico.'
    else if (!isValidEmail(form.email)) nextErrors.email = 'El correo electrónico no es válido.'

    if (!form.password) nextErrors.password = 'Crea una contraseña.'
    else if (!isStrongPassword(form.password)) nextErrors.password = 'La contraseña no cumple con todos los requisitos.'

    if (!form.confirm) nextErrors.confirm = 'Confirma tu contraseña.'
    else if (form.confirm !== form.password) nextErrors.confirm = 'Las contraseñas no coinciden.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setStatus({ type: 'error', text: 'Revisa los campos marcados antes de continuar.' })
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      const email = normalizeEmail(form.email)
      const admins = readStore(ADMINS_KEY)
      const emailExists = email === DEFAULT_ADMIN.email || admins.some((admin) => admin.email === email)

      if (emailExists) {
        setErrors({ email: 'Ya existe una cuenta con este correo electrónico.' })
        setStatus({ type: 'error', text: 'No se puede crear la cuenta.' })
        return
      }

      const newAdmin = {
        id: createId(),
        name: form.name.trim(),
        email,
        passwordHash: await hashPassword(form.password),
        role: 'admin',
        authorized: true,
        createdAt: Date.now(),
      }

      writeStore(ADMINS_KEY, [...admins, newAdmin])
      onRegistered(newAdmin)
    } catch {
      setStatus({ type: 'error', text: 'No se pudo crear la cuenta. Inténtalo de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-stone-500 transition hover:text-amber-300"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Volver al inicio de sesión
      </button>

      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-500">Nueva cuenta</p>
        <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-amber-50">Crear administrador</h2>
        <div className="mt-4 h-px w-12 bg-amber-400/60" />
        <p className="mt-4 text-sm leading-6 text-stone-400">
          Completa tus datos para crear tu cuenta de administrador y acceder directamente al panel de inicio.
        </p>
      </div>

      <StatusMessage status={status} />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="register-name" className={labelClass}>
            Nombre completo
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="María Fernández"
            className={inputClass}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
          />
          {errors.name && (
            <p id="register-name-error" className="mt-2 text-xs text-rose-400">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="register-email" className={labelClass}>
            Correo electrónico
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="nombre@hestia.com"
            className={inputClass}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
          />
          {errors.email && (
            <p id="register-email-error" className="mt-2 text-xs text-rose-400">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="register-password" className={labelClass}>
            Contraseña
          </label>
          <div className="relative">
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Crea una contraseña segura"
              className={`${inputClass} pr-24`}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'register-password-error' : 'password-rules'}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-3 my-auto h-8 rounded-lg px-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-400/10"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {errors.password && (
            <p id="register-password-error" className="mt-2 text-xs text-rose-400">
              {errors.password}
            </p>
          )}
          <div id="password-rules" className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {PASSWORD_RULES.map((rule) => {
              const passed = rule.test(form.password)
              return (
                <p
                  key={rule.id}
                  className={`flex items-center gap-2 text-[11px] ${passed ? 'text-amber-300' : 'text-stone-600'}`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      passed ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-stone-600'
                    }`}
                  >
                    <CheckIcon className="h-2.5 w-2.5" />
                  </span>
                  {rule.label}
                </p>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="register-confirm" className={labelClass}>
            Confirmar contraseña
          </label>
          <input
            id="register-confirm"
            name="confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={form.confirm}
            onChange={handleChange}
            placeholder="Repite tu contraseña"
            className={inputClass}
            aria-invalid={Boolean(errors.confirm)}
            aria-describedby={errors.confirm ? 'register-confirm-error' : undefined}
          />
          {errors.confirm && (
            <p id="register-confirm-error" className="mt-2 text-xs text-rose-400">
              {errors.confirm}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta y entrar'}
        </button>
      </form>
    </AuthLayout>
  )
}

function AdminSession({ admin, onLogout }) {
  const now = new Date()
  const loginTime = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const today = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#070707] px-4 py-10 text-left">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-amber-400/20 bg-[#0b0b0b] p-7 shadow-[0_40px_120px_-40px_rgba(212,175,55,0.35)] sm:p-10">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/70 to-transparent" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
              <FlameIcon className="h-7 w-7" />
            </span>
            <div>
              <p className="font-serif text-2xl font-semibold tracking-wide text-amber-100">Hestia</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-500/70">Panel de inicio</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-stone-400 transition hover:border-amber-400/30 hover:bg-amber-400/5 hover:text-amber-300"
          >
            <LogOutIcon className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>

        <div className="mt-6">
          <StatusMessage status={{ type: 'success', text: 'Acceso concedido. Bienvenido a tu panel de inicio.' }} />
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-[#080808] p-6 sm:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/5 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-500">Bienvenido</p>
          <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-amber-50">Hola, {admin.name}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone-400">
            Has accedido correctamente al sistema de gestión de Hestia. Tu sesión está activa y el acceso al panel fue
            autorizado.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Sesión activa
          </div>
        </section>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Estado</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(245,200,66,0.8)]" />
              <p className="font-semibold text-amber-100">Activa</p>
            </div>
          </article>
          <article className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Rol</p>
            <p className="mt-2 font-semibold text-amber-100">Administrador</p>
          </article>
          <article className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Acceso</p>
            <p className="mt-2 font-semibold text-amber-100">{admin.authorized ? 'Autorizado' : 'Restringido'}</p>
          </article>
        </div>

        <div className="mt-4 rounded-2xl border border-white/5 bg-white/5 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Cuenta</p>
              <p className="mt-1 font-semibold text-amber-100">{admin.email}</p>
              <p className="mt-1 text-xs text-stone-500">Último acceso hoy a las {loginTime}</p>
            </div>
            <p className="text-xs text-stone-500">{today}</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300">
            <CheckIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-200">Sesión protegida</p>
            <p className="mt-1 text-xs leading-5 text-stone-400">
              Cierra sesión al terminar para mantener protegido el panel de Hestia.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.28em] text-stone-600">
          Hestia · Sistema de gestión
        </p>
      </div>
    </main>
  )
}

function Login() {
  const [view, setView] = useState('login')
  const [currentAdmin, setCurrentAdmin] = useState(null)

  if (currentAdmin) {
    return (
      <AdminSession
        admin={currentAdmin}
        onLogout={() => {
          setCurrentAdmin(null)
          setView('login')
        }}
      />
    )
  }

  if (view === 'register') {
    return <RegisterForm onBack={() => setView('login')} onRegistered={setCurrentAdmin} />
  }

  return (
    <LoginForm
      onLogin={setCurrentAdmin}
      onCreateAccount={() => setView('register')}
    />
  )
}

export default Login
