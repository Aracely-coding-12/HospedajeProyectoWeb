function Icon({ className = '', strokeWidth = 1.8, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}

export function ArrowRightIcon({ className = '' }) {
  return (
    <Icon className={className} strokeWidth={2}>
      <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function AlertIcon({ className = '' }) {
  return (
    <Icon className={className} strokeWidth={2.1}>
      <path d="M12 7v6" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </Icon>
  )
}

export function BedIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="M3.5 18V8.5m0 6h17V18m0 0v2m0-2h-17v2" strokeLinecap="round" />
      <path d="M6.5 14.5V7.8A1.8 1.8 0 0 1 8.3 6h7.4a1.8 1.8 0 0 1 1.8 1.8v6.7" strokeLinecap="round" />
      <path d="M6.5 11h11" strokeLinecap="round" />
    </Icon>
  )
}

export function CalendarIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M8 3.5v3M16 3.5v3M3.5 9.5h17" strokeLinecap="round" />
    </Icon>
  )
}

export function CheckIcon({ className = '' }) {
  return (
    <Icon className={className} strokeWidth={2.2}>
      <path d="m5 12.5 4.2 4.2L19 6.8" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function ChevronDownIcon({ className = '' }) {
  return (
    <Icon className={className} strokeWidth={2}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function CloseIcon({ className = '' }) {
  return (
    <Icon className={className} strokeWidth={2}>
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </Icon>
  )
}

export function CoffeeIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="M5 8h11v5.5A4.5 4.5 0 0 1 11.5 18h-2A4.5 4.5 0 0 1 5 13.5V8Z" />
      <path d="M16 9.5h1.8a2.7 2.7 0 0 1 0 5.4H16M8 4.5v1.2M11.5 4.5v1.2" strokeLinecap="round" />
    </Icon>
  )
}

export function CreditCardIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 14.5h4" strokeLinecap="round" />
    </Icon>
  )
}

export function DownloadIcon({ className = '' }) {
  return (
    <Icon className={className} strokeWidth={1.9}>
      <path d="M12 3.5v11m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 16.5v2A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-2" strokeLinecap="round" />
    </Icon>
  )
}

export function EyeIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="M2.5 12S5.5 6.5 12 6.5 21.5 12 21.5 12 18.5 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </Icon>
  )
}

export function EyeOffIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="M2.5 12S5.5 6.5 12 6.5 21.5 12 21.5 12 18.5 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
      <path d="M4 4l16 16" strokeLinecap="round" />
    </Icon>
  )
}

export function LogoutIcon({ className = '' }) {
  return (
    <Icon className={className} strokeWidth={1.9}>
      <path d="M10 4.5H6.5A2.5 2.5 0 0 0 4 7v10a2.5 2.5 0 0 0 2.5 2.5H10" strokeLinecap="round" />
      <path d="M14.5 8.5 18 12l-3.5 3.5M9 12h9" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function MailIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function MapPinIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  )
}

export function MenuIcon({ className = '' }) {
  return (
    <Icon className={className} strokeWidth={2}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </Icon>
  )
}

export function PhoneIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="M7.5 3.5h-2A2.5 2.5 0 0 0 3 6c0 8.3 6.7 15 15 15a2.5 2.5 0 0 0 2.5-2.5v-2l-4.2-1.4-1.9 2a12.6 12.6 0 0 1-5.5-5.5l2-1.9L7.5 3.5Z" strokeLinejoin="round" />
    </Icon>
  )
}

export function SearchIcon({ className = '' }) {
  return (
    <Icon className={className} strokeWidth={1.9}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </Icon>
  )
}

export function ShieldIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.3-7 9-4.1-1.7-7-4.7-7-9V6l7-2.5Z" strokeLinejoin="round" />
      <path d="m8.8 12 2.1 2.1 4.4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function SparklesIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" strokeLinejoin="round" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" strokeLinejoin="round" />
    </Icon>
  )
}

export function StarIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="m12 3.8 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8L12 3.8Z" strokeLinejoin="round" />
    </Icon>
  )
}

export function TagIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="m4 4 6.2.4L20 14.2a2 2 0 0 1 0 2.8l-3 3a2 2 0 0 1-2.8 0L4.4 10.2 4 4Z" strokeLinejoin="round" />
      <circle cx="8.3" cy="8.3" r="1.4" />
    </Icon>
  )
}

export function UserIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
    </Icon>
  )
}

export function UsersIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
      <path d="M15.5 5.8a3.2 3.2 0 0 1 0 5.4M17 14.5a5.5 5.5 0 0 1 3.5 5" strokeLinecap="round" />
    </Icon>
  )
}

export function WifiIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="M3.5 9a13 13 0 0 1 17 0M6.5 12.5a8.5 8.5 0 0 1 11 0M9.5 16a4 4 0 0 1 5 0" strokeLinecap="round" />
      <circle cx="12" cy="19" r=".8" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function ClockIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function PlusIcon({ className = '' }) {
  return (
    <Icon className={className} strokeWidth={2}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </Icon>
  )
}

export function MinusIcon({ className = '' }) {
  return (
    <Icon className={className} strokeWidth={2}>
      <path d="M5 12h14" strokeLinecap="round" />
    </Icon>
  )
}

export function BuildingIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="M4 20.5V5.5A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5v15M15 9.5h3.5A1.5 1.5 0 0 1 20 11v9.5M7.5 8h1M11 8h1M7.5 11.5h1M11 11.5h1M7.5 15h1M11 15h1M3 20.5h18" strokeLinecap="round" />
    </Icon>
  )
}

export function LockIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" strokeLinecap="round" />
      <path d="M12 14v2.5" strokeLinecap="round" />
    </Icon>
  )
}

export function ReceiptIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <path d="M6 3.5h12v17l-2.2-1.5-1.8 1.5-2-1.5-2 1.5-1.8-1.5L6 20.5v-17Z" strokeLinejoin="round" />
      <path d="M9 8h6M9 11.5h6M9 15h4" strokeLinecap="round" />
    </Icon>
  )
}

export function IdIcon({ className = '' }) {
  return (
    <Icon className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.5 16a3.2 3.2 0 0 1 6 0M14 9.5h4M14 13h4" strokeLinecap="round" />
    </Icon>
  )
}
