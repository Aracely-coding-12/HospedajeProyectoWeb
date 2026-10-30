import { useState } from 'react'
import hestiaEmblem from '../assets/hestia-emblem.png'

const ADMINS_KEY = 'hestia_admins_v1'
const PASSWORD_MIN_LENGTH = 12
const PASSWORD_HELP = '12 caracteres / letras mayúsculas, minúsculas, números y símbolos'

const DEFAULT_ADMIN = {
  id: 'hestia-default-admin',
  name: 'Administrador Hestia',
  email: 'admin@hestia.com',
  password: 'Admin123!2026',
  role: 'admin',
  authorized: true,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PASSWORD_RULES = [
  { id: 'length', label: 'Mínimo 12 caracteres', test: (value) => value.length >= PASSWORD_MIN_LENGTH },
  { id: 'uppercase', label: 'Al menos una mayúscula', test: (value) => /[A-Z]/.test(value) },
  { id: 'lowercase', label: 'Al menos una minúscula', test: (value) => /[a-z]/.test(value) },
  { id: 'number', label: 'Al menos un número', test: (value) => /\d/.test(value) },
  { id: 'special', label: 'Al menos un símbolo', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-amber-100/90'

const primaryButtonClass =
  'w-full rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-600 px-4 py-3 font-serif text-base font-bold tracking-wide text-black shadow-[0_12px_30px_-14px_rgba(245,200,66,0.8)] transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-amber-400/25 disabled:cursor-not-allowed disabled:opacity-60'

const linkClass = 'font-semibold text-amber-400 underline underline-offset-4 transition hover:text-amber-300'

function inputClass(hasError = false) {
  return [
    'w-full rounded-md border bg-black/50 px-3.5 py-2.5 text-sm text-amber-50 outline-none transition',
    'placeholder:text-stone-600 focus:ring-2',
    hasError
      ? 'border-rose-500/80 focus:border-rose-400 focus:ring-rose-500/15'
      : 'border-amber-400/55 focus:border-amber-300 focus:ring-amber-400/15',
  ].join(' ')
}

function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className={className}>
      <path d="m5 12.5 4.2 4.2L19 6.8" strokeLinecap="round" strokeLinejoin="round" />
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

function EyeOffIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M2.5 12S5.5 6.5 12 6.5 21.5 12 21.5 12 18.5 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
      <path d="M4 4l16 16" strokeLinecap="round" />
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

function BrandHeader() {
  return (
    <header className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute h-40 w-40 rounded-full bg-amber-400/10 blur-2xl"
        />
        <img
          src={hestiaEmblem}
          alt=""
          className="emblem-mask relative h-32 w-auto [clip-path:inset(0_0_6%_0)] mix-blend-screen sm:h-36"
        />
      </div>
      <p className="brand-font brand-glow mt-1 bg-linear-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-[44px] leading-none text-transparent">
        Hestia
      </p>
    </header>
  )
}

function AuthShell({ children, footer }) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#050505] px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-amber-400/50 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-[390px]">
        <section className="relative overflow-hidden rounded-2xl border border-amber-400/70 bg-[#080705] px-6 py-8 shadow-[0_0_80px_-24px_rgba(245,200,66,0.55)] sm:px-9 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-amber-300 to-transparent"
          />
          <div className="relative">{children}</div>
        </section>
        {footer}
      </div>
    </main>
  )
}

function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      aria-pressed={visible}
      className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-md text-amber-400/80 transition hover:bg-amber-400/10 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
    >
      {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
    </button>
  )
}

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-[11px] leading-4 text-rose-400">
      {children}
    </p>
  )
}

function DemoAccess({ onUse }) {
  return (
    <details className="mt-4 text-center">
      <summary className="mx-auto w-max cursor-pointer list-none text-[10px] uppercase tracking-[0.22em] text-stone-600 transition hover:text-amber-400/80 [&::-webkit-details-marker]:hidden">
        Acceso de demostración
      </summary>
      <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs text-stone-500">
        <p className="font-mono text-[11px] text-stone-400">admin@hestia.com · Admin123!2026</p>
        <button type="button" onClick={onUse} className={`mt-2 text-[11px] ${linkClass}`}>
          Usar estas credenciales
        </button>
      </div>
    </details>
  )
}

function ResultCard({ variant, title, description, actionLabel, onAction }) {
  const isSuccess = variant === 'success'

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#050505] px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-linear-to-r from-transparent via-amber-400/50 to-transparent" />
      </div>

      <section
        role={isSuccess ? 'status' : 'alert'}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-amber-500/60 bg-[#080705] px-8 py-12 text-center shadow-[0_0_80px_-24px_rgba(245,200,66,0.55)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-amber-300 to-transparent"
        />
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-400/90 text-amber-300 shadow-[0_0_30px_-6px_rgba(245,200,66,0.5)]">
          {isSuccess ? <CheckIcon className="h-10 w-10" /> : <AlertIcon className="h-10 w-10" />}
        </span>
        <h1 className="brand-glow mb-0 mt-6 font-serif text-2xl font-semibold tracking-wide text-amber-300">{title}</h1>
        {description && <p className="mt-3 text-sm leading-6 text-stone-400">{description}</p>}
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-400 transition hover:text-amber-300"
          >
            {actionLabel}
          </button>
        )}
      </section>
    </main>
  )
}

function LoginForm({ onLogin, onCreateAccount }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [failure, setFailure] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function fillDemoCredentials() {
    setForm({ email: DEFAULT_ADMIN.email, password: DEFAULT_ADMIN.password })
    setErrors({})
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Ingresa tu correo electrónico.'
    else if (!isValidEmail(form.email)) nextErrors.email = 'Ingresa un correo electrónico válido.'

    if (!form.password) nextErrors.password = 'Ingresa tu contraseña.'
    else if (!isStrongPassword(form.password)) nextErrors.password = PASSWORD_HELP

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setFailure(null)

    try {
      const admin = await authenticate(form.email, form.password)
      if (!admin) {
        setFailure('El correo o la contraseña no son correctos. Verifica tus datos e inténtalo de nuevo.')
        return
      }
      onLogin(admin)
    } catch {
      setFailure('No pudimos validar tus credenciales. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (failure) {
    return (
      <ResultCard
        variant="error"
        title="Error: Algo salió mal"
        description={failure}
        actionLabel="Volver a intentar"
        onAction={() => {
          setFailure(null)
          setErrors({})
        }}
      />
    )
  }

  return (
    <AuthShell footer={<DemoAccess onUse={fillDemoCredentials} />}>
      <h1 className="sr-only">Inicio de sesión</h1>
      <BrandHeader />

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="login-email" className={labelClass}>
            Correo electrónico:
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className={inputClass(Boolean(errors.email))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />
          {errors.email && <FieldError id="login-email-error">{errors.email}</FieldError>}
        </div>

        <div>
          <label htmlFor="login-password" className={labelClass}>
            Password:
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              className={`${inputClass(Boolean(errors.password))} pr-11`}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-message' : 'login-password-help'}
            />
            <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((current) => !current)} />
          </div>
          <p
            id={errors.password ? 'login-password-message' : 'login-password-help'}
            className={`mt-1.5 text-[11px] leading-4 ${errors.password ? 'text-rose-400' : 'text-amber-100/40'}`}
          >
            {errors.password ?? PASSWORD_HELP}
          </p>
        </div>

        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? 'Validando…' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-400">
        ¿No tienes una cuenta?{' '}
        <button type="button" onClick={onCreateAccount} className={linkClass}>
          Crear cuenta
        </button>
      </p>
    </AuthShell>
  )
}

function RegisterForm({ onBack, onRegistered }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [failure, setFailure] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Ingresa tu nombre.'
    else if (form.name.trim().length < 2) nextErrors.name = 'El nombre debe tener al menos 2 caracteres.'

    if (!form.email.trim()) nextErrors.email = 'Ingresa tu correo electrónico.'
    else if (!isValidEmail(form.email)) nextErrors.email = 'Ingresa un correo electrónico válido.'

    if (!form.password) nextErrors.password = 'Crea una contraseña.'
    else if (!isStrongPassword(form.password)) nextErrors.password = 'La contraseña debe cumplir todos los requisitos.'

    if (!form.confirm) nextErrors.confirm = 'Confirma tu contraseña.'
    else if (form.confirm !== form.password) nextErrors.confirm = 'Las contraseñas no coinciden.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setFailure(null)

    try {
      const email = normalizeEmail(form.email)
      const admins = readStore(ADMINS_KEY)
      const emailExists = email === DEFAULT_ADMIN.email || admins.some((admin) => admin.email === email)

      if (emailExists) {
        setErrors({ email: 'Ya existe una cuenta con este correo electrónico.' })
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

      if (!writeStore(ADMINS_KEY, [...admins, newAdmin])) {
        throw new Error('No se pudo guardar la cuenta.')
      }

      onRegistered(newAdmin)
    } catch {
      setFailure('No pudimos crear tu cuenta. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (failure) {
    return (
      <ResultCard
        variant="error"
        title="Error: Algo salió mal"
        description={failure}
        actionLabel="Volver a intentar"
        onAction={() => setFailure(null)}
      />
    )
  }

  return (
    <AuthShell>
      <h1 className="sr-only">Crear cuenta</h1>
      <BrandHeader />

      <p className="mb-0 mt-5 text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-500">
        Crear cuenta
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <div>
          <label htmlFor="register-name" className={labelClass}>
            Nombre completo:
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="María Fernández"
            className={inputClass(Boolean(errors.name))}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
          />
          {errors.name && <FieldError id="register-name-error">{errors.name}</FieldError>}
        </div>

        <div>
          <label htmlFor="register-email" className={labelClass}>
            Correo electrónico:
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="nombre@hestia.com"
            className={inputClass(Boolean(errors.email))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
          />
          {errors.email && <FieldError id="register-email-error">{errors.email}</FieldError>}
        </div>

        <div>
          <label htmlFor="register-password" className={labelClass}>
            Contraseña:
          </label>
          <div className="relative">
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Crea una contraseña segura"
              className={`${inputClass(Boolean(errors.password))} pr-11`}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? 'register-password-error register-password-rules' : 'register-password-rules'
              }
            />
            <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((current) => !current)} />
          </div>
          {errors.password && <FieldError id="register-password-error">{errors.password}</FieldError>}
          <ul id="register-password-rules" className="mt-2 grid gap-1 sm:grid-cols-2">
            {PASSWORD_RULES.map((rule) => {
              const passed = rule.test(form.password)
              return (
                <li
                  key={rule.id}
                  className={`flex items-center gap-1.5 text-[10px] ${passed ? 'text-amber-400' : 'text-stone-600'}`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                      passed ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-stone-600'
                    }`}
                  >
                    <CheckIcon className="h-2 w-2" />
                  </span>
                  {rule.label}
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <label htmlFor="register-confirm" className={labelClass}>
            Confirmar contraseña:
          </label>
          <input
            id="register-confirm"
            name="confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={form.confirm}
            onChange={handleChange}
            placeholder="Repite tu contraseña"
            className={inputClass(Boolean(errors.confirm))}
            aria-invalid={Boolean(errors.confirm)}
            aria-describedby={errors.confirm ? 'register-confirm-error' : undefined}
          />
          {errors.confirm && <FieldError id="register-confirm-error">{errors.confirm}</FieldError>}
        </div>

        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-400">
        ¿Ya tienes una cuenta?{' '}
        <button type="button" onClick={onBack} className={linkClass}>
          Inicia sesión
        </button>
      </p>
    </AuthShell>
  )
}

function Login({ onLogin }) {
  const [view, setView] = useState('login')
  const [authenticated, setAuthenticated] = useState(null)

  if (authenticated) {
    return (
      <ResultCard
        variant="success"
        title="Sesión exitosa"
        description={`Bienvenido, ${authenticated.name}. Sesión iniciada como ${authenticated.email}.`}
        actionLabel="Continuar al panel"
        onAction={() => onLogin(authenticated)}
      />
    )
  }

  if (view === 'register') {
    return <RegisterForm onBack={() => setView('login')} onRegistered={setAuthenticated} />
  }

  return <LoginForm onLogin={setAuthenticated} onCreateAccount={() => setView('register')} />
}

export default Login
