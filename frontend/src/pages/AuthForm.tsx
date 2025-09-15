import React, { useState } from "react";

interface AuthFormsProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isLoading?: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

const AuthForms: React.FC<AuthFormsProps> = ({
  onLogin,
  isDarkMode,
  onToggleDarkMode,
  isLoading = false,
}) => {
  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateLogin = (): boolean => {
    const newErrors: { [key: string]: string } = {};

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    try {
      await onLogin(loginData);
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      {/* Toggle Dark Mode */}
      <button
        onClick={onToggleDarkMode}
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

        {/* Card de Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex bg-gray-50 dark:bg-gray-700/50">
            <button
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-300 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400`}
            >
              Iniciar Sesión
            </button>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleLogin} className="p-6 space-y-6">
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
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
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
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={loginData.rememberMe}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      rememberMe: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Recordarme
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
          <p className="mt-2">
            Desarrollado con ❤️ para la comunidad de la UCT
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForms;
