import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PUERTO = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PUERTO, () => {
  console.log(`Backend corriendo en http://localhost:${PUERTO}`);
});
