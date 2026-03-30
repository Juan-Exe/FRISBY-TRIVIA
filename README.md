# Frisby Trivia

> Juego de trivia interactivo para transmisiones en vivo, inspirado en **El Concursillo de IlloJuan**.
> Diseñado para que un Host conduzca partidas en tiempo real a través de OBS, con mecánicas de comodines, dificultad progresiva y una segunda oportunidad especial en la ronda 10.

---

## Tabla de contenidos

1. [Stack tecnológico](#stack-tecnológico)
2. [Requisitos e instalación](#requisitos-e-instalación)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Arquitectura](#arquitectura)
5. [Mecánicas del juego](#mecánicas-del-juego)
6. [Comodines](#comodines)
7. [Base de datos](#base-de-datos)
8. [Integración con OBS](#integración-con-obs)
9. [Módulos en desarrollo](#módulos-en-desarrollo)
10. [Aviso legal](#aviso-legal)
11. [Inspiración](#inspiración)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Runtime** | Node.js |
| **Framework backend** | Express 5 |
| **Base de datos** | MariaDB |
| **Conector DB** | mysql2 |
| **Frontend** | HTML5 · CSS3 · JavaScript vanilla |
| **Infraestructura** | Docker + Docker Compose |

---

## Requisitos e instalación

### Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución

### Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd FRISBY-TRIVIA

# 2. Levantar la aplicación y la base de datos
npm run docker:up
```

La aplicación quedará disponible en **`http://localhost:3001`**
La base de datos MariaDB quedará expuesta en el puerto **`3307`**

### Comandos disponibles

```bash
npm run docker:up      # Construir e iniciar todos los contenedores
npm run docker:down    # Detener y eliminar los contenedores
npm run docker:logs    # Ver logs en tiempo real
```

### Credenciales de base de datos

Útiles para conectarse con DBeaver u otro cliente SQL:

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Puerto | `3307` |
| Base de datos | `frisby_trivia` |
| Usuario | `frisby_user` |
| Contraseña | `frisby_pass_2026` |
| Usuario root | `root` |
| Contraseña root | `root_frisby_2026` |
| Driver | MariaDB / MySQL compatible |

---

## Estructura del proyecto

```
FRISBY-TRIVIA/
│
├── server.js                     # Servidor Express — API REST y servicio de archivos estáticos
├── docker-compose.yml            # Orquestación: contenedor app + contenedor MariaDB
├── Dockerfile                    # Imagen de la aplicación Node.js
├── .env                          # Variables de entorno (credenciales, puerto)
├── .env.example                  # Plantilla de variables de entorno
│
├── db/
│   └── init/
│       ├── 001_schema.sql        # Definición del esquema de la base de datos
│       └── 002_seed_trivia.sql   # Preguntas iniciales por categoría y dificultad
│
└── public/                       # Frontend estático servido por Express
    ├── index.html                # Pantalla de inicio — punto de entrada del Host
    ├── styles.css                # Estilos globales compartidos
    ├── Assets/                   # Imágenes, íconos y música del juego
    │
    ├── Pre-Inicio/               # Pantalla de configuración de rondas
    │   └── index.html            # El Host asigna una categoría a cada una de las 15 rondas
    │
    ├── Juego/                    # Pantalla principal del juego (vista OBS)
    │   ├── index.html            # Lógica del juego, comodines y animaciones
    │   └── styles.css
    │
    ├── Registrar_Preguntas/      # Módulo para crear preguntas en la base de datos
    │
    └── Gestionar_Preguntas/      # Módulo de administración de preguntas (en desarrollo)
```

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                        Docker                           │
│                                                         │
│   ┌──────────────────┐        ┌──────────────────────┐  │
│   │   Node.js App    │◄──────►│   MariaDB            │  │
│   │   Express 5      │        │   frisby_trivia DB   │  │
│   │   Puerto: 3001   │        │   Puerto: 3307       │  │
│   └──────────┬───────┘        └──────────────────────┘  │
│              │                                          │
└──────────────┼──────────────────────────────────────────┘
               │
               ▼
    ┌──────────────────┐
    │  Navegador Host  │  ←  Controla el juego
    │  localhost:3001  │
    └──────────────────┘
               │
               ▼
    ┌──────────────────┐
    │       OBS        │  ←  Captura y transmite la pantalla del juego
    └──────────────────┘
```

---

## Mecánicas del juego

### Flujo general

```
Inicio  →  Pre-Inicio  →  Juego  →  Victoria / Game Over  →  Inicio
```

### Rol del Host

El Host conduce la partida completa desde su navegador:

1. **Registrar preguntas** — Accede a *Registrar Preguntas* y carga preguntas con categoría y dificultad
2. **Iniciar partida** — Desde la pantalla de inicio verifica que haya suficientes preguntas y presiona *Iniciar*
3. **Configurar rondas** — En *Pre-Inicio* asigna una categoría temática a cada una de las 15 rondas
4. **Conducir el juego** — Revela el enunciado y las respuestas con clics progresivos durante la transmisión

### Estructura de rondas

| Rondas | Dificultad |
|---|---|
| 1 – 5 | Fácil |
| 6 – 10 | Intermedio |
| 11 – 15 | Difícil |

### Sistema de respuesta

- El Host revela el enunciado y cada opción (A, B, C, D) con clics individuales
- El jugador selecciona una respuesta con un primer clic → se marca visualmente
- Un segundo clic sobre la misma respuesta la **confirma**
- Si es correcta → avanza a la siguiente ronda
- Si es incorrecta → **Game Over** (salvo mecánica especial de ronda 10)

### Mecánica especial — Ronda 10: Aureola

La ronda 10 es la última pregunta de dificultad intermedia. Como recompensa por llegar hasta allí, el jugador cuenta con una **segunda oportunidad**:

- Si responde incorrectamente → la aureola se **gasta** (imagen activa pasa a transparente)
- El jugador puede volver a seleccionar una respuesta diferente
- Si falla por segunda vez → **Game Over**
- Si acierta (en cualquiera de los dos intentos) → avanza normalmente

### Game Over

Al perder aparece un modal **GAME OVER** con música detenida y botón para volver al inicio.

---

## Comodines

El juego dispone de 4 comodines, cada uno de uso único por partida:

| Comodín | Disponible desde | Descripción |
|---|---|---|
| **Llamada** | Ronda 1 | Inicia un temporizador de 60 segundos simulando una llamada de ayuda |
| **50 / 50** | Ronda 1 | Elimina aleatoriamente 2 de las 3 respuestas incorrectas |
| **Ruleta** | Ronda 1 | Gira una ruleta que puede eliminar 0, 1, 2 o 3 respuestas incorrectas |
| **Uso Carruso** | Ronda 11 | Descarta la pregunta actual y la reemplaza por otra del banco de preguntas |

> El comodín **Uso Carruso** se desbloquea únicamente al superar la ronda 10, reflejando que el jugador ha llegado a las preguntas difíciles.

---

## Base de datos

### Esquema — tabla `preguntas`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | INT — PK, AUTO_INCREMENT | Identificador único |
| `enunciado` | TEXT | Texto completo de la pregunta |
| `a` | VARCHAR(255) | Opción A |
| `b` | VARCHAR(255) | Opción B |
| `c` | VARCHAR(255) | Opción C |
| `d` | VARCHAR(255) | Opción D |
| `correcta` | CHAR(1) | Letra de la respuesta correcta (`a`, `b`, `c` o `d`) |
| `dificultad` | ENUM | `facil` / `intermedio` / `dificil` |
| `tema` | VARCHAR(100) | Categoría temática de la pregunta |

### Categorías del seed inicial

- Videojuegos
- Series
- Películas
- Cultura pop
- Música

### Restaurar un backup

```bash
# Colocar el archivo backup.sql en la raíz del proyecto y ejecutar:
docker exec -i frisby_trivia_db mariadb -u root -proot_frisby_2026 frisby_trivia < backup.sql
```

---

## Integración con OBS

Este proyecto está diseñado específicamente para transmisiones en vivo:

### Configuración recomendada en OBS

1. **Fuente Navegador** → URL: `http://localhost:3001/Juego/index.html`
   Resolución: `1920 × 1080`

2. **Quitar el fondo blanco** usando *Filtro de color* (Color Key) sobre blanco en la fuente del navegador — el fondo del juego es blanco puro, lo que facilita el keying

3. **Fuente de cámara del Host** — posicionada en una mitad de la escena

4. **Fuente de cámara del participante** — posicionada en la otra mitad

5. El Host controla el juego desde su propio navegador en segundo plano, sin que interfiera con lo que se ve en OBS

### Resultado en pantalla

```
┌────────────────────────────────────────────────────────┐
│  Cámara Host    │    Cámara Participante               │
│                 │                                      │
│       ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○                  │
│       [ PREGUNTA DEL JUEGO                  ]          │
│       [ Opción A         ]  [ Opción B      ]          │
│       [ Opción C         ]  [ Opción D      ]          │
└────────────────────────────────────────────────────────┘
```

---

## Módulos en desarrollo

### Gestionar Preguntas

Panel de administración con las siguientes funcionalidades planificadas:

- Ver historial de preguntas ya jugadas en partidas anteriores
- Bloquear preguntas para que no vuelvan a aparecer en futuras rondas con el mismo jugador
- Filtrar por categoría, dificultad y estado (activa / bloqueada)

> Útil cuando se juega repetidamente con el mismo grupo de personas.

---

## Aviso legal

Las canciones incluidas en este repositorio fueron obtenidas de YouTube con fines de **uso personal, recreativo y sin ánimo de lucro**. No se reivindica autoría sobre ninguna de ellas. Todos los derechos pertenecen a sus respectivos autores y sellos. Este proyecto no tiene fines comerciales.

---

## Inspiración

Inspirado en **El Concursillo de IlloJuan**, el formato de trivia creado por el streamer español **IlloJuan**, que a su vez toma como referencia el programa *¿Quién quiere ser millonario?*

Frisby Trivia adapta ese formato para que cualquier persona pueda montar su propia versión del juego con amigos, usando únicamente un navegador y OBS.
