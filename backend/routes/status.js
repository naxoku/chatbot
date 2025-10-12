const express = require("express");
const router = express.Router();
const db = require("../db");
const si = require("systeminformation");
const axios = require("axios");

const N8N_WEBHOOK_URL_STATUS = "https://skynet.uct.cl/webhook/health-status";

router.get("/status", async (req, res) => {
  let overallStatus = "online";
  const checks = {};

  // Verificar la conexión a la base de datos
  const dbStartTime = process.hrtime.bigint();
  try {
    await db.query("SELECT 1");
    const dbEndTime = process.hrtime.bigint();
    checks.database = {
      status: "online",
      responseTime: `${Number(dbEndTime - dbStartTime) / 1_000_000}ms`,
    };
  } catch (error) {
    console.error("Database check failed:", error);
    overallStatus = "offline";
    checks.database = {
      status: "offline",
      error: error.message,
    };
  }

  // Verificar la conexión al webhook de n8n
  const n8nStartTime = process.hrtime.bigint();
  try {
    const n8nResponse = await axios.get(N8N_WEBHOOK_URL_STATUS, {
      timeout: 30000,
    });
    const n8nEndTime = process.hrtime.bigint();

    if (
      n8nResponse.status === 200 &&
      n8nResponse.data &&
      n8nResponse.data[0] &&
      n8nResponse.data[0].status === "ok"
    ) {
      checks.n8n = {
        status: "online",
        responseTime: `${Number(n8nEndTime - n8nStartTime) / 1_000_000}ms`,
      };
    } else {
      overallStatus = overallStatus === "online" ? "degraded" : overallStatus;
      checks.n8n = {
        status: "degraded",
        message:
          "n8n respondió, pero no con el estado 'ok' ni con la estructura de datos.",
        statusCode: n8nResponse.status,
        responseData: n8nResponse.data,
      };
    }
  } catch (error) {
    console.error("Check a n8n webhook ha fallado:", error.message);
    overallStatus = "offline";
    checks.n8n = {
      status: "offline",
      error: error.message,
    };
  }

  // Monitoreo de recursos del sistema
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    checks.system = {
      cpuUsage: `${cpu.currentLoad.toFixed(2)}%`,
      memoryUsage: `${(mem.used / 1024 / 1024).toFixed(2)}MB / ${(
        mem.total /
        1024 /
        1024 /
        1024
      ).toFixed(2)}GB`,
    };
    // Si el uso de CPU es alto, considerar el estado como degradado
    if (cpu.currentLoad > 80 && overallStatus === "online") {
      overallStatus = "degraded";
    }
  } catch (error) {
    console.error("System information check failed:", error);
    overallStatus = overallStatus === "online" ? "degraded" : overallStatus;
    checks.system = {
      status: "unavailable",
      error: error.message,
    };
  }

  res.status(overallStatus === "online" ? 200 : 503).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    ...checks,
  });
});

module.exports = router;
