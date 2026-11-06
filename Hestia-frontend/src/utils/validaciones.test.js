import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_ADMIN,
  authenticate,
  isStrongPassword,
  isValidEmail,
} from '../lib/adminAuth.js'
import {
  authenticateClient,
  CLIENTS_KEY,
  registerClientAccount,
} from '../lib/clientAuth.js'
import { buildDashboardSummary, toDateKey } from '../data/hestiaData.js'
import { validarDatosRegistro } from './validaciones.js'

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

describe('validaciones reutilizadas por el formulario de registro', () => {
  it('acepta los datos correctos y reporta errores de nombre, correo duplicado y contraseña', () => {
    const accounts = [{ email: 'registrado@example.com' }]

    expect(
      validarDatosRegistro(
        {
          nombre: 'Ana Pérez',
          correo: 'nuevo@example.com',
          clave: 'HestiaSegura123!',
        },
        accounts,
      ),
    ).toEqual({})

    expect(
      validarDatosRegistro(
        {
          nombre: 'Ana',
          correo: 'REGISTRADO@example.com',
          clave: 'debil',
        },
        accounts,
      ),
    ).toEqual({
      nombre: 'Ingresa nombre y apellido.',
      correo: 'El correo electrónico ya está registrado.',
      clave: 'La contraseña no es segura.',
    })
  })
})

describe('criterios de inicio de sesión', () => {
  it('1. permite ingresar con correo electrónico y contraseña válidos', async () => {
    expect(isValidEmail(DEFAULT_ADMIN.email)).toBe(true)

    const admin = await authenticate(DEFAULT_ADMIN.email, DEFAULT_ADMIN.password)

    expect(admin).toMatchObject({
      email: DEFAULT_ADMIN.email,
      role: 'admin',
      authorized: true,
    })
  })

  it('2. rechaza credenciales incorrectas', async () => {
    expect(isValidEmail('correo-invalido')).toBe(false)

    const admin = await authenticate(DEFAULT_ADMIN.email, 'Incorrecta123!')

    expect(admin).toBeNull()
  })

  it.todo('4. muestra el mensaje de éxito o error según el resultado de la autenticación')

  it('5. valida la contraseña con las reglas usadas por los formularios', () => {
    expect(isStrongPassword('HestiaSegura123!')).toBe(true)
    expect(isStrongPassword('Corta123!')).toBe(false)
    expect(isStrongPassword('hestia segura123!')).toBe(false)
  })

  it.todo('6. lleva al formulario de creación de cuenta al seleccionar “Crear cuenta”')
})

describe('funciones de registro y acceso de clientes usadas por el sistema', () => {
  const clientInput = {
    id: 'client-test-1',
    name: 'Ana Pérez',
    email: ' ANA@EXAMPLE.COM ',
    password: 'HestiaSegura123!',
  }

  it('registra una cuenta con correo normalizado, rol de cliente y contraseña no expuesta', async () => {
    const account = await registerClientAccount(clientInput)

    expect(account).toMatchObject({
      id: clientInput.id,
      name: clientInput.name,
      email: 'ana@example.com',
      role: 'client',
      authorized: true,
    })
    expect(account).not.toHaveProperty('passwordHash')

    const storedAccounts = JSON.parse(storage.get(CLIENTS_KEY))
    expect(storedAccounts[0]).toHaveProperty('passwordHash')
  })

  it('permite iniciar sesión con la cuenta registrada y rechaza una contraseña incorrecta', async () => {
    await registerClientAccount(clientInput)

    await expect(authenticateClient('ana@example.com', clientInput.password)).resolves.toMatchObject({
      id: clientInput.id,
      role: 'client',
      email: 'ana@example.com',
    })
    await expect(authenticateClient('ana@example.com', 'OtraClave123!')).resolves.toBeNull()
  })

  it('rechaza correo inválido, contraseña débil y correo ya registrado', async () => {
    await expect(
      registerClientAccount({ ...clientInput, email: 'correo-invalido' }),
    ).rejects.toThrow('Ingresa un correo electrónico válido.')
    await expect(
      registerClientAccount({ ...clientInput, password: 'débil' }),
    ).rejects.toThrow('La contraseña no cumple los requisitos de seguridad.')

    await registerClientAccount(clientInput)
    await expect(
      registerClientAccount({ ...clientInput, id: 'client-test-2' }),
    ).rejects.toThrow('Ya existe una cuenta de cliente con este correo electrónico.')
  })

  it('no permite registrar como cliente el correo reservado al administrador', async () => {
    await expect(
      registerClientAccount({ ...clientInput, email: DEFAULT_ADMIN.email }),
    ).rejects.toThrow('Ese correo electrónico no está disponible para una cuenta de cliente.')
  })
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