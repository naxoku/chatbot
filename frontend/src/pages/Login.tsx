import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { ModeToggle } from "../components/mode-toggle";
import { AppContext } from "../App";
import { LOGIN } from "../config";
import axios from "axios";

import logoVrae from "../assets/logo_vrae.webp";
import fondoVrae from "../assets/fondo_vrae.webp";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface AxiosError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  code?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/chat";
  const { setIsAuthenticated } = useContext(AppContext);

  React.useEffect(() => {
    document.title = "Iniciar Sesión - Asistente virtual VRAE";
  }, []);

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateLogin = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        LOGIN,
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Actualizar estado de autenticación
        setIsAuthenticated(true);

        // Guardar preferencia "recordarme"
        if (formData.rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("userEmail", formData.email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("userEmail");
        }

        // Redirigir a la ruta desde donde vino o al chat
        navigate(from, { replace: true });
      } else {
        setErrors({
          general: response.data.message || "Error al iniciar sesión",
        });
      }
    } catch (error: unknown) {
      console.error("Error en login:", error);

      // Type guard para verificar si es un error de Axios
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as AxiosError;

        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 400
        ) {
          setErrors({
            general:
              axiosError.response.data?.message || "Credenciales inválidas",
          });
        } else if (axiosError.code === "ERR_NETWORK") {
          setErrors({
            general: "Error de conexión. Verifica que el servidor esté activo.",
          });
        } else {
          setErrors({
            general:
              axiosError.response?.data?.message ||
              "Error de conexión. Inténtalo de nuevo.",
          });
        }
      } else {
        setErrors({
          general: "Error de conexión. Inténtalo de nuevo.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar email guardado si existe
  React.useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    const rememberMe = localStorage.getItem("rememberMe");

    if (rememberMe === "true" && savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const handleInputChange = (
    field: keyof LoginFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar errores del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="h-screen bg-[#3E8BD6] relative overflow-hidden flex flex-col">
      {/* Patrón de fondo con imagen */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${fondoVrae}')`,
          height: 'calc(100vh - 120px)',
          bottom: '120px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex-shrink-0">
        <div className="container mx-auto px-3 py-2 md:px-4 md:py-4">
          <div className="flex items justify-between">
            {/* Logo UCT */}
            <div className="bg-transparent flex items-center p-0">
              <img
                src={logoVrae}
                alt="Logo UCT"
                className="w-full h-12 md:h-16 lg:h-20 object-contain"
              />
            </div>
            {/* Mode Toggle */}
            <div className="flex-shrink-0">
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Flex grow para ocupar espacio disponible */}
      <main className="relative z-10 flex-grow flex items-center justify-center">
        <div className="container mx-auto px-3 md:px-4">
          <div className="max-w-md mx-auto">
            <Card className="w-full bg-card/95 backdrop-blur-sm border border-border shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-card-foreground">
                  Iniciar Sesión
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Accede a tu cuenta para continuar
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Error general */}
                  {errors.general && (
                    <div role="alert" className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {errors.general}
                      </p>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors text-sm ${
                          errors.email
                            ? "border-destructive ring-destructive"
                            : "border-border"
                        }`}
                        placeholder="tu.correo@uct.cl"
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" className="mt-2 text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors text-sm ${
                          errors.password
                            ? "border-destructive ring-destructive"
                            : "border-border"
                        }`}
                        placeholder="••••••••"
                        aria-describedby={errors.password ? "password-error" : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="mt-2 text-sm text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Checkbox y link */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center text-card-foreground">
                      <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) =>
                          handleInputChange("rememberMe", e.target.checked)
                        }
                        className="rounded border-border text-primary focus:ring-primary focus:ring-offset-1 focus:ring-offset-card"
                      />
                      <span className="ml-2">Recordarme</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-sm font-medium transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Iniciando sesión...
                      </div>
                    ) : (
                      "Iniciar Sesión"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#FCC200] py-3 sm:py-4 md:py-6 lg:py-8 flex-shrink-0 flex items-center justify-center">
        <div className="container mx-auto px-3 md:px-4">
          <div className="text-center space-y-1 md:space-y-2">
            <p className="text-sm sm:text-base md:text-lg font-bold text-[#3E8BD6]">
              Asistente virtual VRAE
            </p>
            <p className="text-xs sm:text-sm md:text-base text-[#3E8BD6]/80">
              {currentYear} Asistente virtual UCT. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
