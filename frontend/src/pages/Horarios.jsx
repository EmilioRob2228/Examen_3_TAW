import { useState, useEffect } from 'react';
import { LoaderCircle, CalendarDays, MapPin } from 'lucide-react';
import { obtenerHorarios } from '../services/api';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const COLORES_MATERIA = [
  'bg-brand-50 text-brand-800 border-brand-500',
  'bg-oro-100 text-oro-700 border-oro-500',
  'bg-blue-50 text-blue-800 border-blue-500',
  'bg-purple-50 text-purple-800 border-purple-500',
  'bg-rose-50 text-rose-800 border-rose-500',
  'bg-teal-50 text-teal-800 border-teal-500'
];

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
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
        <LoaderCircle size={32} className="animate-spin text-brand-500" />
        Cargando horario de clases...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="mb-4 font-medium text-red-700">{error}</p>
        <button
          onClick={cargarHorarios}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Reintentar
        </button>
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

  const clavesMaterias = [...new Set(listaMaterias.map(m => m.clave_materia))];
  const colorDe = clave => COLORES_MATERIA[clavesMaterias.indexOf(clave) % COLORES_MATERIA.length];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CalendarDays size={22} />
          </div>
          <h2 className="m-0">Horario de clases</h2>
        </div>
        {periodoInfo && (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {periodoInfo.descripcion_periodo || periodoInfo.clave_periodo}
          </span>
        )}
      </div>

      {listaMaterias.length === 0 ? (
        <div className="p-10 text-center text-gray-500">No hay materias inscritas en el horario actual.</div>
      ) : horasOrdenadas.length > 0 ? (
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[820px] border-separate border-spacing-1 text-sm">
            <thead>
              <tr>
                <th className="w-28 px-2 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Hora</th>
                {DIAS_SEMANA.map(dia => (
                  <th key={dia} className="rounded-lg bg-gray-50 px-2 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horasOrdenadas.map(hora => (
                <tr key={hora}>
                  <td className="whitespace-nowrap px-2 py-2 align-top text-xs font-medium text-gray-500">{hora}</td>
                  {DIAS_SEMANA.map(dia => {
                    const clases = matrizHorario[hora]?.[dia] || [];
                    return (
                      <td key={`${hora}-${dia}`} className="h-16 rounded-lg bg-gray-50/60 align-top">
                        {clases.map((c, i) => (
                          <div key={i} className={`h-full rounded-lg border-l-4 px-2.5 py-2 ${colorDe(c.clave)}`}>
                            <p className="m-0 text-xs font-semibold leading-tight">{c.materia}</p>
                            <div className="mt-1 flex flex-wrap gap-x-2 text-[11px] opacity-80">
                              {c.grupo && <span>Grupo {c.grupo}</span>}
                              {c.salon && (
                                <span className="flex items-center gap-0.5"><MapPin size={11} />{c.salon}</span>
                              )}
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3 font-medium">Materia</th>
                <th className="px-3 py-3 font-medium">Grupo</th>
                <th className="px-3 py-3 font-medium">Lunes</th>
                <th className="px-3 py-3 font-medium">Martes</th>
                <th className="px-3 py-3 font-medium">Miércoles</th>
                <th className="px-3 py-3 font-medium">Jueves</th>
                <th className="px-3 py-3 font-medium">Viernes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listaMaterias.map((m, idx) => (
                <tr key={idx}>
                  <td className="px-5 py-3">
                    <p className="m-0 font-medium text-gray-800">{m.nombre_materia}</p>
                    <p className="m-0 text-xs text-gray-500">{m.clave_materia}</p>
                  </td>
                  <td className="px-3 py-3">{m.letra_grupo || '-'}</td>
                  <td className="px-3 py-3">{m.lunes ? `${m.lunes} (${m.lunes_clave_salon || ''})` : '-'}</td>
                  <td className="px-3 py-3">{m.martes ? `${m.martes} (${m.martes_clave_salon || ''})` : '-'}</td>
                  <td className="px-3 py-3">{m.miercoles ? `${m.miercoles} (${m.miercoles_clave_salon || ''})` : '-'}</td>
                  <td className="px-3 py-3">{m.jueves ? `${m.jueves} (${m.jueves_clave_salon || ''})` : '-'}</td>
                  <td className="px-3 py-3">{m.viernes ? `${m.viernes} (${m.viernes_clave_salon || ''})` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
