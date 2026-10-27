import { Pool } from 'pg';
import { computeNextState } from './stateMachine';

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://edukt_user:edukt_password@localhost:5432/edukt_db';

const pool = new Pool({ connectionString });

export class LearningService {
  async getStudentProgress() {
    const progressRes = await pool.query('SELECT * FROM student_progress WHERE id = 1');
    const progress = progressRes.rows[0];

    if (!progress) {
      throw new Error('No se encontró el estado del estudiante. Ejecuta el seeder primero.');
    }

    if (progress.status === 'COMPLETADO') {
      const historyRes = await pool.query('SELECT * FROM attempts ORDER BY created_at DESC');
      return {
        progress: {
          currentTopicId: progress.current_topic_id,
          currentStep: progress.current_step,
          status: progress.status,
        },
        topic: null,
        currentContent: null,
        history: historyRes.rows,
      };
    }

    // Seleccionar contenido omitiendo correct_option por seguridad
    const contentRes = await pool.query(
      'SELECT id, topic_id, type, title, body, options FROM contents WHERE topic_id = $1 AND type = $2',
      [progress.current_topic_id, progress.current_step]
    );

    const topicRes = await pool.query('SELECT * FROM topics WHERE id = $1', [progress.current_topic_id]);
    const historyRes = await pool.query('SELECT * FROM attempts ORDER BY created_at DESC');

    return {
      progress: {
        currentTopicId: progress.current_topic_id,
        currentStep: progress.current_step,
        status: progress.status,
      },
      topic: topicRes.rows[0] || null,
      currentContent: contentRes.rows[0] || null,
      history: historyRes.rows,
    };
  }

  async submitAnswer(contentId: string, selectedOption: string) {
    const progressRes = await pool.query('SELECT * FROM student_progress WHERE id = 1');
    const progress = progressRes.rows[0];

    if (progress.status === 'COMPLETADO') {
      throw new Error('El temario ya fue completado. No se aceptan más respuestas.');
    }

    const contentRes = await pool.query('SELECT * FROM contents WHERE id = $1', [contentId]);
    if (contentRes.rows.length === 0) {
      throw new Error('Contenido no encontrado.');
    }

    const content = contentRes.rows[0];

    // Regla 8: La actividad debe corresponder al paso actual
    if (content.topic_id !== progress.current_topic_id || content.type !== progress.current_step) {
      throw new Error('La actividad no corresponde al paso actual del recorrido.');
    }

    // Validar opción válida
    const options = content.options as Array<{ key: string; text: string }>;
    if (!options || !options.some((opt) => opt.key === selectedOption)) {
      throw new Error('Opción de respuesta inválida o inexistente.');
    }

    const isCorrect = selectedOption === content.correct_option;

    // Registrar intento
    await pool.query(
      'INSERT INTO attempts (topic_id, content_id, selected_option, is_correct) VALUES ($1, $2, $3, $4)',
      [progress.current_topic_id, contentId, selectedOption, isCorrect]
    );

    const totalTopicsRes = await pool.query('SELECT COUNT(*) FROM topics');
    const totalTopics = parseInt(totalTopicsRes.rows[0].count, 10);

    const nextState = computeNextState({
      currentState: {
        currentTopicId: progress.current_topic_id,
        currentStep: progress.current_step,
        status: progress.status,
      },
      isCorrect,
      totalTopics,
    });

    await pool.query(
      'UPDATE student_progress SET current_topic_id = $1, current_step = $2, status = $3 WHERE id = 1',
      [nextState.currentTopicId, nextState.currentStep, nextState.status]
    );

    return {
      isCorrect,
      feedback: isCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta. Revisa el contenido de apoyo.',
      nextState,
    };
  }

  async advanceTheory() {
    const progressRes = await pool.query('SELECT * FROM student_progress WHERE id = 1');
    const progress = progressRes.rows[0];

    if (progress.current_step !== 'TEORIA') {
      throw new Error('Solo se puede avanzar si te encuentras consultando contenido teórico.');
    }

    const totalTopicsRes = await pool.query('SELECT COUNT(*) FROM topics');
    const totalTopics = parseInt(totalTopicsRes.rows[0].count, 10);

    const nextState = computeNextState({
      currentState: {
        currentTopicId: progress.current_topic_id,
        currentStep: progress.current_step,
        status: progress.status,
      },
      totalTopics,
    });

    await pool.query(
      'UPDATE student_progress SET current_topic_id = $1, current_step = $2, status = $3 WHERE id = 1',
      [nextState.currentTopicId, nextState.currentStep, nextState.status]
    );

    return { nextState };
  }

  async restartTopics() {
    // 1. Limpiar el historial de intentos
    await pool.query('DELETE FROM attempts');

    // 2. Reiniciar el progreso al Tema 1 y paso ACTIVIDAD_PRINCIPAL
    await pool.query(
      "UPDATE student_progress SET current_topic_id = 1, current_step = 'ACTIVIDAD_PRINCIPAL', status = 'EN_PROGRESO' WHERE id = 1"
    );

    return { success: true, message: 'Temario reiniciado correctamente.' };
  }
}