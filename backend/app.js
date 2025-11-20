/**
 * SERVIDOR PRINCIPAL - Asistente Virtual UCT
 *
 * Configura y inicia el servidor Express.js con todas las funcionalidades
 * del backend del chatbot: autenticación, conversaciones, documentos, etc.
 */

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const logger = require("./logger");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const convRoutes = require("./routes/conversaciones");
const docRoutes = require("./routes/documentos");
const mapasRoutes = require("./routes/mapas_mentales");
const statusRoutes = require("./routes/status");

const app = express();
const PORT = process.env.PORT || 3000;

// Confiar en el proxy (Nginx/Docker) para manejar correctamente cookies y headers
app.set('trust proxy', 1);

// Middlewares básicos
app.use(express.json());  // Parsear JSON
app.use(express.urlencoded({ extended: true }));  // Parsear formularios

// Configuración CORS - permite conexiones desde múltiples dominios
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      "http://127.0.0.1:5500",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:8080",
    ];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Configuración de sesiones para autenticación
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mi-secreto",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // Secure activado solo si estamos en producción Y explícitamente habilitado
      // Esto evita problemas en despliegues locales con Docker sin HTTPS
      secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE === 'true',
      maxAge: 1000 * 60 * 60 * 24, // 24 horas
      httpOnly: true, // No accesible desde JavaScript
      sameSite: 'lax' // Protección CSRF
    },
  })
);

// Rutas de la API
app.use("/auth", authRoutes);               // Autenticación
app.use("/api/chat", chatRoutes);           // Chat del bot
app.use("/api/conversaciones", convRoutes); // Gestión de conversaciones
app.use("/api/documentos", docRoutes);      // Gestión de documentos
app.use("/api/mapas-mentales", mapasRoutes);// Mapas mentales
app.use("/api", statusRoutes);              // Estado del sistema

// Iniciar servidor
app.listen(PORT, () => {
  logger.success("APP", `Servidor corriendo en http://localhost:${PORT}`);
  logger.info("APP", `Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
  logger.info("APP", `CORS habilitado para ${corsOrigins.length} dominios: ${corsOrigins.join(', ')}`);
});
