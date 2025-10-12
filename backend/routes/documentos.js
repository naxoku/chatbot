const express = require("express");
const axios = require("axios");
const path = require("path");
const router = express.Router();

const API_MINIO_BASE = process.env.API_MINIO_BASE;

router.get("/", async (req, res) => {
  try {
    // Obtener lista de archivos desde el servicio remoto
    const response = await axios.get(`${API_MINIO_BASE}/list`);
    const files = response.data.files || [];

    // Transformar resultados
    const documents = files.map((file, index) => {
      const title = path.basename(file);
      let category = path.dirname(file).replace(/\\/g, "/");

      // ✅ Si la ruta está en la raíz, o comienza con "./", asignar "General"
      if (category === "." || category === "./" || category === "") {
        category = "General";
      }

      const extension = title.split(".").pop().toLowerCase();

      let type = "documento";
      if (extension === "pdf") type = "reglamento";
      if (extension === "txt") type = "instructivo";

      return {
        id: index + 1,
        title,
        description: `Descripción de ${title}`,
        keywords: [title.split(".")[0], category],
        category,
        type,
        url: `${API_MINIO_BASE}/download/${file}`,
      };
    });

    res.json(documents);
  } catch (error) {
    console.error("Error al obtener documentos:", error.message);
    res.status(500).json({ message: "Error al obtener los documentos" });
  }
});

module.exports = router;
