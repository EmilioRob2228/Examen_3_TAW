import { useState, useEffect } from 'react';
import { obtenerResultadoAreas } from '../services/api';

export default function Areas() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [areaDetalleId, setAreaDetalleId] = useState(null);

  useEffect(() => {
    cargarResultado();
  }, []);

  async function cargarResultado() {
    try {
      setCargando(true);
      setError('');
      const respuesta = await obtenerResultadoAreas();
      setDatos(respuesta);
    } catch (err) {
      setError(err.message || 'No se pudo obtener el análisis de áreas');
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return <div className="cargando">Analizando tu kardex por área profesional...</div>;
  }

  if (error) {
    return (
      <div className="contenedor-error">
        <p className="mensaje-error">{error}</p>
        <button onClick={cargarResultado} className="boton-reintentar">Reintentar</button>
      </div>
    );
  }

  const { suficiente, min_materias, recomendada, areas = [] } = datos || {};

  return (
    <div className="pagina-areas">
      <h2>Orientación por Área Profesional</h2>

      {suficiente && recomendada ? (
        <div className="tarjeta-recomendada">
          <div className="etiqueta-destacada">Área Recomendada</div>
          <h3>{recomendada.nombre}</h3>
          <p className="promedio-recomendada">Promedio ponderado: <strong>{recomendada.promedio}</strong></p>
          {recomendada.recomendacion && (
            <div className="caja-recomendacion">
              <strong>Sugerencia profesional:</strong>
              <p>{recomendada.recomendacion}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="alerta-insuficiente">
          <h3>Información insuficiente</h3>
          <p>
            Aún no has cursado suficientes materias representativas para calcular una recomendación definitiva.
            Se requiere contar con al menos 2 áreas que tengan cursadas como mínimo <strong>{min_materias} materias</strong> con calificación numérica.
          </p>
        </div>
      )}

      <div className="seccion-grafica">
        <h3>Comparativa de Promedios por Área</h3>
        <div className="contenedor-grafica-barras">
          {areas.map(area => {
            const porcentaje = area.promedio ? Math.min(Math.max(area.promedio, 0), 100) : 0;
            return (
              <div key={area.id} className="fila-barra">
                <div className="nombre-area-barra">{area.nombre}</div>
                <div className="pista-barra">
                  <div
                    className={`relleno-barra ${area.suficiente ? 'barra-suficiente' : 'barra-insuficiente'}`}
                    style={{ width: `${porcentaje}%` }}
                  >
                    {area.promedio ? `${area.promedio}` : ''}
                  </div>
                </div>
                <div className="texto-promedio-barra">
                  {area.suficiente ? `${area.promedio} pts` : 'Insuficiente'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="seccion-desglose">
        <h3>Detalle de Áreas y Materias Cursadas</h3>
        <div className="cuadricula-areas">
          {areas.map(area => {
            const estaAbierta = areaDetalleId === area.id;
            return (
              <div key={area.id} className={`tarjeta-area ${area.suficiente ? 'area-valida' : 'area-incompleta'}`}>
                <div className="encabezado-area">
                  <h4>{area.nombre}</h4>
                  <span className={`estado-pildora ${area.suficiente ? 'valida' : 'incompleta'}`}>
                    {area.suficiente ? `${area.promedio} pts` : 'Datos insuficientes'}
                  </span>
                </div>

                <p className="descripcion-area">{area.descripcion}</p>

                <p className="conteo-materias">
                  Basado en <strong>{area.materias_usadas}</strong> de <strong>{area.materias_totales}</strong> materias configuradas
                  (mínimo requerido: {min_materias}).
                </p>

                <button
                  type="button"
                  className="boton-alternar-materias"
                  onClick={() => setAreaDetalleId(estaAbierta ? null : area.id)}
                >
                  {estaAbierta ? 'Ocultar materias que influyeron' : 'Ver materias que influyeron'}
                </button>

                {estaAbierta && (
                  <div className="lista-materias-area">
                    {area.materias && area.materias.length > 0 ? (
                      <ul>
                        {area.materias.map(m => (
                          <li key={m.clave}>
                            <span className="clave-materia"><code>{m.clave}</code></span>
                            <span className="nombre-materia">{m.nombre}</span>
                            <span className="calif-materia">{m.calificacion}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="sin-materias">Aún no tienes materias cursadas en esta área.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

