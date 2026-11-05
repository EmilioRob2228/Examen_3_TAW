export class ErrorSII extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

export async function llamarSII(ruta, { metodo = 'GET', token, cuerpo } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${process.env.SII_URL}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
  } catch {
    throw new ErrorSII(502, 'El servidor del SII no está disponible');
  }

  const datos = await respuesta.json().catch(() => null);

  if (respuesta.status === 401 || datos?.status === 401) {
    throw new ErrorSII(401, 'Sesión inválida o expirada');
  }
  if (!respuesta.ok) {
    throw new ErrorSII(502, 'El SII respondió con un error');
  }

  return datos;
}

export function responderError(res, error) {
  if (error instanceof ErrorSII) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor' });
}
