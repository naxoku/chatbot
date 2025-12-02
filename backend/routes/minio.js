/**
 * MinIO Storage API integrated into chatbot backend
 * Endpoints: /list, /upload, /download, /delete, /sign
 */

const express = require("express");
const router = express.Router();
const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { HttpRequest } = require("@smithy/protocol-http");
const { Sha256 } = require("@aws-crypto/sha256-js");

// Read environment variables from chatbot .env
const endpoint = process.env.MINIO_ENDPOINT || process.env.ENDPOINT;
const region = process.env.MINIO_DEFAULT_REGION || process.env.REGION || "us-east-1";
const accessKeyId = process.env.DEV_ASISTENTEVIRTUAL_MINIO_ACCESS_KEY_ID || process.env.ACCESS_KEY;
const secretAccessKey = process.env.DEV_ASISTENTEVIRTUAL_MINIO_SECRET_ACCESS_KEY || process.env.SECRET_KEY;
const bucket = process.env.DEV_ASISTENTEVIRTUAL_MINIO_BUCKET || process.env.MINIO_BUCKET || process.env.BUCKET;
const forcePathStyle = (process.env.MINIO_USE_PATH_STYLE_ENDPOINT || "true").toString().toLowerCase() === "true";

// Initialize S3 client for MinIO
const s3 = new S3Client({
  endpoint,
  region,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle,
});

// Log important configuration (avoid leaking secrets) for easier debugging
console.info("MinIO Integration: endpoint=", endpoint);
console.info("MinIO Integration: region=", region);
console.info("MinIO Integration: bucket=", bucket);
console.info("MinIO Integration: forcePathStyle=", forcePathStyle);

// Helpers
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// GET /api/minio/list
router.get("/list", async (req, res) => {
  try {
    const data = await s3.send(new ListObjectsV2Command({ Bucket: bucket }));
    const files = (data.Contents || []).map((obj) => obj.Key);
    res.json({ files });
  } catch (err) {
    console.error("MinIO list error:", err);
    res.status(500).json({ error: "No se pudo listar los archivos" });
  }
});

// POST /api/minio/upload
// body: { filename: string, content: base64-string }
router.post("/upload", async (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!filename || !content) return res.status(400).json({ error: "Falta filename o content" });

    const buffer = Buffer.from(content, "base64");
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: buffer,
      })
    );

    res.json({ message: `Archivo '${filename}' subido con éxito.` });
  } catch (err) {
    console.error("MinIO upload error:", err);
    res.status(500).json({ error: "No se pudo subir el archivo" });
  }
});

// GET /api/minio/download?key=...
router.get("/download", async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ error: "Missing key" });

    const data = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const buffer = await streamToBuffer(data.Body);
    res.setHeader("Content-Disposition", `attachment; filename=\"${key}\"`);
    res.send(buffer);
  } catch (err) {
    console.error("MinIO download error:", err);
    res.status(500).json({ error: "No se pudo descargar el archivo" });
  }
});

// DELETE /api/minio/delete
// body: { key: string }
router.delete("/delete", async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: "Missing key" });

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    res.json({ message: `Archivo '${key}' eliminado con éxito.` });
  } catch (err) {
    console.error("MinIO delete error:", err);
    res.status(500).json({ error: "No se pudo eliminar el archivo" });
  }
});

// POST /api/minio/sign
// body: { url: string, method?: string }
router.post("/sign", async (req, res) => {
  try {
    const { url, method = "GET" } = req.body;
    if (!url) return res.status(400).json({ error: "Missing 'url'" });

    const signer = new SignatureV4({
      credentials: { accessKeyId, secretAccessKey },
      region,
      service: "s3",
      sha256: Sha256,
    });

    const parsed = new URL(url);
    const request = new HttpRequest({
      method,
      hostname: parsed.hostname,
      path: parsed.pathname,
      headers: {},
    });

    const signed = await signer.sign(request);
    return res.json(signed.headers);
  } catch (err) {
    console.error("MinIO sign error:", err);
    res.status(500).json({ error: "No se pudo firmar la solicitud" });
  }
});

module.exports = router;
