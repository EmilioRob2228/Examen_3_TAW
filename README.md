# Orientación SII

Aplicación web que consume el API del SII del TecNM Celaya para que el estudiante consulte su información académica, y que agrega una funcionalidad propia: orientación por área profesional según su kardex.

Proyecto del Examen 3 de Tópicos Avanzados de Desarrollo Web. No es la plataforma oficial del TecNM.

**Demo:** https://examen-3-taw.vercel.app

## Arquitectura

```
React + Vite (frontend, Vercel)
        |
        |  Authorization: Bearer <token>
        v
Backend propio en Express (Render)
        |                         |
        v                         v
API del SII ITC              Supabase
(autenticación y datos)      (áreas y materias de la funcionalidad extra)
```

- El frontend solo se comunica con nuestro backend. Nunca llama al SII ni a Supabase.
- El backend reenvía el login y las consultas al SII con el token del alumno, aplica la lógica de negocio y administra la funcionalidad extra.
- Los datos académicos no se copian: el SII es la única fuente de verdad.

## Tecnología elegida: React + Vite

Vite ofrece un arranque minimalista y recarga instantánea (HMR) durante el desarrollo, ideal para una aplicación de una sola página (SPA) con varias secciones como esta. React permite dividir la interfaz en componentes reutilizables y manejar el estado de cada pantalla con `useState` y `useEffect`. Se eligió por la experiencia previa del equipo y para mantener separadas las capas de frontend y backend.

El diseño se construyó con Tailwind CSS, con un tema inspirado en la plantilla TailAdmin y los colores del Tec Celaya, e íconos de `lucide-react`.

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, lucide-react |
| Backend | Node.js, Express, dotenv, cors |
| Base de datos | Supabase (PostgreSQL) |
| Despliegue | Vercel (frontend) y Render (backend) |

## Funcionalidades

1. **Autenticación:** inicio de sesión con las credenciales del SII, token JWT guardado en `sessionStorage`, manejo de errores y protección de secciones.
2. **Información del estudiante:** dashboard con perfil, indicadores y avance de la carrera.
3. **Calificaciones:** tabla por materia con búsqueda en tiempo real y colores de desempeño.
4. **Kardex y horario:** historial agrupado por semestre y horario organizado por día y hora.
5. **Orientación por área (funcionalidad extra):** calcula el promedio ponderado del alumno en cada área profesional y recomienda la más fuerte. Incluye un panel de administración para configurar áreas, materias, pesos y el mínimo de materias. La propuesta completa está en [PROPUESTA.md](PROPUESTA.md).

## Endpoints del backend

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/login` | Inicia sesión en el SII y regresa el token |
| GET | `/api/estudiante` | Perfil del estudiante |
| GET | `/api/calificaciones` | Calificaciones del periodo |
| GET | `/api/kardex` | Historial académico |
| GET | `/api/horarios` | Horario del semestre |
| GET | `/api/areas/resultado` | Promedio por área y área recomendada |
| GET, POST, PUT, DELETE | `/api/admin/...` | Administración de áreas, materias y configuración (solo administradores) |

## Instalación y ejecución local

Requisitos: Node.js 18 o superior y un proyecto de Supabase con las tablas `areas`, `area_materias` y `configuracion`.

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/EmilioRob2228/Examen_3_TAW.git
   cd Examen_3_TAW
   ```

2. Backend:

   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

   Llenar en `backend/.env` los valores de `SUPABASE_URL`, `SUPABASE_SECRET_KEY` y `ADMIN_EMAILS` (correos de administradores separados por coma). El backend corre en `http://localhost:3001`.

3. Frontend, en otra terminal:

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

   Abrir `http://localhost:5173`.

## Capturas

| Inicio de sesión | Inicio |
| --- | --- |
| ![Login](docs/capturas/login.png) | ![Inicio](docs/capturas/inicio.png) |

| Calificaciones | Kardex |
| --- | --- |
| ![Calificaciones](docs/capturas/calificaciones.png) | ![Kardex](docs/capturas/kardex.png) |

| Horario | Orientación por áreas |
| --- | --- |
| ![Horario](docs/capturas/horario.png) | ![Áreas](docs/capturas/areas.png) |

| Administración | Vista en celular |
| --- | --- |
| ![Administración](docs/capturas/admin.png) | ![Celular](docs/capturas/celular.png) |

## Equipo

- Emilio Andrés Gómez Robles
- Pedro Emiliano Valencia González

