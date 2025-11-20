/**
 * RUTAS DE DOCUMENTOS
 *
 * Gestiona el acceso y búsqueda de documentos almacenados en la base de datos.
 * Combina documentos de múltiples tablas para una búsqueda unificada.
 */

const express = require("express");
const { db } = require("../db");
const logger = require("../logger");
const router = express.Router();

// Obtener todos los documentos
router.get("/", async (req, res) => {
  try {
    // Consultar documentos de las tres tablas
    const documentosQuery = await db.query("SELECT id, content, metadata FROM documentos");
    const geminiQuery = await db.query("SELECT id, content, metadata FROM documentos_gemini");
    const pruebaQuery = await db.query("SELECT id, content, metadata FROM documentos_prueba");

    // Combinar resultados
    const documents = [
      ...documentosQuery.rows.map(doc => ({
        id: `doc-${doc.id}`,
        title: doc.metadata?.title || `Documento ${doc.id}`,
        description: doc.metadata?.description || doc.content?.substring(0, 100) + '...',
        category: doc.metadata?.category || 'General',
        type: doc.metadata?.type || 'documento',
        url: `/api/documentos/${doc.id}`,
        keywords: doc.metadata?.keywords || [],
        source: 'documentos'
      })),
      ...geminiQuery.rows.map(doc => ({
        id: `gemini-${doc.id}`,
        title: doc.metadata?.title || `Documento Gemini ${doc.id}`,
        description: doc.metadata?.description || doc.content?.substring(0, 100) + '...',
        category: doc.metadata?.category || 'Gemini',
        type: doc.metadata?.type || 'documento',
        url: `/api/documentos/gemini/${doc.id}`,
        keywords: doc.metadata?.keywords || [],
        source: 'documentos_gemini'
      })),
      ...pruebaQuery.rows.map(doc => ({
        id: `prueba-${doc.id}`,
        title: doc.metadata?.title || `Documento Prueba ${doc.id}`,
        description: doc.metadata?.description || doc.content?.substring(0, 100) + '...',
        category: doc.metadata?.category || 'Prueba',
        type: doc.metadata?.type || 'documento',
        url: `/api/documentos/prueba/${doc.id}`,
        keywords: doc.metadata?.keywords || [],
        source: 'documentos_prueba'
      }))
    ];

    res.json(documents);
  } catch (error) {
    logger.error("DOCS", "Error obteniendo documentos:", error.message);
    res.status(500).json({
      message: "Error al obtener los documentos",
      error: error.message
    });
  }
});

// Obtener documento específico
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let query, table;

    if (id.startsWith('doc-')) {
      table = 'documentos';
      query = await db.query("SELECT * FROM documentos WHERE id = $1", [id.replace('doc-', '')]);
    } else if (id.startsWith('gemini-')) {
      table = 'documentos_gemini';
      query = await db.query("SELECT * FROM documentos_gemini WHERE id = $1", [id.replace('gemini-', '')]);
    } else if (id.startsWith('prueba-')) {
      table = 'documentos_prueba';
      query = await db.query("SELECT * FROM documentos_prueba WHERE id = $1", [id.replace('prueba-', '')]);
    } else {
      return res.status(404).json({ message: "Documento no encontrado" });
    }

    if (query.rows.length === 0) {
      return res.status(404).json({ message: "Documento no encontrado" });
    }

    const doc = query.rows[0];
    res.json({
      id: `${table.split('_')[1]}-${doc.id}`,
      content: doc.content,
      metadata: doc.metadata,
      source: table
    });
  } catch (error) {
    logger.error("DOCS", "Error obteniendo documento:", error.message);
    res.status(500).json({
      message: "Error al obtener el documento",
      error: error.message
    });
  }
});

// Agregar documento
router.post("/", async (req, res) => {
  try {
    const { content, metadata, source = 'documentos' } = req.body;
    let table;

    switch (source) {
      case 'documentos':
        table = 'documentos';
        break;
      case 'documentos_gemini':
        table = 'documentos_gemini';
        break;
      case 'documentos_prueba':
        table = 'documentos_prueba';
        break;
      default:
        table = 'documentos';
    }

    const result = await db.query(
      `INSERT INTO ${table} (content, metadata) VALUES ($1, $2) RETURNING id`,
      [content, metadata]
    );

    res.json({
      success: true,
      message: "Documento agregado correctamente",
      id: result.rows[0].id
    });
  } catch (error) {
    logger.error("DOCS", "Error agregando documento:", error.message);
    res.status(500).json({
      message: "Error al agregar el documento",
      error: error.message
    });
  }
});

// Actualizar documento
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content, metadata } = req.body;
    let table, numericId;

    if (id.startsWith('doc-')) {
      table = 'documentos';
      numericId = id.replace('doc-', '');
    } else if (id.startsWith('gemini-')) {
      table = 'documentos_gemini';
      numericId = id.replace('gemini-', '');
    } else if (id.startsWith('prueba-')) {
      table = 'documentos_prueba';
      numericId = id.replace('prueba-', '');
    } else {
      return res.status(400).json({ message: "ID inválido" });
    }

    await db.query(
      `UPDATE ${table} SET content = $1, metadata = $2 WHERE id = $3`,
      [content, metadata, numericId]
    );

    res.json({
      success: true,
      message: "Documento actualizado correctamente"
    });
  } catch (error) {
    logger.error("DOCS", "Error actualizando documento:", error.message);
    res.status(500).json({
      message: "Error al actualizar el documento",
      error: error.message
    });
  }
});

// Eliminar documento
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let table, numericId;

    if (id.startsWith('doc-')) {
      table = 'documentos';
      numericId = id.replace('doc-', '');
    } else if (id.startsWith('gemini-')) {
      table = 'documentos_gemini';
      numericId = id.replace('gemini-', '');
    } else if (id.startsWith('prueba-')) {
      table = 'documentos_prueba';
      numericId = id.replace('prueba-', '');
    } else {
      return res.status(400).json({ message: "ID inválido" });
    }

    await db.query(`DELETE FROM ${table} WHERE id = $1`, [numericId]);

    res.json({
      success: true,
      message: "Documento eliminado correctamente"
    });
  } catch (error) {
    logger.error("DOCS", "Error eliminando documento:", error.message);
    res.status(500).json({
      message: "Error al eliminar el documento",
      error: error.message
    });
  }
});

module.exports = router;
