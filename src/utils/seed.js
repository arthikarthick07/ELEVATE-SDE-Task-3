const Admin = require("../models/Admin");

/**
 * Seed a default admin in development only, when SEED_ADMIN=1.
 * If an admin with the configured username already exists, nothing happens.
 */
function seedAdmin() {
  const seedFlag = (process.env.SEED_ADMIN || "0").toString();
  if (seedFlag !== "1") {
    console.log("[seed] SEED_ADMIN is not 1 — skipping admin seeding.");
    return;
  }

  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

  const existing = Admin.findByUsername(username);
  if (existing) {
    console.log(`[seed] Admin '${username}' already exists — skipping seed.`);
    return;
  }

  Admin.create({ username, password });
  console.log(
    `[seed] Seeded default admin '${username}'. Change the password immediately in production.`
  );
}

module.exports = { seedAdmin };
