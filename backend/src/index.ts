// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { app, server } from './server';
import { config } from './config';
import { logger } from './config/logger.serverless';

const PORT = config.port;

server.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`📡 Socket.IO rodando na porta ${config.socketPort}`);
});

export { app, server as httpServer }; 