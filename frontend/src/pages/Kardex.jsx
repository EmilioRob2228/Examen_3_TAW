import { useState, useEffect } from 'react';
import { LoaderCircle, BookOpen } from 'lucide-react';
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
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
        <LoaderCircle size={32} className="animate-spin text-brand-500" />
        Cargando kardex académico...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="mb-4 font-medium text-red-700">{error}</p>
        <button
          onClick={cargarKardex}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Reintentar
        </button>
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
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="m-0 font-semibold text-gray-800">Avance curricular</p>
            <p className="m-0 text-sm text-gray-500">{listaMaterias.length} materias en el historial</p>
          </div>
          <span className="ml-auto text-2xl font-semibold text-brand-700">{porcentajeAvance}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
            style={{ width: `${Math.min(Math.max(porcentajeAvance, 0), 100)}%` }}
          />
        </div>
      </div>

      {semestresOrdenados.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          No se encontraron materias registradas en el kardex.
        </div>
      ) : (
        semestresOrdenados.map(sem => (
          <div key={sem} className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h3 className="m-0">{typeof sem === 'string' && sem.startsWith('Sin') ? sem : `Semestre ${sem}`}</h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {gruposPorSemestre[sem].length} materias
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-medium">Materia</th>
                    <th className="px-3 py-3 text-center font-medium">Calificación</th>
                    <th className="px-3 py-3 text-center font-medium">Créditos</th>
                    <th className="px-3 py-3 font-medium">Periodo</th>
                    <th className="px-5 py-3 font-medium">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gruposPorSemestre[sem].map((mat, indice) => (
                    <tr key={`${mat.clave_materia}-${indice}`} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="m-0 font-medium text-gray-800">{mat.nombre_materia}</p>
                        <p className="m-0 text-xs text-gray-500">{mat.clave_materia}</p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex min-w-12 justify-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${
                            Number(mat.calificacion) >= 70 || Number.isNaN(Number(mat.calificacion))
                              ? 'bg-green-50 text-green-700 ring-green-600/20'
                              : 'bg-red-50 text-red-700 ring-red-600/20'
                          }`}
                        >
                          {mat.calificacion}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{mat.creditos}</td>
                      <td className="px-3 py-3 text-gray-600">{mat.periodo}</td>
                      <td className="px-5 py-3 text-xs text-gray-500">{mat.descripcion}</td>
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
