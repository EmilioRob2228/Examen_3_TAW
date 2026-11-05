const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function obtenerToken() {
  return sessionStorage.getItem('token');
}

export function guardarToken(token) {
  sessionStorage.setItem('token', token);
}

export function eliminarToken() {
  sessionStorage.removeItem('token');
}

async function peticion(ruta, opciones = {}) {
  const token = obtenerToken();
  const encabezados = {
    'Content-Type': 'application/json',
    ...(opciones.headers || {})
  };

  if (token) {
    encabezados.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    ...opciones,
    headers: encabezados
  });

  if (respuesta.status === 401) {
    eliminarToken();
    window.dispatchEvent(new Event('sesion_expirada'));
    const datosError = await respuesta.json().catch(() => null);
    throw new Error(datosError?.error || 'Sesión expirada o no autorizada');
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(datos?.error || 'Error en la solicitud');
  }

  return datos;
}

export async function obtenerKardex() {
  return peticion('/api/kardex');
}

export async function obtenerHorarios() {
  return peticion('/api/horarios');
}

export async function obtenerResultadoAreas() {
  return peticion('/api/areas/resultado');
}

export async function obtenerAreasAdmin() {
  return peticion('/api/admin/areas');
}

export async function crearAreaAdmin(datosArea) {
  return peticion('/api/admin/areas', {
    method: 'POST',
    body: JSON.stringify(datosArea)
  });
}

export async function editarAreaAdmin(id, datosArea) {
  return peticion(`/api/admin/areas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datosArea)
  });
}

export async function eliminarAreaAdmin(id) {
  return peticion(`/api/admin/areas/${id}`, {
    method: 'DELETE'
  });
}

export async function asignarMateriaAdmin(areaId, materia) {
  return peticion(`/api/admin/areas/${areaId}/materias`, {
    method: 'POST',
    body: JSON.stringify(materia)
  });
}

export async function quitarMateriaAdmin(areaId, clave) {
  return peticion(`/api/admin/areas/${areaId}/materias/${clave}`, {
    method: 'DELETE'
  });
}

export async function obtenerConfiguracionAdmin() {
  return peticion('/api/admin/configuracion');
}

export async function actualizarConfiguracionAdmin(minMaterias) {
  return peticion('/api/admin/configuracion', {
    method: 'PUT',
    body: JSON.stringify({ min_materias: minMaterias })
  });
}

