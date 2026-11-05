import { useState, useEffect } from 'react';
import { Award, Layers, CircleCheck, CircleX, LoaderCircle, Mail, GraduationCap, Hash } from 'lucide-react';
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
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
        <LoaderCircle size={32} className="animate-spin text-brand-500" />
        Cargando tu información...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="mb-4 font-medium text-red-700">{error}</p>
        <button
          onClick={cargarEstudiante}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const indicadores = [
    { titulo: 'Promedio ponderado', valor: estudiante.promedio_ponderado, icono: Award, color: 'bg-oro-100 text-oro-700' },
    { titulo: 'Créditos acumulados', valor: estudiante.creditos_acumulados, icono: Layers, color: 'bg-brand-50 text-brand-600' },
    { titulo: 'Materias aprobadas', valor: estudiante.materias_aprobadas, icono: CircleCheck, color: 'bg-green-50 text-green-600' },
    {
      titulo: 'Materias reprobadas',
      valor: estudiante.materias_reprobadas,
      icono: CircleX,
      color: estudiante.materias_reprobadas > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
    }
  ];

  const avance = Math.min(Math.max(estudiante.porcentaje_avance, 0), 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs sm:flex-row">
        {estudiante.foto && (
          <img
            className="h-28 w-28 rounded-full object-cover ring-4 ring-brand-50"
            src={`data:image/jpeg;base64,${estudiante.foto}`}
            alt={`Foto de ${estudiante.persona}`}
          />
        )}
        <div className="text-center sm:text-left">
          <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            Semestre {estudiante.semestre}
          </span>
          <h2 className="mb-2 mt-2 text-2xl">{estudiante.persona}</h2>
          <div className="flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:gap-5">
            <span className="flex items-center justify-center gap-1.5 sm:justify-start"><Hash size={16} />{estudiante.numero_control}</span>
            <span className="flex items-center justify-center gap-1.5 sm:justify-start"><Mail size={16} />{estudiante.email}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicadores.map(({ titulo, valor, icono: Icono, color }) => (
          <div key={titulo} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs">
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
              <Icono size={24} />
            </div>
            <span className="text-sm text-gray-500">{titulo}</span>
            <p className="m-0 mt-1 text-3xl font-semibold text-gray-800">{valor}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="m-0 font-semibold text-gray-800">Avance de la carrera</p>
            <p className="m-0 text-sm text-gray-500">Porcentaje de créditos cubiertos</p>
          </div>
          <span className="ml-auto text-2xl font-semibold text-brand-700">{avance}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${avance}%` }} />
        </div>
      </div>
    </div>
  );
}
