// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        address: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    address: string;
  };
}

const authService = new AuthService();

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  const user = authService.verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Token inválido' });
  }

  req.user = user;
  next();
};

// Alias para compatibilidade
export const authMiddleware = authenticateToken; 