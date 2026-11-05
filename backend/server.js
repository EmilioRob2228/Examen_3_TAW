import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rutasAcademicas from './routes/academico.js';
import rutasAreas from './routes/areas.js';
import rutasAdmin from './routes/admin.js';
import { ErrorSII } from './services/sii.js';

const aplicacion = express();
const PUERTO = process.env.PORT || 3000;

aplicacion.use(cors());
aplicacion.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

aplicacion.use(express.json());

aplicacion.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok' });
});

aplicacion.use('/api', rutasAcademicas);
aplicacion.use('/api/areas', rutasAreas);
aplicacion.use('/api/admin', rutasAdmin);

aplicacion.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

aplicacion.use((error, req, res, next) => {
  if (error instanceof ErrorSII) {
    return res.status(error.status).json({ error: error.message });
  }
  res.status(500).json({ error: error.message || 'Error interno del servidor' });
});

aplicacion.listen(PUERTO, () => {
  console.log(`Backend corriendo en http://localhost:${PUERTO}`);
});
