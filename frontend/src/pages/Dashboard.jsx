import { useState, useEffect } from 'react';
import { obtenerEstudiante } from '../services/api';

export default function Dashboard() {
  const [estudiante, setEstudiante] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarEstudiante();
  }, []);

  async function cargarEstudiante() {
    try {
      setCargando(true);
      setError('');
      setEstudiante(await obtenerEstudiante());
    } catch (err) {
      setError(err.message || 'No se pudo cargar tu información');
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return <div className="cargando">Cargando tu información...</div>;
  }

  if (error) {
    return (
      <div className="contenedor-error">
        <p className="mensaje-error">{error}</p>
        <button onClick={cargarEstudiante} className="boton-reintentar">Reintentar</button>
      </div>
    );
  }

  const indicadores = [
    { titulo: 'Promedio ponderado', valor: estudiante.promedio_ponderado },
    { titulo: 'Créditos acumulados', valor: estudiante.creditos_acumulados },
    { titulo: 'Materias aprobadas', valor: estudiante.materias_aprobadas },
    { titulo: 'Materias reprobadas', valor: estudiante.materias_reprobadas, alerta: estudiante.materias_reprobadas > 0 }
  ];

  return (
    <div className="pagina-dashboard">
      <div className="tarjeta-perfil">
        {estudiante.foto && (
          <img
            className="foto-perfil"
            src={`data:image/jpeg;base64,${estudiante.foto}`}
            alt={`Foto de ${estudiante.persona}`}
          />
        )}
        <div>
          <h2>{estudiante.persona}</h2>
          <p>Número de control: {estudiante.numero_control}</p>
          <p>{estudiante.email}</p>
          <p>Semestre {estudiante.semestre}</p>
        </div>
      </div>

      <div className="cuadricula-indicadores">
        {indicadores.map(i => (
          <div key={i.titulo} className={`tarjeta-indicador ${i.alerta ? 'alerta' : ''}`}>
            <span>{i.titulo}</span>
            <strong>{i.valor}</strong>
          </div>
        ))}
      </div>

      <div className="tarjeta-avance">
        <div className="encabezado-avance">
          <span>Avance de la carrera</span>
          <span className="valor-avance">{estudiante.porcentaje_avance}%</span>
        </div>
        <div className="barra-fondo">
          <div
            className="barra-progreso"
            style={{ width: `${Math.min(Math.max(estudiante.porcentaje_avance, 0), 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
