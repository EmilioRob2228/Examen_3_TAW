import { useState, useEffect } from 'react';
import Kardex from './pages/Kardex';
import Horarios from './pages/Horarios';
import Areas from './pages/Areas';
import Admin from './pages/Admin';
import { obtenerToken, guardarToken, eliminarToken } from './services/api';
import './App.css';

export default function App() {
  const [tokenActual, setTokenActual] = useState(obtenerToken());
  const [tokenIngreso, setTokenIngreso] = useState('');
  const [pestanaActiva, setPestanaActiva] = useState('areas');

  useEffect(() => {
    function alExpirar() {
      setTokenActual(null);
    }
    window.addEventListener('sesion_expirada', alExpirar);
    return () => {
      window.removeEventListener('sesion_expirada', alExpirar);
    };
  }, []);

  function iniciarSesionTemporal(e) {
    e.preventDefault();
    if (!tokenIngreso.trim()) return;
    guardarToken(tokenIngreso.trim());
    setTokenActual(tokenIngreso.trim());
    setTokenIngreso('');
  }

  function cerrarSesion() {
    eliminarToken();
    setTokenActual(null);
  }

  if (!tokenActual) {
    return (
      <div className="contenedor-principal">
        <div className="cuadro-sesion">
          <h2>Sistema SII - Acceso</h2>
          <p>Ingresa tu Bearer Token del SII (obtenido de Postman o del login) para continuar:</p>
          <form onSubmit={iniciarSesionTemporal}>
            <input
              type="text"
              placeholder="Bearer Token del SII..."
              value={tokenIngreso}
              onChange={e => setTokenIngreso(e.target.value)}
              required
            />
            <button type="submit" className="boton-primario" style={{ width: '100%' }}>
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor-principal">
      <header className="barra-superior">
        <div className="titulo-sistema">TecNM Celaya - Orientación y SII</div>
        <nav className="navegacion-pestanas">
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
          <button
            type="button"
            className={`boton-pestana ${pestanaActiva === 'admin' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('admin')}
          >
            Administración
          </button>
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
        {pestanaActiva === 'areas' && <Areas />}
        {pestanaActiva === 'kardex' && <Kardex />}
        {pestanaActiva === 'horarios' && <Horarios />}
        {pestanaActiva === 'admin' && <Admin />}
      </main>
    </div>
  );
}
