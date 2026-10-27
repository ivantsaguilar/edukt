import express from 'express';
import cors from 'cors';
import learningRoutes from './routes/learning.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', learningRoutes);

export default app;