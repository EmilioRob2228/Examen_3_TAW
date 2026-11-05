import { useState } from 'react';
import { iniciarSesion, guardarToken } from '../services/api';

export default function Login({ alIniciarSesion }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña');
      return;
    }

    try {
      setCargando(true);
      const { token } = await iniciarSesion(email.trim(), password);
      guardarToken(token);
      alIniciarSesion(token);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="contenedor-principal">
      <form className="cuadro-sesion" onSubmit={enviar} noValidate>
        <h2>Sistema SII - Acceso</h2>
        <p>Inicia sesión con tu cuenta del SII</p>

        <input
          type="email"
          placeholder="Correo institucional"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && <p className="mensaje-error">{error}</p>}

        <button type="submit" className="boton-primario" style={{ width: '100%' }} disabled={cargando}>
          {cargando ? 'Entrando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}
