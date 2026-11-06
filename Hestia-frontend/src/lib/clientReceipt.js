import { formatSoles } from './format.js'
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from '../data/hestiaData.js'

const RECEIPT_SHELL = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Comprobante de pago</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px 16px; background: #f5f1e8; color: #1c1917; font-family: Georgia, 'Times New Roman', serif; }
    .receipt { width: min(100%, 640px); margin: 0 auto; background: #fffdf8; border: 1px solid #c9a227; border-radius: 12px; overflow: hidden; box-shadow: 0 18px 50px -24px rgba(60, 45, 10, .5); }
    header { padding: 28px 32px; border-bottom: 2px solid #c9a227; background: #120f08; color: #fef3c7; }
    header p { margin: 0; font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: #d6b45c; }
    header h1 { margin: 8px 0 2px; font-size: 30px; letter-spacing: .02em; }
    header span { font-size: 13px; color: #d6d3d1; }
    .body { padding: 28px 32px 32px; }
    .amount { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding: 18px 20px; border: 1px solid #e6d8a9; border-radius: 8px; background: #fbf6e8; }
    .amount small { display: block; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: #78716c; }
    .amount strong { display: block; margin-top: 4px; font-size: 30px; color: #854d0e; }
    .badge { display: inline-block; border: 1px solid #c9a227; border-radius: 999px; padding: 3px 10px; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #713f12; }
    table { width: 100%; margin-top: 24px; border-collapse: collapse; font-family: system-ui, 'Segoe UI', sans-serif; font-size: 13px; }
    th, td { padding: 10px 0; border-bottom: 1px solid #ede9df; text-align: left; vertical-align: top; }
    th { width: 42%; font-weight: 500; color: #78716c; }
    td { color: #292524; font-weight: 600; }
    .note { margin: 22px 0 0; font-family: system-ui, 'Segoe UI', sans-serif; font-size: 11px; line-height: 1.6; color: #78716c; }
    footer { padding: 16px 32px; border-top: 1px solid #e7e5e4; background: #faf8f2; font-family: system-ui, 'Segoe UI', sans-serif; font-size: 10px; color: #a8a29e; display: flex; justify-content: space-between; gap: 12px; }
  </style>
</head>
<body>
  <main class="receipt">
    <header>
      <p>Hestia · Hospedaje Cusco</p>
      <h1>Comprobante de pago</h1>
      <span data-field="code"></span>
    </header>
    <div class="body">
      <div class="amount">
        <div>
          <small>Monto pagado</small>
          <strong data-field="amount"></strong>
        </div>
        <span class="badge" data-field="status"></span>
      </div>
      <table>
        <tbody data-field="rows"></tbody>
      </table>
      <p class="note">Este comprobante acredita el pago registrado en el sistema de Hestia. Consérvalo como constancia de la transacción.</p>
    </div>
    <footer>
      <span>Hospedaje Cusco · Hestia</span>
      <span>Documento generado por el sistema</span>
    </footer>
  </main>
</body>
</html>`

function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? value
}

export function buildClientReceiptHtml({ payment, reservation, client }) {
  const paidAt = String(payment.paidAt ?? '')
  const paidDate = /^\d{4}-\d{2}-\d{2}$/.test(paidAt)
    ? new Date(`${paidAt}T12:00:00`)
    : new Date(paidAt)
  const issuedAt =
    paidAt && !Number.isNaN(paidDate.getTime())
      ? new Intl.DateTimeFormat('es-PE', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(paidDate)
      : '—'

  const rows = [
    ['Cliente', client?.name ?? '—'],
    ['Documento', client?.document ? `${client.documentType ?? 'DNI'} ${client.document}` : '—'],
    ['N° de reserva', reservation?.code ?? '—'],
    [
      'Habitación',
      reservation?.room
        ? `${reservation.room.number} · ${reservation.room.type}`
        : '—',
    ],
    ['Estadía', reservation ? `${reservation.checkIn} al ${reservation.checkOut}` : '—'],
    ['Método de pago', optionLabel(PAYMENT_METHOD_OPTIONS, payment.method)],
    ['Estado', optionLabel(PAYMENT_STATUS_OPTIONS, payment.status)],
    ['Fecha de pago', issuedAt],
  ]

  const doc = new DOMParser().parseFromString(RECEIPT_SHELL, 'text/html')
  const setText = (selector, value) => {
    const element = doc.querySelector(selector)
    if (element) element.textContent = value ?? ''
  }

  setText('title', `Comprobante ${payment.code ?? ''}`)
  setText('[data-field="code"]', payment.code)
  setText('[data-field="amount"]', formatSoles(payment.amount))
  setText('[data-field="status"]', optionLabel(PAYMENT_STATUS_OPTIONS, payment.status))

  const tbody = doc.querySelector('[data-field="rows"]')
  rows.forEach(([label, value]) => {
    const row = doc.createElement('tr')
    const header = doc.createElement('th')
    const cell = doc.createElement('td')

    header.textContent = label
    cell.textContent = value
    row.append(header, cell)
    tbody?.append(row)
  })

  return `<!doctype html>\n${doc.documentElement.outerHTML}`
}

export function downloadClientReceipt(input) {
  const blob = new Blob([buildClientReceiptHtml(input)], {
    type: 'text/html;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `comprobante-${input.payment.code}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
