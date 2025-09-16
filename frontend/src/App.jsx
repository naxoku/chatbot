import React, { useState, createContext, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";  // Solo aquí
import Home from "./pages/Home";
import Login from "./pages/Login";
import ChatInterface from "./components/ChatInterface/ChatInterface";
import useDarkMode from "./hooks/useDarkMode";
import DDPERBot from "./components/DDPERBot";
import '@fortawesome/fontawesome-free/css/all.min.css';

// Inicializa el contexto con valores por defecto
export const AppContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
  artifacts: [],
  addArtifact: () => {},
  removeArtifact: () => {},
});

const App = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [artifacts, setArtifacts] = useState([]);

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
    }),
    [isDarkMode, artifacts]
  );

  return (
    <BrowserRouter>  {/* ¡ÚNICO router en la app! En la raíz */}
      <AppContext.Provider value={contextValue}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/bot" element={<DDPERBot />} />
            {/* Fallback para rutas no encontradas */}
            <Route path="*" element={<Home />} />  {/* O un componente NotFound */}
          </Routes>
        </div>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default App;