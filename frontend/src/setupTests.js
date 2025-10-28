import '@testing-library/jest-dom';
import React, { createContext } from 'react';

// Configuración básica para jest-dom
// jest-dom añade matchers adicionales como .toBeInTheDocument()

// Polyfill para APIs del navegador que no están disponibles en jsdom
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock de fetch si no está disponible
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock de ResizeObserver si no está disponible
if (!global.ResizeObserver) {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
}

// Configurar mocks para hooks personalizados
jest.mock('./hooks/useTheme', () => ({
  __esModule: true,
  default: () => ({
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
  }),
}));

// Crear un mock del contexto AppContext para testing
export const createTestContext = (overrides = {}) => ({
  isDarkMode: false,
  toggleDarkMode: jest.fn(),
  artifacts: [],
  addArtifact: jest.fn(),
  removeArtifact: jest.fn(),
  isAuthenticated: true,
  setIsAuthenticated: jest.fn(),
  ...overrides,
});

// Exportar el contexto mock real
export const AppContext = createContext(createTestContext());

// Mock de AppContext para testing
export const mockAppContextValue = createTestContext();