import winston from 'winston';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

let logger: winston.Logger;

export function initializeLogger() {
  const logPath = path.join(app.getPath('userData'), 'logs');
  
  // Ensure logs directory exists
  if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath, { recursive: true });
  }
  
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: { service: 'streamgrid' },
    transports: [
      new winston.transports.File({ 
        filename: path.join(logPath, 'error.log'), 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: path.join(logPath, 'combined.log') 
      })
    ]
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }));
  }
}

export function getLogger() {
  return logger;
}