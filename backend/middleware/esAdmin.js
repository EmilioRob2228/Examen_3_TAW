import { llamarSII, ErrorSII } from '../services/sii.js';

export async function esAdmin(req, res, next) {
  try {
    const respuesta = await llamarSII('/movil/estudiante', { token: req.token });
    const correoEstudiante = respuesta?.data?.email?.trim().toLowerCase();

    const correosAdmin = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(c => c.trim().toLowerCase())
      .filter(Boolean);

    if (!correoEstudiante || !correosAdmin.includes(correoEstudiante)) {
      return res.status(403).json({ error: 'No tienes acceso de administrador' });
    }

    req.estudiante = respuesta.data;
    next();
  } catch (error) {
    if (error instanceof ErrorSII) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Error al verificar permisos de administrador' });
  }
}

