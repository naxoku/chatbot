// Servidor
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = 3000;
const path = require("path");

// Servir carpeta public
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // para parsear JSON de POST
app.use(express.urlencoded({ extended: true })); // opcional, para formularios URL-encoded

// Configuración de CORS
const corsOptions = {
  origin: ["http://127.0.0.1:5500", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
};
app.use(cors(corsOptions));

// Configuración de sesiones
app.use(
  session({
    secret: "mi-secreto",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, // 1 día
  })
);

// Configuración DB
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "chatbot",
};

const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "No autorizado" });
  }
  next();
};

// Ruta de registro
app.post("/register", async (req, res) => {
  const { nombre, apellido, email, password } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.json({
      success: false,
      message: "Todos los campos son requeridos",
    });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);

    // Verificar si ya existe el email
    const [rows] = await conn.execute(
      "SELECT id FROM usuarios WHERE correo_electronico = ?",
      [email]
    );
    if (rows.length > 0) {
      return res.json({ success: false, message: "Email ya registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await conn.execute(
      'INSERT INTO usuarios (nombre, apellido, correo_electronico, contrasena, fecha_registro, rol) VALUES (?, ?, ?, ?, NOW(), "usuario")',
      [nombre, apellido, email, hashedPassword]
    );

    res.json({
      success: true,
      message: "Usuario registrado exitosamente",
      user_id: result.insertId,
    });
    await conn.end();
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error en la base de datos" });
  }
});

// Ruta de login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email y contraseña son requeridos",
    });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT * FROM usuarios WHERE correo_electronico = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "Credenciales inválidas" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.contrasena);
    if (!match) {
      return res.json({ success: false, message: "Credenciales inválidas" });
    }

    // Guardar sesión
    req.session.user = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.correo_electronico,
      rol: user.rol,
    };

    res.json({
      success: true,
      message: "Login exitoso",
      user: req.session.user,
    });
    await conn.end();
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error en la base de datos" });
  }
});

// Ruta para cerrar sesión
app.post("/logout", (req, res) => {
  // Destruye la sesión del usuario
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res
        .status(500)
        .json({ success: false, message: "No se pudo cerrar la sesión." });
    }
    // Responde con éxito
    res.json({ success: true, message: "Sesión cerrada correctamente." });
    res.clearCookie("connect.sid");
  });
});

// Ruta checkSession
app.get("/checkSession", (req, res) => {
  if (req.session.user) {
    res.json({ logged_in: true, user: req.session.user });
  } else {
    res.json({ logged_in: false });
  }
});

// Ruta del chat
app.post("/api/chat", async (req, res) => {
  const { pregunta } = req.body;

  try {
    // const response = await fetch("https://skynet.uct.cl/webhook/pinecone", {
    // Webhook chat con pinecone
    const response = await fetch("https://skynet.uct.cl/webhook/chat", {
      // Webhook chat con google sheets
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta }),
    });

    const data = await response.json();
    console.log("Respuesta del webhook:", data);

    let respuesta = "No hay respuesta disponible.";
    if (data && typeof data.respuesta === "string") {
      respuesta = data.respuesta;
    }

    res.json({ respuesta: respuesta });
  } catch (err) {
    console.error("Error al contactar con el asistente:", err);
    res.status(500).json({ respuesta: "Error al contactar con el asistente." });
  }
});

// Ruta para generar el mapa mental
app.post("/api/generar-mapa-mental", async (req, res) => {
  const { contexto } = req.body;
  const N8N_WEBHOOK_URL =
    "https://skynet.uct.cl/webhook/e960ebec-d1a0-4210-a0e3-d5ba29a3f6d9/chat";

  if (!contexto) {
    return res
      .status(400)
      .json({ error: "Falta el contexto para generar el mapa mental." });
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pregunta: `Basado en el siguiente contexto, genera SOLAMENTE una estructura de datos JSON para un mapa mental. El JSON debe tener un nodo raíz con una propiedad "name" y una propiedad "children" que es un array de objetos. Cada objeto hijo también debe tener "name" y opcionalmente "children".

        REGLAS ESTRICTAS:
        1. Tu respuesta debe ser ÚNICAMENTE el código JSON.
        2. NO incluyas \`\`\`json al principio ni \`\`\` al final.
        3. NO agregues ningún texto explicativo.
        4. Asegúrate que el JSON esté bien formado.`,
        contexto: contexto,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error del webhook de n8n: ${response.status} - ${errorText}`
      );
      return res
        .status(response.status)
        .json({ error: `Error del servidor de mapas: ${errorText}` });
    }

    const data = await response.json();
    console.log("Respuesta completa de n8n:", data);

    // La IA a veces responde en la propiedad 'respuesta' y puede ser un string o un objeto.
    let rawResponse =
      data.respuesta ||
      (Array.isArray(data) && data[0] ? data[0].respuesta : null);
    let mindMapData;

    if (typeof rawResponse === "string") {
      console.log("La IA devolvió un string, intentando limpiar y parsear...");
      try {
        // Se le quitan los ```json y los espacios en blanco de más
        const cleanJsonString = rawResponse
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "")
          .trim();
        mindMapData = JSON.parse(cleanJsonString);
      } catch (e) {
        // Si después de limpiar sigue mala, avisamos.
        console.error(
          "La IA devolvió un JSON malformado o texto que no es JSON:",
          rawResponse
        );
        // Mandamos un error 500 pero con un mensaje claro.
        return res.status(500).json({
          error: "La IA generó una respuesta inválida que no se pudo procesar.",
        });
      }
    } else if (typeof rawResponse === "object" && rawResponse !== null) {
      console.log("La IA devolvió un objeto JSON directamente.");
      mindMapData = rawResponse;
    } else {
      console.error(
        "No se encontró una respuesta válida en el objeto de n8n:",
        data
      );
      return res
        .status(500)
        .json({ error: "El formato de respuesta de n8n es inesperado." });
    }

    // Devolvemos el JSON limpio al frontend
    res.json(mindMapData);
  } catch (error) {
    console.error("Error catastrofico en la API de mapa mental:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al generar el mapa mental." });
  }
});

// Iniciar servidor
app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
