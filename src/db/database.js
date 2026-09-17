const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dataDir = path.join(__dirname, "..", "..", "data");
const schemaPath = path.join(__dirname, "schema.sql");

function createDatabase() {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "app.db"));
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(fs.readFileSync(schemaPath, "utf8"));
  return db;
}

module.exports = { createDatabase };
