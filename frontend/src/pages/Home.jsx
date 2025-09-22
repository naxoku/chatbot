import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";

const Home = () => {
  const { isDarkMode, toggleDarkMode } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <main className="flex-grow flex items-center justify-center text-center p-8 bg-gradient-to-br from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900">
        <div className="max-w-4xl mx-auto py-20 px-8">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            Asistente de Documentos
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-purple-100 mb-6">
            Optimiza tu gestión documental de manera inteligente.
          </h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Accede a la información de documentos institucionales de forma
            rápida y precisa. Pregúntale al bot sobre reglamentos, formularios o
            cualquier otro documento oficial, y obtén respuestas al instante.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Acceder al Sistema
          </button>
        </div>
      </main>

      <footer className="py-8 px-4 bg-gray-800 dark:bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-white text-sm"></i>
            </div>
            <span className="text-lg font-bold">Asistente UCT</span>
          </div>
          <p>
            © {new Date().getFullYear()} Asistente UCT. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
