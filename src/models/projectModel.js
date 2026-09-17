function createProjectModel(db) {
  const insertStmt = db.prepare(
    `INSERT INTO projects (name, description, start_date, expected_end_date)
     VALUES (?, ?, ?, ?)`
  );
  const listStmt = db.prepare(
    `SELECT id, name, description, start_date, expected_end_date, created_at
     FROM projects
     ORDER BY id DESC`
  );
  const getStmt = db.prepare(
    `SELECT id, name, description, start_date, expected_end_date, created_at
     FROM projects
     WHERE id = ?`
  );
  const updateStmt = db.prepare(
    `UPDATE projects
     SET name = ?, description = ?, start_date = ?, expected_end_date = ?
     WHERE id = ?`
  );
  const deleteStmt = db.prepare(`DELETE FROM projects WHERE id = ?`);

  function validate(data) {
    const name = String(data.name || "").trim();
    const description = String(data.description || "").trim();
    const startDate = String(data.start_date || "").trim();
    const expectedEndDate = String(data.expected_end_date || "").trim();

    if (!name) {
      return { error: "Project name is required." };
    }
    if (!startDate || !expectedEndDate) {
      return { error: "Start date and expected end date are required." };
    }
    if (Number.isNaN(Date.parse(startDate)) || Number.isNaN(Date.parse(expectedEndDate))) {
      return { error: "Project dates must be valid." };
    }
    if (expectedEndDate < startDate) {
      return { error: "Expected end date cannot be earlier than the start date." };
    }

    return { value: { name, description, startDate, expectedEndDate } };
  }

  return {
    list() {
      return listStmt.all();
    },
    getById(id) {
      return getStmt.get(id) || null;
    },
    create(data) {
      const result = validate(data);
      if (result.error) {
        return result;
      }
      const info = insertStmt.run(
        result.value.name,
        result.value.description,
        result.value.startDate,
        result.value.expectedEndDate
      );
      return { value: this.getById(info.lastInsertRowid) };
    },
    update(id, data) {
      if (!this.getById(id)) {
        return { error: "Project not found.", status: 404 };
      }
      const result = validate(data);
      if (result.error) {
        return result;
      }
      updateStmt.run(
        result.value.name,
        result.value.description,
        result.value.startDate,
        result.value.expectedEndDate,
        id
      );
      return { value: this.getById(id) };
    },
    remove(id) {
      const existing = this.getById(id);
      if (!existing) {
        return { error: "Project not found.", status: 404 };
      }
      deleteStmt.run(id);
      return { value: existing };
    },
  };
}

module.exports = { createProjectModel };
