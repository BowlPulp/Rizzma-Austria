import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import webhookRoutes from './routes/webhooks';
import apiRoutes from './routes';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler';

/**
 * Creates and configures the Express application.
 * CRITICAL: Webhook route is mounted FIRST with raw body parser,
 * before express.json() is applied to all other routes.
 */
export function createApp(): express.Application {
  const app = express();

  // 1. Webhook route FIRST (needs raw body, before express.json())
  app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

  // 2. Security headers
  app.use(helmet());

  // 3. CORS — allow client at http://localhost:3000
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 4. JSON body parser (for all routes except webhooks)
  app.use(express.json({ limit: '10mb' }));

  // 5. HTTP request logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // 6. Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // 7. API routes
  app.use('/api', apiRoutes);

  // 8. 404 handler
  app.use(notFoundHandler);

  // 9. Global error handler
  app.use(globalErrorHandler);

  return app;
}
