import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../App";

const NotFound = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(AppContext);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <i className="fas fa-exclamation-triangle text-white text-5xl"></i>
          </div>
          <div className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-full opacity-20 animate-ping"></div>
        </div>

        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
          404
        </h1>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          Página no encontrada
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Volver atrás</span>
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <i className="fas fa-home"></i>
            <span>Ir al inicio</span>
          </button>
        </div>

        <div className="mt-12 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Si crees que esto es un error, contacta con soporte
          </p>

          <a
            href="mailto:soporte@uct.cl"
            className="inline-flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            <i className="fas fa-envelope"></i>
            <span>soporte@uct.cl</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
