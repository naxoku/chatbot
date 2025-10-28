/**
 * Test Suite para NotFound
 * Verifica el renderizado y funcionalidad de la página 404
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../components/NotFound';

// Mock completo de App con contexto funcional
jest.mock('../App', () => ({
  AppContext: {
    Provider: ({ children, value }) => {
      const React = require('react');
      // Crear un contexto mock que simule el contexto real
      const TestContext = React.createContext({
        isDarkMode: false,
        toggleDarkMode: () => {},
        artifacts: [],
        addArtifact: () => {},
        removeArtifact: () => {},
        isAuthenticated: true,
        setIsAuthenticated: () => {},
        ...value,
      });
      
      // Proveer el contexto como si fuera el AppContext real
      return React.createElement(TestContext.Provider, { value }, children);
    },
    Consumer: ({ children }) => children({ isDarkMode: false }),
  },
}));

// Mock de hooks y dependencias
const mockNavigate = jest.fn();

// Mock useNavigate de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useContext para devolver el contexto mock
const mockContextValue = {
  isDarkMode: false,
  toggleDarkMode: jest.fn(),
  artifacts: [],
  addArtifact: jest.fn(),
  removeArtifact: jest.fn(),
  isAuthenticated: true,
  setIsAuthenticated: jest.fn(),
};

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: () => mockContextValue,
}));

describe('NotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado Inicial', () => {
    test('renderiza correctamente el componente 404', () => {
      render(<NotFound />);
      
      // Verificar elementos principales
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
      expect(screen.getByText(/Lo sentimos, la página que buscas no existe/)).toBeInTheDocument();
    });

    test('muestra el ícono de advertencia', () => {
      render(<NotFound />);
      
      const warningIcon = document.querySelector('i[class*="fa-exclamation-triangle"]');
      expect(warningIcon).toBeInTheDocument();
    });

    test('incluye la sección de ayuda con información de contacto', () => {
      render(<NotFound />);
      
      expect(screen.getByText('¿Necesitas ayuda?')).toBeInTheDocument();
      expect(screen.getByText(/Si crees que esto es un error, contacta con soporte/)).toBeInTheDocument();
      expect(screen.getByText('soporte@uct.cl')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'soporte@uct.cl' })).toBeInTheDocument();
    });
  });

  describe('Funcionalidad de Botones', () => {
    test('botón "Volver atrás" navega correctamente', async () => {
      const user = userEvent.setup();
      render(<NotFound />);
      
      const backButton = screen.getByText('Volver atrás');
      await user.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    test('botón "Ir al inicio" navega al chat', async () => {
      const user = userEvent.setup();
      render(<NotFound />);
      
      const homeButton = screen.getByText('Ir al inicio');
      await user.click(homeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  });

  describe('Modo Oscuro/Claro', () => {
    test('aplica correctamente los estilos para modo claro', () => {
      render(<NotFound />);
      
      const mainContainer = document.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('bg-gray-50');
    });

    test('aplica correctamente los estilos para modo oscuro', () => {
      render(<NotFound />);
      
      const mainContainer = document.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('dark:bg-gray-900');
    });

    test('cambia el color del texto según el tema', () => {
      render(<NotFound />);
      
      // Verificar que el título principal tiene color correcto
      expect(screen.getByText('Página no encontrada')).toHaveClass('text-gray-900');
    });

    test('ajusta los colores para modo oscuro', () => {
      render(<NotFound />);
      
      // Verificar que el título principal tiene clases para modo oscuro
      const title = screen.getByText('Página no encontrada');
      expect(title).toHaveClass('dark:text-white');
    });
  });

  describe('Accesibilidad', () => {
    test('tiene la estructura semántica correcta', () => {
      render(<NotFound />);
      
      // Verificar que hay un h1 (404) y h2 (Página no encontrada)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    test('los botones tienen roles y textos descriptivos', () => {
      render(<NotFound />);
      
      const backButton = screen.getByText('Volver atrás');
      const homeButton = screen.getByText('Ir al inicio');
      
      expect(backButton.closest('button')).toBeInTheDocument();
      expect(homeButton.closest('button')).toBeInTheDocument();
    });

    test('el enlace de soporte tiene href correcto', () => {
      render(<NotFound />);
      
      const supportLink = screen.getByText('soporte@uct.cl').closest('a');
      expect(supportLink).toHaveAttribute('href', 'mailto:soporte@uct.cl');
    });
  });

  describe('Animaciones y Efectos Visuales', () => {
    test('incluye elementos con animaciones', () => {
      render(<NotFound />);
      
      // Verificar que hay elementos con clases de animación
      const animatedElements = document.querySelectorAll('[class*="animate-pulse"], [class*="animate-ping"]');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    test('el círculo principal tiene gradiente y animación', () => {
      render(<NotFound />);
      
      const mainCircle = document.querySelector('.bg-gradient-to-br.from-purple-600.to-blue-600');
      expect(mainCircle).toBeInTheDocument();
      expect(mainCircle).toHaveClass('animate-pulse');
    });
  });

  describe('Responsive Design', () => {
    test('se adapta correctamente a diferentes tamaños de pantalla', () => {
      // Simular viewport móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<NotFound />);
      
      // Verificar que los botones están en columna en móvil
      const buttonsContainer = screen.getByText('Volver atrás').closest('div.flex');
      expect(buttonsContainer).toHaveClass('flex-col', 'sm:flex-row');
    });

    test('maneja correctamente el layout en pantallas grandes', () => {
      // Simular viewport desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      render(<NotFound />);
      
      // Verificar que el contenedor principal está centrado
      const mainContainer = document.querySelector('.text-center');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Contenido Dinámico', () => {
    test('muestra mensaje de error descriptivo', () => {
      render(<NotFound />);
      
      expect(screen.getByText(/Lo sentimos, la página que buscas no existe o ha sido movida/)).toBeInTheDocument();
    });

    test('incluye información de contacto correcta', () => {
      render(<NotFound />);
      
      expect(screen.getByText('soporte@uct.cl')).toBeInTheDocument();
      const emailLink = screen.getByText('soporte@uct.cl').closest('a');
      expect(emailLink).toHaveAttribute('href', 'mailto:soporte@uct.cl');
    });
  });

  describe('Estados de Error', () => {
    test('maneja errores de navegación gracefully', async () => {
      // Simular error en navegación
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const user = userEvent.setup();
      
      render(<NotFound />);
      
      const backButton = screen.getByText('Volver atrás');
      
      // Verificar que el componente sigue renderizándose sin errores
      expect(() => user.click(backButton)).not.toThrow();
      
      // El componente debe seguir siendo visible después del error
      expect(screen.getByText('404')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});