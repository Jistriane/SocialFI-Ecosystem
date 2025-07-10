# Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
# Criado do zero por mim. Removal of this notice is prohibited for 10 years.

#!/bin/bash

echo "🔧 Corrigindo imports do logger para versão serverless..."

# Substituir imports do logger
sed -i "s|from '../config/logger'|from '../config/logger.serverless'|g" src/services/trustchain.service.ts
sed -i "s|from '../config/logger'|from '../config/logger.serverless'|g" src/storage/index.ts
sed -i "s|from './config/logger'|from './config/logger.serverless'|g" src/index.ts
sed -i "s|from '../config/logger'|from '../config/logger.serverless'|g" src/services/auth.service.ts
sed -i "s|from '../config/logger'|from '../config/logger.serverless'|g" src/controllers/trustchain.controller.ts
sed -i "s|from './config/logger'|from './config/logger.serverless'|g" src/server.ts
sed -i "s|from '../config/logger'|from '../config/logger.serverless'|g" src/controllers/auth.controller.ts
sed -i "s|from '../config/logger'|from '../config/logger.serverless'|g" src/middlewares/errorHandler.ts

echo "✅ Imports do logger corrigidos!"
echo "🚀 Fazendo build e redeploy..." 