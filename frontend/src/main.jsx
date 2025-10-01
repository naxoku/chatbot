import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://chatbot-production-d56e.up.railway.app";

// ¡NUEVO: Interceptor para redirigir automáticamente en 401/403 (o logged_in false en respuestas)
axios.interceptors.response.use(
  (response) => {
    // Opcional: Verifica si es checkSession y logged_in false → redirige
    if (response.config.url === "/checkSession" && !response.data.logged_in) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return response;
  },
  (error) => {
    // Para errores HTTP (ej. 401 si lo agregas en backend)
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    // Para red errors (backend down)
    if (error.code === "ERR_NETWORK" || !error.response) {
      console.error("Backend no accesible:", error.message);
      // Opcional: Muestra toast o modal de error global
    }
    return Promise.reject(error);  // Re-lanza para manejo local
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);