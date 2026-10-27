import { pool } from '../config/db';
import { computeNextState } from './stateMachine';

export class LearningService {
  async getCurrentProgress() {
    const progressRes = await pool.query('SELECT * FROM student_progress WHERE id = 1');
    const progress = progressRes.rows[0];

    if (progress.status === 'COMPLETED') {
      return { status: 'COMPLETED', message: 'Temario completado' };
    }

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
        status: progress.status
      },
      topic: topicRes.rows[0],
      currentContent: contentRes.rows[0],
      history: historyRes.rows
    };
  }

  async processAnswer(contentId: string, selectedOption: string) {
    const progressRes = await pool.query('SELECT * FROM student_progress WHERE id = 1');
    const currentProgress = progressRes.rows[0];

    const contentRes = await pool.query('SELECT * FROM contents WHERE id = $1', [contentId]);
    const content = contentRes.rows[0];

    if (content.topic_id !== currentProgress.current_topic_id || content.type !== currentProgress.current_step) {
      throw new Error('La actividad no corresponde al paso actual del recorrido.');
    }

    const isCorrect = selectedOption === content.correct_option;

    await pool.query(
      'INSERT INTO attempts (topic_id, content_id, selected_option, is_correct) VALUES ($1, $2, $3, $4)',
      [currentProgress.current_topic_id, contentId, selectedOption, isCorrect]
    );

    const nextState = computeNextState({
      currentState: {
        currentTopicId: currentProgress.current_topic_id,
        currentStep: currentProgress.current_step,
        status: currentProgress.status
      },
      isCorrect,
      totalTopics: 3
    });

    await pool.query(
      'UPDATE student_progress SET current_topic_id = $1, current_step = $2, status = $3 WHERE id = 1',
      [nextState.currentTopicId, nextState.currentStep, nextState.status]
    );

    return { isCorrect, nextState };
  }
}