import React, { useState } from "react";
import { Link } from "react-router-dom";
import LogoUCT from "../assets/logouct_blanco.png"; // Ajusta la ruta si es necesario (e.g., ./assets/ si está en el mismo dir)

const Navbar = ({
  isDarkMode,
  toggleDarkMode,
  artifactCount = 0,
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

  return (
    <nav
      className={`sticky top-0 z-50 shadow-sm transition-colors duration-300 ${
        isDarkMode
          ? "bg-blue-uct-dark text-white"
          : "bg-white text-gray-900 border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {" "}
        {/* Padding central estándar, pero elementos pegados */}
        <div className="flex items-center justify-between h-16">
          {" "}
          {/* justify-between para pegada a bordes */}
          {/* Logo pegado al borde izquierdo */}
          <div className="flex-shrink-0 ml-0">
            {" "}
            {/* ml-0 para pegado */}
            <Link to="/">
              <img
                src={LogoUCT}
                alt="Logo UCT"
                className="h-auto w-5z" // Tamaño fijo en altura, ancho auto
                style={{
                  filter: isDarkMode ? "brightness(0) invert(1)" : "none",
                }} // Opcional: Invierte colores en dark mode si es necesario (para logo blanco en fondo oscuro)
              />
            </Link>
          </div>
          {/* Título Central: Ocupa espacio intermedio, centrado y prominente (como en NotebookLM) */}
          <div className="hidden sm:flex flex-1 justify-center items-center mx-0">
            {" "}
            {/* flex-1 para ocupar, mx-0 sin márgenes extra */}
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                {" "}
                {/* font-lg/bold para prominencia */}
                Asistente DDPER
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dirección de Desarrollo de Personas - UCT
              </p>
            </div>
          </div>
          {/* Controles pegados al borde derecho */}
          <div className="hidden md:flex items-center space-x-1 mr-0">
            {" "}
            {/* space-x-1 compacto, mr-0 para pegado */}
            {/* Contador de artefactos (compacto) */}
            {artifactCount > 0 && (
              <span className="bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400 text-xs px-2 py-1 rounded-full font-medium">
                {artifactCount}
              </span>
            )}
            {/* Botón de Dark Mode - Compacto */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" // p-1.5 más pequeño
              title={isDarkMode ? "Modo claro" : "Modo oscuro"}
            >
              {isDarkMode ? (
                <i className="fas fa-sun text-lg text-yellow-400"></i>
              ) : (
                <i className="fas fa-moon text-lg text-gray-500"></i>
              )}
            </button>
            {/* Botón Logout - Compacto */}
            {onLogout && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-2 py-1.5 rounded-md font-medium text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors text-sm" // Más compacto
                title="Cerrar sesión"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span className="hidden lg:block">Salir</span>{" "}
                {/* Texto solo en lg+ para espacio */}
              </button>
            )}
          </div>
          {/* Botón Hamburguesa (mobile, pegado der.) */}
          <div className="flex md:hidden mr-0">
            {" "}
            {/* mr-0 para pegado */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Abrir menú"
            >
              <i
                className={`fas ${
                  isMobileMenuOpen ? "fa-times" : "fa-bars"
                } text-lg`}
              ></i>
            </button>
          </div>
        </div>
      </div>

      {/* Menú Mobile: Apilado, con logo arriba */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 space-y-2">
            {" "}
            {/* Padding interno para mobile */}
            {/* Logo en mobile (pequeño) */}
            <div className="flex justify-center">
              <img
                src={LogoUCT}
                alt="Logo UCT"
                className="h-6 w-auto"
                style={{
                  filter: isDarkMode ? "brightness(0) invert(1)" : "none",
                }}
              />
            </div>
            {/* Título en mobile */}
            <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                Asistente DDPER
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Dirección de Desarrollo de Personas - UCT
              </p>
            </div>
            {/* Contador artifacts */}
            {artifactCount > 0 && (
              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Artefactos:
                </span>
                <span className="bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400 text-xs px-2 py-0.5 rounded-full">
                  {artifactCount}
                </span>
              </div>
            )}
            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="flex w-full justify-between items-center px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Modo oscuro
              </span>
              {isDarkMode ? (
                <i className="fas fa-sun text-lg text-yellow-400"></i>
              ) : (
                <i className="fas fa-moon text-lg text-gray-500"></i>
              )}
            </button>
            {/* Logout */}
            {onLogout && (
              <button
                onClick={handleLogout}
                className="flex w-full justify-between items-center px-2 py-2 rounded-md font-medium text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
              >
                <span>Cerrar Sesión</span>
                <i className="fas fa-sign-out-alt"></i>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
