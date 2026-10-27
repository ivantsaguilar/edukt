import { Router } from 'express';
import { LearningController } from '../controllers/learning.controller';

const router = Router();

router.get('/progress', LearningController.getProgress);
router.post('/submit', LearningController.submit);

export default router;