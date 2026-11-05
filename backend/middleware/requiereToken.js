export function requiereToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Sesión no iniciada' });
  }

  req.token = token;
  next();
}
