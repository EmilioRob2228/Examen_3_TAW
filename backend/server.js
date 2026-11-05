import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rutasAuth from './routes/auth.js';
import rutasEstudiante from './routes/estudiante.js';
import rutasAcademicas from './routes/academico.js';
import rutasAreas from './routes/areas.js';
import rutasAdmin from './routes/admin.js';
import { ErrorSII } from './services/sii.js';

const app = express();
const PUERTO = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok' });
});

app.use('/api/auth', rutasAuth);
app.use('/api', rutasEstudiante);
app.use('/api', rutasAcademicas);
app.use('/api/areas', rutasAreas);
app.use('/api/admin', rutasAdmin);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  if (error instanceof ErrorSII) {
    return res.status(error.status).json({ error: error.message });
  }
  res.status(500).json({ error: error.message || 'Error interno del servidor' });
});

app.listen(PUERTO, () => {
  console.log(`Backend corriendo en http://localhost:${PUERTO}`);
});
