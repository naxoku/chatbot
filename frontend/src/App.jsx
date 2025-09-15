import React, { useState, createContext, useMemo } from "react";
// Aquí ya NO importas 'BrowserRouter as Router'
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ChatInterface from "./pages/ChatInterface";
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
    <AppContext.Provider value={contextValue}>
      {/* ¡Ojo! Aquí se saca el <Router> que estaba antes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<ChatInterface />} />
        {/*
          Aquí puedes agregar más rutas si es necesario.
          Si agregas la ruta del bot, recuerda cambiar el componente.
        */}
        <Route path="/bot" element={<DDPERBot />} />
      </Routes>
    </AppContext.Provider>
  );
};

export default App;