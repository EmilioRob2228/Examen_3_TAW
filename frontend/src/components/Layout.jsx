import { useState } from 'react';
import { House, GraduationCap, Compass, BookOpen, CalendarDays, Settings, LogOut, Menu, X } from 'lucide-react';

const SECCIONES = [
  { clave: 'dashboard', nombre: 'Inicio', icono: House },
  { clave: 'calificaciones', nombre: 'Calificaciones', icono: GraduationCap },
  { clave: 'kardex', nombre: 'Kardex', icono: BookOpen },
  { clave: 'horarios', nombre: 'Horarios', icono: CalendarDays },
  { clave: 'areas', nombre: 'Orientación por Áreas', icono: Compass },
  { clave: 'admin', nombre: 'Administración', icono: Settings, soloAdmin: true }
];

export default function Layout({ pestanaActiva, onCambiarPestana, esAdmin, estudiante, onCerrarSesion, children }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const secciones = SECCIONES.filter(s => !s.soloAdmin || esAdmin);
  const actual = secciones.find(s => s.clave === pestanaActiva);

  function elegir(clave) {
    onCambiarPestana(clave);
    setMenuAbierto(false);
  }

  return (
    <div className="flex min-h-screen">
      {menuAbierto && (
        <div className="fixed inset-0 z-30 bg-gray-900/40 lg:hidden" onClick={() => setMenuAbierto(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-gray-200 bg-white px-5 transition-transform lg:static lg:translate-x-0 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 py-6">
          <img src="/linces.png" alt="Linces TecNM en Celaya" className="h-11 w-11 rounded-full" />
          <div className="leading-tight">
            <p className="m-0 text-base font-semibold text-gray-800">Orientación SII</p>
            <p className="m-0 text-xs text-gray-500">Proyecto académico TAW</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-2 mt-2 text-xs font-medium uppercase tracking-wider text-gray-400">Menú</p>
        <nav className="flex flex-col gap-1">
          {secciones.map(({ clave, nombre, icono: Icono }) => (
            <button
              key={clave}
              type="button"
              onClick={() => elegir(clave)}
              className={`menu-item ${pestanaActiva === clave ? 'menu-item-active' : ''}`}
            >
              <Icono size={20} />
              {nombre}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={onCerrarSesion}
          className="menu-item mb-6 mt-auto text-gray-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-3 md:px-6">
          <button
            type="button"
            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <h1 className="m-0 text-lg font-semibold text-gray-800">{actual?.nombre}</h1>

          {estudiante && (
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right leading-tight sm:block">
                <p className="m-0 text-sm font-medium text-gray-800">{estudiante.persona}</p>
                <p className="m-0 text-xs text-gray-500">{estudiante.numero_control}</p>
              </div>
              {estudiante.foto ? (
                <img
                  src={`data:image/jpeg;base64,${estudiante.foto}`}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-oro-500"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {estudiante.persona?.[0]}
                </div>
              )}
            </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
