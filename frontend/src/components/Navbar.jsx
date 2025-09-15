import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({
  isDarkMode,
  toggleDarkMode, // OJO: Cambié el nombre del prop para que coincida con el ChatInterface.jsx
  artifactCount = 0,
  botStatus = "online",
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const getBotStatusConfig = () => {
    switch (botStatus) {
      case "online":
        return {
          color: "green",
          text: "En línea",
          animate: "animate-pulse",
        };
      case "offline":
        return {
          color: "red",
          text: "Desconectado",
          animate: "",
        };
      case "processing":
        return {
          color: "yellow",
          text: "Procesando...",
          animate: "animate-pulse",
        };
      default:
        return {
          color: "gray",
          text: "Desconocido",
          animate: "",
        };
    }
  };

  const status = getBotStatusConfig();

  return (
    <nav
      className={`sticky top-0 z-50 shadow-sm transition-colors duration-300 ${
        isDarkMode
          ? "bg-blue-uct-dark text-white"
          : "bg-white text-gray-900 border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center space-x-2 text-lg font-bold"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isDarkMode ? "bg-white text-blue-uct-dark" : "bg-blue-uct-dark text-white"
                }`}
              >
                <i className="fas fa-brain text-sm"></i>
              </div>
              <span className="hidden md:block">Asistente UCT</span>
            </Link>
          </div>

          {/* Botones del menú principal (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Estado del bot */}
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full bg-${status.color}-500 ${status.animate}`}></span>
              <span className="text-sm font-medium">{status.text}</span>
            </div>

            {/* Contador de artefactos */}
            {artifactCount > 0 && (
              <span className="bg-purple-600/20 text-purple-600 dark:bg-purple-800/20 dark:text-purple-400 text-sm px-2 py-1 rounded-full font-semibold">
                Artefactos: {artifactCount}
              </span>
            )}

            {/* Botón de Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? (
                <i className="fas fa-sun text-xl text-yellow-400"></i>
              ) : (
                <i className="fas fa-moon text-xl text-gray-500"></i>
              )}
            </button>
            {/* Botón para cerrar sesión */}
            {onLogout && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md font-medium text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 transition-colors"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Cerrar Sesión</span>
              </button>
            )}
          </div>

          {/* Botón del menú móvil */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Abrir menú principal</span>
              <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {/* Estado del bot (Móvil) */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado:
            </span>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full bg-${status.color}-500 ${status.animate}`}></span>
              <span className="text-sm font-medium">{status.text}</span>
            </div>
          </div>
          {/* Contador de artefactos (Móvil) */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Artefactos:
            </span>
            <span className="bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 text-sm px-2 py-1 rounded-full font-semibold">
              {artifactCount}
            </span>
          </div>

          {/* Botón de Dark Mode (Móvil) */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Modo oscuro:
            </span>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? (
                <i className="fas fa-sun text-xl text-yellow-400"></i>
              ) : (
                <i className="fas fa-moon text-xl text-gray-500"></i>
              )}
            </button>
          </div>

          {/* Botón para cerrar sesión (Móvil) */}
          {onLogout && (
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cerrar Sesión:
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md font-medium text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 transition-colors"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;