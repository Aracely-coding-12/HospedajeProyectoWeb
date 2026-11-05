import { useRef, useState } from 'react'
import {
  PASSWORD_HELP,
  PASSWORD_RULES,
  changeAdminPassword,
  isStrongPassword,
  isValidEmail,
} from '../lib/adminAuth.js'

const fieldClass =
  'w-full rounded-md border border-amber-400/55 bg-[#0b0a07] px-3 py-2 text-sm text-amber-50 outline-none transition placeholder:text-stone-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/15'

const labelClass = 'mb-1.5 block text-[11px] font-medium tracking-wide text-amber-100/90'

const primaryButtonClass =
  'inline-flex items-center justify-center gap-1.5 rounded-md bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 px-4 py-2.5 text-xs font-bold text-black shadow-[0_12px_30px_-14px_rgba(245,200,66,0.8)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60'

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-amber-400/55 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 disabled:cursor-not-allowed disabled:opacity-40'

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notification-1',
    title: 'Nueva reserva confirmada',
    description: 'La reserva HES-0015 de Ana Quispe fue confirmada para el 12/11.',
    time: 'Hace 8 minutos',
    read: false,
  },
  {
    id: 'notification-2',
    title: 'Pago registrado',
    description: 'Se registró un pago de S/ 480.00 para la reserva HES-0012.',
    time: 'Hace 35 minutos',
    read: false,
  },
  {
    id: 'notification-3',
    title: 'Promoción próxima a vencer',
    description: 'La promoción Happy Hour vence en 2 días. Revisa su vigencia.',
    time: 'Hace 2 horas',
    read: false,
  },
  {
    id: 'notification-4',
    title: 'Nuevo cliente registrado',
    description: 'Lucía Fernández se registró desde la web del hospedaje.',
    time: 'Ayer',
    read: true,
  },
]

function initials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'AH'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function formatAccountDate(value) {
  if (!value) return 'No registrada'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No registrada'

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function languageLabel(value) {
  if (value === 'en') return 'Inglés'
  return 'Español'
}

function themeLabel(value) {
  return value === 'claro' ? 'Modo claro' : 'Modo oscuro'
}

function AccountAvatar({ profile, className = '', textClassName = '' }) {
  if (profile.avatar) {
    return (
      <img
        src={profile.avatar}
        alt={`Foto de perfil de ${profile.name}`}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={`flex h-full w-full items-center justify-center bg-linear-to-br from-amber-200 via-yellow-500 to-amber-700 font-serif font-bold text-black ${textClassName}`}
    >
      {initials(profile.name)}
    </span>
  )
}

function UserIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="9.5" r="2.8" />
      <path d="M6.8 18.7a5.8 5.8 0 0 1 10.4 0" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M6.5 10.2a5.5 5.5 0 0 1 11 0c0 3.3 1 4.7 2 5.8H4.5c1-1.1 2-2.5 2-5.8Z" strokeLinejoin="round" />
      <path d="M10 19.2a2.2 2.2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  )
}

function CameraIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M4.5 8.5h3l1.4-2h6.2l1.4 2h3v10h-15v-10Z" strokeLinejoin="round" />
      <circle cx="12" cy="13.2" r="3.2" />
    </svg>
  )
}

function ShieldIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.3-7 9-4.1-1.7-7-4.7-7-9V6l7-2.5Z" strokeLinejoin="round" />
      <path d="m8.8 12 2.1 2.1 4.4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GlobeIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.4 3.4 5.4 3.4 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.4-5.4-3.4-8.5S9.8 5.9 12 3.5Z" />
    </svg>
  )
}

function MoonIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M19.5 14.2A7.8 7.8 0 0 1 9.8 4.5 8.5 8.5 0 1 0 19.5 14.2Z" strokeLinejoin="round" />
    </svg>
  )
}

function MailIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7.5 6 7.5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PhoneIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M7.5 4.5 5 6.7c-.8.7-.9 1.9-.3 2.8 2.2 3.5 5.3 6.6 8.8 8.8.9.6 2.1.5 2.8-.3l2.2-2.5-3.4-3.1-2 1.7a20 20 0 0 1-4.2-4.2l1.7-2-3.1-3.4Z" strokeLinejoin="round" />
    </svg>
  )
}

function MapPinIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M12 21s6.5-5.4 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.6 12 21 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="10.5" r="2.3" />
    </svg>
  )
}

function IdIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <circle cx="8.5" cy="11" r="1.7" />
      <path d="M5.8 15.6a3.2 3.2 0 0 1 5.4 0M13 9.5h4.5M13 12.5h4.5M13 15.5h3" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17" strokeLinecap="round" />
    </svg>
  )
}

function LockIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10M12 14v2.5" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className={className}>
      <path d="m5 12.5 4.2 4.2L19 6.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AlertIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className={className}>
      <path d="M12 7v6M12 17h.01" strokeLinecap="round" />
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
      <path d="m4 4 16 16" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-400/50 bg-amber-400/10 text-amber-300">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-[11px] text-stone-500">{description}</p>}
      </div>
    </div>
  )
}

function PageNotice({ notice, onClose }) {
  const success = notice.type === 'success'

  return (
    <div
      role="status"
      className={`mt-4 flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${
        success
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
          : 'border-rose-500/40 bg-rose-500/10 text-rose-100'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          success ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'
        }`}
      >
        {success ? <CheckIcon className="h-3 w-3" /> : <AlertIcon className="h-3 w-3" />}
      </span>
      <p className="flex-1">{notice.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar aviso"
        className="rounded p-0.5 opacity-80 transition hover:bg-white/5 hover:opacity-100"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

function PasswordField({
  id,
  name,
  label,
  value,
  visible,
  error,
  autoComplete,
  onChange,
  onToggle,
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}: *
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`${fieldClass} pr-10 ${error ? 'border-rose-500/70' : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-1.5 my-auto flex h-7 w-7 items-center justify-center rounded text-amber-400/80 transition hover:bg-amber-400/10 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
        >
          {visible ? <EyeOffIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[10px] text-rose-400">
          {error}
        </p>
      )}
    </div>
  )
}

function PreferenceRow({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-amber-400/10 py-2.5 last:border-b-0">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/80" />
        <div>
          <p className="text-[11px] font-medium text-stone-300">{label}</p>
          {hint && <p className="mt-0.5 text-[9px] leading-4 text-stone-600">{hint}</p>}
        </div>
      </div>
      <span className="shrink-0 rounded-full border border-amber-400/35 bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-200">
        {value}
      </span>
    </div>
  )
}

function Cuenta({ profile, onUpdateProfile }) {
  const [form, setForm] = useState(() => ({
    name: profile.name ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    document: profile.document ?? '',
    address: profile.address ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [savingPassword, setSavingPassword] = useState(false)

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [lastAccess] = useState(() => Date.now())
  const notificationsRef = useRef(null)
  const fileInputRef = useRef(null)

  const unreadCount = notifications.filter((notification) => !notification.read).length
  const passwordValid = isStrongPassword(passwordForm.next)

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleProfileChange(event) {
    const { name, value } = event.target
    updateForm(name, value)
  }

  function handleProfileSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    const name = form.name.trim()
    const email = form.email.trim()
    const phone = form.phone.trim()

    if (!name) nextErrors.name = 'Ingresa tu nombre completo.'
    else if (name.length < 2) nextErrors.name = 'El nombre debe tener al menos 2 caracteres.'
    else if (name.length > 80) nextErrors.name = 'El nombre no puede superar los 80 caracteres.'

    if (!email) nextErrors.email = 'Ingresa tu correo electrónico.'
    else if (!isValidEmail(email)) nextErrors.email = 'Ingresa un correo electrónico válido.'

    if (phone && !/^[+()\d\s-]{6,20}$/.test(phone)) {
      nextErrors.phone = 'Ingresa un teléfono válido de 6 a 20 caracteres.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setNotice({ type: 'error', message: 'Revisa los datos personales antes de guardar.' })
      return
    }

    setSavingProfile(true)
    setNotice(null)

    try {
      const updated = onUpdateProfile({
        name,
        email,
        phone,
        document: form.document,
        address: form.address,
      })
      setForm({
        name: updated.name ?? '',
        email: updated.email ?? '',
        phone: updated.phone ?? '',
        document: updated.document ?? '',
        address: updated.address ?? '',
      })
      setErrors({})
      setNotice({ type: 'success', message: 'Tus datos personales se actualizaron correctamente.' })
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudieron guardar tus datos.',
      })
    } finally {
      setSavingProfile(false)
    }
  }

  function handleAvatarChange(event) {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setNotice({ type: 'error', message: 'Selecciona una imagen válida (JPG, PNG o WEBP).' })
      input.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setNotice({ type: 'error', message: 'La foto de perfil no debe superar los 2 MB.' })
      input.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        onUpdateProfile({ avatar: String(reader.result) })
        setNotice({ type: 'success', message: 'Tu foto de perfil se actualizó correctamente.' })
      } catch (error) {
        setNotice({
          type: 'error',
          message:
            error instanceof Error ? error.message : 'No se pudo actualizar la foto de perfil.',
        })
      }
      input.value = ''
    }
    reader.onerror = () => {
      setNotice({ type: 'error', message: 'No se pudo leer la imagen seleccionada.' })
      input.value = ''
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveAvatar() {
    try {
      onUpdateProfile({ avatar: '' })
      setNotice({ type: 'success', message: 'Se eliminó la foto de perfil.' })
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo eliminar la foto.',
      })
    }
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target
    setPasswordForm((current) => ({ ...current, [name]: value }))
    setPasswordErrors((current) => ({ ...current, [name]: undefined }))
  }

  function togglePasswordVisible(field) {
    setPasswordVisible((current) => {
      switch (field) {
        case 'current':
          return { ...current, current: !current.current }
        case 'next':
          return { ...current, next: !current.next }
        case 'confirm':
          return { ...current, confirm: !current.confirm }
        default:
          return current
      }
    })
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!passwordForm.current) nextErrors.current = 'Ingresa tu contraseña actual.'
    if (!passwordForm.next) nextErrors.next = 'Ingresa tu nueva contraseña.'
    else if (!passwordValid) nextErrors.next = PASSWORD_HELP
    else if (passwordForm.next === passwordForm.current) {
      nextErrors.next = 'La nueva contraseña debe ser diferente a la actual.'
    }
    if (!passwordForm.confirm) nextErrors.confirm = 'Confirma tu nueva contraseña.'
    else if (passwordForm.confirm !== passwordForm.next) {
      nextErrors.confirm = 'Las contraseñas no coinciden.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors)
      return
    }

    setSavingPassword(true)
    setNotice(null)

    try {
      await changeAdminPassword(profile, passwordForm.current, passwordForm.next)
      setPasswordForm({ current: '', next: '', confirm: '' })
      setPasswordErrors({})
      setNotice({
        type: 'success',
        message: 'Tu contraseña se actualizó correctamente. Úsala en tu próximo inicio de sesión.',
      })
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.',
      })
    } finally {
      setSavingPassword(false)
    }
  }

  function toggleNotifications() {
    setNotificationsOpen((current) => {
      const next = !current
      if (next) {
        window.setTimeout(() => {
          notificationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 50)
      }
      return next
    })
  }

  function markNotificationRead(notificationId) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    )
  }

  function markAllNotificationsRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    )
  }

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-400/70 bg-amber-400/10 text-amber-300">
            <UserIcon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[26px]">
              Mi cuenta
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              Visualiza y actualiza tu información personal y preferencias.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleNotifications}
          aria-expanded={notificationsOpen}
          aria-controls="account-notifications"
          className="relative inline-flex items-center justify-center gap-2 self-start rounded-md border border-amber-400/55 bg-black/30 px-3.5 py-2.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
        >
          <BellIcon className="h-4 w-4" />
          Notificaciones
          {unreadCount > 0 && (
            <span className="flex min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-black">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {notice && <PageNotice notice={notice} onClose={() => setNotice(null)} />}

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="min-w-0 space-y-4">
          <section className="relative overflow-hidden rounded-md border border-amber-400/60 bg-[#080705] p-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-amber-300/70 to-transparent"
            />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-amber-400/70 shadow-[0_0_30px_-8px_rgba(245,200,66,0.55)]">
                  <AccountAvatar profile={profile} textClassName="text-3xl" />
                </div>
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#080705] bg-emerald-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.22em] text-amber-500">
                  Perfil de administrador
                </p>
                <h2 className="mt-1 truncate text-xl font-bold text-white">{profile.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-stone-400">
                  <MailIcon className="h-3.5 w-3.5 shrink-0 text-amber-400/70" />
                  {profile.email}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-200">
                    <ShieldIcon className="h-3 w-3" />
                    Administrador
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {profile.authorized === false ? 'Inactivo' : 'Activo'}
                  </span>
                  <span className="text-[10px] text-stone-600">
                    Miembro desde {formatAccountDate(profile.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={secondaryButtonClass}
                >
                  <CameraIcon className="h-3.5 w-3.5" />
                  Cambiar foto
                </button>
                {profile.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="inline-flex items-center justify-center rounded-md border border-rose-500/40 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10"
                  >
                    Quitar foto
                  </button>
                )}
                <p className="text-[9px] leading-4 text-stone-600 sm:text-center">
                  JPG, PNG o WEBP · máx. 2 MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarChange}
                className="sr-only"
                aria-label="Seleccionar foto de perfil"
              />
            </div>
          </section>

          <section className="rounded-md border border-amber-400/60 bg-[#080705] p-5">
            <SectionHeading
              icon={UserIcon}
              title="Datos personales"
              description="Mantén tu información de contacto actualizada."
            />

            <form onSubmit={handleProfileSubmit} noValidate className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="account-name" className={labelClass}>
                    Nombre completo: *
                  </label>
                  <input
                    id="account-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength="80"
                    value={form.name}
                    onChange={handleProfileChange}
                    className={`${fieldClass} ${errors.name ? 'border-rose-500/70' : ''}`}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'account-name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="account-name-error" role="alert" className="mt-1 text-[10px] text-rose-400">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="account-email" className={labelClass}>
                    Correo electrónico: *
                  </label>
                  <input
                    id="account-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleProfileChange}
                    className={`${fieldClass} ${errors.email ? 'border-rose-500/70' : ''}`}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'account-email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="account-email-error" role="alert" className="mt-1 text-[10px] text-rose-400">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="account-phone" className={labelClass}>
                    Teléfono:
                  </label>
                  <div className="relative">
                    <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-400/60" />
                    <input
                      id="account-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength="20"
                      value={form.phone}
                      onChange={handleProfileChange}
                      placeholder="+51 984 123 456"
                      className={`${fieldClass} pl-9 ${errors.phone ? 'border-rose-500/70' : ''}`}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'account-phone-error' : undefined}
                    />
                  </div>
                  {errors.phone && (
                    <p id="account-phone-error" role="alert" className="mt-1 text-[10px] text-rose-400">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="account-document" className={labelClass}>
                    Documento de identidad:
                  </label>
                  <div className="relative">
                    <IdIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-400/60" />
                    <input
                      id="account-document"
                      name="document"
                      type="text"
                      maxLength="20"
                      value={form.document}
                      onChange={handleProfileChange}
                      placeholder="DNI 45678912"
                      className={`${fieldClass} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="account-address" className={labelClass}>
                    Dirección:
                  </label>
                  <div className="relative">
                    <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-400/60" />
                    <input
                      id="account-address"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      maxLength="120"
                      value={form.address}
                      onChange={handleProfileChange}
                      placeholder="Cusco, Perú"
                      className={`${fieldClass} pl-9`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-400/15 pt-4">
                <p className="text-[10px] text-stone-600">
                  Los datos se guardan en tu perfil de administrador.
                </p>
                <button type="submit" disabled={savingProfile} className={primaryButtonClass}>
                  <CheckIcon className="h-3.5 w-3.5" />
                  {savingProfile ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-md border border-amber-400/60 bg-[#080705] p-5">
            <SectionHeading
              icon={LockIcon}
              title="Cambiar contraseña"
              description="Actualiza tu clave de acceso con una contraseña segura."
            />

            <form onSubmit={handlePasswordSubmit} noValidate className="mt-4 space-y-3">
              <PasswordField
                id="account-current-password"
                name="current"
                label="Contraseña actual"
                value={passwordForm.current}
                visible={passwordVisible.current}
                error={passwordErrors.current}
                autoComplete="current-password"
                onChange={handlePasswordChange}
                onToggle={() => togglePasswordVisible('current')}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <PasswordField
                    id="account-new-password"
                    name="next"
                    label="Nueva contraseña"
                    value={passwordForm.next}
                    visible={passwordVisible.next}
                    error={passwordErrors.next}
                    autoComplete="new-password"
                    onChange={handlePasswordChange}
                    onToggle={() => togglePasswordVisible('next')}
                  />
                  <p className="mt-1 text-[9px] leading-4 text-stone-600">{PASSWORD_HELP}</p>
                </div>
                <PasswordField
                  id="account-confirm-password"
                  name="confirm"
                  label="Confirmar contraseña"
                  value={passwordForm.confirm}
                  visible={passwordVisible.confirm}
                  error={passwordErrors.confirm}
                  autoComplete="new-password"
                  onChange={handlePasswordChange}
                  onToggle={() => togglePasswordVisible('confirm')}
                />
              </div>

              <div className="rounded-md border border-amber-400/20 bg-black/25 px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
                  Requisitos de seguridad
                </p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(passwordForm.next)
                    return (
                      <li
                        key={rule.id}
                        className={`flex items-center gap-1.5 text-[10px] ${
                          passed ? 'text-amber-300' : 'text-stone-600'
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
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-400/15 pt-4">
                <p className="text-[10px] text-stone-600">
                  Se solicitará tu contraseña actual antes de aplicar el cambio.
                </p>
                <button type="submit" disabled={savingPassword} className={primaryButtonClass}>
                  <LockIcon className="h-3.5 w-3.5" />
                  {savingPassword ? 'Actualizando…' : 'Actualizar contraseña'}
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside className="space-y-4">
          <section
            id="account-notifications"
            ref={notificationsRef}
            className="scroll-mt-6 overflow-hidden rounded-md border border-amber-400/60 bg-[#080705]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-amber-400/20 px-4 py-3">
              <SectionHeading
                icon={BellIcon}
                title="Notificaciones"
                description={unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
              />
              <button
                type="button"
                onClick={toggleNotifications}
                aria-expanded={notificationsOpen}
                aria-controls="account-notifications-list"
                aria-label={notificationsOpen ? 'Ocultar notificaciones' : 'Ver notificaciones'}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-400/40 text-amber-200 transition hover:bg-amber-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
              >
                <BellIcon className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[8px] font-bold text-black">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {notificationsOpen ? (
              <div id="account-notifications-list">
                <div className="flex items-center justify-between gap-2 border-b border-amber-400/10 px-4 py-2">
                  <p className="text-[10px] text-stone-500">
                    {unreadCount > 0 ? `${unreadCount} pendientes` : 'No hay pendientes'}
                  </p>
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    disabled={unreadCount === 0}
                    className="text-[10px] font-semibold text-amber-400 underline underline-offset-2 transition hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Marcar todas como leídas
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markNotificationRead(notification.id)}
                      className={`flex w-full items-start gap-2.5 border-b border-amber-400/10 px-4 py-3 text-left transition last:border-b-0 hover:bg-amber-400/[0.04] ${
                        notification.read ? 'opacity-55' : ''
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          notification.read ? 'bg-stone-600' : 'bg-amber-400'
                        }`}
                      />
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold text-stone-200">
                          {notification.title}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-stone-500">
                          {notification.description}
                        </span>
                        <span className="mt-1 block text-[9px] text-stone-600">
                          {notification.time}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-4">
                <p className="text-[11px] leading-5 text-stone-500">
                  {unreadCount > 0
                    ? `Tienes ${unreadCount} notificaciones pendientes de revisar.`
                    : 'No tienes notificaciones pendientes.'}
                </p>
                <button
                  type="button"
                  onClick={toggleNotifications}
                  className="mt-2 text-[10px] font-semibold text-amber-400 underline underline-offset-2 transition hover:text-amber-300"
                >
                  Ver notificaciones
                </button>
              </div>
            )}
          </section>

          <section className="rounded-md border border-amber-400/60 bg-[#080705] p-4">
            <SectionHeading
              icon={GlobeIcon}
              title="Preferencias"
              description="Configuración de tu experiencia en el panel."
            />
            <div className="mt-2">
              <PreferenceRow
                icon={GlobeIcon}
                label="Idioma"
                value={languageLabel(profile.language)}
                hint="Idioma de la interfaz."
              />
              <PreferenceRow
                icon={MoonIcon}
                label="Tema"
                value={themeLabel(profile.theme)}
                hint="Apariencia del panel."
              />
              <PreferenceRow
                icon={BellIcon}
                label="Notificaciones"
                value="Activadas"
                hint="Alertas de reservas, pagos y promociones."
              />
            </div>
          </section>

          <section className="rounded-md border border-amber-400/60 bg-[#080705] p-4">
            <SectionHeading
              icon={ShieldIcon}
              title="Información de la cuenta"
              description="Datos de acceso y seguridad."
            />
            <dl className="mt-3 space-y-2.5 text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-500">Rol</dt>
                <dd className="font-semibold text-amber-100">Administrador</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-500">Estado</dt>
                <dd className="inline-flex items-center gap-1.5 font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Activo
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-stone-500">
                  <CalendarIcon className="h-3 w-3" />
                  Miembro desde
                </dt>
                <dd className="text-right text-stone-300">{formatAccountDate(profile.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-500">Último acceso</dt>
                <dd className="text-right text-stone-300">{formatAccountDate(lastAccess)}</dd>
              </div>
              <div className="border-t border-amber-400/10 pt-2.5">
                <dt className="text-stone-500">ID de cuenta</dt>
                <dd className="mt-0.5 break-all font-mono text-[9px] text-stone-500">
                  {profile.id}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </>
  )
}

export default Cuenta
