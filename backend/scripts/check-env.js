// Debug script to check environment variables
require('dotenv').config({ path: '../../.env' });

// Logger utility for consistent logging
const logger = {
  info: (message, data = {}) => {
    console.info('Script Info:', {
      script: 'check-env',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Script Debug:', {
        script: 'check-env',
        message,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },
  error: (message, error, data = {}) => {
    console.error('Script Error:', {
      script: 'check-env',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  table: (data, columns) => {
    if (process.env.NODE_ENV === 'development') {
      console.table(data, columns);
    } else {
      logger.info('Tabular data', { data, columns });
    }
  },
  warn: (message, data = {}) => {
    console.warn('Script Warning:', {
      script: 'check-env',
      message,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

logger.info('Starting environment variable check');

const requiredVars = ['GMAIL_USER', 'GMAIL_PASS', 'NODE_ENV'];

const envVars = requiredVars.map(varName => ({
  Variable: varName,
  Status: process.env[varName] ? 'Set' : 'Missing',
  Value: process.env[varName] ? '***' + process.env[varName].slice(-3) : undefined
}));

logger.info('Required environment variables status', {
  total: requiredVars.length,
  set: envVars.filter(v => v.Status === 'Set').length,
  missing: envVars.filter(v => v.Status === 'Missing').length
});

logger.table(envVars, ['Variable', 'Status', 'Value']);

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  logger.warn('Some required environment variables are missing', {
    missingVariables: missingVars
  });
} else {
  logger.info('All required environment variables are set', {
    status: 'success',
    variableCount: requiredVars.length
  });
}

// Check if .env file is being read
const fs = require('fs');
const envPath = require('path').resolve(__dirname, '../../.env');
logger.info('.env file path', { path: envPath });
logger.info('.env file exists', { exists: fs.existsSync(envPath) });

logger.info('Environment check completed', {
  status: 'completed',
  timestamp: new Date().toISOString()
});
