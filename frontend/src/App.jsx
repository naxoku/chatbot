import React, { useState, createContext, useMemo, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ChatInterface from "./components/ChatInterface/ChatInterface";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import useTheme from "./hooks/useTheme";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { CHECK_SESSION } from "./config";

// Inicializa el contexto con valores por defecto
export const AppContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
  artifacts: [],
  addArtifact: () => {},
  removeArtifact: () => {},
  isAuthenticated: null,
  setIsAuthenticated: () => {},
});

const App = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [artifacts, setArtifacts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verificar autenticación al iniciar la app
  useEffect(() => {
    checkInitialAuth();
  }, []);

  const checkInitialAuth = async () => {
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

  const addArtifact = (newArtifact) => {
    setArtifacts((prev) => [...prev, newArtifact]);
  };

  const removeArtifact = (id) => {
    setArtifacts((prev) => prev.filter((art) => art.id !== id));
  };

  const contextValue = useMemo(
    () => ({
      isDarkMode,
      toggleDarkMode,
      artifacts,
      addArtifact,
      removeArtifact,
      isAuthenticated,
      setIsAuthenticated,
    }),
    [isDarkMode, artifacts, isAuthenticated]
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
                  <ChatInterface />
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

export default App;
