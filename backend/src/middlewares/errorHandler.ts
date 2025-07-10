// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.serverless';

interface ErrorWithStatus extends Error {
  status?: number;
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor.';

  logger.error(`[${status}] ${message}`, {
    error: err,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    headers: req.headers,
  });

  res.status(status).json({
    error: message,
  });
}; 