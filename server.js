// server.js
"use strict";

/**
* - Express + Mongoose server
* - Uses Azure/App Service env vars (process.env.*)
* - Loads .env only for local dev
* - Connects to DB before listening
* - Clean routing: /api/* for API, SPA fallback for everything else
*/

// Loads vars from .env in local dev only
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();

// *** Server configuration ***
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

// Database configuration for Azure Cosmos DB / MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

// Timeout for initial DB connection
const DB_TIMEOUT_MS = Number(process.env.DB_TIMEOUT_MS) || 10000;

// *** Logging helper functions for troubleshooting ***
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

//  *** Middleware ***
// Allows CORS for API access from Angular
app.use(cors());

// Parses JSON bodies with 1mb limit
app.use(express.json({ limit: "1mb" }));

// Disables the X-Powered-By header for security
app.disable("x-powered-by");

// *** Health check ***
// Used by Azure to montior server health and connection state
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        uptimeSec: Math.floor(process.uptime()),
        dbReadyState: mongoose.connection.readyState, // 0=disconnected 1=connected 2=connecting 3=disconnecting
    });
});

//  *** API Routes ***
app.use("/api/animals", require("./routes/animals"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/admin", require("./routes/admin"));

// *** Angular SPA Hosting ***
const angularDistPath = path.join(__dirname, "public", "browser");
const indexHtml = path.join(angularDistPath, "index.html");

if (fs.existsSync(indexHtml)) {
    app.use(express.static(angularDistPath));

    // SPA fallback: send index.html for all non-API routes
    app.get(/^\/(?!api).*/, (req, res) => {
        res.sendFile(indexHtml);
    });

    // Log that Angular UI is being served
    logInfo("Angular UI detected and will be served.", { angularDistPath });
} else {
    logWarn("Angular UI not built. Run: npm run build:ui", { expected: indexHtml });
}

// *** API 404 handler ***
app.use("/api", (req, res) => {
    res.status(404).json({ error: "Not Found" });
});

// Global error handler 
app.use((err, req, res, next) => {
    logError("Unhandled error", { message: err.message, stack: err.stack });
    res.status(500).json({ error: "Internal Server Error" });
});

// *** DB Connection ***
// Validates that a required env var is set
function requireEnv(name, value) {
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
}

// Connects to MongoDB/Cosmos DB
async function connectDb() {
    requireEnv("MONGODB_URI", MONGODB_URI);
    requireEnv("DB_NAME", DB_NAME);

    // Mongoose connection
    await mongoose.connect(MONGODB_URI, {
        dbName: DB_NAME,
        serverSelectionTimeoutMS: DB_TIMEOUT_MS,
    });
    // Log successful connection
    logInfo("✅ Connected to Mongo/Cosmos DB", { dbName: DB_NAME });
}

// *** Start the server ***
// Starts the Express server after connecting to the DB
async function start() {
    try {
        logInfo("Starting server...", { node: process.version, env: process.env.NODE_ENV || "undefined" });

        await connectDb();

        // Start listening for requests
        app.listen(PORT, HOST, () => {
            logInfo(`🚀 Listening on http://${HOST}:${PORT}`, { PORT });
        });
    } catch (err) {
        logError("❌ Startup failed", { message: err.message });
        process.exit(1);
    }
}

// *** shutdown ***
// Cleans up resources on shutdown
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

// Handle termination signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Start the app
start();
