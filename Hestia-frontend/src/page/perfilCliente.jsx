import { useState } from 'react'
import { CLIENT_DOCUMENT_TYPES } from '../data/hestiaData.js'
import {
  PASSWORD_HELP,
  PASSWORD_RULES,
  isStrongPassword,
  isValidEmail,
} from '../lib/adminAuth.js'
import { clientPayments, clientReservations } from '../lib/clientBooking.js'
import { formatShortDate, formatSoles } from '../lib/format.js'
import {
  AlertIcon,
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  EyeIcon,
  EyeOffIcon,
  IdIcon,
  LockIcon,
  LogoutIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  UserIcon,
} from '../components/cliente/icons.jsx'
import {
  EmptyState,
  fieldErrorClass,
  inputClass,
  labelClass,
  Notice,
  PageHeading,
  primaryButtonClass,
  secondaryButtonClass,
  StatusBadge,
} from '../components/cliente/ui.jsx'

const DOCUMENT_HINTS = {
  DNI: '8 dígitos',
  RUC: '11 dígitos',
  CE: '9 a 12 caracteres',
}

const memberFormatter = new Intl.DateTimeFormat('es-PE', {
  month: 'long',
  year: 'numeric',
})

function documentIsValid(type, value) {
  if (type === 'DNI') return /^\d{8}$/.test(value)
  if (type === 'RUC') return /^\d{11}$/.test(value)
  if (type === 'CE') return /^[A-Za-z0-9]{9,12}$/.test(value)
  return false
}

function initials(name) {
  return String(name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function profileToForm(profile) {
  const nameParts = String(profile?.name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return {
    firstName: profile?.firstName || nameParts[0] || '',
    lastName:
      profile?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''),
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    documentType: profile?.documentType ?? 'DNI',
    document: profile?.document ?? '',
  }
}

function FieldError({ id, children }) {
  return (
    <p id={id} role="alert" className={fieldErrorClass}>
      {children}
    </p>
  )
}

function PasswordVisibility({ visible, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
      aria-pressed={visible}
      className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-md text-amber-400/80 transition hover:bg-amber-400/10 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
    >
      {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
    </button>
  )
}

function PerfilCliente({
  session,
  profile,
  data,
  onUpdateProfile,
  onChangePassword,
  onGoToReservations,
  onGoToPayment,
  onLogout,
  onRequireAuth,
}) {
  const [form, setForm] = useState(() => profileToForm(profile))
  const [errors, setErrors] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileNotice, setProfileNotice] = useState(null)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [showPasswords, setShowPasswords] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordNotice, setPasswordNotice] = useState(null)

  if (!session) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Mi cuenta"
          title="Mi perfil"
          description="Administra tus datos personales y la seguridad de tu cuenta."
        />
        <div className="mt-6">
          <EmptyState
            icon={UserIcon}
            title="Inicia sesión para ver tu perfil"
            description="Ingresa a tu cuenta de cliente para actualizar tus datos personales y revisar tus reservas y pagos."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onRequireAuth('login')}
                  className={secondaryButtonClass}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => onRequireAuth('register')}
                  className={primaryButtonClass}
                >
                  Crear cuenta
                </button>
              </div>
            }
          />
        </div>
      </section>
    )
  }

  const reservations = clientReservations(data, session.id)
  const payments = clientPayments(data, session.id)
  const activeReservations = reservations.filter(
    (reservation) =>
      reservation.status === 'pendiente' || reservation.status === 'confirmada',
  )
  const nextStay =
    [...activeReservations].sort((first, second) =>
      first.checkIn.localeCompare(second.checkIn),
    )[0] ?? null
  const paidTotal = payments
    .filter((payment) => payment.status === 'pagado')
    .reduce((sum, payment) => sum + payment.amount, 0)
  const memberSince = profile?.createdAt
    ? memberFormatter.format(new Date(profile.createdAt))
    : 'Cliente Hestia'

  function handleFormChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setProfileNotice(null)
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!form.firstName.trim()) nextErrors.firstName = 'Ingresa tus nombres.'
    else if (form.firstName.trim().length < 2) {
      nextErrors.firstName = 'Ingresa al menos 2 caracteres.'
    }

    if (!form.lastName.trim()) nextErrors.lastName = 'Ingresa tus apellidos.'
    else if (form.lastName.trim().length < 2) {
      nextErrors.lastName = 'Ingresa al menos 2 caracteres.'
    }

    if (!form.email.trim()) nextErrors.email = 'Ingresa tu correo electrónico.'
    else if (!isValidEmail(form.email)) nextErrors.email = 'Ingresa un correo válido.'

    if (!form.phone.trim()) nextErrors.phone = 'Ingresa tu teléfono.'
    else if (!/^\d{9}$/.test(form.phone.trim())) {
      nextErrors.phone = 'El teléfono debe tener 9 dígitos.'
    }

    if (!form.document.trim()) nextErrors.document = 'Ingresa tu documento.'
    else if (!documentIsValid(form.documentType, form.document.trim())) {
      nextErrors.document = `El documento debe tener ${
        DOCUMENT_HINTS[form.documentType] ?? 'un formato válido'
      }.`
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSavingProfile(true)
    setProfileNotice(null)
    try {
      const updated = await onUpdateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email,
        phone: form.phone.trim(),
        documentType: form.documentType,
        document: form.document.trim(),
      })
      setForm(profileToForm(updated))
      setProfileNotice({
        type: 'success',
        message: 'Tus datos personales se actualizaron correctamente.',
      })
    } catch (error) {
      setProfileNotice({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'No se pudieron actualizar tus datos.',
      })
    } finally {
      setSavingProfile(false)
    }
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target
    setPasswordForm((current) => ({ ...current, [name]: value }))
    setPasswordErrors((current) => ({ ...current, [name]: undefined }))
    setPasswordNotice(null)
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!passwordForm.current) nextErrors.current = 'Ingresa tu contraseña actual.'
    if (!passwordForm.next) nextErrors.next = 'Ingresa una nueva contraseña.'
    else if (!isStrongPassword(passwordForm.next)) {
      nextErrors.next = 'La contraseña debe cumplir todos los requisitos.'
    } else if (passwordForm.next === passwordForm.current) {
      nextErrors.next = 'La nueva contraseña debe ser diferente a la actual.'
    }
    if (!passwordForm.confirm) nextErrors.confirm = 'Confirma la nueva contraseña.'
    else if (passwordForm.confirm !== passwordForm.next) {
      nextErrors.confirm = 'Las contraseñas no coinciden.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors)
      return
    }

    setSavingPassword(true)
    setPasswordNotice(null)
    try {
      await onChangePassword(passwordForm.current, passwordForm.next)
      setPasswordForm({ current: '', next: '', confirm: '' })
      setPasswordNotice({
        type: 'success',
        message: 'Tu contraseña se actualizó. Úsala la próxima vez que ingreses.',
      })
    } catch (error) {
      setPasswordNotice({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.',
      })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <>
      <section className="border-b border-amber-400/15 bg-[#070605]">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-amber-400/50 bg-amber-400/15 text-lg font-bold text-amber-200">
                {initials(profile?.name ?? session.name)}
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
                  Mi cuenta
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {profile?.name ?? session.name}
                </h1>
                <p className="mt-1 text-xs text-stone-500">
                  {profile?.email ?? session.email} · Cliente desde {memberSince}
                </p>
              </div>
            </div>
            <button type="button" onClick={onLogout} className={secondaryButtonClass}>
              <LogoutIcon className="h-4 w-4" /> Cerrar sesión
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Reservas',
                value: reservations.length,
                note: `${activeReservations.length} activas`,
              },
              {
                label: 'Pagos registrados',
                value: payments.length,
                note: `${formatSoles(paidTotal)} pagados`,
              },
              {
                label: 'Estado de cuenta',
                value: 'Activa',
                note: 'Acceso habilitado',
              },
              {
                label: 'Documento',
                value: profile?.documentType ?? 'DNI',
                note: profile?.document ?? 'Sin registrar',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-amber-400/25 bg-[#080705] px-4 py-3"
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">
                  {item.label}
                </p>
                <p className="mt-1 text-xl font-bold text-white">{item.value}</p>
                <p className="mt-0.5 text-[10px] text-stone-500">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:items-start">
          <form
            onSubmit={handleProfileSubmit}
            noValidate
            className="rounded-xl border border-amber-400/30 bg-[#080705] p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
                <UserIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">Datos personales</h2>
                <p className="mt-0.5 text-xs leading-5 text-stone-500">
                  Usaremos estos datos para tu reserva y la coordinación de servicios.
                </p>
              </div>
            </div>

            {profileNotice && (
              <Notice
                type={profileNotice.type}
                message={profileNotice.message}
                onClose={() => setProfileNotice(null)}
                className="mt-4"
              />
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="client-profile-first-name" className={labelClass}>
                  Nombres: *
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
                  <input
                    id="client-profile-first-name"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    maxLength="60"
                    value={form.firstName}
                    onChange={handleFormChange}
                    className={`${inputClass} pl-9`}
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={
                      errors.firstName ? 'client-profile-first-name-error' : undefined
                    }
                  />
                </div>
                {errors.firstName && (
                  <FieldError id="client-profile-first-name-error">
                    {errors.firstName}
                  </FieldError>
                )}
              </div>

              <div>
                <label htmlFor="client-profile-last-name" className={labelClass}>
                  Apellidos: *
                </label>
                <input
                  id="client-profile-last-name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  maxLength="80"
                  value={form.lastName}
                  onChange={handleFormChange}
                  className={inputClass}
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={
                    errors.lastName ? 'client-profile-last-name-error' : undefined
                  }
                />
                {errors.lastName && (
                  <FieldError id="client-profile-last-name-error">
                    {errors.lastName}
                  </FieldError>
                )}
              </div>

              <div>
                <label htmlFor="client-profile-email" className={labelClass}>
                  Correo electrónico: *
                </label>
                <div className="relative">
                  <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
                  <input
                    id="client-profile-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleFormChange}
                    className={`${inputClass} pl-9`}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? 'client-profile-email-error' : undefined
                    }
                  />
                </div>
                {errors.email && (
                  <FieldError id="client-profile-email-error">{errors.email}</FieldError>
                )}
              </div>

              <div>
                <label htmlFor="client-profile-phone" className={labelClass}>
                  Teléfono: *
                </label>
                <div className="relative">
                  <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
                  <input
                    id="client-profile-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength="9"
                    value={form.phone}
                    onChange={handleFormChange}
                    className={`${inputClass} pl-9`}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={
                      errors.phone ? 'client-profile-phone-error' : undefined
                    }
                  />
                </div>
                {errors.phone && (
                  <FieldError id="client-profile-phone-error">{errors.phone}</FieldError>
                )}
              </div>

              <div>
                <label htmlFor="client-profile-document-type" className={labelClass}>
                  Tipo de documento: *
                </label>
                <select
                  id="client-profile-document-type"
                  name="documentType"
                  value={form.documentType}
                  onChange={handleFormChange}
                  className={inputClass}
                >
                  {CLIENT_DOCUMENT_TYPES.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#0b0a07]"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="client-profile-document" className={labelClass}>
                  Número de documento: *
                </label>
                <div className="relative">
                  <IdIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
                  <input
                    id="client-profile-document"
                    name="document"
                    type="text"
                    maxLength="12"
                    value={form.document}
                    onChange={handleFormChange}
                    className={`${inputClass} pl-9`}
                    aria-invalid={Boolean(errors.document)}
                    aria-describedby={
                      errors.document ? 'client-profile-document-error' : undefined
                    }
                  />
                </div>
                {errors.document ? (
                  <FieldError id="client-profile-document-error">
                    {errors.document}
                  </FieldError>
                ) : (
                  <p className="mt-1.5 text-[10px] text-stone-500">
                    {form.documentType}: {DOCUMENT_HINTS[form.documentType]}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={savingProfile}
                className={primaryButtonClass}
              >
                {savingProfile ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(profileToForm(profile))
                  setErrors({})
                  setProfileNotice(null)
                }}
                disabled={savingProfile}
                className={secondaryButtonClass}
              >
                Restablecer
              </button>
            </div>
          </form>

          <div className="grid gap-5">
            <form
              onSubmit={handlePasswordSubmit}
              noValidate
              className="rounded-xl border border-amber-400/30 bg-[#080705] p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
                  <ShieldIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">Seguridad</h2>
                  <p className="mt-0.5 text-xs leading-5 text-stone-500">
                    Cambia tu contraseña periódicamente para proteger tu cuenta.
                  </p>
                </div>
              </div>

              {passwordNotice && (
                <Notice
                  type={passwordNotice.type}
                  message={passwordNotice.message}
                  onClose={() => setPasswordNotice(null)}
                  className="mt-4"
                />
              )}

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="client-password-current" className={labelClass}>
                    Contraseña actual: *
                  </label>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
                    <input
                      id="client-password-current"
                      name="current"
                      type={showPasswords ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={passwordForm.current}
                      onChange={handlePasswordChange}
                      className={`${inputClass} pl-9 pr-11`}
                      aria-invalid={Boolean(passwordErrors.current)}
                      aria-describedby={
                        passwordErrors.current ? 'client-password-current-error' : undefined
                      }
                    />
                    <PasswordVisibility
                      visible={showPasswords}
                      onToggle={() => setShowPasswords((current) => !current)}
                    />
                  </div>
                  {passwordErrors.current && (
                    <FieldError id="client-password-current-error">
                      {passwordErrors.current}
                    </FieldError>
                  )}
                </div>

                <div>
                  <label htmlFor="client-password-next" className={labelClass}>
                    Nueva contraseña: *
                  </label>
                  <input
                    id="client-password-next"
                    name="next"
                    type={showPasswords ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={passwordForm.next}
                    onChange={handlePasswordChange}
                    className={inputClass}
                    aria-invalid={Boolean(passwordErrors.next)}
                    aria-describedby={
                      passwordErrors.next
                        ? 'client-password-next-error client-password-rules'
                        : 'client-password-rules'
                    }
                  />
                  {passwordErrors.next && (
                    <FieldError id="client-password-next-error">
                      {passwordErrors.next}
                    </FieldError>
                  )}
                </div>

                <div>
                  <label htmlFor="client-password-confirm" className={labelClass}>
                    Confirmar nueva contraseña: *
                  </label>
                  <input
                    id="client-password-confirm"
                    name="confirm"
                    type={showPasswords ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={passwordForm.confirm}
                    onChange={handlePasswordChange}
                    className={inputClass}
                    aria-invalid={Boolean(passwordErrors.confirm)}
                    aria-describedby={
                      passwordErrors.confirm ? 'client-password-confirm-error' : undefined
                    }
                  />
                  {passwordErrors.confirm && (
                    <FieldError id="client-password-confirm-error">
                      {passwordErrors.confirm}
                    </FieldError>
                  )}
                </div>
              </div>

              <ul id="client-password-rules" className="mt-4 grid gap-1">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(passwordForm.next)
                  return (
                    <li
                      key={rule.id}
                      className={`flex items-center gap-1.5 text-[10px] ${
                        passed ? 'text-amber-400' : 'text-stone-600'
                      }`}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                          passed
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'bg-white/5 text-stone-600'
                        }`}
                      >
                        <CheckIcon className="h-2 w-2" />
                      </span>
                      {rule.label}
                    </li>
                  )
                })}
              </ul>
              <p className="mt-1.5 text-[10px] leading-4 text-stone-500">{PASSWORD_HELP}</p>

              <button
                type="submit"
                disabled={savingPassword}
                className={`${primaryButtonClass} mt-4 w-full`}
              >
                {savingPassword ? 'Actualizando…' : 'Actualizar contraseña'}
              </button>
            </form>

            <div className="rounded-xl border border-amber-400/30 bg-[#080705] p-5">
              <h2 className="text-base font-semibold text-white">Accesos rápidos</h2>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={onGoToReservations}
                  className="flex items-center justify-between rounded-lg border border-amber-400/20 bg-black/25 px-4 py-3 text-left transition hover:border-amber-400/60 hover:bg-amber-400/5"
                >
                  <span className="flex items-center gap-2.5">
                    <CalendarIcon className="h-4 w-4 text-amber-400/80" />
                    <span>
                      <span className="block text-xs font-semibold text-stone-200">
                        Mis reservas
                      </span>
                      <span className="block text-[10px] text-stone-500">
                        {activeReservations.length} activas de {reservations.length}
                      </span>
                    </span>
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400">Ver</span>
                </button>

                <button
                  type="button"
                  onClick={onGoToPayment}
                  className="flex items-center justify-between rounded-lg border border-amber-400/20 bg-black/25 px-4 py-3 text-left transition hover:border-amber-400/60 hover:bg-amber-400/5"
                >
                  <span className="flex items-center gap-2.5">
                    <CreditCardIcon className="h-4 w-4 text-amber-400/80" />
                    <span>
                      <span className="block text-xs font-semibold text-stone-200">
                        Pagos y comprobantes
                      </span>
                      <span className="block text-[10px] text-stone-500">
                        {payments.length} pagos registrados
                      </span>
                    </span>
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400">Ver</span>
                </button>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2.5">
                <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                <p className="text-[10px] leading-4 text-stone-400">
                  Si detectas un movimiento que no reconoces, cierra tu sesión y contacta al
                  administrador del hospedaje.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-rose-500/25 bg-rose-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <LogoutIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                <div>
                  <p className="text-sm font-semibold text-white">Cerrar sesión</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-stone-500">
                    Tu cuenta y tus reservas seguirán guardadas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-500/50 px-4 py-2.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/50"
              >
                Salir de mi cuenta
              </button>
            </div>

            {nextStay && (
              <div className="rounded-xl border border-amber-400/25 bg-[#080705] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-white">Próxima estadía</h2>
                  <StatusBadge
                    status={nextStay.status}
                    label={nextStay.status === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                  />
                </div>
                <p className="mt-2 text-sm font-semibold text-stone-200">
                  {nextStay.room
                    ? `Habitación ${nextStay.room.number} · ${nextStay.room.type}`
                    : 'Habitación por confirmar'}
                </p>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  {formatShortDate(nextStay.checkIn)} → {formatShortDate(nextStay.checkOut)} ·{' '}
                  {formatSoles(nextStay.total)}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default PerfilCliente
