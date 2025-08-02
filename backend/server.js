require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const logger = require('./config/logger');
const db = require('./models');

// Initialize Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Basic security and middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.WS_CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: 'Connected'
  });
});

// Database models info endpoint (for development)
app.get('/api/v1/models', (req, res) => {
  const models = Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize');
  res.status(200).json({
    message: 'Available models',
    models: models,
    database: {
      host: db.sequelize.config.host,
      database: db.sequelize.config.database,
      dialect: db.sequelize.config.dialect
    }
  });
});

// API routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/skills', require('./routes/skill.routes'));
app.use('/api/v1/technicians', require('./routes/technician.routes'));
app.use('/api/v1/tickets', require('./routes/ticket.routes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error handler:', err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: errors
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection and sync models
    await db.sequelize.authenticate();
    logger.info('✅ Database connection established successfully.');
    
    // Sync models in development
    if (NODE_ENV === 'development') {
      // Use force: false to avoid altering existing tables that might have too many indexes
      await db.sequelize.sync({ force: false });
      logger.info('✅ Database models synchronized successfully.');
    }

    // Start the server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`📡 Health check: http://localhost:${PORT}/health`);
      logger.info(`📊 Models info: http://localhost:${PORT}/api/v1/models`);
      
      // Log available models
      const models = Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize');
      logger.info(`📋 Available models: ${models.join(', ')}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing server');
  await db.sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing server');
  await db.sequelize.close();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;