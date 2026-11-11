require("dotenv").config();

const express = require("express");
const { initDatabase } = require("./config/database");
const { seedAdmin } = require("./utils/seed");
const publicRoutes = require("./routes/publicRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CredVault API",
    time: new Date().toISOString(),
    uptime_seconds: process.uptime(),
  });
});

// Routes
app.use("/api", publicRoutes);
app.use("/api", adminRoutes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

async function start() {
  await initDatabase();
  seedAdmin();

  app.listen(PORT, () => {
    console.log(`CredVault API running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

module.exports = app;
