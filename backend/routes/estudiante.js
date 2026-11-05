import { Router } from 'express';
import { llamarSII, responderError } from '../services/sii.js';
import { requiereToken } from '../middleware/requiereToken.js';

const router = Router();

router.get('/estudiante', requiereToken, async (req, res) => {
  try {
    const { data } = await llamarSII('/movil/estudiante', { token: req.token });
    res.json({
      ...data,
      promedio_ponderado: Number(Number(data.promedio_ponderado).toFixed(2)),
      promedio_aritmetico: Number(Number(data.promedio_aritmetico).toFixed(2)),
      creditos_acumulados: Number(data.creditos_acumulados),
      materias_cursadas: Number(data.materias_cursadas),
      materias_aprobadas: Number(data.materias_aprobadas),
      materias_reprobadas: Number(data.materias_reprobadas)
    });
  } catch (error) {
    responderError(res, error);
  }
});

function calcularFinal(parciales) {
  const capturadas = parciales.filter(p => p !== null);
  if (capturadas.length === 0) return null;
  const suma = capturadas.reduce((total, p) => total + p, 0);
  return Math.round(suma / capturadas.length);
}

router.get('/calificaciones', requiereToken, async (req, res) => {
  try {
    const { data } = await llamarSII('/movil/estudiante/calificaciones', { token: req.token });

    const materias = data.flatMap(({ periodo, materias }) =>
      materias.map(({ materia, calificaiones }) => {
        const parciales = calificaiones
          .sort((a, b) => a.numero_calificacion - b.numero_calificacion)
          .map(c => (c.calificacion === null ? null : Number(c.calificacion)));

        return {
          clave_materia: materia.clave_materia,
          nombre_materia: materia.nombre_materia,
          grupo: materia.letra_grupo,
          periodo: periodo.descripcion_periodo,
          parciales,
          calificacion_final: calcularFinal(parciales)
        };
      })
    );

    res.json(materias);
  } catch (error) {
    responderError(res, error);
  }
});

export default router;
