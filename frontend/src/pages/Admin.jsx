import { useState, useEffect } from 'react';
import {
  obtenerAreasAdmin,
  crearAreaAdmin,
  editarAreaAdmin,
  eliminarAreaAdmin,
  asignarMateriaAdmin,
  quitarMateriaAdmin,
  obtenerConfiguracionAdmin,
  actualizarConfiguracionAdmin
} from '../services/api';
import { LoaderCircle, ShieldAlert, SlidersHorizontal, Plus, Pencil, Trash2, ListChecks, X, CircleCheck, CircleAlert } from 'lucide-react';

const CAMPO = 'mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-theme-xs outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10';
const ETIQUETA = 'block text-sm font-medium text-gray-700';
const BOTON_PRIMARIO = 'inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-700';
const BOTON_SECUNDARIO = 'inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50';
const BOTON_ICONO = 'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium';
const TARJETA = 'rounded-2xl border border-gray-200 bg-white shadow-theme-xs';

export default function Admin() {
  const [areas, setAreas] = useState([]);
  const [minMaterias, setMinMaterias] = useState(3);
  const [cargando, setCargando] = useState(true);
  const [esNoAutorizado, setEsNoAutorizado] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const [formularioArea, setFormularioArea] = useState({
    nombre: '',
    descripcion: '',
    recomendacion: ''
  });
  const [editandoId, setEditandoId] = useState(null);

  const [areaSeleccionadaMaterias, setAreaSeleccionadaMaterias] = useState(null);
  const [formularioMateria, setFormularioMateria] = useState({
    clave_materia: '',
    nombre_materia: '',
    peso: 1
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setMensaje({ tipo: '', texto: '' });
      const [datosAreas, datosConfig] = await Promise.all([
        obtenerAreasAdmin(),
        obtenerConfiguracionAdmin()
      ]);
      setAreas(datosAreas || []);
      if (datosConfig?.min_materias) {
        setMinMaterias(datosConfig.min_materias);
      }
      setEsNoAutorizado(false);
    } catch (err) {
      if (err.message?.includes('No tienes acceso de administrador') || err.message?.includes('403')) {
        setEsNoAutorizado(true);
      } else {
        setMensaje({ tipo: 'error', texto: err.message || 'Error al cargar datos administrativos' });
      }
    } finally {
      setCargando(false);
    }
  }

  async function guardarConfiguracion(e) {
    e.preventDefault();
    try {
      await actualizarConfiguracionAdmin(Number(minMaterias));
      setMensaje({ tipo: 'exito', texto: 'Configuración actualizada con éxito' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al actualizar configuración' });
    }
  }

  async function guardarArea(e) {
    e.preventDefault();
    if (!formularioArea.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre del área es requerido' });
      return;
    }

    try {
      if (editandoId) {
        await editarAreaAdmin(editandoId, formularioArea);
        setMensaje({ tipo: 'exito', texto: 'Área actualizada exitosamente' });
      } else {
        await crearAreaAdmin(formularioArea);
        setMensaje({ tipo: 'exito', texto: 'Área creada exitosamente' });
      }
      setFormularioArea({ nombre: '', descripcion: '', recomendacion: '' });
      setEditandoId(null);
      await recargarAreas();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al guardar el área' });
    }
  }

  function iniciarEdicion(area) {
    setEditandoId(area.id);
    setFormularioArea({
      nombre: area.nombre || '',
      descripcion: area.descripcion || '',
      recomendacion: area.recomendacion || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setFormularioArea({ nombre: '', descripcion: '', recomendacion: '' });
  }

  async function borrarArea(id) {
    if (!window.confirm('¿Seguro que deseas eliminar esta área y todas sus materias asignadas?')) {
      return;
    }
    try {
      await eliminarAreaAdmin(id);
      setMensaje({ tipo: 'exito', texto: 'Área eliminada exitosamente' });
      if (areaSeleccionadaMaterias?.id === id) {
        setAreaSeleccionadaMaterias(null);
      }
      await recargarAreas();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al eliminar área' });
    }
  }

  async function recargarAreas() {
    const datos = await obtenerAreasAdmin();
    setAreas(datos || []);
    if (areaSeleccionadaMaterias) {
      const actualizada = datos.find(a => a.id === areaSeleccionadaMaterias.id);
      setAreaSeleccionadaMaterias(actualizada || null);
    }
  }

  async function agregarMateria(e) {
    e.preventDefault();
    if (!areaSeleccionadaMaterias) return;

    try {
      await asignarMateriaAdmin(areaSeleccionadaMaterias.id, {
        clave_materia: formularioMateria.clave_materia,
        nombre_materia: formularioMateria.nombre_materia,
        peso: Number(formularioMateria.peso)
      });
      setFormularioMateria({ clave_materia: '', nombre_materia: '', peso: 1 });
      setMensaje({ tipo: 'exito', texto: 'Materia asignada correctamente' });
      await recargarAreas();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al asignar materia' });
    }
  }

  async function removerMateria(areaId, clave) {
    if (!window.confirm(`¿Quitar materia con clave ${clave}?`)) return;
    try {
      await quitarMateriaAdmin(areaId, clave);
      setMensaje({ tipo: 'exito', texto: 'Materia removida del área' });
      await recargarAreas();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al remover materia' });
    }
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
        <LoaderCircle size={32} className="animate-spin text-brand-500" />
        Cargando módulo de administración...
      </div>
    );
  }

  if (esNoAutorizado) {
    return (
      <div className="flex gap-4 rounded-2xl border border-red-200 bg-red-50 p-6">
        <ShieldAlert size={24} className="shrink-0 text-red-600" />
        <div>
          <h3 className="mb-1 text-red-800">Acceso restringido</h3>
          <p className="m-0 text-sm text-red-700">No tienes permisos de administrador para consultar este panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mensaje.texto && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            mensaje.tipo === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {mensaje.tipo === 'error' ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className={`${TARJETA} p-6`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oro-100 text-oro-700">
              <SlidersHorizontal size={20} />
            </div>
            <h3 className="m-0">Configuración general</h3>
          </div>
          <form onSubmit={guardarConfiguracion} className="space-y-4">
            <label className={ETIQUETA}>
              Mínimo de materias por área
              <input
                type="number"
                min="1"
                value={minMaterias}
                onChange={e => setMinMaterias(e.target.value)}
                required
                className={CAMPO}
              />
            </label>
            <p className="text-xs text-gray-500">Un área solo se calcula si el alumno lleva al menos esta cantidad de materias.</p>
            <button type="submit" className={`${BOTON_PRIMARIO} w-full`}>Guardar mínimo</button>
          </form>
        </div>

        <div className={`${TARJETA} p-6 xl:col-span-2`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              {editandoId ? <Pencil size={20} /> : <Plus size={20} />}
            </div>
            <h3 className="m-0">{editandoId ? 'Editar área' : 'Crear nueva área'}</h3>
          </div>
          <form onSubmit={guardarArea} className="space-y-4">
            <label className={ETIQUETA}>
              Nombre del área
              <input
                type="text"
                value={formularioArea.nombre}
                onChange={e => setFormularioArea({ ...formularioArea, nombre: e.target.value })}
                placeholder="Ej. Desarrollo de Software"
                required
                className={CAMPO}
              />
            </label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className={ETIQUETA}>
                Descripción
                <textarea
                  value={formularioArea.descripcion}
                  onChange={e => setFormularioArea({ ...formularioArea, descripcion: e.target.value })}
                  placeholder="Descripción del enfoque o perfil profesional"
                  rows="3"
                  className={CAMPO}
                />
              </label>
              <label className={ETIQUETA}>
                Recomendación para el alumno
                <textarea
                  value={formularioArea.recomendacion}
                  onChange={e => setFormularioArea({ ...formularioArea, recomendacion: e.target.value })}
                  placeholder="Consejo que verá el alumno si esta es su área principal"
                  rows="3"
                  className={CAMPO}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className={BOTON_PRIMARIO}>
                {editandoId ? 'Actualizar área' : 'Crear área'}
              </button>
              {editandoId && (
                <button type="button" onClick={cancelarEdicion} className={BOTON_SECUNDARIO}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className={TARJETA}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="m-0">Áreas registradas</h3>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{areas.length} áreas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3 font-medium">Área</th>
                <th className="px-3 py-3 font-medium">Descripción</th>
                <th className="px-3 py-3 text-center font-medium">Materias</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {areas.map(area => {
                const totalMaterias = area.area_materias ? area.area_materias.length : 0;
                return (
                  <tr key={area.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="m-0 font-medium text-gray-800">{area.nombre}</p>
                      <p className="m-0 text-xs text-gray-400">ID {area.id}</p>
                    </td>
                    <td className="max-w-sm px-3 py-4 text-gray-500">{area.descripcion}</td>
                    <td className="px-3 py-4 text-center">
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{totalMaterias}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className={`${BOTON_ICONO} bg-brand-50 text-brand-700 hover:bg-brand-100`}
                          onClick={() => setAreaSeleccionadaMaterias(area)}
                        >
                          <ListChecks size={14} />Materias
                        </button>
                        <button
                          type="button"
                          className={`${BOTON_ICONO} bg-gray-100 text-gray-700 hover:bg-gray-200`}
                          onClick={() => iniciarEdicion(area)}
                        >
                          <Pencil size={14} />Editar
                        </button>
                        <button
                          type="button"
                          className={`${BOTON_ICONO} bg-red-50 text-red-700 hover:bg-red-100`}
                          onClick={() => borrarArea(area.id)}
                        >
                          <Trash2 size={14} />Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {areaSeleccionadaMaterias && (
        <div className={TARJETA}>
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <p className="m-0 text-xs uppercase tracking-wider text-gray-400">Materias del área</p>
              <h3 className="m-0">{areaSeleccionadaMaterias.nombre}</h3>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              onClick={() => setAreaSeleccionadaMaterias(null)}
              aria-label="Cerrar materias"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={agregarMateria} className="border-b border-gray-200 p-5">
            <p className="mb-3 text-sm font-medium text-gray-700">Asignar materia al área</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr_110px_auto]">
              <input
                type="text"
                placeholder="Clave (ej. AEF-1031)"
                value={formularioMateria.clave_materia}
                onChange={e => setFormularioMateria({ ...formularioMateria, clave_materia: e.target.value })}
                required
                className={`${CAMPO} mt-0`}
              />
              <input
                type="text"
                placeholder="Nombre de la materia"
                value={formularioMateria.nombre_materia}
                onChange={e => setFormularioMateria({ ...formularioMateria, nombre_materia: e.target.value })}
                required
                className={`${CAMPO} mt-0`}
              />
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Peso"
                value={formularioMateria.peso}
                onChange={e => setFormularioMateria({ ...formularioMateria, peso: e.target.value })}
                required
                className={`${CAMPO} mt-0`}
              />
              <button type="submit" className={BOTON_PRIMARIO}><Plus size={16} />Asignar</button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 font-medium">Clave</th>
                  <th className="px-3 py-3 font-medium">Materia</th>
                  <th className="px-3 py-3 text-center font-medium">Peso</th>
                  <th className="px-5 py-3 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(areaSeleccionadaMaterias.area_materias || []).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-gray-500">No hay materias asignadas a esta área todavía.</td>
                  </tr>
                ) : (
                  areaSeleccionadaMaterias.area_materias.map(mat => (
                    <tr key={mat.clave_materia} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{mat.clave_materia}</code>
                      </td>
                      <td className="px-3 py-3 text-gray-700">{mat.nombre_materia}</td>
                      <td className="px-3 py-3 text-center font-medium text-gray-800">{mat.peso}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          className={`${BOTON_ICONO} bg-red-50 text-red-700 hover:bg-red-100`}
                          onClick={() => removerMateria(areaSeleccionadaMaterias.id, mat.clave_materia)}
                        >
                          <Trash2 size={14} />Quitar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
