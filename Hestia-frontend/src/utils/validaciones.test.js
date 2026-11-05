import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ADMINS_KEY, DEFAULT_ADMIN, authenticate } from '../lib/adminAuth.js'
import {
  esClaveSegura,
  esClaveValida,
  esCorreoUnico,
  esCorreoValido,
  esNombreCompletoValido,
  validarDatosRegistro,
} from './validaciones.js'
import { buildDashboardSummary, toDateKey } from '../data/hestiaData.js'

const storage = new Map()

beforeEach(() => {
  storage.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('criterios de inicio de sesión', () => {
  it('1. permite ingresar con correo electrónico y contraseña válidos', async () => {
    expect(esCorreoValido(DEFAULT_ADMIN.email)).toBe(true)
    expect(esClaveValida(DEFAULT_ADMIN.password)).toBe(true)

    const admin = await authenticate(DEFAULT_ADMIN.email, DEFAULT_ADMIN.password)

    expect(admin).toMatchObject({
      email: DEFAULT_ADMIN.email,
      role: 'admin',
      authorized: true,
    })
  })

  it('2. rechaza credenciales incorrectas', async () => {
    expect(esCorreoValido('correo-invalido')).toBe(false)

    const admin = await authenticate(DEFAULT_ADMIN.email, 'Incorrecta123!')

    expect(admin).toBeNull()
  })

  it('3. rechaza una cuenta que no está autorizada como administradora', async () => {
    storage.set(
      ADMINS_KEY,
      JSON.stringify([
        {
          id: 'admin-no-autorizado',
          email: 'no-autorizado@hestia.com',
          role: 'admin',
          authorized: false,
          passwordHash: 'no-se-verifica',
        },
      ]),
    )

    const admin = await authenticate('no-autorizado@hestia.com', 'Valida123!Clave')

    expect(admin).toBeNull()
  })

  it.todo('4. muestra el mensaje de éxito o error según el resultado de la autenticación')

  it('5. rechaza contraseñas con menos de 12 caracteres', () => {
    expect(esClaveValida('HestiaSegura123!')).toBe(true)
    expect(esClaveValida('Corta123!')).toBe(false)
  })

  it.todo('6. lleva al formulario de creación de cuenta al seleccionar “Crear cuenta”')
})

describe('criterios de registro de administrador', () => {
  it('1. requiere nombre y apellido', () => {
    expect(esNombreCompletoValido('Ana Pérez')).toBe(true)
    expect(esNombreCompletoValido('Ana')).toBe(false)
    expect(esNombreCompletoValido('   ')).toBe(false)
  })

  it('2. acepta un correo válido que no esté registrado', () => {
    const cuentas = [{ email: 'admin@hestia.com' }]

    expect(esCorreoUnico('nuevo@hestia.com', cuentas)).toBe(true)
    expect(esCorreoUnico('ADMIN@HESTIA.COM', cuentas)).toBe(false)
    expect(esCorreoUnico('correo-invalido', cuentas)).toBe(false)
  })

  it('3. requiere una contraseña de al menos 12 caracteres con mayúscula, minúscula, número y símbolo', () => {
    expect(esClaveSegura('HestiaSegura123!')).toBe(true)
    expect(esClaveSegura('Hestia123')).toBe(false)
    expect(esClaveSegura('hestiasegura123!')).toBe(false)
  })

  it.todo(
    '4. asigna el rol y los permisos seleccionados; exponer la función que construye la cuenta con su rol y permisos',
  )

  it('5. valida todos los datos antes de crear la cuenta', () => {
    const errores = validarDatosRegistro(
      { nombre: 'Ana', correo: 'admin@hestia.com', clave: 'débil' },
      [{ email: 'admin@hestia.com' }],
    )

    expect(errores).toEqual({
      nombre: 'Ingresa nombre y apellido.',
      correo: 'El correo electrónico ya está registrado.',
      clave: 'La contraseña no es segura.',
    })
  })

  it.todo(
    '6. muestra confirmación al crear la cuenta; exponer el resultado visible o el callback de éxito del formulario',
  )
})

describe('criterios del panel principal', () => {
  const now = new Date(2026, 10, 5, 12)
  const todayKey = toDateKey(now)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const future = new Date(now)
  future.setDate(future.getDate() + 3)
  const data = {
    rooms: [{ id: 'room-1' }, { id: 'room-2' }, { id: 'room-3' }],
    reservations: [
      {
        id: 'reservation-today',
        status: 'confirmada',
        createdAt: `${todayKey}T10:00:00`,
        checkIn: toDateKey(future),
        checkOut: toDateKey(new Date(future.getTime() + 86400000)),
        roomId: 'room-1',
        code: 'HES-0001',
        guestName: 'Ana Pérez',
        total: 100,
      },
      {
        id: 'reservation-recent',
        status: 'finalizada',
        createdAt: `${todayKey}T11:00:00`,
        checkIn: todayKey,
        checkOut: todayKey,
        roomId: 'room-2',
        code: 'HES-0002',
        guestName: 'Luis Rojas',
        total: 150,
      },
      {
        id: 'reservation-cancelled',
        status: 'cancelada',
        createdAt: `${todayKey}T09:00:00`,
        checkIn: todayKey,
        checkOut: todayKey,
        roomId: 'room-3',
        code: 'HES-0003',
        guestName: 'María Flores',
        total: 80,
      },
      {
        id: 'reservation-upcoming',
        status: 'pendiente',
        createdAt: '2026-11-04T10:00:00',
        checkIn: toDateKey(tomorrow),
        checkOut: toDateKey(new Date(tomorrow.getTime() + 86400000)),
        roomId: 'room-3',
        code: 'HES-0004',
        guestName: 'Carlos Quispe',
        total: 120,
      },
    ],
    clients: [{ id: 'client-1' }, { id: 'client-2' }],
    payments: [
      { amount: 75, paidAt: `${todayKey}T10:00:00`, status: 'pagado' },
      { amount: 25, paidAt: `${todayKey}T11:00:00`, status: 'pendiente' },
      { amount: 40, paidAt: '2026-11-04T10:00:00', status: 'pagado' },
    ],
  }

  const summary = buildDashboardSummary(data, now)

  it('1. muestra la cantidad total de habitaciones registradas', () => {
    expect(summary.rooms.total).toBe(3)
  })

  it('2. muestra la cantidad de reservas creadas en el día', () => {
    expect(summary.reservationsToday).toBe(2)
  })

  it('3. muestra la cantidad de clientes registrados', () => {
    expect(summary.clients).toBe(2)
  })

  it('4. muestra el monto de los pagos recibidos en el día', () => {
    expect(summary.revenueToday).toBe(75)
  })

  it('5. muestra las próximas reservas y las reservas recientes', () => {
    expect(summary.upcomingReservations.map((reservation) => reservation.id)).toEqual([
      'reservation-upcoming',
      'reservation-today',
    ])
    expect(summary.recentReservations.map((reservation) => reservation.id)).toEqual([
      'reservation-recent',
      'reservation-today',
      'reservation-upcoming',
    ])
  })

  it.todo(
    '6. el botón “Crear reserva” abre el formulario de reservas; requiere pruebas de interacción del componente Inicio',
  )
})