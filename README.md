# Frisby Trivia

Juego de trivia interactivo estilo *¿Quién quiere ser millonario?*, diseñado para ser usado en transmisiones en vivo con OBS. El Host controla el juego desde el navegador mientras los jugadores compiten en pantalla.

---

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express 5 |
| Base de datos | MariaDB (Docker) |
| Frontend | HTML, CSS, JavaScript vanilla |
| Infraestructura | Docker + Docker Compose |
| Conector DB | mysql2 |

---

## Cómo correr el proyecto

### Requisitos
- Docker Desktop instalado y corriendo

### Pasos

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd FRISBY-TRIVIA

# Levantar todo (app + base de datos)
npm run docker:up
```

La app queda disponible en `http://localhost:3001`

### Credenciales de la base de datos (DBeaver u otro cliente)

| Campo | Valor |
|---|---|
| Host | localhost |
| Puerto | 3307 |
| Base de datos | frisby_trivia |
| Usuario | frisby_user |
| Contraseña | frisby_pass_2026 |
| Driver | MariaDB / MySQL |

### Comandos útiles

```bash
npm run docker:up      # Levantar contenedores
npm run docker:down    # Bajar contenedores
npm run docker:logs    # Ver logs en tiempo real
```

---

## Estructura del proyecto

```
FRISBY-TRIVIA/
├── server.js                  # API REST con Express
├── docker-compose.yml         # App + MariaDB
├── Dockerfile
├── db/
│   └── init/
│       ├── 001_schema.sql     # Esquema de la base de datos
│       └── 002_seed_trivia.sql # Preguntas iniciales de ejemplo
└── public/
    ├── index.html             # Pantalla de inicio (Host)
    ├── styles.css
    ├── Pre-Inicio/            # Selección de categorías por ronda
    ├── Juego/                 # Pantalla principal del juego
    ├── Registrar_Preguntas/   # Módulo para agregar preguntas
    └── Gestionar_Preguntas/   # Módulo para administrar preguntas (en desarrollo)
```

---

## Cómo funciona el juego

### Rol del Host
El Host es quien opera el juego. Antes de empezar:
1. Registra preguntas desde **Registrar Preguntas** (con categoría y dificultad)
2. En la pantalla de inicio presiona **Iniciar**
3. En la pantalla de **Pre-Inicio** asigna una categoría de pregunta a cada una de las 15 rondas
4. Comienza el juego

### Dinámica de juego
- **15 rondas** divididas en tres bloques de dificultad:
  - Rondas 1–5: Fácil
  - Rondas 6–10: Intermedio
  - Rondas 11–15: Difícil
- Cada ronda muestra una pregunta de la categoría asignada con 4 opciones (A, B, C, D)
- El Host va revelando el enunciado y las respuestas con clics
- El jugador selecciona una respuesta; un segundo clic sobre la misma la confirma

### Comodines
El juego tiene 4 comodines:

| Comodín | Descripción |
|---|---|
| **Llamada** | Activa un temporizador de 60 segundos para "llamar a un amigo" |
| **50/50** | Elimina 2 respuestas incorrectas |
| **Ruleta** | Gira una ruleta que elimina entre 0 y 3 respuestas incorrectas aleatoriamente |
| **Uso Carruso** *(ronda 11+)* | Descarta la pregunta actual y la reemplaza por otra del sistema |

### Mecánica especial — Ronda 10 (Aureola)
Al llegar a la ronda 10, el jugador tiene **una segunda oportunidad**:
- Si responde mal, la aureola se "gasta" (vuelve a su versión transparente) y puede volver a intentarlo
- Si falla por segunda vez, es **Game Over**
- Si acierta en cualquiera de los dos intentos, avanza normalmente

### Game Over
Al responder incorrectamente (sin segunda oportunidad disponible), aparece un modal **GAME OVER** con opción de volver al inicio.

---

## Base de datos

### Tabla `preguntas`

| Campo | Tipo | Descripción |
|---|---|---|
| id | INT (PK) | Identificador único |
| enunciado | TEXT | Texto de la pregunta |
| a / b / c / d | VARCHAR | Opciones de respuesta |
| correcta | CHAR(1) | Letra correcta (a, b, c, d) |
| dificultad | ENUM | facil / intermedio / dificil |
| tema | VARCHAR | Categoría (videojuegos, series, etc.) |

### Categorías incluidas en el seed inicial
- Videojuegos
- Series
- Películas
- Cultura pop
- Música

---

## Uso con OBS

Este juego está diseñado para transmisiones en vivo:

1. Agregar una fuente **Navegador** en OBS apuntando a `http://localhost:3001/Juego/index.html`
2. Activar **"Quitar fondo"** en la configuración de la fuente del navegador (chroma key o color key sobre blanco)
3. Agregar las cámaras del Host y del participante como fuentes separadas
4. El Host controla el juego desde su propio navegador; los jugadores ven la pantalla compartida

---

## Módulos en desarrollo

- **Gestionar Preguntas**: Panel para ver, bloquear y administrar preguntas ya jugadas, útil para reutilizar el juego con los mismos jugadores sin repetir preguntas

---

## Aviso legal

Las canciones incluidas en el proyecto fueron descargadas de YouTube con fines de **uso personal y entretenimiento**. No se busca ningún rédito económico ni se reivindica autoría sobre ellas. Todos los derechos pertenecen a sus respectivos autores. Este proyecto es de carácter recreativo y no comercial.

---

## Inspiración

Inspirado directamente en el formato del programa *¿Quién quiere ser millonario?* / *El Concorcillo*, adaptado para ser jugado entre amigos en un ambiente informal y divertido.
