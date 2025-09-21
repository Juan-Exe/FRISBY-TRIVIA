const express = require('express');
const mysql = require('mysql2');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3001;

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// WebSocket
wss.on('connection', ws => {
    console.log("🟢 Cliente conectado");
    ws.on('message', message => {
        console.log("📨", message);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

// MySQL conexión
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'frisby_trivia'
});
db.connect(err => {
    if (err) throw err;
    console.log("🟢 Conectado a MySQL");
});

// 🟢 Ruta para registrar preguntas
app.post('/registrar-pregunta', (req, res) => {
    let { tema, enunciado, respuestaA, respuestaB, respuestaC, respuestaD, correcta, dificultad } = req.body;
    dificultad = dificultad.toLowerCase().trim();

    const dificultadesValidas = ["facil", "intermedio", "dificil"];
    if (!dificultadesValidas.includes(dificultad)) {
        return res.status(400).send('Dificultad inválida. Debe ser: facil, intermedio o dificil');
    }

    const sql = `INSERT INTO preguntas (tema, enunciado, respuestaA, respuestaB, respuestaC, respuestaD, correcta, dificultad)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [tema, enunciado, respuestaA, respuestaB, respuestaC, respuestaD, correcta, dificultad], (err) => {
        if (err) return res.status(500).send('Error al registrar');
        res.status(200).send('Pregunta registrada correctamente');
    });
});

// 🟢 Obtener pregunta por ID
app.get('/pregunta/:id', (req, res) => {
    const sql = 'SELECT * FROM preguntas WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err || result.length === 0) return res.status(404).send('Pregunta no encontrada');
        res.json(result[0]);
    });
});

// 🟢 Eliminar pregunta
app.delete('/eliminar-pregunta/:id', (req, res) => {
    const sql = 'DELETE FROM preguntas WHERE id = ?';
    db.query(sql, [req.params.id], (err) => {
        if (err) {
            console.error("❌ Error al eliminar:", err);
            return res.status(500).send('Error al eliminar pregunta');
        }
        res.send('✅ Pregunta eliminada correctamente');
    });
});

// 🟢 Conteo por dificultad con conversión a minúscula
app.get('/conteo-preguntas', (req, res) => {
    const sql = `
        SELECT LOWER(TRIM(dificultad)) AS dificultad, COUNT(*) as cantidad
        FROM preguntas
        GROUP BY dificultad
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ Error al contar preguntas:", err);
            return res.status(500).send("Error al contar preguntas");
        }

        const conteo = {
            facil: 0,
            intermedio: 0,
            dificil: 0,
        };

        result.forEach(row => {
            const dif = row.dificultad;
            if (conteo.hasOwnProperty(dif)) {
                conteo[dif] = row.cantidad;
            }
        });

        res.json(conteo);
    });
});

// 🟢 Editar pregunta con validación mejorada
app.put('/Editar-Preguntas/:id', (req, res) => {
    let { tema, enunciado, respuestaA, respuestaB, respuestaC, respuestaD, correcta, dificultad } = req.body;
    dificultad = dificultad.toLowerCase().trim();

    const dificultadesValidas = ["facil", "intermedio", "dificil"];
    if (!dificultadesValidas.includes(dificultad)) {
        return res.status(400).send('Dificultad inválida. Debe ser: facil, intermedio o dificil');
    }

    const sql = `UPDATE preguntas 
                 SET tema = ?, enunciado = ?, respuestaA = ?, respuestaB = ?, respuestaC = ?, respuestaD = ?, correcta = ?, dificultad = ? 
                 WHERE id = ?`;
    db.query(sql, [tema, enunciado, respuestaA, respuestaB, respuestaC, respuestaD, correcta, dificultad, req.params.id], (err, result) => {
        if (err) {
            console.error("❌ Error al actualizar pregunta:", err);
            return res.status(500).send('Error al actualizar');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Pregunta no encontrada para actualizar');
        }

        res.send('Pregunta actualizada correctamente');
    });
});

app.get('/temas-por-dificultad', (req, res) => {
    const sql = `
        SELECT DISTINCT tema, LOWER(TRIM(dificultad)) AS dificultad
        FROM preguntas
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener temas:", err);
            return res.status(500).send('Error al obtener temas');
        }

        const temasPorDificultad = {
            facil: [],
            intermedio: [],
            dificil: []
        };

        results.forEach(row => {
            if (temasPorDificultad[row.dificultad]) {
                if (!temasPorDificultad[row.dificultad].includes(row.tema)) {
                    temasPorDificultad[row.dificultad].push(row.tema);
                }
            }
        });

        res.json(temasPorDificultad);
    });
});

// 🟢 Conteo de temas disponibles por dificultad
app.get('/conteo-temas', (req, res) => {
    const sql = `
        SELECT LOWER(TRIM(dificultad)) AS dificultad, tema, COUNT(*) AS cantidad
        FROM preguntas
        GROUP BY dificultad, tema
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error al contar temas:", err);
            return res.status(500).send("Error al contar temas");
        }

        const conteoTemas = {
            facil: {},
            intermedio: {},
            dificil: {}
        };

        results.forEach(row => {
            const { dificultad, tema, cantidad } = row;
            if (conteoTemas[dificultad]) {
                conteoTemas[dificultad][tema] = cantidad;
            }
        });

        res.json(conteoTemas);
    });
});



// 🟢 Obtener todas las preguntas
app.get('/preguntas', (req, res) => {
    db.query('SELECT * FROM preguntas', (err, results) => {
        if (err) return res.status(500).send('Error al obtener preguntas');
        res.json(results);
    });
});

// Express.js ejemplo
// 🟢 Obtener pregunta aleatoria (solo del tema actual, sin comodín)
app.post('/pregunta-random', (req, res) => {
    const { tema, yaUsadas = [], dificultad } = req.body;

    const sql = `
        SELECT * FROM preguntas 
        WHERE tema = ? 
          AND LOWER(TRIM(dificultad)) = ?
          ${yaUsadas.length ? `AND id NOT IN (${yaUsadas.map(() => '?').join(',')})` : ''}
    `;

    const params = [tema, dificultad, ...yaUsadas];

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("❌ Error al obtener pregunta:", err);
            return res.status(500).send('Error interno');
        }

        if (results.length === 0) {
            return res.status(404).send("No hay preguntas disponibles en este tema");
        }

        const pregunta = results[Math.floor(Math.random() * results.length)];

        res.json({
            id: pregunta.id,
            enunciado: pregunta.enunciado,
            respuestas: {
                a: pregunta.respuestaA,
                b: pregunta.respuestaB,
                c: pregunta.respuestaC,
                d: pregunta.respuestaD
            },
            correcta: pregunta.correcta,
            tema
        });
    });
});


// 🟢 Ruta para comodín extra (cambio de tema si no hay preguntas en el actual)
app.post("/comodin-extra", (req, res) => {
    const { tema, dificultad, yaUsadas = [], futurasRondasTemas = [] } = req.body;

    const consultaPregunta = (temaIntento) => {
        return new Promise((resolve, reject) => {
            const sql = `
            SELECT * FROM preguntas 
            WHERE tema = ? 
              AND LOWER(TRIM(dificultad)) = ?
              ${yaUsadas.length ? `AND id NOT IN (${yaUsadas.map(() => '?').join(',')})` : ''}
        `;
            const params = [temaIntento, dificultad, ...yaUsadas];

            db.query(sql, params, (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return resolve(null);

                const raw = results[Math.floor(Math.random() * results.length)];
                const pregunta = {
                    id: raw.id,
                    enunciado: raw.enunciado,
                    respuestas: {
                        a: raw.respuestaA,
                        b: raw.respuestaB,
                        c: raw.respuestaC,
                        d: raw.respuestaD
                    },
                    correcta: raw.correcta,
                    tema: raw.tema
                };
                resolve(pregunta);
            });
        });
    };


    (async () => {
        try {
            // Intentamos primero con el tema original
            let pregunta = await consultaPregunta(tema);
            if (pregunta) return res.json(pregunta);

            // Buscar otros temas disponibles de la misma dificultad
            const temaQuery = `
                SELECT DISTINCT tema FROM preguntas 
                WHERE LOWER(TRIM(dificultad)) = ?
            `;
            db.query(temaQuery, [dificultad], async (err, results) => {
                if (err) return res.status(500).json({ error: "Error al obtener temas" });

                const temasFiltrados = results
                    .map(r => r.tema)
                    .filter(t => t !== tema && !futurasRondasTemas.includes(t));

                for (const nuevoTema of temasFiltrados) {
                    pregunta = await consultaPregunta(nuevoTema);
                    if (pregunta) {
                        pregunta.temaCambiado = nuevoTema;
                        return res.json(pregunta);
                    }
                }

                res.status(404).json({ error: "No hay preguntas disponibles en ningún tema alterno" });
            });
        } catch (e) {
            console.error("❌ Error comodín:", e);
            res.status(500).json({ error: "Error interno en comodín" });
        }
    })();
});



app.get("/temas-dificiles", (req, res) => {
    const query = `
        SELECT DISTINCT tema 
        FROM preguntas 
        WHERE dificultad = 'dificil'
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Error al obtener temas difíciles" });
        const temas = results.map(r => r.tema);
        res.json(temas);
    });
});



// 🟢 Obtener temas disponibles para una dificultad
app.post('/temas-dificultad', (req, res) => {
    const { dificultad } = req.body;

    if (!dificultad || !["facil", "intermedio", "dificil"].includes(dificultad.toLowerCase().trim())) {
        return res.status(400).send('Dificultad inválida');
    }

    const sql = `
        SELECT DISTINCT tema 
        FROM preguntas 
        WHERE LOWER(TRIM(dificultad)) = ?
    `;

    db.query(sql, [dificultad.toLowerCase().trim()], (err, results) => {
        if (err) {
            console.error("❌ Error al obtener temas:", err);
            return res.status(500).send('Error al obtener temas por dificultad');
        }

        const temas = results.map(row => row.tema);
        res.json(temas);
    });
});



// Archivos estáticos (al final)
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
