import { Router } from 'express';
import { LearningController } from '../controllers/learningController';

const router = Router();

router.get('/progress', LearningController.getProgress);
router.post('/submit', LearningController.submitAnswer);
router.post('/advance-theory', LearningController.advanceTheory);
router.post('/restart-topics', LearningController.restartTopics);

export default router;