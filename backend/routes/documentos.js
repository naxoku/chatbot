const express = require("express");
const axios = require("axios");
const path = require("path");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${process.env.API_MINIO_BASE}/list`);
    const files = response.data.files || [];

    // Transformar resultados
    const documents = files.map((file, index) => {
      const title = path.basename(file);
      let category = path.dirname(file).replace(/\\/g, "/");

      // Si la ruta está en la raíz, o comienza con "./", asignar "General"
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
        url: `${process.env.API_MINIO_BASE}/download/${file}`,
      };
    });

    res.json(documents);
  } catch (error) {
    
    res.status(500).json({
      message: "Error al obtener los documentos",
      error: error.message,
      details: error.response?.data
    });
  }
});

module.exports = router;
