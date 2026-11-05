import { Router } from 'express';
import { llamarSII, ErrorSII } from '../services/sii.js';
import { requiereToken } from '../middleware/requiereToken.js';

const enrutador = Router();

enrutador.get('/kardex', requiereToken, async (req, res) => {
  try {
    const respuesta = await llamarSII('/movil/estudiante/kardex', { token: req.token });
    const datos = respuesta?.data !== undefined ? respuesta.data : respuesta;
    res.json(datos);
  } catch (error) {
    if (error instanceof ErrorSII) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al consultar el kardex' });
  }
});

enrutador.get('/horarios', requiereToken, async (req, res) => {
  try {
    let respuesta;
    try {
      respuesta = await llamarSII('/movil/estudiante/horario', { token: req.token });
    } catch (errHorario) {
      if (errHorario instanceof ErrorSII && errHorario.status === 401) {
        throw errHorario;
      }
      respuesta = await llamarSII('/movil/estudiante/horarios', { token: req.token });
    }
    const datos = respuesta?.data !== undefined ? respuesta.data : respuesta;
    res.json(datos);
  } catch (error) {
    if (error instanceof ErrorSII) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al consultar los horarios' });
  }
});

export default enrutador;

