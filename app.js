// Servidor
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 3000;
const path = require('path');

// Servir carpeta public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // para parsear JSON de POST
app.use(express.urlencoded({ extended: true })); // opcional, para formularios URL-encoded

// Configuración de CORS
const corsOptions = {
  origin: 'http://127.0.0.1:5500',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
};
app.use(cors(corsOptions)); // solo esto

// Configuración de sesiones
app.use(session({
  secret: 'mi-secreto',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true solo si usas HTTPS
}));

// Configuración DB
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chatbot'
};

// Ruta de registro
app.post('/register', async (req, res) => {
  const { nombre, apellido, email, password } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.json({ success: false, message: 'Todos los campos son requeridos' });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);

    // Verificar si ya existe el email
    const [rows] = await conn.execute('SELECT id FROM usuarios WHERE correo_electronico = ?', [email]);
    if (rows.length > 0) {
      return res.json({ success: false, message: 'Email ya registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await conn.execute(
      'INSERT INTO usuarios (nombre, apellido, correo_electronico, contrasena, fecha_registro, rol) VALUES (?, ?, ?, ?, NOW(), "usuario")',
      [nombre, apellido, email, hashedPassword]
    );

    res.json({ success: true, message: 'Usuario registrado exitosamente', user_id: result.insertId });
    await conn.end();
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error en la base de datos' });
  }
});

// Ruta de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: 'Email y contraseña son requeridos' });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM usuarios WHERE correo_electronico = ?', [email]);

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.contrasena);
    if (!match) {
      return res.json({ success: false, message: 'Credenciales inválidas' });
    }

    // Guardar sesión
    req.session.user = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.correo_electronico,
      rol: user.rol
    };

    res.json({ success: true, message: 'Login exitoso', user: req.session.user });
    await conn.end();
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error en la base de datos' });
  }
});

// Ruta logout
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

// Ruta checkSession
app.get('/checkSession', (req, res) => {
  if (req.session.user) {
    res.json({ logged_in: true, user: req.session.user });
  } else {
    res.json({ logged_in: false });
  }
});

// Ruta del chat
app.post('/api/chat', async (req, res) => {
  const { pregunta } = req.body;

  try {
    // const response = await fetch("https://skynet.uct.cl/webhook/pinecone", {
    const response = await fetch("https://skynet.uct.cl/webhook/chat", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta })
    });

    const data = await response.json();
    console.log("Respuesta del webhook:", data);

    let respuesta = "No hay respuesta disponible.";
    if (data && typeof data.respuesta === 'string') {
      respuesta = data.respuesta;
    }

    res.json({ respuesta: respuesta });

  } catch (err) {
    console.error("Error al contactar con el asistente:", err);
    res.status(500).json({ respuesta: "Error al contactar con el asistente." });
  }
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
