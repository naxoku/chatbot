/**
 * Rutas para gestión de documentos.
 * Lista y proporciona acceso a documentos almacenados en MinIO/S3.
 */

const express = require("express");
const path = require("path");
const { ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { s3, getBucket } = require("./s3Client");
const { logger } = require("../logger");

const router = express.Router();

// Construye la URL base para descargas de documentos
const getDownloadBaseUrl = (req) => {
  // Devolver URL relativa para evitar problemas con proxies y localhost
  // El navegador resolverá esto contra la URL del frontend actual
  // Si el frontend está en https://midominio.com, esto será https://midominio.com/api/...
  return "";
};

// Obtiene la lista completa de documentos disponibles en el almacenamiento
router.get("/", async (req, res) => {
  try {
    const bucket = getBucket();
    logger.debug({ bucket }, "Obteniendo lista de documentos");

    const data = await s3.send(new ListObjectsV2Command({ Bucket: bucket }));
    const files = (data.Contents || []).map(obj => obj.Key);

    // Obtener la URL base para construir las URLs de descarga
    const baseUrl = getDownloadBaseUrl(req);

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
        // Usar query string para evitar problemas de encoding con caracteres especiales en la ruta
        url: `${baseUrl}/api/minio/download?key=${encodeURIComponent(file)}`,
      };
    });

    logger.info({ count: documents.length }, "Documentos obtenidos exitosamente");
    res.json(documents);
  } catch (error) {
    logger.error({ err: error }, "Error al obtener los documentos");
    res.status(500).json({
      message: "Error interno al obtener documentos. Intente nuevamente.",
      error: error.message
    });
  }
});

module.exports = router;
