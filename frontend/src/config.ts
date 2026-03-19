// En producción usar rutas relativas para que nginx haga el proxy al backend
// En desarrollo, el proxy de Vite redirige a localhost:3000
const isDev = import.meta.env.DEV;
export const API_BASE = isDev ? "http://localhost:3000" : "";
export const LOGOUT = `${API_BASE}/auth/logout`;
export const CHECK_SESSION = `${API_BASE}/auth/checkSession`;
export const LOGIN = `${API_BASE}/auth/login`;