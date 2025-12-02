// Configuración de API basada en el entorno
const getApiBase = (): string => {
    const env = import.meta.env.VITE_ENVIRONMENT;
    const port = import.meta.env.VITE_BACKEND_PORT || '3000';

    if (env === 'docker') {
        // En Docker, usar URLs relativas para que Nginx proxy
        return '';
    }

    if (env === 'production') {
        // En producción real
        return 'https://asistentevirtual.uct.cl';
    }

    // En desarrollo
    return `http://localhost:${port}`;
};

export const API_BASE = getApiBase();
export const API_MINIO_BASE = `${API_BASE}/api/minio`;
export const LOGOUT = `${API_BASE}/auth/logout`;
export const CHECK_SESSION = `${API_BASE}/auth/checkSession`;
export const LOGIN = `${API_BASE}/auth/login`;