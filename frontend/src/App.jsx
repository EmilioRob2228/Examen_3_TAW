import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calificaciones from './pages/Calificaciones';
import Kardex from './pages/Kardex';
import Horarios from './pages/Horarios';
import Areas from './pages/Areas';
import Admin from './pages/Admin';
import { obtenerToken, eliminarToken, obtenerEstudiante } from './services/api';
import './App.css';

export default function App() {
  const [tokenActual, setTokenActual] = useState(obtenerToken());
  const [pestanaActiva, setPestanaActiva] = useState('dashboard');
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    if (!tokenActual) {
      setEsAdmin(false);
      return;
    }
    obtenerEstudiante()
      .then(datos => setEsAdmin(Boolean(datos?.es_admin)))
      .catch(() => setEsAdmin(false));
  }, [tokenActual]);

  useEffect(() => {
    function alExpirar() {
      setTokenActual(null);
    }
    window.addEventListener('sesion_expirada', alExpirar);
    return () => {
      window.removeEventListener('sesion_expirada', alExpirar);
    };
  }, []);

  function alIniciarSesion(token) {
    setTokenActual(token);
    setPestanaActiva('dashboard');
  }

  function cerrarSesion() {
    eliminarToken();
    setTokenActual(null);
  }

  if (!tokenActual) {
    return <Login alIniciarSesion={alIniciarSesion} />;
  }

  return (
    <div className="contenedor-principal">
      <header className="barra-superior">
        <div className="titulo-sistema">TecNM Celaya - Orientación y SII</div>
        <nav className="navegacion-pestanas">
          <button
            type="button"
            className={`boton-pestana ${pestanaActiva === 'dashboard' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('dashboard')}
          >
            Inicio
          </button>
          <button
            type="button"
            className={`boton-pestana ${pestanaActiva === 'calificaciones' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('calificaciones')}
          >
            Calificaciones
          </button>
          <button
            type="button"
            className={`boton-pestana ${pestanaActiva === 'areas' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('areas')}
          >
            Orientación por Áreas
          </button>
          <button
            type="button"
            className={`boton-pestana ${pestanaActiva === 'kardex' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('kardex')}
          >
            Kardex
          </button>
          <button
            type="button"
            className={`boton-pestana ${pestanaActiva === 'horarios' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('horarios')}
          >
            Horarios
          </button>
          {esAdmin && (
            <button
              type="button"
              className={`boton-pestana ${pestanaActiva === 'admin' ? 'activa' : ''}`}
              onClick={() => setPestanaActiva('admin')}
            >
              Administración
            </button>
          )}
          <button
            type="button"
            className="boton-pestana"
            onClick={cerrarSesion}
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            Salir
          </button>
        </nav>
      </header>

      <main className="contenido-pagina">
        {pestanaActiva === 'dashboard' && <Dashboard />}
        {pestanaActiva === 'calificaciones' && <Calificaciones />}
        {pestanaActiva === 'areas' && <Areas />}
        {pestanaActiva === 'kardex' && <Kardex />}
        {pestanaActiva === 'horarios' && <Horarios />}
        {pestanaActiva === 'admin' && esAdmin && <Admin />}
      </main>
    </div>
  );
}
