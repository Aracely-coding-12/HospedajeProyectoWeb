// Historia de correo electrónico y contraseña de administrador
export function esCorreoValido(c) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)
}

export function esClaveValida(p) {
  return p.length >= 12
}

// Validaciones para crear una cuenta de administrador
export function esNombreCompletoValido(nombre) {
  return typeof nombre === 'string' && nombre.trim().split(/\s+/).length >= 2
}

export function esCorreoUnico(correo, cuentas = []) {
  if (!esCorreoValido(correo)) return false

  const normalizado = correo.trim().toLowerCase()
  return !cuentas.some(
    (cuenta) => cuenta.email?.trim().toLowerCase() === normalizado,
  )
}

export function esClaveSegura(clave) {
  return (
    typeof clave === 'string' &&
    esClaveValida(clave) &&
    /[A-Z]/.test(clave) &&
    /[a-z]/.test(clave) &&
    /\d/.test(clave) &&
    /[^A-Za-z0-9]/.test(clave)
  )
}

export function validarDatosRegistro(datos, cuentas = []) {
  const errores = {}
  const { nombre, correo, clave } = datos

  if (!esNombreCompletoValido(nombre)) errores.nombre = 'Ingresa nombre y apellido.'
  if (!esCorreoValido(correo)) errores.correo = 'Ingresa un correo válido.'
  else if (!esCorreoUnico(correo, cuentas)) {
    errores.correo = 'El correo electrónico ya está registrado.'
  }
  if (!esClaveSegura(clave)) errores.clave = 'La contraseña no es segura.'

  return errores
}
