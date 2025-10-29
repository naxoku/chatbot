import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CHECK_SESSION } from "../config.js";

/**
 * Hook personalizado para manejar la sesión del usuario
 *
 * Responsabilidades:
 * - Verificar si el usuario tiene una sesión activa
 * - Cargar los datos del usuario desde el backend
 * - Redirigir al login si no hay sesión
 *
 * @param {Function} setUser - Función para actualizar el estado del usuario
 * @param {Function} setMessages - Función para actualizar los mensajes del chat
 * @returns {Object} Estado de carga de la sesión
 */
export const useSessionManager = (setUser, setMessages) => {
  const navigate = useNavigate();
  const hasInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevenir múltiples ejecuciones del check de sesión
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const checkSession = async () => {
      try {
        const res = await fetch(CHECK_SESSION, { credentials: "include" });
        const data = await res.json();

        if (data.logged_in) {
          // Usuario autenticado: cargar datos
          setUser({
            name: data.user.nombre,
            email: data.user.email,
            role: data.user.rol,
          });
        } else {
          // No hay sesión: redirigir al login
          navigate("/login");
        }
      } catch (err) {
        console.error("Error en checkSession:", err);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate, setUser, setMessages]);

  return { isLoading };
};
