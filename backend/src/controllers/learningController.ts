import { Request, Response } from 'express';
import { LearningService } from '../services/learning.service';

const learningService = new LearningService();

export class LearningController {
  static async getProgress(req: Request, res: Response) {
    try {
      const data = await learningService.getStudentProgress();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener el progreso.' });
    }
  }

  static async submitAnswer(req: Request, res: Response) {
    try {
      const { contentId, selectedOption } = req.body;
      if (!contentId || !selectedOption) {
        return res.status(400).json({ error: 'contentId y selectedOption son requeridos.' });
      }

      const result = await learningService.submitAnswer(contentId, selectedOption);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al procesar la respuesta.' });
    }
  }

  static async advanceTheory(req: Request, res: Response) {
    try {
      const result = await learningService.advanceTheory();
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al avanzar desde teoría.' });
    }
  }

  static async restartTopics(req: Request, res: Response) {
    try {
      const result = await learningService.restartTopics();
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al reiniciar el temario.' });
    }
  }
}