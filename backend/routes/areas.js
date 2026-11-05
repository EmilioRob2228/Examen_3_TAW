import { Router } from 'express';
import { llamarSII, ErrorSII } from '../services/sii.js';
import { supabase } from '../services/supabase.js';
import { requiereToken } from '../middleware/requiereToken.js';

const enrutador = Router();

enrutador.get('/resultado', requiereToken, async (req, res) => {
  try {
    const respuestaSII = await llamarSII('/movil/estudiante/kardex', { token: req.token });
    const listaKardex = respuestaSII?.data?.kardex || respuestaSII?.kardex || [];

    const materiasKardex = new Map();
    for (const item of listaKardex) {
      const clave = item.clave_materia?.trim();
      const califTexto = item.calificacion !== undefined && item.calificacion !== null ? String(item.calificacion).trim() : '';
      const califNumero = Number(califTexto);
      if (clave && califTexto !== '' && !Number.isNaN(califNumero)) {
        materiasKardex.set(clave, {
          clave,
          nombre: item.nombre_materia,
          calificacion: califNumero
        });
      }
    }

    const { data: configFila } = await supabase
      .from('configuracion')
      .select('valor')
      .eq('clave', 'min_materias')
      .maybeSingle();

    let minMaterias = configFila ? parseInt(configFila.valor, 10) : 3;
    if (Number.isNaN(minMaterias) || minMaterias < 1) {
      minMaterias = 3;
    }

    const { data: areasRegistradas, error: errorAreas } = await supabase
      .from('areas')
      .select('*')
      .order('id');

    if (errorAreas) {
      return res.status(500).json({ error: 'Error al consultar las áreas' });
    }

    const { data: materiasRegistradas, error: errorMaterias } = await supabase
      .from('area_materias')
      .select('*');

    if (errorMaterias) {
      return res.status(500).json({ error: 'Error al consultar las materias de las áreas' });
    }

    const materiasPorArea = new Map();
    for (const materia of materiasRegistradas || []) {
      if (!materiasPorArea.has(materia.area_id)) {
        materiasPorArea.set(materia.area_id, []);
      }
      materiasPorArea.get(materia.area_id).push(materia);
    }

    const areasCalculadas = (areasRegistradas || []).map(area => {
      const materiasConfiguradas = materiasPorArea.get(area.id) || [];
      const materiasUsadas = [];
      let sumaPonderada = 0;
      let sumaPesos = 0;

      for (const materiaConfig of materiasConfiguradas) {
        const clave = materiaConfig.clave_materia?.trim();
        const cursada = materiasKardex.get(clave);
        if (cursada) {
          const peso = Number(materiaConfig.peso) || 1;
          sumaPonderada += cursada.calificacion * peso;
          sumaPesos += peso;
          materiasUsadas.push({
            clave: cursada.clave,
            nombre: cursada.nombre || materiaConfig.nombre_materia,
            calificacion: cursada.calificacion
          });
        }
      }

      const tieneSuficientes = materiasUsadas.length >= minMaterias;
      let promedioFinal = null;

      if (tieneSuficientes && sumaPesos > 0) {
        promedioFinal = Number((sumaPonderada / sumaPesos).toFixed(1));
      }

      return {
        id: area.id,
        nombre: area.nombre,
        descripcion: area.descripcion || '',
        recomendacion: area.recomendacion || '',
        promedio: promedioFinal,
        suficiente: tieneSuficientes,
        materias_usadas: materiasUsadas.length,
        materias_totales: materiasConfiguradas.length,
        materias: materiasUsadas
      };
    });

    const areasSuficientes = areasCalculadas
      .filter(a => a.suficiente)
      .sort((a, b) => b.promedio - a.promedio);

    const areasInsuficientes = areasCalculadas.filter(a => !a.suficiente);
    const listaOrdenada = [...areasSuficientes, ...areasInsuficientes];

    const suficienteGlobal = areasSuficientes.length >= 2;
    let recomendada = null;

    if (suficienteGlobal && areasSuficientes.length > 0) {
      const mejorArea = areasSuficientes[0];
      recomendada = {
        id: mejorArea.id,
        nombre: mejorArea.nombre,
        promedio: mejorArea.promedio,
        recomendacion: mejorArea.recomendacion
      };
    }

    res.json({
      suficiente: suficienteGlobal,
      min_materias: minMaterias,
      recomendada,
      areas: listaOrdenada
    });
  } catch (error) {
    if (error instanceof ErrorSII) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al calcular el resultado de áreas' });
  }
});

export default enrutador;

