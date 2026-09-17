const PRIORITIES = ["high", "medium", "low"];
const STATUSES = ["new", "in_progress", "done"];

function createTaskModel(db) {
  const insertStmt = db.prepare(
    `INSERT INTO tasks (project_id, parent_id, title, description, priority, status)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const listByProjectStmt = db.prepare(
    `SELECT id, project_id, parent_id, title, description, priority, status, created_at
     FROM tasks
     WHERE project_id = ?
     ORDER BY
       CASE WHEN parent_id IS NULL THEN id ELSE parent_id END,
       CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
       id`
  );
  const getStmt = db.prepare(
    `SELECT id, project_id, parent_id, title, description, priority, status, created_at
     FROM tasks
     WHERE id = ?`
  );
  const updateStmt = db.prepare(
    `UPDATE tasks
     SET title = ?, description = ?, priority = ?, status = ?, parent_id = ?
     WHERE id = ?`
  );
  const deleteStmt = db.prepare(`DELETE FROM tasks WHERE id = ?`);
  const childrenStmt = db.prepare(`SELECT id FROM tasks WHERE parent_id = ?`);
  const insertLogStmt = db.prepare(
    `INSERT INTO activity_logs (task_id, from_status, to_status) VALUES (?, ?, ?)`
  );

  function validate(data, projectId, existing) {
    const title = String(data.title || "").trim();
    const description = String(data.description || "").trim();
    const priority = String(data.priority || "").trim().toLowerCase();
    const status = String(data.status || existing?.status || "new").trim().toLowerCase();
    let parentId = data.parent_id === "" || data.parent_id === undefined || data.parent_id === null
      ? null
      : Number(data.parent_id);

    if (!title) {
      return { error: "Task title is required." };
    }
    if (!PRIORITIES.includes(priority)) {
      return { error: "Priority must be high, medium, or low." };
    }
    if (!STATUSES.includes(status)) {
      return { error: "Status must be new, in_progress, or done." };
    }
    if (parentId !== null) {
      if (!Number.isInteger(parentId)) {
        return { error: "Parent task is invalid." };
      }
      const parent = getStmt.get(parentId);
      if (!parent || parent.project_id !== Number(projectId)) {
        return { error: "Parent task must belong to the same project." };
      }
      if (existing && parentId === Number(existing.id)) {
        return { error: "A task cannot be a parent of itself." };
      }
      if (parent.parent_id !== null) {
        return { error: "A subtask cannot be used as a parent task." };
      }
      if (existing) {
        const children = childrenStmt.all(existing.id);
        if (children.length > 0) {
          return { error: "A parent task with subtasks cannot become a subtask." };
        }
      }
    }

    return { value: { title, description, priority, status, parentId } };
  }

  return {
    priorities: PRIORITIES,
    statuses: STATUSES,
    listByProject(projectId) {
      return listByProjectStmt.all(projectId);
    },
    getById(id) {
      return getStmt.get(id) || null;
    },
    create(projectId, data) {
      const result = validate(data, projectId, null);
      if (result.error) {
        return result;
      }
      const info = insertStmt.run(
        projectId,
        result.value.parentId,
        result.value.title,
        result.value.description,
        result.value.priority,
        result.value.status
      );
      insertLogStmt.run(info.lastInsertRowid, null, result.value.status);
      return { value: this.getById(info.lastInsertRowid) };
    },
    update(id, data) {
      const existing = this.getById(id);
      if (!existing) {
        return { error: "Task not found.", status: 404 };
      }
      const result = validate(data, existing.project_id, existing);
      if (result.error) {
        return result;
      }
      if (result.value.status !== existing.status) {
        insertLogStmt.run(id, existing.status, result.value.status);
      }
      updateStmt.run(
        result.value.title,
        result.value.description,
        result.value.priority,
        result.value.status,
        result.value.parentId,
        id
      );
      return { value: this.getById(id) };
    },
    remove(id) {
      const existing = this.getById(id);
      if (!existing) {
        return { error: "Task not found.", status: 404 };
      }
      deleteStmt.run(id);
      return { value: existing };
    },
  };
}

module.exports = { createTaskModel, PRIORITIES, STATUSES };
