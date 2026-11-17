/**
 * Copyright 2026 Arm Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    transform: {
        '\\.js$': [
            'babel-jest',
            {
                plugins: ['@babel/plugin-transform-modules-commonjs'],
            },
        ],
        '^.+\\.(ts|tsx|js)$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.json',
            },
        ],
    },
    transformIgnorePatterns: ['/node_modules/(?!(@faker-js/faker|@microsoft|yaml)/)'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/packages/cmsis-common/',
        '/src/e2e-tests/',
    ],
    testMatch: ['**/*.test.+(ts|tsx)'],
    moduleNameMapper: {
        '\\.(css)$': '<rootDir>/__mocks__/static-assets.js',
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [
        './jestSetupFile.js',
        './src/__test__/custom-matchers.ts',
        '@open-cmsis-pack/cmsis-common/map',
        '@open-cmsis-pack/cmsis-common/array',
    ],
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: [
        '**/*.{ts,tsx}',
        '!**/node_modules/**',
        '!**/lib/**',
        '!**/scripts/**',
        '!**/*.d.ts',
        '!src/**/*.factories.{ts,tsx}',
        '!src/vscode-api/**',
        '!src/e2e-tests/**',
        '!src/api/extension-host-v3-smoke.ts',
        '!src/desktop/extension.ts',
        '!src/solar-search/graphql/client',
    ],
    coverageDirectory: './coverage',
    coverageReporters: ['lcov', 'text'],
    reporters: ['default', 'github-actions', 'jest-html-reporter'],
};
