// Configuración de API basada en el entorno
const getApiBase = (): string => {
    // En producción
    if (window.location.hostname === 'asistentevirtual.uct.cl') {
        return 'https://asistentevirtual.uct.cl';
    }

    // En desarrollo
    if (window.location.hostname === 'asistentevirtual.dev.uct.cl') {
        return 'https://asistentevirtual.dev.uct.cl';
    }

    // En local (desarrollo)
    return 'http://localhost:3000';
};

export const API_BASE = getApiBase();
export const API_MINIO_BASE = "https://node-minio-crud.vercel.app";
export const LOGOUT = `${API_BASE}/auth/logout`;
export const CHECK_SESSION = `${API_BASE}/auth/checkSession`;
export const LOGIN = `${API_BASE}/auth/login`;