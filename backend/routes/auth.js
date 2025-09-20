const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  const { nombre, apellido, email, password } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.json({
      success: false,
      message: "Todos los campos son requeridos",
    });
  }

  try {
    const existingUser = await db.query(
      "SELECT id FROM usuarios WHERE correo_electronico = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.json({ success: false, message: "Email ya registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO usuarios (nombre, apellido, correo_electronico, contraseña, fecha_registro, rol) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'usuario') 
       RETURNING id`,
      [nombre, apellido, email, hashedPassword]
    );

    res.json({ success: true, user_id: result.rows[0].id });
  } catch (err) {
    console.error("Error en registro:", err);
    res.json({ success: false, message: "Error en la base de datos" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT id, nombre, apellido, correo_electronico, contraseña, rol FROM usuarios WHERE correo_electronico = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "Credenciales inválidas" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.contraseña);

    if (!match) {
      return res.json({ success: false, message: "Credenciales inválidas" });
    }

    req.session.user = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.correo_electronico,
      rol: user.rol,
    };

    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error("Error en login:", err);
    res.json({ success: false, message: "Error en la base de datos" });
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
