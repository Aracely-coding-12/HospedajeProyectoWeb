const shortDateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: 'short',
})

const longDateFormatter = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatSoles(amount) {
  const rounded = Math.round(Number(amount) || 0)
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  return `${rounded < 0 ? '-' : ''}S/ ${grouped}`
}

export function formatShortDate(dateKey) {
  return shortDateFormatter.format(new Date(`${dateKey}T12:00:00`)).replace(/\./g, '')
}

export function formatLongDate(date = new Date()) {
  const formatted = longDateFormatter.format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function todayKey() {
  return dateKey(new Date())
}

export function addDaysKey(dateKeyValue, amount) {
  const date = new Date(`${dateKeyValue}T12:00:00`)
  date.setDate(date.getDate() + amount)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
