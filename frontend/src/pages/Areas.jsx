import { useState, useEffect } from 'react';
import { LoaderCircle, Trophy, Lightbulb, Info, ChevronDown, ChartBar } from 'lucide-react';
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
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
        <LoaderCircle size={32} className="animate-spin text-brand-500" />
        Analizando tu kardex por área profesional...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="mb-4 font-medium text-red-700">{error}</p>
        <button
          onClick={cargarResultado}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { suficiente, min_materias, recomendada, areas = [] } = datos || {};

  return (
    <div className="space-y-6">
      {suficiente && recomendada ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-theme-md md:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[32px] border-oro-500/15" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-oro-500 text-brand-950">
              <Trophy size={32} />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium uppercase tracking-wider text-oro-500">Área recomendada</span>
              <h2 className="mb-1 mt-1 text-3xl text-white">{recomendada.nombre}</h2>
              <p className="text-brand-100">Promedio ponderado de las materias del área</p>
            </div>
            <div className="text-5xl font-semibold text-white">{recomendada.promedio}</div>
          </div>
          {recomendada.recomendacion && (
            <div className="relative mt-6 flex gap-3 rounded-xl bg-white/10 p-4">
              <Lightbulb size={20} className="mt-0.5 shrink-0 text-oro-500" />
              <p className="m-0 text-sm text-brand-50">{recomendada.recomendacion}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <Info size={24} className="shrink-0 text-amber-600" />
          <div>
            <h3 className="mb-1 text-amber-800">Información insuficiente</h3>
            <p className="m-0 text-sm text-amber-700">
              Aún no has cursado suficientes materias representativas para calcular una recomendación.
              Se necesitan al menos 2 áreas con un mínimo de <strong>{min_materias} materias</strong> con calificación numérica.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <ChartBar size={22} />
          </div>
          <div>
            <p className="m-0 font-semibold text-gray-800">Comparativa de promedios por área</p>
            <p className="m-0 text-sm text-gray-500">Escala de 0 a 100</p>
          </div>
        </div>

        <div className="space-y-4">
          {areas.map(area => {
            const porcentaje = area.promedio ? Math.min(Math.max(area.promedio, 0), 100) : 0;
            const esRecomendada = recomendada && area.id === recomendada.id;
            return (
              <div key={area.id} className="grid grid-cols-1 items-center gap-2 md:grid-cols-[220px_1fr_90px] md:gap-4">
                <span className="text-sm font-medium text-gray-700">{area.nombre}</span>
                <div className="relative h-8 overflow-hidden rounded-lg bg-gray-100">
                  {[25, 50, 75].map(linea => (
                    <div key={linea} className="absolute inset-y-0 w-px bg-white" style={{ left: `${linea}%` }} />
                  ))}
                  <div
                    className={`h-full rounded-lg transition-all ${
                      !area.suficiente ? 'bg-gray-300' : esRecomendada ? 'bg-oro-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold md:text-right ${area.suficiente ? 'text-gray-800' : 'text-gray-400'}`}>
                  {area.suficiente ? area.promedio : 'Insuficiente'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-oro-500" />Recomendada</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" />Con datos suficientes</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gray-300" />Datos insuficientes</span>
        </div>
      </div>

      <div>
        <h3>Detalle de áreas y materias cursadas</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {areas.map(area => {
            const estaAbierta = areaDetalleId === area.id;
            return (
              <div key={area.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h4 className="m-0 font-semibold text-gray-800">{area.nombre}</h4>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      area.suficiente ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {area.suficiente ? `${area.promedio} pts` : 'Datos insuficientes'}
                  </span>
                </div>

                <p className="text-sm text-gray-500">{area.descripcion}</p>

                <p className="mt-3 text-xs text-gray-500">
                  Basado en <strong className="text-gray-700">{area.materias_usadas}</strong> de{' '}
                  <strong className="text-gray-700">{area.materias_totales}</strong> materias configuradas
                  (mínimo requerido: {min_materias}).
                </p>

                <button
                  type="button"
                  className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                  onClick={() => setAreaDetalleId(estaAbierta ? null : area.id)}
                >
                  {estaAbierta ? 'Ocultar materias que influyeron' : 'Ver materias que influyeron'}
                  <ChevronDown size={16} className={`transition-transform ${estaAbierta ? 'rotate-180' : ''}`} />
                </button>

                {estaAbierta && (
                  <div className="mt-3 rounded-xl bg-gray-50 p-3">
                    {area.materias && area.materias.length > 0 ? (
                      <ul className="m-0 divide-y divide-gray-200 p-0">
                        {area.materias.map(m => (
                          <li key={m.clave} className="flex items-center gap-3 py-2 text-sm">
                            <code className="rounded bg-white px-1.5 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200">{m.clave}</code>
                            <span className="flex-1 text-gray-700">{m.nombre}</span>
                            <span className="font-semibold text-gray-800">{m.calificacion}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="m-0 text-sm text-gray-500">Aún no tienes materias cursadas en esta área.</p>
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
