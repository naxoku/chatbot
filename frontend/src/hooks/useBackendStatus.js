import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config.js";

/**
 * Hook personalizado para monitorear el estado del backend
 *
 * Responsabilidades:
 * - Verificar el estado de salud del backend
 * - Monitorear el estado de la base de datos
 * - Monitorear el estado de n8n
 * - Actualizar el estado cada 3 minutos
 *
 * @returns {Object} Estado actual del backend
 */
export const useBackendStatus = () => {
  const [backendStatus, setBackendStatus] = useState({
    status: "unknown",
    database: { status: "unknown" },
    n8n: { status: "unknown" },
    system: { cpuUsage: "0%", memoryUsage: "0MB / 0GB" },
  });

  useEffect(() => {
    const fetchBackendStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/status`);
        setBackendStatus(response.data);
      } catch (error) {
        console.error("Error al verificar estado del backend:", error);
        setBackendStatus({
          status: "offline",
          database: { status: "offline", error: error.message },
          n8n: { status: "offline", error: error.message },
          system: { cpuUsage: "N/A", memoryUsage: "N/A" },
        });
      }
    };

    // Verificar inmediatamente y luego cada 3 minutos
    fetchBackendStatus();
    const intervalId = setInterval(fetchBackendStatus, 180000);

    return () => clearInterval(intervalId);
  }, []);

  return backendStatus;
};
