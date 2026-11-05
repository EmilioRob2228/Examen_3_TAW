# Propuesta de Funcionalidad Extra: Orientación por Área Profesional

## 1. Problema
Los estudiantes de la carrera suelen enfrentarse a momentos críticos de decisión académica y profesional —como la elección de materias optativas, la línea de especialidad, el proyecto de residencias profesionales y el rumbo de su carrera laboral al egresar— sin contar con información cuantitativa u objetiva sobre sus fortalezas reales. Habitualmente, esta elección se realiza por intuición, recomendaciones informales o la influencia de compañeros, pasando por alto el rendimiento histórico y específico que el alumno ha demostrado a lo largo de su trayectoria académica.

## 2. Solución
Se desarrolló un módulo de orientación vocacional y profesional integrado al sistema, el cual consume directamente el kardex oficial del alumno desde el SII en tiempo real. 

El algoritmo clasifica las materias significativas cursadas en áreas de especialización predefinidas (tales como Desarrollo de Software, Bases de Datos y Datos, Redes, Hardware e Inteligencia Artificial). Descarta calificaciones no cuantitativas y calcula un promedio ponderado según la relevancia y peso curricular de cada materia. 

A partir de un mínimo configurable de materias cursadas por área, el sistema genera:
- Una recomendación principal del área con mayor desempeño si el estudiante cuenta con suficiente información representativa en al menos dos áreas.
- Gráficas comparativas de rendimiento por área profesional.
- Un desglose transparente que detalla exactamente qué materias influyeron en el cálculo de cada área.
- Un panel administrativo que faculta a los coordinadores a actualizar áreas, asignar materias y calibrar los mínimos requeridos sin modificar código.

## 3. Beneficio para los Estudiantes
- **Toma de decisiones fundamentada:** Los alumnos eligen especialidad y residencias con base en evidencia empírica de sus propias competencias demostradas.
- **Transparencia total:** El estudiante conoce con exactitud el peso y la calificación de cada materia involucrada en su evaluación.
- **Seguridad y privacidad:** Los datos del kardex no son almacenados en bases de datos externas; se procesan al vuelo directamente desde el SII respetando la confidencialidad.
- **Flexibilidad institucional:** La coordinación de la carrera puede adaptar las áreas y retículas a las necesidades cambiantes del mercado laboral.

