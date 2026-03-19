/**
 * Configuración del cliente S3 para MinIO.
 * Proporciona cliente S3 y utilidades para operaciones con MinIO.
 */

const { S3Client } = require("@aws-sdk/client-s3");
const { logger } = require("../logger");

// Configuración del cliente S3 para integración con MinIO
const endpoint = process.env.MINIO_ENDPOINT;
const region = process.env.MINIO_DEFAULT_REGION || 'us-east-1';
const accessKeyId = process.env.DEV_ASISTENTEVIRTUAL_MINIO_ACCESS_KEY_ID;
const secretAccessKey = process.env.DEV_ASISTENTEVIRTUAL_MINIO_SECRET_ACCESS_KEY;
const forcePathStyle = (process.env.MINIO_USE_PATH_STYLE_ENDPOINT || 'true').toString().toLowerCase() === 'true';

// Validar configuración
if (!endpoint || !accessKeyId || !secretAccessKey) {
  logger.warn("Configuración de MinIO incompleta. Revisa las variables de entorno.");
}

// Cliente S3 configurado para trabajar con MinIO
const s3 = new S3Client({
  endpoint,
  region,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle, // Necesario para MinIO
});

// Obtiene el nombre del bucket configurado desde variables de entorno
const getBucket = () => {
  return process.env.DEV_ASISTENTEVIRTUAL_MINIO_BUCKET || process.env.MINIO_BUCKET;
};

module.exports = { s3, getBucket };