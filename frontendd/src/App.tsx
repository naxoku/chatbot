/* eslint-disable react-refresh/only-export-components */
import React, {
  useState,
  createContext,
  useMemo,
  useEffect,
  Suspense,
} from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { LazyLoading } from "./components/LazyLoading";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { CHECK_SESSION } from "./config";

// Lazy loading de páginas para code-splitting
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const ChatBot = React.lazy(() => import("./pages/ChatBot"));
const ProtectedRoute = React.lazy(() => import("./components/ProtectedRoute"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Hook para obtener el tipo de loading según la ruta
const useLoadingType = (): string => {
  const location = useLocation();
  
  if (location.pathname === "/chat") return "chat";
  if (location.pathname === "/") return "home";
  if (location.pathname === "/login") return "login";
  if (location.pathname === "/404" || location.pathname === "*") return "notfound";
  
  return "default";
};

// Componente de loading global (solo para verificación inicial)
const GlobalLoading: React.FC = () => (
  <div className="h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center animate-pulse">
        <i className="fas fa-brain text-primary-foreground text-2xl"></i>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <i className="fas fa-spinner fa-spin text-2xl text-primary"></i>
        <p className="text-lg text-foreground">
          Iniciando Asistente UCT...
        </p>
      </div>
    </div>
  </div>
);

// Componente de loading específico por página
const SpecificLoading: React.FC = () => {
  const loadingType = useLoadingType();
  return <LazyLoading>{loadingType}</LazyLoading>;
};

// Interfaces para TypeScript
interface Artifact {
  id: string;
  [key: string]: unknown;
}

interface AppContextType {
  artifacts: Artifact[];
  addArtifact: (artifact: Artifact) => void;
  removeArtifact: (id: string) => void;
  isAuthenticated: boolean | null;
  setIsAuthenticated: (authenticated: boolean) => void;
}

// Crear el contexto con valores por defecto
export const AppContext = createContext<AppContextType>({
  artifacts: [],
  addArtifact: () => {},
  removeArtifact: () => {},
  isAuthenticated: null,
  setIsAuthenticated: () => {},
});

const App: React.FC = () => {
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
      artifacts,
      addArtifact,
      removeArtifact,
      isAuthenticated,
      setIsAuthenticated,
    }),
    [artifacts, isAuthenticated]
  );

  // Mostrar loader mientras verifica la sesión inicial
  if (isCheckingAuth) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <GlobalLoading />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AppContext.Provider value={contextValue}>
          <div className="min-h-screen bg-background transition-colors duration-300">
            <Suspense fallback={<SpecificLoading />}>
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
                      <ChatBot />
                    </ProtectedRoute>
                  }
                />

                {/* Ruta 404 - Para cualquier ruta no encontrada */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </AppContext.Provider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
