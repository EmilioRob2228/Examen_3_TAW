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
    return <div className="cargando">Cargando módulo de administración...</div>;
  }

  if (esNoAutorizado) {
    return (
      <div className="contenedor-error">
        <h3>Acceso Restringido</h3>
        <p className="mensaje-error">No tienes permisos de administrador para consultar este panel.</p>
      </div>
    );
  }

  return (
    <div className="pagina-admin">
      <h2>Panel de Administración de Áreas y Materias</h2>

      {mensaje.texto && (
        <div className={`alerta-panel ${mensaje.tipo === 'error' ? 'alerta-error' : 'alerta-exito'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="tarjeta-admin seccion-config">
        <h3>Configuración General</h3>
        <form onSubmit={guardarConfiguracion} className="formulario-en-linea">
          <label>
            Mínimo de materias requeridas por área:
            <input
              type="number"
              min="1"
              value={minMaterias}
              onChange={e => setMinMaterias(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="boton-primario">Guardar mínimo</button>
        </form>
      </div>

      <div className="tarjeta-admin seccion-formulario-area">
        <h3>{editandoId ? 'Editar Área' : 'Crear Nueva Área'}</h3>
        <form onSubmit={guardarArea} className="formulario-apilado">
          <label>
            Nombre del área:
            <input
              type="text"
              value={formularioArea.nombre}
              onChange={e => setFormularioArea({ ...formularioArea, nombre: e.target.value })}
              placeholder="Ej. Desarrollo de Software"
              required
            />
          </label>
          <label>
            Descripción:
            <textarea
              value={formularioArea.descripcion}
              onChange={e => setFormularioArea({ ...formularioArea, descripcion: e.target.value })}
              placeholder="Descripción del enfoque o perfil profesional"
              rows="2"
            />
          </label>
          <label>
            Recomendación para el alumno:
            <textarea
              value={formularioArea.recomendacion}
              onChange={e => setFormularioArea({ ...formularioArea, recomendacion: e.target.value })}
              placeholder="Consejo o recomendación que verá el alumno si esta es su área principal"
              rows="3"
            />
          </label>
          <div className="acciones-formulario">
            <button type="submit" className="boton-primario">
              {editandoId ? 'Actualizar Área' : 'Crear Área'}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion} className="boton-secundario">
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="tarjeta-admin">
        <h3>Áreas Registradas ({areas.length})</h3>
        <div className="tabla-responsiva">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Materias</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {areas.map(area => {
                const totalMaterias = area.area_materias ? area.area_materias.length : 0;
                return (
                  <tr key={area.id}>
                    <td>{area.id}</td>
                    <td><strong>{area.nombre}</strong></td>
                    <td>{area.descripcion}</td>
                    <td>{totalMaterias} materias</td>
                    <td>
                      <div className="botones-accion">
                        <button
                          type="button"
                          className="boton-chico boton-info"
                          onClick={() => setAreaSeleccionadaMaterias(area)}
                        >
                          Materias
                        </button>
                        <button
                          type="button"
                          className="boton-chico boton-secundario"
                          onClick={() => iniciarEdicion(area)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="boton-chico boton-peligro"
                          onClick={() => borrarArea(area.id)}
                        >
                          Eliminar
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
        <div className="tarjeta-admin seccion-materias-area">
          <div className="encabezado-materias">
            <h3>Materias de: {areaSeleccionadaMaterias.nombre}</h3>
            <button
              type="button"
              className="boton-chico"
              onClick={() => setAreaSeleccionadaMaterias(null)}
            >
              Cerrar materias
            </button>
          </div>

          <form onSubmit={agregarMateria} className="formulario-materia-nueva">
            <h4>Asignar Materia al Área</h4>
            <div className="fila-campos-materia">
              <input
                type="text"
                placeholder="Clave (ej. AEF-1031)"
                value={formularioMateria.clave_materia}
                onChange={e => setFormularioMateria({ ...formularioMateria, clave_materia: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Nombre de la materia"
                value={formularioMateria.nombre_materia}
                onChange={e => setFormularioMateria({ ...formularioMateria, nombre_materia: e.target.value })}
                required
              />
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Peso"
                value={formularioMateria.peso}
                onChange={e => setFormularioMateria({ ...formularioMateria, peso: e.target.value })}
                required
              />
              <button type="submit" className="boton-primario">Asignar</button>
            </div>
          </form>

          <div className="tabla-responsiva">
            <table className="tabla-datos">
              <thead>
                <tr>
                  <th>Clave</th>
                  <th>Nombre Materia</th>
                  <th>Peso</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {(areaSeleccionadaMaterias.area_materias || []).length === 0 ? (
                  <tr>
                    <td colSpan="4">No hay materias asignadas a esta área todavía.</td>
                  </tr>
                ) : (
                  areaSeleccionadaMaterias.area_materias.map(mat => (
                    <tr key={mat.clave_materia}>
                      <td><code>{mat.clave_materia}</code></td>
                      <td>{mat.nombre_materia}</td>
                      <td>{mat.peso}</td>
                      <td>
                        <button
                          type="button"
                          className="boton-chico boton-peligro"
                          onClick={() => removerMateria(areaSeleccionadaMaterias.id, mat.clave_materia)}
                        >
                          Quitar
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

