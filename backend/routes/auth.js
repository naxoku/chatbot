const express = require("express");
const axios = require("axios");
const db = require("../db");

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email y contraseña son requeridos",
    });
  }

  try {
    // Llamada a la API de validación externa
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

    const data = response.data;

    if (data && data.success && data.data?.authenticated) {
      const { Rut, cn, uid } = data.data;

      // Verificamos si el usuario ya existe
      const existingUser = await db.query(
        "SELECT id FROM usuarios WHERE correo_electronico = $1",
        [email]
      );

      let userId;
      if (existingUser.rows.length === 0) {
        // Insertamos el usuario en la nueva tabla
        const result = await db.query(
          `INSERT INTO usuarios (rut, nombre, correo_electronico, usuario) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id`,
          [Rut, cn, email, uid]
        );
        userId = result.rows[0].id;
      } else {
        userId = existingUser.rows[0].id;
      }

      // Guardamos en sesión
      req.session.user = {
        id: userId,
        email,
        rut: Rut,
        nombre: cn,
        usuario: uid,
      };

      return res.json({
        success: true,
        message: `Bienvenido ${cn}`,
        user: req.session.user,
      });
    } else {
      return res.json({
        success: false,
        message: data?.message || "Credenciales inválidas",
      });
    }
  } catch (err) {
    console.error("Error en login:", err.message);
    return res.json({
      success: false,
      message: "Error en el servicio de autenticación",
    });
  }
});

// Insertar conversación
router.post("/conversacion", async (req, res) => {
  const { pregunta, respuesta } = req.body;

  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Usuario no autenticado",
    });
  }

  try {
    const result = await db.query(
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
    console.error("Error al guardar conversación:", err.message);
    return res.json({
      success: false,
      message: "Error al guardar la conversación",
    });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Sesión cerrada correctamente." });
  });
});

// Check session
router.get("/checkSession", (req, res) => {
  if (req.session.user) {
    res.json({ logged_in: true, user: req.session.user });
  } else {
    res.json({ logged_in: false });
  }
});

module.exports = router;
