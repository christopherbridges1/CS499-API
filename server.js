// server.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const cors = require("cors");
app.use(cors());
app.use(express.json());

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!uri) throw new Error("Missing MONGODB_URI in .env");
  if (!dbName) throw new Error("Missing DB_NAME in .env");

  await mongoose.connect(uri, {
    dbName,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`✅ Connected to Mongo/Cosmos DB: ${dbName}`);
}

//  API routes 
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TEMP: DB test route 
app.use("/api/animals", require("./routes/animals"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/admin", require("./routes/admin"));

// Serve Angular build (Angular 17+ outputs to /browser)
const fs = require("fs");

const angularDistPath = path.join(__dirname, "public", "browser");
const indexHtml = path.join(angularDistPath, "index.html");

if (fs.existsSync(indexHtml)) {
  app.use(express.static(angularDistPath));

  // SPA fallback (exclude /api)
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(indexHtml);
  });
} else {
  console.warn("⚠️ Angular UI not built yet. Run: npm run build:ui");
}
// Starts the server ONLY after DB connects
connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });