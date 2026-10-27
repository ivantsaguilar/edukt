import { Request, Response } from 'express';
import { Pool } from 'pg';
import { computeNextState } from '../services/stateMachine';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function getStudentProgress(req: Request, res: Response) {
  try {
    const progressRes = await pool.query('SELECT * FROM student_progress WHERE id = 1');
    const progress = progressRes.rows[0];

    if (progress.status === 'COMPLETED') {
      return res.json({ status: 'COMPLETED', message: '¡Has completado todo el temario!' });
    }

    const contentRes = await pool.query(
      'SELECT id, topic_id, type, title, body, options FROM contents WHERE topic_id = $1 AND type = $2',
      [progress.current_topic_id, progress.current_step]
    );

    const topicRes = await pool.query('SELECT * FROM topics WHERE id = $1', [progress.current_topic_id]);
    const historyRes = await pool.query('SELECT * FROM attempts ORDER BY created_at DESC');

    return res.json({
      progress: {
        currentTopicId: progress.current_topic_id,
        currentStep: progress.current_step,
        status: progress.status
      },
      topic: topicRes.rows[0],
      currentContent: contentRes.rows[0],
      history: historyRes.rows
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al consultar el progreso.' });
  }
}

export async function submitAnswer(req: Request, res: Response) {
  try {
    const { contentId, selectedOption } = req.body;

    const progressRes = await pool.query('SELECT * FROM student_progress WHERE id = 1');
    const progress = progressRes.rows[0];

    if (progress.status === 'COMPLETED') {
      return res.status(400).json({ error: 'El temario ya fue completado. No se aceptan más respuestas.' });
    }

    const contentRes = await pool.query('SELECT * FROM contents WHERE id = $1', [contentId]);
    if (contentRes.rows.length === 0) {
      return res.status(404).json({ error: 'Contenido no encontrado.' });
    }

    const content = contentRes.rows[0];

    if (content.topic_id !== progress.current_topic_id || content.type !== progress.current_step) {
      return res.status(400).json({ error: 'La actividad no corresponde al paso actual del recorrido.' });
    }

    const options = content.options as Array<{ key: string; text: string }>;
    if (!options || !options.some(opt => opt.key === selectedOption)) {
      return res.status(400).json({ error: 'Opción de respuesta inválida o inexistente.' });
    }

    const isCorrect = selectedOption === content.correct_option;

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
        status: progress.status
      },
      isCorrect,
      totalTopics
    });

    await pool.query(
      'UPDATE student_progress SET current_topic_id = $1, current_step = $2, status = $3 WHERE id = 1',
      [nextState.currentTopicId, nextState.currentStep, nextState.status]
    );

    return res.json({
      isCorrect,
      feedback: isCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta. Revisa el contenido de apoyo.',
      nextState
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error en el servidor.' });
  }
}

export async function advanceTheory(req: Request, res: Response) {
  try {
    const progressRes = await pool.query('SELECT * FROM student_progress WHERE id = 1');
    const progress = progressRes.rows[0];

    if (progress.current_step !== 'THEORY') {
      return res.status(400).json({ error: 'Solo se puede avanzar si te encuentras consultando contenido teórico.' });
    }

    const totalTopicsRes = await pool.query('SELECT COUNT(*) FROM topics');
    const totalTopics = parseInt(totalTopicsRes.rows[0].count, 10);

    const nextState = computeNextState({
      currentState: {
        currentTopicId: progress.current_topic_id,
        currentStep: progress.current_step,
        status: progress.status
      },
      totalTopics
    });

    await pool.query(
      'UPDATE student_progress SET current_topic_id = $1, current_step = $2, status = $3 WHERE id = 1',
      [nextState.currentTopicId, nextState.currentStep, nextState.status]
    );

    return res.json({ nextState });
  } catch (err) {
    return res.status(500).json({ error: 'Error al avanzar desde teoría.' });
  }
}