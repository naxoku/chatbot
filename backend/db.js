/**
 * CONFIGURACIÓN DE BASE DE DATOS - PostgreSQL con Supabase
 *
 * Configura la conexión a PostgreSQL usando variables de entorno.
 * Incluye pool de conexiones, reintentos automáticos y logging.
 */

const postgres = require("postgres");
require("dotenv").config();
const logger = require("./logger");

// Conexión a PostgreSQL usando variables de entorno
const sql = postgres({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'require' ? 'require' : false,
}, {
  // Configuración del pool de conexiones
  max: 20,                  // Máximo de conexiones
  idle_timeout: 30000,      // Cerrar conexiones inactivas después de 30s
  connect_timeout: 2000,    // Timeout de conexión 2s
  retry_on_init_fail: true, // Reintentar al iniciar

  // Logging solo en desarrollo
  onnotice: (notice) => {
    if (process.env.NODE_ENV !== "production") {
      logger.info("DB", `PostgreSQL Notice: ${notice.message}`);
    }
  },
  onclose: () => {
    if (process.env.NODE_ENV !== "production") {
      logger.info("DB", "Conexión PostgreSQL cerrada");
    }
  }
});

/**
 * Ejecuta consultas SQL con sistema de reintentos automático
 * @param {string} text - Consulta SQL
 * @param {Array} params - Parámetros de la consulta
 * @param {number} retryCount - Contador de reintentos (interno)
 */
const queryWithRetry = async (text, params = [], retryCount = 0) => {
  try {
    const result = await sql.unsafe(text, params);
    // Adaptar formato para compatibilidad con pg
    return {
      rows: result,
      rowCount: result.length,
    };
  } catch (error) {
    logger.warn("DB", `Error en consulta (intento ${retryCount + 1}): ${error.message}`);

    // Reintentar en caso de errores de conexión (máximo 3 veces)
    if (
      (error.code === "ECONNRESET" ||
        error.code === "ENOTFOUND" ||
        error.code === "ECONNREFUSED" ||
        error.message.includes("connection")) &&
      retryCount < 3
    ) {
      const delay = 1000 * (retryCount + 1);
      logger.info("DB", `Reintentando en ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return queryWithRetry(text, params, retryCount + 1);
    }

    throw error;
  }
};

// Exportar objeto de base de datos con método de consulta
const db = {
  query: queryWithRetry,  // Método principal
  sql,                    // Instancia directa para uso avanzado
};

// Exportar el módulo
module.exports = {
  db,
  queryWithRetry,
  sql,
};
