# Backlog de Videojuegos

CRUD para gestionar mi backlog personal de videojuegos.
Permite agregar, listar, editar y eliminar juegos, con filtros por
estado, género y búsqueda por título.

## Tecnologías
- Node.js + Express
- MongoDB 
- HTML, CSS y JavaScript 

## Ramas
* **`feature/agregar-readme`**: Mejorar el README
* **`feature/filtro-plataforma`**: Agregar filtro por plataforma en `routes/juegos.js`
* **`feature/estadisticas-genero`**: Agregar conteo por género en las stats
* **`feature/validar-notas`**: Ajustar validación en `models/Juego.js`
* **`hotfix/fix-mensaje-conexion`**: Corregir un texto en `server.js`

## Estadísticas
El endpoint principal devuelve estadísticas: total de juegos,
conteo por estado, conteo por género y calificación promedio.

## Filtros disponibles
La lista de juegos se puede filtrar por estado, género, plataforma
y búsqueda por título.

## Validaciones
La calificación solo acepta valores entre 0 y 10, con mensajes
de error personalizados.

## Notas
Corrección de un comentario y descripción de conexión a la base de datos.

## Autor
Elias Mateo - 2022-1922 — Programación III 