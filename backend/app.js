require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const convRoutes = require("./routes/conversaciones");
const docRoutes = require("./routes/documentos");
const mapasRoutes = require("./routes/mapas_mentales");
const statusRoutes = require("./routes/status"); // Importar las rutas de estado

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://agenteuct.up.railway.app",
    ],
    credentials: true,
  })
);
app.use(
  session({
    secret: "mi-secreto",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
  })
);

// Rutas
app.use("/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversaciones", convRoutes);
app.use("/api/documentos", docRoutes);
app.use("/api/mapas-mentales", mapasRoutes);
app.use("/api", statusRoutes); // Usar las rutas de estado

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
