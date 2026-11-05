import { useState, useEffect } from 'react';
import { Search, LoaderCircle, BookOpen } from 'lucide-react';
import { obtenerCalificaciones } from '../services/api';

function nivelDesempeno(calificacion) {
  if (calificacion === null) return 'sin-calificacion';
  if (calificacion >= 80) return 'verde';
  if (calificacion >= 70) return 'amarillo';
  return 'rojo';
}

const ESTILOS_DESEMPENO = {
  verde: 'bg-green-50 text-green-700 ring-green-600/20',
  amarillo: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  rojo: 'bg-red-50 text-red-700 ring-red-600/20',
  'sin-calificacion': 'bg-gray-100 text-gray-500 ring-gray-500/20'
};

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
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
        <LoaderCircle size={32} className="animate-spin text-brand-500" />
        Cargando calificaciones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="mb-4 font-medium text-red-700">{error}</p>
        <button
          onClick={cargarCalificaciones}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const texto = busqueda.trim().toLowerCase();
  const filtradas = materias.filter(m =>
    m.nombre_materia.toLowerCase().includes(texto) || m.periodo.toLowerCase().includes(texto)
  );
  const numeroParciales = Math.max(0, ...materias.map(m => m.parciales.length));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs">
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="mb-0">Calificaciones del periodo</h2>
          <p className="text-sm text-gray-500">{materias[0]?.periodo}</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar por materia o periodo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm shadow-theme-xs outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-14 text-center text-gray-500">
          <BookOpen size={32} className="text-gray-300" />
          No se encontró ninguna materia con esa búsqueda.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3 font-medium">Materia</th>
                {Array.from({ length: numeroParciales }, (_, i) => (
                  <th key={i} className="px-3 py-3 text-center font-medium">U{i + 1}</th>
                ))}
                <th className="px-5 py-3 text-center font-medium">Promedio actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtradas.map(m => (
                <tr key={`${m.clave_materia}-${m.grupo}`} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="m-0 font-medium text-gray-800">{m.nombre_materia}</p>
                    <p className="m-0 text-xs text-gray-500">{m.clave_materia} · Grupo {m.grupo} · {m.periodo}</p>
                  </td>
                  {Array.from({ length: numeroParciales }, (_, i) => (
                    <td key={i} className="px-3 py-4 text-center text-gray-600">{m.parciales[i] ?? '–'}</td>
                  ))}
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex min-w-12 justify-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${
                        ESTILOS_DESEMPENO[nivelDesempeno(m.calificacion_final)]
                      }`}
                    >
                      {m.calificacion_final ?? 'Sin capturar'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 px-5 py-4 text-xs text-gray-500">
        <span>Promedio calculado con las unidades capturadas:</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" />80 o más</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />70 a 79</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" />Menos de 70</span>
      </div>
    </div>
  );
}
