import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calificaciones from './pages/Calificaciones';
import Kardex from './pages/Kardex';
import Horarios from './pages/Horarios';
import Areas from './pages/Areas';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import { obtenerToken, eliminarToken, obtenerEstudiante } from './services/api';
import './App.css';

export default function App() {
  const [tokenActual, setTokenActual] = useState(obtenerToken());
  const [pestanaActiva, setPestanaActiva] = useState('dashboard');
  const [esAdmin, setEsAdmin] = useState(false);
  const [estudiante, setEstudiante] = useState(null);

  useEffect(() => {
    if (!tokenActual) {
      setEsAdmin(false);
      setEstudiante(null);
      return;
    }
    obtenerEstudiante()
      .then(datos => {
        setEstudiante(datos);
        setEsAdmin(Boolean(datos?.es_admin));
      })
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
    <Layout
      pestanaActiva={pestanaActiva}
      onCambiarPestana={setPestanaActiva}
      esAdmin={esAdmin}
      estudiante={estudiante}
      onCerrarSesion={cerrarSesion}
    >
      {pestanaActiva === 'dashboard' && <Dashboard />}
      {pestanaActiva === 'calificaciones' && <Calificaciones />}
      {pestanaActiva === 'areas' && <Areas />}
      {pestanaActiva === 'kardex' && <Kardex />}
      {pestanaActiva === 'horarios' && <Horarios />}
      {pestanaActiva === 'admin' && esAdmin && <Admin />}
    </Layout>
  );
}
