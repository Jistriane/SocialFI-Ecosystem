// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import winston from 'winston';
import { config } from './index';

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  
  return msg;
});

// Logger para ambiente serverless - apenas console
export const logger = winston.createLogger({
  level: config.logLevel || 'info',
  format: combine(
    timestamp(),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        customFormat
      )
    })
  ]
});

// Função para formatar erros
export function formatError(error: any): string {
  if (error instanceof Error) {
    return `${error.message}\n${error.stack}`;
  }
  return String(error);
}

// Função para formatar objetos
export function formatObject(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return String(obj);
  }
}

// Função para formatar mensagens de log
export function formatLogMessage(message: string, metadata?: any): string {
  if (!metadata) {
    return message;
  }
  return `${message} ${formatObject(metadata)}`;
}

// Função para criar um logger com namespace
export function createNamespacedLogger(namespace: string) {
  return {
    debug: (message: string, metadata?: any) => {
      logger.debug(formatLogMessage(`[${namespace}] ${message}`, metadata));
    },
    info: (message: string, metadata?: any) => {
      logger.info(formatLogMessage(`[${namespace}] ${message}`, metadata));
    },
    warn: (message: string, metadata?: any) => {
      logger.warn(formatLogMessage(`[${namespace}] ${message}`, metadata));
    },
    error: (message: string | Error, metadata?: any) => {
      const errorMessage = message instanceof Error ? formatError(message) : message;
      logger.error(formatLogMessage(`[${namespace}] ${errorMessage}`, metadata));
    },
  };
}

// Função para criar um logger de performance
export function createPerformanceLogger(namespace: string) {
  const performanceLogger = createNamespacedLogger(`${namespace}:performance`);
  return {
    start: (operation: string) => {
      const startTime = process.hrtime();
      return {
        end: () => {
          const [seconds, nanoseconds] = process.hrtime(startTime);
          const duration = seconds * 1000 + nanoseconds / 1e6;
          performanceLogger.info(`${operation} completed in ${duration.toFixed(2)}ms`);
          return duration;
        },
      };
    },
  };
}

// Função para criar um logger de request
export function createRequestLogger(namespace: string) {
  const requestLogger = createNamespacedLogger(`${namespace}:request`);
  return (req: any, res: any, next: any) => {
    const startTime = process.hrtime();
    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds * 1000 + nanoseconds / 1e6;
      requestLogger.info(`${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration.toFixed(2)}ms`,
        userAgent: req.get('user-agent'),
        ip: req.ip,
      });
    });
    next();
  };
}

// Função para criar um logger de blockchain
export function createBlockchainLogger(namespace: string) {
  const blockchainLogger = createNamespacedLogger(`${namespace}:blockchain`);
  return {
    transaction: (txHash: string, metadata?: any) => {
      blockchainLogger.info(`Transaction ${txHash}`, metadata);
    },
    contract: (address: string, metadata?: any) => {
      blockchainLogger.info(`Contract ${address}`, metadata);
    },
    event: (eventName: string, metadata?: any) => {
      blockchainLogger.info(`Event ${eventName}`, metadata);
    },
    error: (error: Error, metadata?: any) => {
      blockchainLogger.error(error, metadata);
    },
  };
}

// Exportar funções e configurações
export default {
  logger,
  formatError,
  formatObject,
  formatLogMessage,
  createNamespacedLogger,
  createPerformanceLogger,
  createRequestLogger,
  createBlockchainLogger,
}; 