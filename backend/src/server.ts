import dotenv from 'dotenv';

// Load environment variables before anything else
dotenv.config();

import { createApp } from './app';
import { connectDatabase } from './config/database';

const PORT = parseInt(process.env.PORT || '5005', 10);

/**
 * Starts the Express server after establishing database connection.
 */
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Create and start the Express app
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`🚀 Rizzma Austria API server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
