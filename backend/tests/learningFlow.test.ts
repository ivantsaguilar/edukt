import request from 'supertest';
import app from '../src/app';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

describe('Pruebas de Borde y Reglas de Negocio - edukt.com', () => {
  beforeEach(async () => {
    await pool.query("UPDATE student_progress SET current_topic_id = 1, current_step = 'MAIN', status = 'IN_PROGRESS' WHERE id = 1");
    await pool.query('DELETE FROM attempts');
  });

  test('1. Respuesta incorrecta en Actividad Principal transiciona a TEORÍA', async () => {
    const res = await request(app)
      .post('/api/submit')
      .send({ contentId: 'A1', selectedOption: 'a' });

    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(false);

    const progress = await request(app).get('/api/progress');
    expect(progress.body.progress.currentStep).toBe('THEORY');
  });

  test('2. Rechazar intento de respuesta en un paso inválido', async () => {
    const res = await request(app)
      .post('/api/submit')
      .send({ contentId: 'R1', selectedOption: 'a' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('La actividad no corresponde al paso actual');
  });

  test('3. Rechazar opción no existente', async () => {
    const res = await request(app)
      .post('/api/submit')
      .send({ contentId: 'A1', selectedOption: 'z' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Opción de respuesta inválida');
  });

  test('4. Bloqueo de envíos tras completar todo el temario', async () => {
    await pool.query("UPDATE student_progress SET status = 'COMPLETED', current_step = 'COMPLETED' WHERE id = 1");

    const res = await request(app)
      .post('/api/submit')
      .send({ contentId: 'A1', selectedOption: 'b' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('El temario ya fue completado');
  });
});