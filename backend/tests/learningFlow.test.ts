import request from 'supertest';
import app from '../src/app';
import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://edukt_user:edukt_password@localhost:5432/edukt_db';

const pool = new Pool({ connectionString });

describe('Pruebas de Borde y Reglas de Negocio - edukt.com', () => {
  beforeEach(async () => {
    // Restablecer el estado inicial antes de cada prueba
    await pool.query(
      "UPDATE student_progress SET current_topic_id = 1, current_step = 'ACTIVIDAD_PRINCIPAL', status = 'EN_PROGRESO' WHERE id = 1"
    );
    await pool.query('DELETE FROM attempts');
  });

  afterAll(async () => {
    // Cerrar la conexión para evitar alertas de Jest (open handles)
    await pool.end();
  });

  test('1. Respuesta correcta en Actividad Principal avanza al siguiente tema', async () => {
    const res = await request(app)
      .post('/api/submit')
      .send({ contentId: 'A1', selectedOption: 'b' });

    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(true);

    const progress = await request(app).get('/api/progress');
    expect(progress.body.progress.currentTopicId).toBe(2);
    expect(progress.body.progress.currentStep).toBe('ACTIVIDAD_PRINCIPAL');
  });

  test('2. Respuesta incorrecta en Actividad Principal transiciona a TEORÍA', async () => {
    const res = await request(app)
      .post('/api/submit')
      .send({ contentId: 'A1', selectedOption: 'a' });

    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(false);

    const progress = await request(app).get('/api/progress');
    expect(progress.body.progress.currentStep).toBe('TEORIA');
  });

  test('3. Rechazar opción de respuesta inexistente (ejemplo: "z")', async () => {
    const res = await request(app)
      .post('/api/submit')
      .send({ contentId: 'A1', selectedOption: 'z' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Opción de respuesta inválida');
  });

  test('4. Bloqueo de envíos tras completar todo el temario', async () => {
    await pool.query(
      "UPDATE student_progress SET current_step = 'COMPLETADO', status = 'COMPLETADO' WHERE id = 1"
    );

    const res = await request(app)
      .post('/api/submit')
      .send({ contentId: 'A1', selectedOption: 'b' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('El temario ya fue completado');
  });

  test('5. Rechazar intento de responder una actividad fuera del paso actual', async () => {
    // Intentar responder el refuerzo R1 estando en ACTIVIDAD_PRINCIPAL
    const res = await request(app)
      .post('/api/submit')
      .send({ contentId: 'R1', selectedOption: 'a' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('La actividad no corresponde al paso actual');
  });
});