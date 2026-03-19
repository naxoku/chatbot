/**
 * Rutas para operaciones con MinIO/S3.
 * Maneja subida, descarga, listado y eliminación de archivos.
 */

const express = require("express");
const { ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3, getBucket } = require("./s3Client");
const { logger } = require("../logger");

const router = express.Router();

// Convierte un stream de datos en un buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Lista todos los archivos disponibles en el bucket de MinIO
router.get("/list", async (req, res) => {
  try {
    const bucket = getBucket();
    logger.debug({ bucket }, "Listando archivos de MinIO");

    const data = await s3.send(new ListObjectsV2Command({ Bucket: bucket }));
    const files = (data.Contents || []).map(obj => obj.Key);

    logger.info({ count: files.length }, "Archivos listados exitosamente");
    res.json({ files });
  } catch (err) {
    logger.error({ err }, "Error al listar archivos de MinIO");
    res.status(500).json({ error: "Error interno al listar archivos. Intente nuevamente." });
  }
});

// Sube un archivo codificado en base64 al bucket de MinIO
router.post("/upload", async (req, res) => {
  try {
    const { filename, content } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: "Falta filename o content" });
    }

    const bucket = getBucket();
    const buffer = Buffer.from(content, "base64");

    logger.debug({ bucket, filename, size: buffer.length }, "Subiendo archivo a MinIO");

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: buffer
    }));

    logger.info({ filename }, "Archivo subido exitosamente");
    res.json({ message: `Archivo '${filename}' subido con éxito.` });
  } catch (err) {
    logger.error({ err }, "Error al subir archivo a MinIO");
    res.status(500).json({ error: "Error interno al subir archivo. Intente nuevamente." });
  }
});

// Descarga un archivo desde MinIO
router.get("/download", async (req, res) => {
  try {
    // Usar query param 'key'
    const key = req.query.key;

    if (!key) {
      return res.status(400).json({ error: "Falta el parámetro key" });
    }

    const bucket = getBucket();
    logger.debug({ bucket, key }, "Descargando archivo de MinIO");

    const data = await s3.send(new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }));

    const buffer = await streamToBuffer(data.Body);

    // Obtener el nombre del archivo para el header
    const filename = key.split("/").pop();
    
    // Determinar disposition basada en query param
    const disposition = req.query.inline === "true" ? "inline" : "attachment";
    
    // Determinar content-type correcto basado en extensión (siempre forzar el correcto)
    const extension = filename.split('.').pop()?.toLowerCase();
    let contentType;
    
    // Forzar el Content-Type correcto basado en la extensión, ignorando lo que venga de MinIO
    if (extension === 'pdf') {
      contentType = 'application/pdf';
    } else if (['jpg', 'jpeg'].includes(extension)) {
      contentType = 'image/jpeg';
    } else if (extension === 'png') {
      contentType = 'image/png';
    } else if (extension === 'gif') {
      contentType = 'image/gif';
    } else if (extension === 'webp') {
      contentType = 'image/webp';
    } else {
      // Fallback al Content-Type de MinIO o octet-stream
      contentType = data.ContentType || "application/octet-stream";
    }
    
    res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);

    logger.info({ key, size: buffer.length }, "Archivo descargado exitosamente");
    res.send(buffer);
  } catch (err) {
    logger.error({ err, key: req.query.key || req.params[0] }, "Error al descargar archivo de MinIO");
    res.status(500).json({ error: "Error interno al descargar archivo. Intente nuevamente." });
  }
});

// Elimina un archivo específico del bucket de MinIO
router.delete("/delete", async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "Falta el parámetro key" });
    }

    const bucket = getBucket();
    logger.debug({ bucket, key }, "Eliminando archivo de MinIO");

    await s3.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }));

    logger.info({ key }, "Archivo eliminado exitosamente");
    res.json({ message: `Archivo '${key}' eliminado con éxito.` });
  } catch (err) {
    logger.error({ err, key: req.body.key }, "Error al eliminar archivo de MinIO");
    res.status(500).json({ error: "Error interno al eliminar archivo. Intente nuevamente." });
  }
});

module.exports = router;