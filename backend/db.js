const { Pool } = require("pg");
require("dotenv").config();

// Configuración mejorada del pool para manejar desconexiones
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },

  // Configuración del pool
  max: 20, // Máximo número de clientes en el pool
  idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar conexión
  connectionTimeoutMillis: 2000, // Timeout para conectar
  allowExitOnIdle: false, // No permitir que el proceso termine con conexiones inactivas

  // Reintentos automáticos
  retryLimit: 3, // Número de reintentos para operaciones fallidas
  retryDelay: 1000, // Delay entre reintentos en ms
});

db.on("error", (err, client) => {
  console.error("❌ Error en el pool de la DB:", err.message);

  // Intentar reconectar si es un error de conexión perdida
  if (
    err.code === "ECONNRESET" ||
    err.code === "ENOTFOUND" ||
    err.code === "ECONNREFUSED"
  ) {
    console.log("🔄 Intentando reconectar a la base de datos...");
    // El pool se reconectará automáticamente en la siguiente consulta
  }
});

// Manejo de eventos de conexión
db.on("connect", (client) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Nueva conexión establecida a la base de datos");
  }
});

db.on("acquire", (client) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("🔄 Cliente adquirido del pool");
  }
});

db.on("release", (client) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Cliente liberado al pool");
  }
});

// Función helper para ejecutar consultas con reintentos
const queryWithRetry = async (text, params, retryCount = 0) => {
  try {
    const result = await db.query(text, params);
    return result;
  } catch (error) {
    console.log(
      `❌ Error en consulta (intento ${retryCount + 1}):`,
      error.message
    );

    // Reintentar si es un error de conexión y no hemos excedido el límite
    if (
      (error.code === "ECONNRESET" ||
        error.code === "ENOTFOUND" ||
        error.code === "ECONNREFUSED" ||
        error.message.includes("connection")) &&
      retryCount < (db.options?.retryLimit || 3)
    ) {
      console.log(`🔄 Reintentando en ${db.options?.retryDelay || 1000}ms...`);
      await new Promise((resolve) =>
        setTimeout(resolve, (db.options?.retryDelay || 1000) * (retryCount + 1))
      );
      return queryWithRetry(text, params, retryCount + 1);
    }

    throw error;
  }
};

module.exports = {
  db,
  queryWithRetry,
};
