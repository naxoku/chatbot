// Servidor
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const { Pool } = require("pg"); // PostgreSQL driver
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Configuración de PostgreSQL con Supabase
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para Supabase
  }
});

// Función para probar la conexión
const testDatabaseConnection = async () => {
  try {
    console.log('🔄 Probando conexión a PostgreSQL...');
    const client = await db.connect();
    const result = await client.query('SELECT NOW() as fecha, version() as version');
    client.release();
    
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log(`📅 Fecha del servidor: ${result.rows[0].fecha}`);
    console.log(`🗄️ Versión PostgreSQL: ${result.rows[0].version}`);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error.message);
    console.error('🔧 Verifica tu URL de conexión y contraseña');
    return false;
  }
};

// Función completa de inicialización
const initializeDatabase = async () => {
  console.log('🚀 Inicializando sistema PostgreSQL...');
  
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    console.error('💥 No se puede continuar sin conexión a PostgreSQL');
    process.exit(1);
  }
  
  // const tablesOk = await initializeTables();
  // if (!tablesOk) {
  //   console.error('⚠️ Problemas al crear las tablas, pero la aplicación continuará');
  // }
  
  console.log('🎉 PostgreSQL listo para usar');
};

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

// Middleware para rutas protegidas
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "No autorizado" });
  }
  next();
};

// Ruta de registro (CORREGIDA para PostgreSQL)
app.post("/register", async (req, res) => {
  const { nombre, apellido, email, password } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.json({
      success: false,
      message: "Todos los campos son requeridos",
    });
  }

  try {
    // Verificar si ya existe el email (PostgreSQL)
    const existingUser = await db.query(
      "SELECT id FROM usuarios WHERE correo_electronico = $1",
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.json({ success: false, message: "Email ya registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario (PostgreSQL con RETURNING)
    const result = await db.query(
      `INSERT INTO usuarios (nombre, apellido, correo_electronico, contrasena, fecha_registro, rol) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'usuario') 
       RETURNING id`,
      [nombre, apellido, email, hashedPassword]
    );

    res.json({
      success: true,
      message: "Usuario registrado exitosamente",
      user_id: result.rows[0].id,
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.json({ success: false, message: "Error en la base de datos" });
  }
});

// Ruta de login (CORREGIDA para PostgreSQL)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  // Validación inicial
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email y contraseña son requeridos",
    });
  }

  try {
    console.log('🔍 Intentando login para:', email);
    
    const result = await db.query(
      "SELECT id, nombre, apellido, correo_electronico, contraseña, rol FROM usuarios WHERE correo_electronico = $1",
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado:', email);
      return res.json({ success: false, message: "Credenciales inválidas" });
    }

    const user = result.rows[0];
    
    // DEBUG: Verificar qué datos tenemos
    console.log('📊 Datos del usuario encontrado:');
    console.log('- ID:', user.id);
    console.log('- Nombre:', user.nombre);
    console.log('- Email:', user.correo_electronico);
    console.log('- Contraseña hash existe:', !!user.contraseña);
    console.log('- Longitud del hash:', user.contraseña ? user.contraseña.length : 'NULL');
    console.log('- Password recibido existe:', !!password);
    console.log('- Longitud password:', password ? password.length : 'NULL');

    // Validar que ambos argumentos existan
    if (!user.contraseña) {
      console.error('❌ ERROR: La contraseña hash está NULL o vacía en la DB');
      return res.json({ 
        success: false, 
        message: "Error de configuración de cuenta. Contacta al administrador." 
      });
    }

    if (!password) {
      console.error('❌ ERROR: Password recibido está vacío');
      return res.json({ 
        success: false, 
        message: "La contraseña es requerida" 
      });
    }

    // Intentar comparar las contraseñas
    console.log('🔐 Comparando contraseñas...');
    const match = await bcrypt.compare(password, user.contraseña);
    console.log('✅ Resultado de comparación:', match);

    if (!match) {
      console.log('❌ Contraseña incorrecta para:', email);
      return res.json({ success: false, message: "Credenciales inválidas" });
    }

    // Login exitoso
    console.log('✅ Login exitoso para:', email);
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

  } catch (err) {
    console.error('❌ Error en login:', err);
    res.json({ success: false, message: "Error en la base de datos" });
  }
});

// RUTA ADICIONAL: Para verificar usuarios existentes (temporal para debug)
app.get("/debug/usuarios", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        nombre, 
        apellido, 
        correo_electronico, 
        CASE 
          WHEN contrasena IS NULL THEN 'NULL'
          WHEN contrasena = '' THEN 'EMPTY'
          ELSE 'EXISTS (' || length(contrasena) || ' chars)'
        END as estado_password,
        fecha_registro,
        rol
      FROM usuarios 
      ORDER BY fecha_registro DESC
    `);
    
    res.json({
      success: true,
      total_usuarios: result.rows.length,
      usuarios: result.rows
    });
  } catch (err) {
    console.error('Error en debug usuarios:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ruta para cerrar sesión
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res
        .status(500)
        .json({ success: false, message: "No se pudo cerrar la sesión." });
    }
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Sesión cerrada correctamente." });
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
    const response = await fetch("https://skynet.uct.cl/webhook/chat", {
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

    let rawResponse =
      data.respuesta ||
      (Array.isArray(data) && data[0] ? data[0].respuesta : null);
    let mindMapData;

    if (typeof rawResponse === "string") {
      console.log("La IA devolvió un string, intentando limpiar y parsear...");
      try {
        const cleanJsonString = rawResponse
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "")
          .trim();
        mindMapData = JSON.parse(cleanJsonString);
      } catch (e) {
        console.error(
          "La IA devolvió un JSON malformado o texto que no es JSON:",
          rawResponse
        );
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

    res.json(mindMapData);
  } catch (error) {
    console.error("Error catastrofico en la API de mapa mental:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al generar el mapa mental." });
  }
});

// Ruta mejorada para verificar DB (CORREGIDA)
app.get("/db-test", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        NOW() as fecha_actual,
        version() as version_postgresql,
        current_database() as base_datos_actual,
        pg_backend_pid() as id_conexion
    `);
    
    // Verificar si existe la tabla usuarios
    const tableCheck = await db.query(`
      SELECT COUNT(*) as existe 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'usuarios'
    `);
    
    res.json({ 
      success: true, 
      connection_info: result.rows[0],
      tabla_usuarios_existe: parseInt(tableCheck.rows[0].existe) > 0,
      message: "Conexión a PostgreSQL exitosa"
    });
  } catch (err) {
    console.error('Error en db-test:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error en la conexión a PostgreSQL",
      error: err.message 
    });
  }
});

// Inicializar base de datos y luego iniciar servidor
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔗 Prueba la DB en: http://localhost:${PORT}/db-test`);
  });
}).catch((error) => {
  console.error('💥 Error fatal al inicializar:', error);
  process.exit(1);
});