import { useState, useEffect } from 'react';
import { obtenerCalificaciones } from '../services/api';

function nivelDesempeno(calificacion) {
  if (calificacion === null) return 'sin-calificacion';
  if (calificacion >= 80) return 'verde';
  if (calificacion >= 70) return 'amarillo';
  return 'rojo';
}

export default function Calificaciones() {
  const [materias, setMaterias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCalificaciones();
  }, []);

  async function cargarCalificaciones() {
    try {
      setCargando(true);
      setError('');
      setMaterias(await obtenerCalificaciones());
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las calificaciones');
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return <div className="cargando">Cargando calificaciones...</div>;
  }

  if (error) {
    return (
      <div className="contenedor-error">
        <p className="mensaje-error">{error}</p>
        <button onClick={cargarCalificaciones} className="boton-reintentar">Reintentar</button>
      </div>
    );
  }

  const texto = busqueda.trim().toLowerCase();
  const filtradas = materias.filter(m =>
    m.nombre_materia.toLowerCase().includes(texto) || m.periodo.toLowerCase().includes(texto)
  );
  const numeroParciales = Math.max(0, ...materias.map(m => m.parciales.length));

  return (
    <div className="pagina-calificaciones">
      <h2>Calificaciones</h2>

      <input
        className="buscador"
        type="search"
        placeholder="Buscar por materia o periodo..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      {filtradas.length === 0 ? (
        <p>No se encontró ninguna materia con esa búsqueda.</p>
      ) : (
        <div className="tabla-responsiva">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Periodo</th>
                {Array.from({ length: numeroParciales }, (_, i) => (
                  <th key={i}>U{i + 1}</th>
                ))}
                <th>Promedio actual</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(m => (
                <tr key={`${m.clave_materia}-${m.grupo}`}>
                  <td>{m.nombre_materia}</td>
                  <td>{m.periodo}</td>
                  {Array.from({ length: numeroParciales }, (_, i) => (
                    <td key={i}>{m.parciales[i] ?? '-'}</td>
                  ))}
                  <td>
                    <span className={`calif-desempeno ${nivelDesempeno(m.calificacion_final)}`}>
                      {m.calificacion_final ?? 'Sin capturar'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="nota-calificaciones">
        El promedio actual se calcula con las unidades capturadas. Verde: 80 o más, amarillo: de 70 a 79, rojo: menos de 70.
      </p>
    </div>
  );
}
