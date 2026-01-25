// server.js
"use strict";

/**
 * Production-friendly Express + Mongoose server
 * - Uses Azure/App Service env vars (process.env.*)
 * - Loads .env only for local dev
 * - Connects to DB before listening
 * - Clean routing: /api/* for API, SPA fallback for everything else
 */

if (process.env.NODE_ENV !== "production") {
  // Local development only
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();

// ---- Config ----
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

// These must exist in Azure App Settings (Environment variables)
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

// Optional tuning
const DB_TIMEOUT_MS = Number(process.env.DB_TIMEOUT_MS) || 10000;

// ---- Basic logging helper ----
function logInfo(msg, meta) {
  if (meta) console.log(`[INFO] ${msg}`, meta);
  else console.log(`[INFO] ${msg}`);
}
function logWarn(msg, meta) {
  if (meta) console.warn(`[WARN] ${msg}`, meta);
  else console.warn(`[WARN] ${msg}`);
}
function logError(msg, meta) {
  if (meta) console.error(`[ERROR] ${msg}`, meta);
  else console.error(`[ERROR] ${msg}`);
}

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: "1mb" })); // avoid huge payloads accidentally

// Helpful header
app.disable("x-powered-by");

// ---- Health checks ----
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptimeSec: Math.floor(process.uptime()),
    dbReadyState: mongoose.connection.readyState, // 0=disconnected 1=connected 2=connecting 3=disconnecting
  });
});

// ---- API Routes ----
app.use("/api/animals", require("./routes/animals"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/admin", require("./routes/admin"));

// ---- Serve Angular build (Angular 17+ outputs to /browser) ----
const angularDistPath = path.join(__dirname, "public", "browser");
const indexHtml = path.join(angularDistPath, "index.html");

if (fs.existsSync(indexHtml)) {
  app.use(express.static(angularDistPath));

  // SPA fallback: send index.html for all non-API routes
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(indexHtml);
  });

  logInfo("Angular UI detected and will be served.", { angularDistPath });
} else {
  logWarn("Angular UI not built. Run: npm run build:ui", { expected: indexHtml });
}

// ---- 404 for API (after routes) ----
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ---- Global error handler ----
app.use((err, req, res, next) => {
  logError("Unhandled error", { message: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal Server Error" });
});

// ---- DB + Server startup ----
function requireEnv(name, value) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
}

async function connectDb() {
  requireEnv("MONGODB_URI", MONGODB_URI);
  requireEnv("DB_NAME", DB_NAME);

  // Mongoose 6/7: useNewUrlParser/useUnifiedTopology are defaults now
  await mongoose.connect(MONGODB_URI, {
    dbName: DB_NAME,
    serverSelectionTimeoutMS: DB_TIMEOUT_MS,
  });

  logInfo("✅ Connected to Mongo/Cosmos DB", { dbName: DB_NAME });
}

async function start() {
  try {
    logInfo("Starting server...", { node: process.version, env: process.env.NODE_ENV || "undefined" });

    await connectDb();

    app.listen(PORT, HOST, () => {
      logInfo(`🚀 Listening on http://${HOST}:${PORT}`, { PORT });
    });
  } catch (err) {
    logError("❌ Startup failed", { message: err.message });
    process.exit(1);
  }
}

// ---- Graceful shutdown (Azure redeploys/restarts) ----
function shutdown(signal) {
  logWarn(`Received ${signal}. Shutting down...`);
  mongoose
    .disconnect()
    .then(() => {
      logInfo("Mongo disconnected. Exiting.");
      process.exit(0);
    })
    .catch((err) => {
      logError("Error during Mongo disconnect", { message: err.message });
      process.exit(1);
    });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Start the app
start();
