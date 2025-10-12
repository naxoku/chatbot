const { Pool } = require("pg");
require("dotenv").config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.on("error", (err, client) => {
  console.error("Error en el pool de la DB:", err);
});

module.exports = db;
