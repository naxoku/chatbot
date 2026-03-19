/**
 * Rutas de autenticación y gestión de sesiones.
 * Maneja login/logout, validación LDAP y almacenamiento de conversaciones.
 */

const express = require("express");
const axios = require("axios");
const { db, queryWithRetry } = require("../db");
const { logger } = require("../logger");

const router = express.Router();

// Autentica contra API LDAP de UCT
const authenticateWithLDAP = async (email, password) => {
  const response = await axios.post(
    "https://api-ldap.uct.cl/validacion",
    { email, password },
    {
      headers: {
        Authorization: "7d668ec5c1f3a94921d321d8d27e4b16",
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Obtiene o crea usuario en la base de datos
const getOrCreateUser = async (email, userData) => {
  const { Rut, cn, uid } = userData;
  
  const existingUser = await queryWithRetry(
    "SELECT id FROM usuarios WHERE correo_electronico = $1",
    [email]
  );

  if (existingUser.rows.length === 0) {
    logger.info("Creando nuevo usuario...");
    const result = await queryWithRetry(
      `INSERT INTO usuarios (rut, nombre, correo_electronico, usuario)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [Rut, cn, email, uid]
    );
    return result.rows[0].id;
  }
  
  return existingUser.rows[0].id;
};

// Autentica usuarios contra el servicio LDAP de UCT
router.post("/login", async (req, res) => {
  logger.debug({ contentType: req.headers["content-type"] }, "Solicitud de login recibida");

  const { email, password } = req.body;

  if (!email || !password) {
    logger.warn("Email o contraseña faltantes en la solicitud");
    return res.json({
      success: false,
      message: "Email y contraseña son requeridos",
    });
  }

  try {
    logger.info("Llamando a la API de UCT...");

    const data = await authenticateWithLDAP(email, password);
    logger.info({ authenticated: data?.success && data?.data?.authenticated }, "Respuesta de la API de UCT");

    if (data && data.success && data.data?.authenticated) {
      logger.info("Usuario autenticado, verificando base de datos...");
      
      const userId = await getOrCreateUser(email, data.data);
      logger.info({ userId }, "ID de usuario obtenido");

      req.session.user = {
        id: userId,
        email,
        rut: data.data.Rut,
        nombre: data.data.cn,
        usuario: data.data.uid,
      };

      logger.info({ userId }, "Inicio de sesión exitoso");
      return res.json({
        success: true,
        message: `Bienvenido ${data.data.cn}`,
        user: req.session.user,
      });
    }
    
    logger.warn("Falló la autenticación");
    return res.json({
      success: false,
      message: data?.message || "Credenciales inválidas",
    });
  } catch (err) {
    logger.error({ err }, "Error en login");
    return res.json({
      success: false,
      message: "Error al verificar credenciales. Verifique su conexión e intente nuevamente.",
    });
  }
});

// Almacena una conversación en la base de datos.
router.post("/conversacion", async (req, res) => {
  const { pregunta, respuesta } = req.body;

  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Sesión expirada o no iniciada. Inicie sesión nuevamente.",
    });
  }

  try {
    const result = await queryWithRetry(
      `INSERT INTO conversaciones (usuario_id, pregunta, respuesta)
       VALUES ($1, $2, $3)
       RETURNING id, fecha_creacion`,
      [req.session.user.id, pregunta, respuesta]
    );

    return res.json({
      success: true,
      message: "Conversación guardada correctamente",
      conversacion: {
        id: result.rows[0].id,
        usuario_id: req.session.user.id,
        pregunta,
        respuesta,
        fecha_creacion: result.rows[0].fecha_creacion,
      },
    });
  } catch (err) {
    logger.error({ err }, "Error al guardar conversación");
    return res.json({
      success: false,
      message: "Error interno al guardar conversación. Intente nuevamente.",
    });
  }
});

// Destruye la sesión del usuario y limpia las cookies.
router.post("/logout", (req, res) => {
  logger.info({ sessionID: req.sessionID }, "Intento de cierre de sesión");

  req.session.destroy((err) => {
    if (err) {
      logger.error({ err }, "Error al destruir sesión");
      return res.status(500).json({ success: false, message: "Error interno al cerrar sesión. Intente nuevamente." });
    }

    logger.info({ sessionID: req.sessionID }, "Sesión destruida exitosamente");
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Sesión cerrada correctamente." });
  });
});

// Verifica el estado de autenticación de la sesión actual.
router.get("/checkSession", (req, res) => {
  if (req.session.user) {
    res.json({ logged_in: true, user: req.session.user });
  } else {
    res.json({ logged_in: false });
  }
});

module.exports = router;
