export function requiereToken(req, res, next) {
  const encabezado = req.headers.authorization;
  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = encabezado.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  req.token = token;
  next();
}

