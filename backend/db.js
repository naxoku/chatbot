/**
 * Configuración del pool de conexiones a PostgreSQL.
 * Maneja conexiones, reintentos y logging para la base de datos.
 */

const { Pool } = require("pg");
require("dotenv").config();
const { logger } = require("./logger");

// Configura el pool de conexiones a PostgreSQL con manejo robusto de errores
const {
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL,
} = process.env;

let connectionString = DATABASE_URL;
if (!connectionString) {
  if (DB_HOST && DB_USER && DB_PASSWORD && DB_NAME) {
    connectionString = `postgres://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT || 5432}/${DB_NAME}`;
  } else {
    logger.warn(
      "No se encontró DATABASE_URL ni variables DB_* completas en .env. Usando valores por defecto",
    );
  }
}

// Configura SSL según el entorno y variables de configuración
const sslConfig =
  DB_SSL === "true" || DB_SSL === "1" || (!DB_SSL && !!DATABASE_URL)
    ? { rejectUnauthorized: false }
    : false;

// Crea el pool de conexiones PostgreSQL con configuración optimizada para conexiones remotas (Supabase)
const db = new Pool({
  connectionString: connectionString,
  ssl: sslConfig,

  // Configuración del pool para optimizar uso de recursos en conexiones remotas
  max: 10, // Reducido para evitar saturar el pooler de Supabase
  idleTimeoutMillis: 60000, // Tiempo de inactividad antes de cerrar conexión (1 min)
  connectionTimeoutMillis: 30000, // Timeout para conectar (30 segundos para conexiones remotas)
  allowExitOnIdle: false, // No permitir que el proceso termine con conexiones inactivas

  // Configuración adicional para conexiones remotas
  statement_timeout: 30000, // Timeout para statements (30 seg)
  query_timeout: 30000, // Timeout para queries (30 seg)
  keepAlive: true, // Mantener conexiones vivas
  keepAliveInitialDelayMillis: 10000, // Delay inicial para keepalive

  // Reintentos automáticos para mayor resiliencia
  retryLimit: 5, // Número de reintentos para operaciones fallidas
  retryDelay: 2000, // Delay entre reintentos en ms
});

// Verifica si un error es de tipo conexión
const isConnectionError = (error) => {
  return (
    error.code === "ECONNRESET" ||
    error.code === "ENOTFOUND" ||
    error.code === "ECONNREFUSED" ||
    error.message?.includes("connection")
  );
};

// Maneja errores del pool de conexiones
db.on("error", (err, client) => {
  logger.error({ err }, "Error en el pool de la DB");

  if (isConnectionError(err)) {
    logger.info("Intentando reconectar a la base de datos...");
  }
});

// Registra eventos del pool para monitoreo y debugging
db.on("connect", (client) => {
  if (process.env.NODE_ENV !== "production") {
    logger.info("Nueva conexión establecida a la base de datos");
  }
});

db.on("acquire", (client) => {
  if (process.env.NODE_ENV !== "production") {
    logger.debug("Cliente adquirido del pool");
  }
});

db.on("release", (client) => {
  if (process.env.NODE_ENV !== "production") {
    logger.debug("Cliente liberado al pool");
  }
});

// Ejecuta consultas SQL con reintentos automático
const queryWithRetry = async (text, params, retryCount = 0) => {
  try {
    return await db.query(text, params);
  } catch (error) {
    logger.error({ err: error, attempt: retryCount + 1 }, "Error en consulta");

    const maxRetries = db.options?.retryLimit || 3;
    const shouldRetry = isConnectionError(error) && retryCount < maxRetries;

    if (shouldRetry) {
      const delay = (db.options?.retryDelay || 1000) * (retryCount + 1);
      logger.warn({ delay }, "Reintentando consulta...");
      await new Promise((resolve) => setTimeout(resolve, delay));
      return queryWithRetry(text, params, retryCount + 1);
    }

    throw error;
  }
};

module.exports = {
  db,
  queryWithRetry,
};

// Verifica conexión a la DB al iniciar la aplicación
const testConnection = async (attempt = 1, maxAttempts = 5) => {
  try {
    logger.info(
      { attempt, maxAttempts },
      "Intentando conectar a la base de datos...",
    );
    const client = await db.connect();
    try {
      const res = await client.query("SELECT NOW()");
      logger.info(
        { timestamp: res.rows[0], attempt },
        "DB: Conexión a la base de datos OK",
      );
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error(
      { err, attempt },
      "Error de conexión a la base de datos (startup check)",
    );

    if (err.message && err.message.includes("password authentication failed")) {
      logger.error(
        "Autenticación fallida: revisa DATABASE_URL o DB_USER/DB_PASSWORD en .env",
      );
      return; // No reintentar si es error de autenticación
    }

    // Reintentar si no hemos alcanzado el máximo de intentos
    if (attempt < maxAttempts) {
      const delay = 5000 * attempt; // Delay incremental: 5s, 10s, 15s, etc.
      logger.warn(
        { delay, nextAttempt: attempt + 1 },
        "Reintentando conexión a la base de datos...",
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return testConnection(attempt + 1, maxAttempts);
    } else {
      logger.error("Se agotaron los intentos de conexión a la base de datos");
    }
  }
};

testConnection();
