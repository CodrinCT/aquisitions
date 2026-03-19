import express from 'express';
import logger from './config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.get('/', (req, res) => {
  logger.info('Hello World endpoint was hit');
  res.status(200).send('Hello World');
});

app.get('/health', (req, res) => {
  logger.info('Health check endpoint was hit');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
app.get('/api', (req, res) => {
  logger.info('API root endpoint was hit');
  res.status(200).json({ message: 'Welcome to the Aquisitions API' });
});

app.use('/api/auth', authRoutes);

export default app;
