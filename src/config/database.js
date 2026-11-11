const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

let db = null;
let SQL = null;

const DB_PATH = path.resolve(
  process.env.DB_PATH || path.join(process.cwd(), "data", "credvault.db")
);

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male','Female','Other')),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  rejection_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_applications_application_id ON applications(application_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certificate_id TEXT NOT NULL UNIQUE,
  application_id TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'Valid' CHECK (status IN ('Valid','Revoked')),
  revoked_at TEXT,
  revocation_reason TEXT,
  FOREIGN KEY (application_id) REFERENCES applications(application_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_application_id ON certificates(application_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
`;

function persist() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
}

async function initDatabase() {
  if (db) return db;

  SQL = await initSqlJs();

  let fileBuffer = null;
  if (fs.existsSync(DB_PATH)) {
    fileBuffer = fs.readFileSync(DB_PATH);
  }
  db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();

  db.run(SCHEMA_SQL);
  persist();
  return db;
}

function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

function run(sql, params = []) {
  const database = getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  persist();
}

function all(sql, params = []) {
  const database = getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const rows = all(sql, params);
  return rows.length ? rows[0] : null;
}

module.exports = {
  initDatabase,
  getDb,
  run,
  all,
  get,
  persist,
  DB_PATH,
};
