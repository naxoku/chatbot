const express = require("express");
const axios = require("axios");
const { API_MINIO_BASE } = require("../../frontend/src/config");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_MINIO_BASE}/list`);
    const files = response.data.files || [];

    const documents = files.map((file, index) => {
      const parts = file.split("/");
      const title = parts.length > 1 ? parts[1] : parts[0];
      const category = parts.length > 1 ? parts[0] : "General";
      const extension = title.split(".").pop().toLowerCase();

      let type = "documento";
      if (extension === "pdf") type = "reglamento";
      if (extension === "txt") type = "instructivo";

      return {
        id: index + 1,
        title: title,
        description: `Descripción de ${title}`,
        keywords: [title.split(".")[0], category],
        category: category,
        type: type,
        url: `https://node-minio-crud-coni.vercel.app/download/${file}`, // Asumiendo una URL de descarga
      };
    });

    res.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Error al obtener los documentos" });
  }
});

module.exports = router;
