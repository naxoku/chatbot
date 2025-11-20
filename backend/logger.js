// Logger compacto con colores para toda la aplicación
const logger = {
  info: (module, msg, ...args) => console.log(`\x1b[36m[${module}]\x1b[0m ${msg}`, ...args),
  success: (module, msg, ...args) => console.log(`\x1b[32m[${module}]\x1b[0m ${msg}`, ...args),
  warn: (module, msg, ...args) => console.log(`\x1b[33m[${module}]\x1b[0m ${msg}`, ...args),
  error: (module, msg, ...args) => console.log(`\x1b[31m[${module}]\x1b[0m ${msg}`, ...args),
};

module.exports = logger;