// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

import { jest } from '@jest/globals';

declare global {
  const jest: typeof jest;
  const expect: jest.Expect;
  const describe: jest.Describe;
  const it: jest.It;
  const beforeEach: jest.Hook;
  const afterEach: jest.Hook;
  const beforeAll: jest.Hook;
  const afterAll: jest.Hook;
} 