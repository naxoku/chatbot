/**
 * Configuración principal de la aplicación Express.
 * Define middleware, rutas y servicios del servidor backend.
 */

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pinoHttp = require("pino-http");
const { db } = require("./db");
const cors = require("cors");
const { logger } = require("./logger");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const convRoutes = require("./routes/conversaciones");
const docRoutes = require("./routes/documentos");
const mapasRoutes = require("./routes/mapas_mentales");
const minioRoutes = require("./routes/minio");

/**
 * Configura la aplicación Express principal del servidor.
 * Centraliza la configuración de middleware, rutas y servicios.
 */
const app = express();
const PORT = process.env.PORT;

// Genera representación enmascarada de la URL de base de datos para logging
const getMasked = (s) => {
  if (!s) return 'N/A';
  try {
    const url = new URL(s);
    const user = url.username || process.env.DB_USER || 'N/A';
    const host = url.hostname || process.env.DB_HOST || 'N/A';
    const port = url.port || process.env.DB_PORT || 'N/A';
    return `${user}@${host}:${port}`;
  } catch (e) {
    return `${process.env.DB_USER || 'N/A'}@${process.env.DB_HOST || 'N/A'}:${process.env.DB_PORT || 'N/A'}`;
  }
};

logger.info({ db: getMasked(process.env.DATABASE_URL) }, "Configuración de DB (parcial)");

// Habilita confianza en proxy para obtener IP real del cliente
app.set("trust proxy", 1);

// Configura middleware de logging HTTP con pino
app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} - ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
    },
    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        query: req.query,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configura CORS con lista blanca de orígenes permitidos
const allowedOrigins = [
  // Desarrollo local
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8080",
  // Producción
  "https://asistentevirtual.dev.uct.cl",
  "https://asistentevirtual.uct.cl",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requests sin origin (como mobile apps o curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn({ origin }, "Origen CORS bloqueado");
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Configura gestión de sesiones con PostgreSQL como almacén
const isProduction = process.env.NODE_ENV === 'production';
if (!process.env.SESSION_SECRET) {
  logger.error("SESSION_SECRET no está definido en las variables de entorno. La aplicación no puede iniciar sin un secreto de sesión seguro.");
  process.exit(1);
}
logger.info({ usingEnvSecret: !!process.env.SESSION_SECRET }, "Configuración de secreto de sesión");
app.use(
  session({
    store: new pgSession({
      pool: db,
      tableName: 'session',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // true en producción (HTTPS)
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 24 horas
    },
  })
);

// Endpoint de depuración para inspeccionar el estado de la sesión actual
app.get('/api/debug-session', (req, res) => {
  res.json({
    status: 'ok',
    sessionID: req.sessionID,
    user: req.session.userId ? { id: req.session.userId } : null,
    cookie: req.session.cookie
  });
});

// Endpoint de depuración para listar sesiones activas en la base de datos
app.get('/api/debug-sessions', async (req, res) => {
  try {
    const result = await db.query('SELECT sid, sess, expire FROM session LIMIT 10');
    res.json({
      status: 'ok',
      sessions: result.rows.map(row => ({
        sid: row.sid,
        user: row.sess?.user ? { id: row.sess.user.id } : null,
        expire: row.expire
      }))
    });
  } catch (err) {
    logger.error({ err }, "Error al obtener sesiones");
    res.status(500).json({ status: "error", message: "Error al obtener sesiones" });
  }
});

// Rutas de la API
app.use("/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversaciones", convRoutes);
app.use("/api/documentos", docRoutes);
app.use("/api/mapas-mentales", mapasRoutes);
app.use("/api/minio", minioRoutes);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Servidor corriendo");
});
