import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";

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
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
        credentials: "include", // 👈 MUY IMPORTANTE para que viaje la cookie
      });

      const data = await response.json();

      if (data.success) {
        if (loginData.rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
        navigate("/chat");
      } else {
        setErrors({ general: data.message || "Error al iniciar sesión" });
      }
    } catch (error) {
      console.error("Error en login:", error);
      setErrors({ general: "Error de conexión. Inténtalo de nuevo." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      {/* Toggle Dark Mode */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
      >
        <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"} text-lg`}></i>
      </button>

      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-brain text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Asistente UCT
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Mapas Mentales Inteligentes
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center">
            <h2 className="text-xl font-semibold text-white">Iniciar Sesión</h2>
            <p className="text-purple-100 text-sm mt-1">
              Accede a tu cuenta para continuar
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="p-6 space-y-6">
            {/* Error general */}
            {errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>{" "}
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
                <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${
                    errors.email
                      ? "border-red-500"
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
                <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                >
                  <i
                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
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
              <label className="flex items-center text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={loginData.rememberMe}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      rememberMe: e.target.checked,
                    })
                  }
                  className="rounded text-purple-600 dark:text-purple-500 border-gray-300 dark:border-gray-600 focus:ring-purple-500"
                />
                <span className="ml-2">Recordarme</span>
              </label>
              <button
                type="button"
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
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

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 Asistente UCT. Todos los derechos reservados.</p>
          <p>
            Desarrollado con <i className="fas fa-heart text-red-500"></i> por
            el equipo de T.I.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;