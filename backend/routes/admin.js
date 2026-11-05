import { Router } from 'express';
import { supabase } from '../services/supabase.js';
import { requiereToken } from '../middleware/requiereToken.js';
import { esAdmin } from '../middleware/esAdmin.js';

const enrutador = Router();

enrutador.use(requiereToken);
enrutador.use(esAdmin);

enrutador.get('/areas', async (req, res) => {
  try {
    const { data: areas, error: errorAreas } = await supabase
      .from('areas')
      .select('*, area_materias(*)')
      .order('id');

    if (errorAreas) {
      return res.status(500).json({ error: 'Error al obtener las áreas' });
    }

    res.json(areas);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

enrutador.post('/areas', async (req, res) => {
  try {
    const { nombre, descripcion, recomendacion } = req.body || {};
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const { data, error } = await supabase
      .from('areas')
      .insert([{
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || '',
        recomendacion: recomendacion?.trim() || ''
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al crear el área' });
    }

    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

enrutador.put('/areas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, recomendacion } = req.body || {};

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const { data, error } = await supabase
      .from('areas')
      .update({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || '',
        recomendacion: recomendacion?.trim() || ''
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar el área' });
    }

    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

enrutador.delete('/areas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('areas')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error al eliminar el área' });
    }

    res.json({ mensaje: 'Área eliminada correctamente' });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

enrutador.post('/areas/:id/materias', async (req, res) => {
  try {
    const { id } = req.params;
    const { clave_materia, nombre_materia, peso } = req.body || {};

    if (!clave_materia || !clave_materia.trim()) {
      return res.status(400).json({ error: 'La clave de la materia es obligatoria' });
    }

    if (!nombre_materia || !nombre_materia.trim()) {
      return res.status(400).json({ error: 'El nombre de la materia es obligatorio' });
    }

    const pesoNumero = Number(peso);
    if (Number.isNaN(pesoNumero) || pesoNumero <= 0) {
      return res.status(400).json({ error: 'El peso debe ser un número mayor a cero' });
    }

    const { data, error } = await supabase
      .from('area_materias')
      .upsert({
        area_id: id,
        clave_materia: clave_materia.trim(),
        nombre_materia: nombre_materia.trim(),
        peso: pesoNumero
      }, { onConflict: 'area_id,clave_materia' })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error al asignar la materia al área' });
    }

    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

enrutador.delete('/areas/:id/materias/:clave', async (req, res) => {
  try {
    const { id, clave } = req.params;
    const { error } = await supabase
      .from('area_materias')
      .delete()
      .eq('area_id', id)
      .eq('clave_materia', clave);

    if (error) {
      return res.status(500).json({ error: 'Error al remover la materia del área' });
    }

    res.json({ mensaje: 'Materia eliminada del área correctamente' });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

enrutador.get('/configuracion', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('valor')
      .eq('clave', 'min_materias')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Error al obtener la configuración' });
    }

    const minMaterias = data ? parseInt(data.valor, 10) : 3;
    res.json({ min_materias: minMaterias });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

enrutador.put('/configuracion', async (req, res) => {
  try {
    const { min_materias } = req.body || {};
    const minNumero = Number(min_materias);

    if (!Number.isInteger(minNumero) || minNumero < 1) {
      return res.status(400).json({ error: 'min_materias debe ser un número entero mayor o igual a 1' });
    }

    const { error } = await supabase
      .from('configuracion')
      .upsert({
        clave: 'min_materias',
        valor: String(minNumero)
      });

    if (error) {
      return res.status(500).json({ error: 'Error al guardar la configuración' });
    }

    res.json({ min_materias: minNumero });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default enrutador;

