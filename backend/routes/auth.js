import { Router } from 'express';
import { llamarSII, responderError, ErrorSII } from '../services/sii.js';

const router = Router();

router.post('/login', async (req, res) => {
  const email = req.body?.email?.trim();
  const password = req.body?.password;

  if (!email || !password) {
    return res.status(400).json({ error: 'Escribe tu correo y tu contraseña' });
  }

  try {
    const datos = await llamarSII('/login', {
      metodo: 'POST',
      cuerpo: { email, password }
    });

    const token = datos?.message?.login?.token;
    if (!token) {
      return res.status(502).json({ error: 'El SII no regresó un token' });
    }

    res.json({ token });
  } catch (error) {
    if (error instanceof ErrorSII && error.status === 401) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    responderError(res, error);
  }
});

export default router;
