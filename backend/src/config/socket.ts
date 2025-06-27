// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from './index';
import { logger } from './logger';

export const initializeSocket = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: config.socketPath
  });

  io.on('connection', (socket) => {
    logger.info(`Cliente WebSocket conectado: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Cliente WebSocket desconectado: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error(`Erro no WebSocket: ${error}`);
    });
  });

  return io;
};

// Alias para compatibilidade
export const setupWebSocket = initializeSocket; 