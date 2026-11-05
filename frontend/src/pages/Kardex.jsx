import { useState, useEffect } from 'react';
import { obtenerKardex } from '../services/api';

export default function Kardex() {
  const [datosKardex, setDatosKardex] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarKardex();
  }, []);

  async function cargarKardex() {
    try {
      setCargando(true);
      setError('');
      const respuesta = await obtenerKardex();
      setDatosKardex(respuesta);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el kardex');
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return <div className="cargando">Cargando kardex académico...</div>;
  }

  if (error) {
    return (
      <div className="contenedor-error">
        <p className="mensaje-error">{error}</p>
        <button onClick={cargarKardex} className="boton-reintentar">Reintentar</button>
      </div>
    );
  }

  const porcentajeAvance = datosKardex?.porcentaje_avance ?? 0;
  const listaMaterias = datosKardex?.kardex || [];

  const gruposPorSemestre = {};
  for (const materia of listaMaterias) {
    const sem = materia.semestre || 'Sin semestre';
    if (!gruposPorSemestre[sem]) {
      gruposPorSemestre[sem] = [];
    }
    gruposPorSemestre[sem].push(materia);
  }

  const semestresOrdenados = Object.keys(gruposPorSemestre).sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
    return String(a).localeCompare(String(b));
  });

  return (
    <div className="pagina-kardex">
      <h2>Kardex Académico</h2>

      <div className="tarjeta-avance">
        <div className="encabezado-avance">
          <span>Porcentaje de Avance Curricular</span>
          <span className="valor-avance">{porcentajeAvance}%</span>
        </div>
        <div className="barra-fondo">
          <div
            className="barra-progreso"
            style={{ width: `${Math.min(Math.max(porcentajeAvance, 0), 100)}%` }}
          />
        </div>
      </div>

      {semestresOrdenados.length === 0 ? (
        <p>No se encontraron materias registradas en el kardex.</p>
      ) : (
        semestresOrdenados.map(sem => (
          <div key={sem} className="bloque-semestre">
            <h3>{typeof sem === 'string' && sem.startsWith('Sin') ? sem : `Semestre ${sem}`}</h3>
            <div className="tabla-responsiva">
              <table className="tabla-datos">
                <thead>
                  <tr>
                    <th>Clave</th>
                    <th>Materia</th>
                    <th>Calificación</th>
                    <th>Créditos</th>
                    <th>Periodo</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {gruposPorSemestre[sem].map((mat, indice) => (
                    <tr key={`${mat.clave_materia}-${indice}`}>
                      <td><code>{mat.clave_materia}</code></td>
                      <td>{mat.nombre_materia}</td>
                      <td>
                        <span className={`etiqueta-calif ${Number(mat.calificacion) >= 70 ? 'aprobada' : 'no-aprobada'}`}>
                          {mat.calificacion}
                        </span>
                      </td>
                      <td>{mat.creditos}</td>
                      <td>{mat.periodo}</td>
                      <td>{mat.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

