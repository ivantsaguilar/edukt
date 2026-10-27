import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://edukt_user:edukt_password@localhost:5432/edukt_db';

const pool = new Pool({ connectionString });

export async function runSeeder() {
  console.log('Inicializando esquema y seeder en la base de datos...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS topics (
      id INT PRIMARY KEY,
      order_index INT UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contents (
      id VARCHAR(50) PRIMARY KEY,
      topic_id INT REFERENCES topics(id),
      type VARCHAR(30) NOT NULL, -- 'ACTIVIDAD_PRINCIPAL', 'TEORIA', 'REFUERZO'
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      options JSONB, -- Array de { key: "a", text: "..." }
      correct_option VARCHAR(10)
    );

    CREATE TABLE IF NOT EXISTS student_progress (
      id INT PRIMARY KEY DEFAULT 1,
      current_topic_id INT REFERENCES topics(id),
      current_step VARCHAR(30) NOT NULL, -- 'ACTIVIDAD_PRINCIPAL', 'TEORIA', 'REFUERZO', 'COMPLETADO'
      status VARCHAR(20) NOT NULL -- 'EN_PROGRESO', 'COMPLETADO'
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id SERIAL PRIMARY KEY,
      topic_id INT REFERENCES topics(id),
      content_id VARCHAR(50) REFERENCES contents(id),
      selected_option VARCHAR(10) NOT NULL,
      is_correct BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insertar Temas
  await pool.query(`
    INSERT INTO topics (id, order_index, title) VALUES
    (1, 1, 'Operaciones algebraicas'),
    (2, 2, 'Ecuaciones lineales'),
    (3, 3, 'Ecuaciones cuadráticas')
    ON CONFLICT (id) DO NOTHING;
  `);

  // Insertar Contenidos
  await pool.query(`
    INSERT INTO contents (id, topic_id, type, title, body, options, correct_option) VALUES
    -- Tema 1
    ('A1', 1, 'ACTIVIDAD_PRINCIPAL', 'Actividad principal A1', 'Resuelve $x+4=9$.', '[{"key":"a","text":"3"},{"key":"b","text":"5"},{"key":"c","text":"13"}]', 'b'),
    ('T1', 1, 'TEORIA', 'Contenido teórico T1: Despeje de incógnitas', 'Para resolver una ecuación, debemos encontrar el valor de la incógnita que hace verdadera la igualdad. Podemos realizar operaciones equivalentes en ambos lados. Ejemplo: $x+4=9 \\implies x=5$.', NULL, NULL),
    ('R1', 1, 'REFUERZO', 'Actividad de refuerzo R1', 'Resuelve $3x=12$.', '[{"key":"a","text":"4"},{"key":"b","text":"9"},{"key":"c","text":"36"}]', 'a'),

    -- Tema 2
    ('A2', 2, 'ACTIVIDAD_PRINCIPAL', 'Actividad principal A2', 'Resuelve $2x+3=11$.', '[{"key":"a","text":"7"},{"key":"b","text":"4"},{"key":"c","text":"5"}]', 'b'),
    ('T2', 2, 'TEORIA', 'Contenido teórico T2: Ecuaciones lineales de varios pasos', 'Primero podemos eliminar los términos que se suman o restan y después despejar el coeficiente. Ejemplo: $2x+3=11 \\implies 2x=8 \\implies x=4$.', NULL, NULL),
    ('R2', 2, 'REFUERZO', 'Actividad de refuerzo R2', 'Resuelve $5x-7=8$.', '[{"key":"a","text":"1"},{"key":"b","text":"3"},{"key":"c","text":"5"}]', 'b'),

    -- Tema 3
    ('A3', 3, 'ACTIVIDAD_PRINCIPAL', 'Actividad principal A3', 'Resuelve $x^2-5x+6=0$.', '[{"key":"a","text":"x=2, x=3"},{"key":"b","text":"x=1, x=6"},{"key":"c","text":"x=-2, x=-3"}]', 'a'),
    ('T3', 3, 'TEORIA', 'Contenido teórico T3: Resolución de ecuaciones cuadráticas', 'Algunas ecuaciones cuadráticas pueden resolverse mediante factorización: $(x-2)(x-3)=0 \\implies x=2 \\text{ o } x=3$.', NULL, NULL),
    ('R3', 3, 'REFUERZO', 'Actividad de refuerzo R3', 'Resuelve $x^2-9=0$.', '[{"key":"a","text":"x=3 únicamente"},{"key":"b","text":"x=-3, x=3"},{"key":"c","text":"x=-9, x=9"}]', 'b')
    ON CONFLICT (id) DO NOTHING;
  `);

  // Inicializar Estado
  await pool.query(`
    INSERT INTO student_progress (id, current_topic_id, current_step, status)
    VALUES (1, 1, 'ACTIVIDAD_PRINCIPAL', 'EN_PROGRESO')
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log('Base de datos inicializada e información cargada exitosamente.');
}

// INVOCACIÓN AUTOMÁTICA AL EJECUTAR EL ARCHIVO DIRECTAMENTE
if (require.main === module) {
  runSeeder()
    .then(() => pool.end())
    .catch((err) => {
      console.error('Error al ejecutar el seeder:', err);
      pool.end();
      process.exit(1);
    });
}