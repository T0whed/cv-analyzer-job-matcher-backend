import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import cvRoutes from './routes/cv.routes';
import jobRoutes from './routes/job.routes';
import matchRoutes from './routes/match.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/match', matchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CV Analyzer API is running' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;