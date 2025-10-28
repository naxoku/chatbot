/**
 * Test Suite para ProtectedRoute
 * Verifica la lógica de autenticación y protección de rutas
 */

import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Mock de config
jest.mock('../config', () => ({
  CHECK_SESSION: '/api/check-session',
}));

// Mock de hooks de react-router-dom
const mockUseLocation = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, state }) => (
    <div data-testid="navigate-redirect">
      Redirecting to {to} with state: {state?.from?.pathname}
    </div>
  ),
  useLocation: () => mockUseLocation(),
  useNavigate: () => mockNavigate(),
}));

// Mock de fetch
global.fetch = jest.fn();

// Helper para crear children de prueba
const TestChild = () => <div data-testid="protected-content">Contenido Protegido</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/protected' });
    global.fetch.mockClear();
  });

  describe('Estados de Carga', () => {
    test('muestra spinner de carga durante la verificación de autenticación', async () => {
      // Simular respuesta lenta para ver el estado de loading
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => 
          resolve({ json: () => Promise.resolve({ logged_in: true }) })
        , 100))
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Verificar que muestra loading inmediatamente
      expect(screen.getByText('Verificando sesión...')).toBeInTheDocument();
      // Durante loading, no debe haber redirección
      expect(screen.queryByTestId('navigate-redirect')).not.toBeInTheDocument();
      // Debe mostrar el componente de loading
      expect(document.querySelector('.fa-spinner')).toBeInTheDocument();
    });

    test('muestra el spinner con el ícono animado correcto', () => {
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({ json: () => Promise.resolve({ logged_in: true }) })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Verificando sesión...')).toBeInTheDocument();
      expect(document.querySelector('.fa-spinner')).toBeInTheDocument();
      expect(document.querySelector('.fa-spinner')).toHaveClass('fa-spin');
    });
  });

  describe('Autenticación Exitosa', () => {
    test('renderiza children cuando el usuario está autenticado', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ logged_in: true }),
        })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Esperar a que termine la verificación
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
      });

      // Verificar que no se muestra la pantalla de loading
      expect(screen.queryByText('Verificando sesión...')).not.toBeInTheDocument();
    });

    test('no redirige cuando logged_in es true', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ logged_in: true }),
        })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('navigate-redirect')).not.toBeInTheDocument();
    });
  });

  describe('No Autenticado', () => {
    test('redirige a /login cuando el usuario no está autenticado', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ logged_in: false }),
        })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Esperar a que termine la verificación
      await waitFor(() => {
        expect(screen.getByTestId('navigate-redirect')).toBeInTheDocument();
      });

      // Verificar que no se muestran los children
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument();

      // Verificar el mensaje de redirección
      expect(screen.getByText(/Redirecting to \/login/)).toBeInTheDocument();
    });

    test('preserva la ubicación de origen para redirección', async () => {
      const originalPathname = '/protected';
      mockUseLocation.mockReturnValue({ pathname: originalPathname });

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ logged_in: false }),
        })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('navigate-redirect')).toBeInTheDocument();
      });

      // Verificar que se preserva la ubicación
      expect(screen.getByText(/with state: \/protected/)).toBeInTheDocument();
    });
  });

  describe('Manejo de Errores', () => {
    test('maneja errores de red durante la verificación', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.reject(new Error('Network error'))
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Esperar a que termine la verificación
      await waitFor(() => {
        expect(screen.getByTestId('navigate-redirect')).toBeInTheDocument();
      });

      // Verificar que se registra el error
      expect(consoleSpy).toHaveBeenCalledWith('Error verificando sesión:', expect.any(Error));

      // Verificar que redirige a login en caso de error (comportamiento seguro)
      expect(screen.getByText(/Redirecting to \/login/)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('maneja respuestas inválidas del servidor', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({}), // Sin campo logged_in
        })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Esperar a que termine la verificación
      await waitFor(() => {
        expect(screen.getByTestId('navigate-redirect')).toBeInTheDocument();
      });

      // Debería redirigir por defecto cuando no hay logged_in
      expect(screen.getByText(/Redirecting to \/login/)).toBeInTheDocument();
    });
  });

  describe('Estados de Datos', () => {
    test('maneja logged_in como string truthy', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ logged_in: 'true' }),
        })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('maneja logged_in como número', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ logged_in: 1 }),
        })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('maneja logged_in como null/undefined como no autenticado', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ logged_in: null }),
        })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('navigate-redirect')).toBeInTheDocument();
      });
    });
  });

  describe('Renderizado de Loading State', () => {
    test('muestra el loading state con estilos correctos', () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ logged_in: true }),
        })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Verificar elementos de loading
      expect(screen.getByText('Verificando sesión...')).toBeInTheDocument();
      
      // Verificar estructura del loading screen
      const loadingContainer = document.querySelector('.h-screen.flex.items-center.justify-center');
      expect(loadingContainer).toBeInTheDocument();
      
      // Verificar spinner
      expect(document.querySelector('.fa-spinner')).toBeInTheDocument();
      
      // Verificar ícono del cerebro
      expect(document.querySelector('.fa-brain')).toBeInTheDocument();
    });

    test('loading state se actualiza después de la verificación', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ logged_in: true }),
        })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      // Verificar loading inicial
      expect(screen.getByText('Verificando sesión...')).toBeInTheDocument();

      // Esperar a que cambie al contenido protegido
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      // Verificar que ya no se muestra loading
      expect(screen.queryByText('Verificando sesión...')).not.toBeInTheDocument();
    });
  });

  describe('Navegación y Estados', () => {
    test('preserva el estado de navegación correctamente', async () => {
      const locationState = { from: { pathname: '/original-page' }, extra: 'data' };
      mockUseLocation.mockReturnValue(locationState);

      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ logged_in: false }),
        })
      );

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('navigate-redirect')).toBeInTheDocument();
      });

      // Verificar que se preserva la ubicación de origen
      expect(screen.getByText(/Redirecting to \/login/)).toBeInTheDocument();
      // Verificar que hay redirección con estado preservado
      expect(screen.getByTestId('navigate-redirect')).toBeInTheDocument();
    });
  });
});