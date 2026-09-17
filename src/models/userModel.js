function createUserModel(db) {
  const insertStmt = db.prepare(`INSERT INTO users (name) VALUES (?)`);
  const listStmt = db.prepare(
    `SELECT id, name, created_at FROM users ORDER BY name COLLATE NOCASE`
  );
  const getStmt = db.prepare(`SELECT id, name, created_at FROM users WHERE id = ?`);
  const deleteStmt = db.prepare(`DELETE FROM users WHERE id = ?`);

  return {
    list() {
      return listStmt.all();
    },
    getById(id) {
      return getStmt.get(id) || null;
    },
    create(data) {
      const name = String(data.name || "").trim();
      if (!name) {
        return { error: "Member name is required." };
      }
      const info = insertStmt.run(name);
      return { value: this.getById(info.lastInsertRowid) };
    },
    remove(id) {
      const existing = this.getById(id);
      if (!existing) {
        return { error: "Member not found.", status: 404 };
      }
      deleteStmt.run(id);
      return { value: existing };
    },
  };
}

module.exports = { createUserModel };
