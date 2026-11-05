import { useState } from 'react';
import { Mail, Lock, LoaderCircle } from 'lucide-react';
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
    <div className="flex min-h-screen">
      <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-10 text-center md:flex">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full border-[40px] border-white/5" />
        <div className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full border-[48px] border-oro-500/10" />
        <div className="absolute right-16 top-16 h-24 w-24 rounded-full bg-oro-500/10" />

        <div className="relative">
          <div className="mx-auto mb-10 flex h-64 w-64 items-center xl:h-80 xl:w-80 justify-center rounded-full bg-white/5 p-4 ring-1 ring-white/10 shadow-2xl">
            <img src="/linces.png" alt="Linces TecNM en Celaya" className="h-full w-full rounded-full" />
          </div>
          <h2 className="mb-3 text-4xl font-semibold tracking-tight text-white">Orientación SII</h2>
          <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-oro-500" />
          <p className="mx-auto max-w-md text-lg text-brand-100">
            Consulta tu información académica y descubre hacia qué área profesional apuntas según tu kardex.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <form onSubmit={enviar} noValidate className="w-full max-w-md">
          <img src="/linces.png" alt="" className="mb-6 h-20 w-20 rounded-full md:hidden" />
          <h1 className="mb-1 text-3xl font-semibold text-gray-800">Iniciar sesión</h1>
          <p className="mb-8 text-sm text-gray-500">Entra con tu correo institucional y tu contraseña del SII.</p>

          <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="email">Correo institucional</label>
          <div className="relative mb-5">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              placeholder="l00000000@celaya.tecnm.mx"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm shadow-theme-xs outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="password">Contraseña</label>
          <div className="relative mb-5">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              type="password"
              placeholder="Tu contraseña del SII"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm shadow-theme-xs outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-700 disabled:opacity-70"
          >
            {cargando && <LoaderCircle size={18} className="animate-spin" />}
            {cargando ? 'Entrando...' : 'Iniciar sesión'}
          </button>

          <p className="mt-8 text-center text-xs text-gray-400">
            Proyecto académico de Tópicos Avanzados de Desarrollo Web. No es la plataforma oficial del TecNM.
          </p>
        </form>
      </div>
    </div>
  );
}
