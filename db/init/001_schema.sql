CREATE DATABASE IF NOT EXISTS frisby_trivia;
USE frisby_trivia;

CREATE TABLE IF NOT EXISTS preguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tema VARCHAR(100) NOT NULL,
  enunciado TEXT NOT NULL,
  respuestaA VARCHAR(255) NOT NULL,
  respuestaB VARCHAR(255) NOT NULL,
  respuestaC VARCHAR(255) NOT NULL,
  respuestaD VARCHAR(255) NOT NULL,
  correcta CHAR(1) NOT NULL,
  dificultad VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tema (tema),
  INDEX idx_dificultad (dificultad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO preguntas (tema, enunciado, respuestaA, respuestaB, respuestaC, respuestaD, correcta, dificultad)
VALUES
  ('Frisby', 'En que ano se fundo Frisby?', '1965', '1977', '1989', '1995', 'b', 'facil'),
  ('Colombia', 'Cual es la capital de Colombia?', 'Medellin', 'Cali', 'Bogota', 'Barranquilla', 'c', 'facil'),
  ('Cultura General', 'Cuantos continentes existen tradicionalmente?', '5', '6', '7', '8', 'c', 'intermedio')
ON DUPLICATE KEY UPDATE enunciado = VALUES(enunciado);
