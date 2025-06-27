// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import crypto from 'crypto';

export const generateNonce = (): string => {
  return crypto.randomBytes(32).toString('hex');
}; 