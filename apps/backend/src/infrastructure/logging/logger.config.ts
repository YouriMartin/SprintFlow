import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

export const createLogger = () => {
  return WinstonModule.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, context, trace }) => {
              const ts = typeof timestamp === 'string' ? timestamp : '';
              const ctx = typeof context === 'string' ? context : 'Application';
              const msg = typeof message === 'string' ? message : '';
              const traceStr = typeof trace === 'string' ? `\n${trace}` : '';
              return `${ts} [${ctx}] ${level}: ${msg}${traceStr}`;
            },
          ),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
      }),
    ],
  });
};
