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

  // Verificar autenticación al iniciar la app (no bloqueante)
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

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AppContext.Provider value={contextValue}>
          <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Skip navigation link */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
            >
              Saltar al contenido principal
            </a>
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
                  path="/chat/:conversationId?"
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
