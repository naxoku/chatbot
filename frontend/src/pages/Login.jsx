import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import axios from "axios"; // Ya incluido para consistencia

const Login = () => {
  const { isDarkMode, toggleDarkMode } = useContext(AppContext);
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateLogin = () => {
    const newErrors = {};

    if (!loginData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!loginData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (loginData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    setErrors({}); // Limpia errores previos
    try {
      const response = await axios.post(
        "auth/login",
        {
          email: loginData.email,
          password: loginData.password,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (loginData.rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
        navigate("/chat");
      } else {
        setErrors({
          general: response.data.message || "Error al iniciar sesión",
        });
      }
    } catch (error) {
      console.error("Error en login:", error);

      if (error.response?.status === 401 || error.response?.status === 400) {
        setErrors({
          general: error.response.data?.message || "Credenciales inválidas",
        });
      } else if (error.code === "ERR_NETWORK") {
        setErrors({
          general: "Error de conexión. Verifica que el servidor esté activo.",
        });
      } else {
        setErrors({ general: "Error de conexión. Inténtalo de nuevo." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Toggle Dark Mode - Fijo top-right, igual que en ChatInterface */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
        aria-label="Toggle dark mode"
      >
        <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"} text-lg`}></i>
      </button>

      <div className="w-full max-w-md">
        {/* Logo y Header - Centrado, con acento sutil */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <i className="fas fa-brain text-white text-2xl"></i>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Asistente UCT
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Mapas Mentales Inteligentes
          </p>
        </div>

        {/* Card de Login - Estilo unificado con ChatInterface */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
          {/* Header de Card - Neutro para consistencia */}
          <div className="bg-white dark:bg-gray-800 p-6 text-center border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Iniciar Sesión
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Accede a tu cuenta para continuar
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="p-6 space-y-6">
            {/* Error general */}
            {errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg transition-all duration-300">
                <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {errors.general}
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm ${
                    errors.email
                      ? "border-red-500 ring-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="tu.correo@uct.cl"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm ${
                    errors.password
                      ? "border-red-500 ring-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200"
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Checkbox y link */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-700 dark:text-gray-300 transition-colors duration-300">
                <input
                  type="checkbox"
                  checked={loginData.rememberMe}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      rememberMe: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600 dark:text-purple-500 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-all duration-200"
                />
                <span className="ml-2">Recordarme</span>
              </label>
              <button
                type="button"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button - Mantengo gradiente para acento, pero con dark hover */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>

        {/* Footer - Neutro y centrado, como en ChatInterface */}
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 Asistente UCT. Todos los derechos reservados.</p>
          <p className="mt-1">
            Desarrollado con <i className="fas fa-heart text-red-500"></i> por
            el equipo de T.I.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
