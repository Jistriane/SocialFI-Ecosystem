// Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
// Criado do zero por mim. Removal of this notice is prohibited for 10 years.

const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        // Handle module aliases
        '^@/(.*)$': '<rootDir>/src/$1',
        // Handle CSS imports
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        // Handle image imports
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
        // Mock wagmi and viem modules
        '^wagmi$': '<rootDir>/__mocks__/wagmi.js',
        '^viem$': '<rootDir>/__mocks__/viem.js',
        '^@wagmi/(.*)$': '<rootDir>/__mocks__/wagmi.js',
        '^@rainbow-me/rainbowkit$': '<rootDir>/__mocks__/rainbowkit.js',
    },
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
    // Removido transform babel-jest para permitir SWC do Next.js
    transformIgnorePatterns: [
        '/node_modules/(?!(wagmi|viem|@wagmi|@viem|@rainbow-me|isows)/)',
        '^.+\\.module\\.(css|sass|scss)$',
    ],
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/**/*.test.{js,jsx,ts,tsx}',
        '!src/**/_*.{js,jsx,ts,tsx}',
        '!src/**/*.config.{js,jsx,ts,tsx}',
        '!src/types/**/*',
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    moduleDirectories: ['node_modules', '<rootDir>/'],
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    verbose: true,
    // Increase timeout for async operations
    testTimeout: 10000,
    // Handle ES modules - configuração simplificada
    extensionsToTreatAsEsm: ['.ts', '.tsx']
}

module.exports = createJestConfig(customJestConfig)