export default {
  // Usar jsdom para simular el browser environment
  testEnvironment: 'jsdom',
  
  // Buscar archivos de test en estas extensiones
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx}',
    '<rootDir>/tests/**/*.{js,jsx}'
  ],
  
  // Transformar archivos JSX
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Módulos que Jest debe ignorar
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Configurar imports globales para testing
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/index.css',
    '!src/vite-env.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Module name mapping para imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  
  // Verbose output
  verbose: true
};