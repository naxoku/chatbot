/**
 * Configuración del sistema de logging con Pino.
 * Proporciona logger estructurado para desarrollo y producción.
 */

const pino = require("pino");

/**
 * Determina el entorno de ejecución para configurar el formato de logs apropiado.
 * En desarrollo se prioriza legibilidad, en producción se optimiza para procesamiento.
 */
const isProduction = process.env.NODE_ENV === "production";

/**
 * Configura el logger principal con pino.
 * Utiliza formato legible en desarrollo y JSON estructurado en producción para integración con sistemas de monitoreo.
 */
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // En desarrollo usamos pino-pretty para logs legibles
  // En producción usamos JSON para mejor procesamiento
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
  // Configuración base para producción (JSON)
  ...(isProduction && {
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
});

/**
 * Crea un logger hijo con contexto adicional.
 * Útil para agregar metadatos específicos a logs de módulos o funciones particulares.
 */
const createChildLogger = (context) => {
  return logger.child(context);
};

module.exports = {
  logger,
  createChildLogger,
};
