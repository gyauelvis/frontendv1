import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import paymentRoutes from './routes/payment';
import analyticsRoutes from './routes/analytics';
import fraudRoutes from './routes/fraud';
import webhookRoutes from './routes/webhook';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Import config
import { loadConfig } from './config/config';

// Load environment variables
dotenv.config();

// Load configuration
const config = loadConfig();

// Create Express app
const app: Application = express();
const PORT = config.port || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:8081',
    'http://192.168.3.1:8081',
    'http://100.112.21.136:8081',
    'http://192.168.2.1:8081',
    'exp://192.168.3.1:8081',
    'exp://100.112.21.136:8081',
    'exp://192.168.2.1:8081'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Fintech App Backend is running',
    timestamp: new Date(),
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    // await initializeDatabase();
    
    // Initialize Redis connection
    // await initializeRedis();
    
    // Initialize RabbitMQ connection
    // await initializeRabbitMQ();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER] Fintech App Backend running on port ${PORT}`);
      console.log(`[INFO] Environment: ${config.nodeEnv}`);
      console.log(`[INFO] Health check: http://localhost:${PORT}/health`);
      console.log(`[INFO] Network accessible: http://0.0.0.0:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;
