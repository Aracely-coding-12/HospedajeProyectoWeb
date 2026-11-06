import { useState } from 'react'
import hestiaEmblem from '../assets/hestia-emblem.png'
import { CLIENT_DOCUMENT_TYPES } from '../data/hestiaData.js'
import {
  PASSWORD_HELP,
  PASSWORD_RULES,
  isAdminEmail,
  isValidEmail,
  readStore,
} from '../lib/adminAuth.js'
import { CLIENTS_KEY } from '../lib/clientAuth.js'
import { validarDatosRegistro } from '../utils/validaciones.js'
import {
  AlertIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  IdIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  UserIcon,
} from '../components/cliente/icons.jsx'
import {
  fieldErrorClass,
  inputClass,
  labelClass,
  Modal,
  primaryButtonClass,
} from '../components/cliente/ui.jsx'

const DOCUMENT_HINTS = {
  DNI: '8 dígitos',
  RUC: '11 dígitos',
  CE: '9 a 12 caracteres',
}

function documentIsValid(type, value) {
  if (type === 'DNI') return /^\d{8}$/.test(value)
  if (type === 'RUC') return /^\d{11}$/.test(value)
  if (type === 'CE') return /^[A-Za-z0-9]{9,12}$/.test(value)
  return false
}

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className={fieldErrorClass}>
      {children}
    </p>
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

function Brand() {
  return (
    <div className="flex flex-col items-center pb-1">
      <img src={hestiaEmblem} alt="" className="h-20 w-auto object-contain" />
      <p className="brand-font brand-glow mt-1 bg-linear-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-[30px] leading-none text-transparent">
        Hestia
      </p>
      <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-stone-500">
        Hospedaje Cusco
      </p>
    </div>
  )
}

function LoginPanel({ onLogin, onGoRegister, onAdminAccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState('')

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
    else if (!isValidEmail(form.email)) nextErrors.email = 'Ingresa un correo electrónico válido.'
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
      setFailure(error instanceof Error ? error.message : 'No pudimos iniciar tu sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Brand />

      <div className="mt-5 flex rounded-lg border border-amber-400/25 bg-black/30 p-1">
        <button
          type="button"
          className="flex-1 rounded-md bg-amber-400/15 px-3 py-2 text-xs font-semibold text-amber-200"
          aria-current="page"
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={onGoRegister}
          className="flex-1 rounded-md px-3 py-2 text-xs font-semibold text-stone-400 transition hover:text-amber-200"
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <div>
          <label htmlFor="client-login-email" className={labelClass}>
            Correo electrónico:
          </label>
          <div className="relative">
            <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
            <input
              id="client-login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              className={`${inputClass} pl-9`}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'client-login-email-error' : undefined}
            />
          </div>
          {errors.email && <FieldError id="client-login-email-error">{errors.email}</FieldError>}
        </div>

        <div>
          <label htmlFor="client-login-password" className={labelClass}>
            Contraseña:
          </label>
          <div className="relative">
            <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
            <input
              id="client-login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              className={`${inputClass} pl-9 pr-11`}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'client-login-password-error' : undefined}
            />
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
            />
          </div>
          {errors.password && (
            <FieldError id="client-login-password-error">{errors.password}</FieldError>
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

        <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full`}>
          {submitting ? 'Validando…' : 'Entrar a mi cuenta'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-stone-500">
        ¿Aún no tienes cuenta?{' '}
        <button
          type="button"
          onClick={onGoRegister}
          className="font-semibold text-amber-400 underline underline-offset-4 transition hover:text-amber-300"
        >
          Regístrate y reserva tu estadía
        </button>
      </p>

      <div className="mt-5 border-t border-white/5 pt-4 text-center">
        <button
          type="button"
          onClick={onAdminAccess}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 transition hover:text-amber-300"
        >
          <ShieldIcon className="h-3.5 w-3.5" />
          Administración
        </button>
        <p className="mt-1 text-[10px] text-stone-600">
          Acceso exclusivo del administrador del hospedaje.
        </p>
      </div>
    </div>
  )
}

function RegisterPanel({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: 'DNI',
    document: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFailure('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    const registeredAccounts = readStore(CLIENTS_KEY)
    const accountsForValidation = isAdminEmail(form.email)
      ? [...registeredAccounts, { email: form.email }]
      : registeredAccounts
    const registrationErrors = validarDatosRegistro(
      {
        nombre: `${form.firstName} ${form.lastName}`,
        correo: form.email,
        clave: form.password,
      },
      accountsForValidation,
    )

    if (!form.firstName.trim()) nextErrors.firstName = 'Ingresa tus nombres.'
    else if (form.firstName.trim().length < 2) {
      nextErrors.firstName = 'Ingresa al menos 2 caracteres.'
    }

    if (!form.lastName.trim()) nextErrors.lastName = 'Ingresa tus apellidos.'
    else if (form.lastName.trim().length < 2) {
      nextErrors.lastName = 'Ingresa al menos 2 caracteres.'
    }

    if (!form.email.trim()) nextErrors.email = 'Ingresa tu correo electrónico.'
    else if (registrationErrors.correo) nextErrors.email = registrationErrors.correo

    if (!form.phone.trim()) nextErrors.phone = 'Ingresa tu teléfono.'
    else if (!/^\d{9}$/.test(form.phone.trim())) {
      nextErrors.phone = 'El teléfono debe tener 9 dígitos.'
    }

    if (!form.document.trim()) nextErrors.document = 'Ingresa tu documento.'
    else if (!documentIsValid(form.documentType, form.document.trim())) {
      nextErrors.document = `El documento debe tener ${DOCUMENT_HINTS[form.documentType] ?? 'un formato válido'}.`
    }

    if (!form.password) nextErrors.password = 'Crea una contraseña.'
    else if (registrationErrors.clave) nextErrors.password = registrationErrors.clave

    if (
      registrationErrors.nombre &&
      !nextErrors.firstName &&
      !nextErrors.lastName
    ) {
      nextErrors.firstName = registrationErrors.nombre
    }

    if (!form.confirm) nextErrors.confirm = 'Confirma tu contraseña.'
    else if (form.confirm !== form.password) nextErrors.confirm = 'Las contraseñas no coinciden.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setFailure('')
    try {
      await onRegister({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email,
        phone: form.phone.trim(),
        documentType: form.documentType,
        document: form.document.trim(),
        password: form.password,
      })
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'No pudimos crear tu cuenta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Brand />

      <div className="mt-5 flex rounded-lg border border-amber-400/25 bg-black/30 p-1">
        <button
          type="button"
          onClick={onGoLogin}
          className="flex-1 rounded-md px-3 py-2 text-xs font-semibold text-stone-400 transition hover:text-amber-200"
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          className="flex-1 rounded-md bg-amber-400/15 px-3 py-2 text-xs font-semibold text-amber-200"
          aria-current="page"
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="client-register-first-name" className={labelClass}>
              Nombres: *
            </label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
              <input
                id="client-register-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                maxLength="60"
                value={form.firstName}
                onChange={handleChange}
                placeholder="María"
                className={`${inputClass} pl-9`}
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={errors.firstName ? 'client-register-first-name-error' : undefined}
              />
            </div>
            {errors.firstName && (
              <FieldError id="client-register-first-name-error">{errors.firstName}</FieldError>
            )}
          </div>

          <div>
            <label htmlFor="client-register-last-name" className={labelClass}>
              Apellidos: *
            </label>
            <input
              id="client-register-last-name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              maxLength="80"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Fernández Quispe"
              className={inputClass}
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={errors.lastName ? 'client-register-last-name-error' : undefined}
            />
            {errors.lastName && (
              <FieldError id="client-register-last-name-error">{errors.lastName}</FieldError>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="client-register-email" className={labelClass}>
            Correo electrónico: *
          </label>
          <div className="relative">
            <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
            <input
              id="client-register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              className={`${inputClass} pl-9`}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'client-register-email-error' : undefined}
            />
          </div>
          {errors.email && <FieldError id="client-register-email-error">{errors.email}</FieldError>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="client-register-phone" className={labelClass}>
              Teléfono: *
            </label>
            <div className="relative">
              <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
              <input
                id="client-register-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                maxLength="9"
                value={form.phone}
                onChange={handleChange}
                placeholder="987654321"
                className={`${inputClass} pl-9`}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'client-register-phone-error' : undefined}
              />
            </div>
            {errors.phone && (
              <FieldError id="client-register-phone-error">{errors.phone}</FieldError>
            )}
          </div>

          <div>
            <label htmlFor="client-register-document-type" className={labelClass}>
              Tipo de documento: *
            </label>
            <select
              id="client-register-document-type"
              name="documentType"
              value={form.documentType}
              onChange={handleChange}
              className={inputClass}
            >
              {CLIENT_DOCUMENT_TYPES.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#0b0a07]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="client-register-document" className={labelClass}>
            Número de documento: *
          </label>
          <div className="relative">
            <IdIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
            <input
              id="client-register-document"
              name="document"
              type="text"
              required
              maxLength="12"
              value={form.document}
              onChange={handleChange}
              placeholder={DOCUMENT_HINTS[form.documentType] ?? ''}
              className={`${inputClass} pl-9`}
              aria-invalid={Boolean(errors.document)}
              aria-describedby={errors.document ? 'client-register-document-error' : undefined}
            />
          </div>
          {errors.document ? (
            <FieldError id="client-register-document-error">{errors.document}</FieldError>
          ) : (
            <p className="mt-1.5 text-[10px] text-stone-500">
              {form.documentType}: {DOCUMENT_HINTS[form.documentType]}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="client-register-password" className={labelClass}>
              Contraseña: *
            </label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
              <input
                id="client-register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                className={`${inputClass} pl-9 pr-11`}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? 'client-register-password-error client-register-password-rules'
                    : 'client-register-password-rules'
                }
              />
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((current) => !current)}
              />
            </div>
            {errors.password && (
              <FieldError id="client-register-password-error">{errors.password}</FieldError>
            )}
          </div>

          <div>
            <label htmlFor="client-register-confirm" className={labelClass}>
              Confirmar contraseña: *
            </label>
            <input
              id="client-register-confirm"
              name="confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={form.confirm}
              onChange={handleChange}
              className={inputClass}
              aria-invalid={Boolean(errors.confirm)}
              aria-describedby={errors.confirm ? 'client-register-confirm-error' : undefined}
            />
            {errors.confirm && (
              <FieldError id="client-register-confirm-error">{errors.confirm}</FieldError>
            )}
          </div>
        </div>

        <ul id="client-register-password-rules" className="grid gap-1 sm:grid-cols-2">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(form.password)
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-1.5 text-[10px] ${
                  passed ? 'text-amber-400' : 'text-stone-600'
                }`}
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
        <p className="text-[10px] leading-4 text-stone-500">{PASSWORD_HELP}</p>

        {failure && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-xs leading-5 text-rose-100"
          >
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{failure}</span>
          </div>
        )}

        <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-full`}>
          {submitting ? 'Creando cuenta…' : 'Crear mi cuenta'}
        </button>
      </form>

      <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2.5 text-[10px] leading-4 text-stone-400">
        <ShieldIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
        <p>
          Tu contraseña se guarda cifrada. Con tu cuenta podrás reservar, pagar en línea y
          revisar el historial de tus estadías.
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-stone-500">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={onGoLogin}
          className="font-semibold text-amber-400 underline underline-offset-4 transition hover:text-amber-300"
        >
          Inicia sesión
        </button>
      </p>
    </div>
  )
}

function AccesoCliente({
  open,
  initialMode = 'login',
  onClose,
  onLogin,
  onRegister,
  onAdminAccess,
}) {
  const [mode, setMode] = useState(initialMode)

  async function handleLogin(credentials) {
    await onLogin(credentials)
    onClose()
  }

  async function handleRegister(form) {
    await onRegister(form)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta de cliente'}
      description={
        mode === 'login'
          ? 'Ingresa para gestionar tus reservas, pagos y datos personales.'
          : 'Regístrate para reservar tu próxima estadía en Hestia.'
      }
      size="lg"
    >
      {mode === 'login' ? (
        <LoginPanel
          onLogin={handleLogin}
          onGoRegister={() => setMode('register')}
          onAdminAccess={onAdminAccess}
        />
      ) : (
        <RegisterPanel onRegister={handleRegister} onGoLogin={() => setMode('login')} />
      )}
    </Modal>
  )
}

export default AccesoCliente
