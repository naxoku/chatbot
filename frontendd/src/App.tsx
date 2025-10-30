import React, { useState, createContext, useMemo, useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import useTheme from "./hooks/useTheme";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { CHECK_SESSION } from "./config";

// Interfaces para TypeScript
interface Artifact {
  id: string;
  [key: string]: unknown;
}

interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  artifacts: Artifact[];
  addArtifact: (artifact: Artifact) => void;
  removeArtifact: (id: string) => void;
  isAuthenticated: boolean | null;
  setIsAuthenticated: (authenticated: boolean) => void;
}

// Crear el contexto con valores por defecto
export const AppContext = createContext<AppContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  artifacts: [],
  addArtifact: () => {},
  removeArtifact: () => {},
  isAuthenticated: null,
  setIsAuthenticated: () => {},
});

const App: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Verificar autenticación al iniciar la app
  useEffect(() => {
    checkInitialAuth();
  }, []);

  const checkInitialAuth = async (): Promise<void> => {
    try {
      const response = await fetch(CHECK_SESSION, {
        credentials: "include",
      });

      const data = await response.json();
      setIsAuthenticated(data.logged_in);
    } catch (error) {
      console.error("Error verificando sesión inicial:", error);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const addArtifact = (newArtifact: Artifact): void => {
    setArtifacts((prev) => {
      // Evitar duplicados: si ya existe un artefacto con el mismo ID, no lo añadimos
      if (prev.some((art) => art.id === newArtifact.id)) {
        return prev;
      }
      return [...prev, newArtifact];
    });
  };

  const removeArtifact = (id: string): void => {
    setArtifacts((prev) => prev.filter((art) => art.id !== id));
  };

  const contextValue = useMemo<AppContextType>(
    () => ({
      isDarkMode,
      toggleDarkMode,
      artifacts,
      addArtifact,
      removeArtifact,
      isAuthenticated,
      setIsAuthenticated,
    }),
    [isDarkMode, artifacts, isAuthenticated, toggleDarkMode]
  );

  // Mostrar loader mientras verifica la sesión inicial
  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <i className="fas fa-brain text-white text-2xl"></i>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Iniciando Asistente UCT...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppContext.Provider value={contextValue}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Routes>
            {/* Ruta Home - Accesible siempre */}
            <Route path="/" element={<Home />} />

            {/* Ruta Login - Redirige a /chat si ya está autenticado */}
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/chat" replace /> : <Login />
              }
            />

            {/* Ruta Chat - Protegida, requiere autenticación */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <div>Chat Interface Placeholder</div>
                </ProtectedRoute>
              }
            />

            {/* Ruta 404 - Para cualquier ruta no encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

// Componente ProtectedRoute temporal
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useContext(AppContext);
  
  if (isAuthenticated === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <i className="fas fa-brain text-white text-2xl"></i>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Verificando autenticación...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente NotFound temporal
const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <i className="fas fa-exclamation-triangle text-4xl text-gray-500 dark:text-gray-400"></i>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Página no encontrada
        </p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <i className="fas fa-home mr-2"></i>
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default App;
