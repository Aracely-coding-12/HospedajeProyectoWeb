import { useEffect, useState } from 'react'
import {
  addClientToData,
  addPaymentToData,
  addReservationToData,
  cancelReservationInData,
  updateClientInData,
} from './data/hestiaData.js'
import { authenticate } from './lib/adminAuth.js'
import {
  authenticateClient,
  changeClientPassword,
  clearClientSession,
  loadClientSession,
  registerClientAccount,
  saveClientSession,
  updateClientAccount,
} from './lib/clientAuth.js'
import {
  appendNotification,
  appendServiceRequest,
  HESTIA_DATA_KEY,
  HESTIA_NOTIFICATIONS_KEY,
  HESTIA_SERVICE_REQUESTS_KEY,
  loadHestiaData,
  loadNotifications,
  loadServiceRequests,
  saveHestiaData,
  saveNotifications,
  saveServiceRequests,
} from './lib/hestiaStore.js'
import { formatShortDate, formatSoles, todayKey } from './lib/format.js'
import Admin from './page/admin.jsx'
import Login from './page/login.jsx'
import VistaPrincipalCliente from './page/vistaPrincipalCliente.jsx'
import './App.css'

function loadInitialClientSession() {
  const session = loadClientSession()
  if (!session) return null

  const data = loadHestiaData()
  const record = data.clients.find((client) => client.id === session.id)
  if (!record || record.active === false) {
    clearClientSession()
    return null
  }

  return session
}

function App() {
  const [face, setFace] = useState('client')
  const [adminSession, setAdminSession] = useState(null)
  const [clientSession, setClientSession] = useState(loadInitialClientSession)
  const [data, setData] = useState(loadHestiaData)
  const [notifications, setNotifications] = useState(loadNotifications)
  const [serviceRequests, setServiceRequests] = useState(loadServiceRequests)

  useEffect(() => {
    saveHestiaData(data)
  }, [data])

  useEffect(() => {
    saveNotifications(notifications)
  }, [notifications])

  useEffect(() => {
    saveServiceRequests(serviceRequests)
  }, [serviceRequests])

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === HESTIA_DATA_KEY) {
        const nextData = loadHestiaData()
        setData(nextData)

        if (clientSession) {
          const record = nextData.clients.find(
            (client) => client.id === clientSession.id,
          )
          if (!record || record.active === false) {
            clearClientSession()
            setClientSession(null)
          }
        }
      } else if (event.key === HESTIA_NOTIFICATIONS_KEY) {
        setNotifications(loadNotifications())
      } else if (event.key === HESTIA_SERVICE_REQUESTS_KEY) {
        setServiceRequests(loadServiceRequests())
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [clientSession])

  const liveClientRecord = clientSession
    ? data.clients.find((client) => client.id === clientSession.id) ?? null
    : null
  const activeClientSession =
    clientSession && liveClientRecord && liveClientRecord.active !== false
      ? clientSession
      : null

  function pushNotification(input) {
    setNotifications((current) => appendNotification(current, input))
  }

  function handleClientLogout() {
    clearClientSession()
    setClientSession(null)
  }

  function requireActiveClient() {
    if (!activeClientSession) {
      throw new Error(
        'Tu cuenta ya no está activa. Inicia sesión nuevamente o contacta al administrador.',
      )
    }

    return liveClientRecord
  }

  async function handleClientRegister(form) {
    const nextData = addClientToData(data, {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      documentType: form.documentType,
      document: form.document,
      source: 'web',
    })
    const record = nextData.clients.at(-1)

    const account = await registerClientAccount({
      id: record.id,
      name: record.name,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      documentType: form.documentType,
      document: form.document,
      password: form.password,
    })

    setData(nextData)
    setClientSession(account)
    saveClientSession(account)
    pushNotification({
      type: 'cliente',
      title: 'Nuevo cliente registrado',
      message: `${account.name} creó una cuenta de cliente con ${account.email}.`,
      target: 'clientes',
    })

    return account
  }

  async function handleClientLogin({ email, password }) {
    const account = await authenticateClient(email, password)
    if (!account) throw new Error('El correo o la contraseña no son correctos.')

    const record = data.clients.find((client) => client.id === account.id)
    if (!record || record.active === false) {
      throw new Error(
        'Tu cuenta no está habilitada. Contacta al administrador del hospedaje.',
      )
    }

    const session = { ...account, name: record.name || account.name }
    setClientSession(session)
    saveClientSession(session)
    return session
  }

  async function handleUpdateClientProfile(patch) {
    const record = requireActiveClient()
    const name = `${patch.firstName} ${patch.lastName}`.trim()

    const nextData = updateClientInData(data, {
      id: record.id,
      firstName: patch.firstName,
      lastName: patch.lastName,
      email: patch.email,
      phone: patch.phone,
      documentType: patch.documentType,
      document: patch.document,
      active: record.active !== false,
    })

    const account = updateClientAccount(activeClientSession.id, {
      name,
      firstName: patch.firstName,
      lastName: patch.lastName,
      email: patch.email,
      phone: patch.phone,
      documentType: patch.documentType,
      document: patch.document,
    })

    setData(nextData)
    setClientSession(account)
    saveClientSession(account)
    return account
  }

  async function handleChangeClientPassword(currentPassword, newPassword) {
    requireActiveClient()
    await changeClientPassword(activeClientSession.id, currentPassword, newPassword)
    return true
  }

  async function handleCreateReservation(input) {
    const record = requireActiveClient()

    const nextData = addReservationToData(data, {
      roomId: input.roomId,
      clientId: activeClientSession.id,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      promotionCode: input.promotionCode,
      status: 'pendiente',
    })

    const reservation = nextData.reservations.find(
      (item) => !data.reservations.some((existing) => existing.id === item.id),
    )
    const room = nextData.rooms.find((item) => item.id === reservation.roomId)

    setData(nextData)
    pushNotification({
      type: 'reserva',
      title: 'Nueva solicitud de reserva',
      message: `${record.name} solicitó la habitación ${room?.number ?? ''} del ${formatShortDate(
        reservation.checkIn,
      )} al ${formatShortDate(reservation.checkOut)} (${reservation.nights} ${
        reservation.nights === 1 ? 'noche' : 'noches'
      }, ${formatSoles(reservation.total)}).`,
      target: 'reserva',
    })

    return { ...reservation, room }
  }

  async function handleCancelClientReservation(reservationId) {
    const record = requireActiveClient()
    const target = data.reservations.find(
      (reservation) => reservation.id === reservationId,
    )

    if (!target || target.clientId !== activeClientSession.id) {
      throw new Error('La reserva seleccionada no pertenece a tu cuenta.')
    }

    const nextData = cancelReservationInData(data, reservationId)
    setData(nextData)
    pushNotification({
      type: 'reserva',
      title: 'Reserva cancelada por el cliente',
      message: `${record.name} canceló la reserva ${target.code}.`,
      target: 'reserva',
    })

    return nextData.reservations.find((item) => item.id === reservationId) ?? target
  }

  async function handleCreateClientPayment({ reservationId, method }) {
    const record = requireActiveClient()
    const reservation = data.reservations.find((item) => item.id === reservationId)

    if (!reservation || reservation.clientId !== activeClientSession.id) {
      throw new Error('La reserva seleccionada no pertenece a tu cuenta.')
    }
    if (reservation.status !== 'pendiente' && reservation.status !== 'confirmada') {
      throw new Error('Esta reserva ya no admite pagos.')
    }
    if (data.payments.some((payment) => payment.reservationId === reservationId)) {
      throw new Error('Esta reserva ya tiene un pago registrado.')
    }

    const nextData = addPaymentToData(data, {
      reservationNumber: reservation.code,
      method,
      status: 'pagado',
      paidAt: todayKey(),
    })
    const payment = nextData.payments[0]

    setData(nextData)
    pushNotification({
      type: 'pagos',
      title: 'Pago registrado por el cliente',
      message: `${record.name} registró el pago ${payment.code} de ${formatSoles(
        payment.amount,
      )} para la reserva ${reservation.code}.`,
      target: 'pagos',
    })

    return payment
  }

  async function handleRequestClientService({ serviceId, quantity, notes }) {
    const record = requireActiveClient()
    const service = data.services.find((item) => item.id === serviceId)

    if (!service) throw new Error('El servicio seleccionado ya no existe.')
    if (service.status !== 'disponible') {
      throw new Error('El servicio seleccionado no está disponible.')
    }

    const amount = Number(quantity)
    if (!Number.isInteger(amount) || amount < 1 || amount > 10) {
      throw new Error('Indica una cantidad entre 1 y 10.')
    }

    const total = Math.round(service.price * amount * 100) / 100
    const request = {
      id: crypto.randomUUID ? `request-${crypto.randomUUID()}` : `request-${Date.now()}`,
      clientId: activeClientSession.id,
      clientName: record.name,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      price: service.price,
      quantity: amount,
      total,
      notes: String(notes ?? '').trim(),
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    }

    setServiceRequests((current) => appendServiceRequest(current, request))
    pushNotification({
      type: 'servicios',
      title: 'Nueva solicitud de servicio',
      message: `${record.name} solicitó ${amount} × ${service.name} (${formatSoles(
        total,
      )}).${request.notes ? ` Indicaciones: ${request.notes}` : ''}`,
      target: 'servicios',
    })

    return request
  }

  async function handleAdminLogin({ email, password }) {
    const account = await authenticate(email, password)
    if (!account) {
      throw new Error('Las credenciales de administrador no son correctas.')
    }

    // El panel es exclusivo del administrador: no se conserva la sesión de cliente.
    handleClientLogout()
    setAdminSession(account)
    setFace('admin')
  }

  function handleAdminLogout() {
    setAdminSession(null)
    setFace('adminLogin')
  }

  if (face === 'adminLogin') {
    return (
      <Login
        onLogin={handleAdminLogin}
        onBackToClient={() => setFace('client')}
      />
    )
  }

  if (face === 'admin' && adminSession) {
    return (
      <Admin
        session={adminSession}
        data={data}
        onDataChange={setData}
        notifications={notifications}
        onNotificationsChange={setNotifications}
        onLogout={handleAdminLogout}
      />
    )
  }

  return (
    <VistaPrincipalCliente
      session={activeClientSession}
      profile={activeClientSession}
      data={data}
      serviceRequests={serviceRequests}
      onLogin={handleClientLogin}
      onRegister={handleClientRegister}
      onLogout={handleClientLogout}
      onCreateReservation={handleCreateReservation}
      onCancelReservation={handleCancelClientReservation}
      onCreatePayment={handleCreateClientPayment}
      onUpdateProfile={handleUpdateClientProfile}
      onChangePassword={handleChangeClientPassword}
      onRequestService={handleRequestClientService}
      onAdminAccess={() => setFace('adminLogin')}
    />
  )
}

export default App
