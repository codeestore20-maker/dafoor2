import express from 'express';
import cors from 'cors';
import subjectsRouter from './routes/subjects.routes';
import resourcesRouter from './routes/resources.routes';
import authRouter from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
  res.send('Server is running via Railway!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/resources', resourcesRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
