import { useState, useEffect } from 'react';
import { obtenerHorarios } from '../services/api';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const DIAS_CONFIG = [
  { clave: 'lunes', etiqueta: 'Lunes', claveSalon: 'lunes_clave_salon' },
  { clave: 'martes', etiqueta: 'Martes', claveSalon: 'martes_clave_salon' },
  { clave: 'miercoles', etiqueta: 'Miércoles', claveSalon: 'miercoles_clave_salon' },
  { clave: 'jueves', etiqueta: 'Jueves', claveSalon: 'jueves_clave_salon' },
  { clave: 'viernes', etiqueta: 'Viernes', claveSalon: 'viernes_clave_salon' },
  { clave: 'sabado', etiqueta: 'Sábado', claveSalon: 'sabado_clave_salon' }
];

export default function Horarios() {
  const [datosHorarios, setDatosHorarios] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarHorarios();
  }, []);

  async function cargarHorarios() {
    try {
      setCargando(true);
      setError('');
      const respuesta = await obtenerHorarios();
      setDatosHorarios(respuesta);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los horarios');
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return <div className="cargando">Cargando horario de clases...</div>;
  }

  if (error) {
    return (
      <div className="contenedor-error">
        <p className="mensaje-error">{error}</p>
        <button onClick={cargarHorarios} className="boton-reintentar">Reintentar</button>
      </div>
    );
  }

  let listaMaterias = [];
  let periodoInfo = null;

  if (Array.isArray(datosHorarios)) {
    if (datosHorarios.length > 0 && Array.isArray(datosHorarios[0]?.horario)) {
      listaMaterias = datosHorarios[0].horario;
      periodoInfo = datosHorarios[0].periodo;
    } else {
      listaMaterias = datosHorarios;
    }
  } else if (Array.isArray(datosHorarios?.horario)) {
    listaMaterias = datosHorarios.horario;
    periodoInfo = datosHorarios?.periodo;
  } else if (Array.isArray(datosHorarios?.materias)) {
    listaMaterias = datosHorarios.materias;
  }

  function desglosarHoras(rangoTexto) {
    if (!rangoTexto || typeof rangoTexto !== 'string') return [];
    const partes = rangoTexto.split('-').map(p => p.trim());
    if (partes.length !== 2) return [rangoTexto];

    const [inicioStr, finStr] = partes;
    const horaIni = parseInt(inicioStr.split(':')[0], 10);
    const horaFin = parseInt(finStr.split(':')[0], 10);

    if (Number.isNaN(horaIni) || Number.isNaN(horaFin) || horaFin <= horaIni) {
      return [rangoTexto];
    }

    const bloques = [];
    for (let h = horaIni; h < horaFin; h++) {
      const h1 = String(h).padStart(2, '0') + ':00';
      const h2 = String(h + 1).padStart(2, '0') + ':00';
      bloques.push(`${h1} - ${h2}`);
    }
    return bloques;
  }

  const matrizHorario = {};
  const conjuntoHoras = new Set();

  for (const item of listaMaterias) {
    const nombre = item.nombre_materia || item.materia || item.asignatura || 'Materia';
    const claveMat = item.clave_materia || '';
    const grupo = item.letra_grupo || item.grupo || '';

    for (const d of DIAS_CONFIG) {
      const valorHora = item[d.clave];
      if (valorHora && typeof valorHora === 'string' && valorHora.trim() !== '') {
        const salon = item[d.claveSalon] || item.aula || item.salon || '';
        const bloques = desglosarHoras(valorHora);

        for (const b of bloques) {
          conjuntoHoras.add(b);
          if (!matrizHorario[b]) matrizHorario[b] = {};
          if (!matrizHorario[b][d.etiqueta]) matrizHorario[b][d.etiqueta] = [];

          matrizHorario[b][d.etiqueta].push({
            materia: nombre,
            clave: claveMat,
            grupo,
            salon
          });
        }
      }
    }
  }

  const horasOrdenadas = Array.from(conjuntoHoras).sort((a, b) => {
    const numA = parseInt(a.split(':')[0], 10);
    const numB = parseInt(b.split(':')[0], 10);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });

  return (
    <div className="pagina-horarios">
      <div className="encabezado-horario">
        <h2>Horario de Clases</h2>
        {periodoInfo && (
          <span className="etiqueta-periodo">
            {periodoInfo.descripcion_periodo || periodoInfo.clave_periodo}
          </span>
        )}
      </div>

      {listaMaterias.length === 0 ? (
        <p>No hay materias inscritas en el horario actual.</p>
      ) : horasOrdenadas.length > 0 ? (
        <div className="tabla-responsiva">
          <table className="tabla-horario">
            <thead>
              <tr>
                <th className="columna-hora">Hora</th>
                {DIAS_SEMANA.map(dia => (
                  <th key={dia}>{dia}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horasOrdenadas.map(hora => (
                <tr key={hora}>
                  <td className="celda-hora">
                    <strong>{hora}</strong>
                  </td>
                  {DIAS_SEMANA.map(dia => {
                    const clases = matrizHorario[hora]?.[dia] || [];
                    return (
                      <td
                        key={`${hora}-${dia}`}
                        className={clases.length > 0 ? 'celda-ocupada' : 'celda-vacia'}
                      >
                        {clases.map((c, i) => (
                          <div key={i} className="tarjeta-clase">
                            <span className="clase-nombre">{c.materia}</span>
                            <div className="clase-detalles">
                              {c.clave && <small className="clase-clave">{c.clave}</small>}
                              {c.grupo && <small className="clase-grupo">Grp: {c.grupo}</small>}
                              {c.salon && <small className="clase-aula">Salón: {c.salon}</small>}
                            </div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="tabla-responsiva">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Clave</th>
                <th>Materia</th>
                <th>Grupo</th>
                <th>Lunes</th>
                <th>Martes</th>
                <th>Miércoles</th>
                <th>Jueves</th>
                <th>Viernes</th>
              </tr>
            </thead>
            <tbody>
              {listaMaterias.map((m, idx) => (
                <tr key={idx}>
                  <td><code>{m.clave_materia}</code></td>
                  <td><strong>{m.nombre_materia}</strong></td>
                  <td>{m.letra_grupo || '-'}</td>
                  <td>{m.lunes ? `${m.lunes} (${m.lunes_clave_salon || ''})` : '-'}</td>
                  <td>{m.martes ? `${m.martes} (${m.martes_clave_salon || ''})` : '-'}</td>
                  <td>{m.miercoles ? `${m.miercoles} (${m.miercoles_clave_salon || ''})` : '-'}</td>
                  <td>{m.jueves ? `${m.jueves} (${m.jueves_clave_salon || ''})` : '-'}</td>
                  <td>{m.viernes ? `${m.viernes} (${m.viernes_clave_salon || ''})` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
