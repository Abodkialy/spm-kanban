function createAssignmentModel(db) {
  const insertStmt = db.prepare(
    `INSERT INTO task_assignments (task_id, user_id) VALUES (?, ?)`
  );
  const listByTaskStmt = db.prepare(
    `SELECT a.id, a.task_id, a.user_id, a.assigned_at, u.name AS user_name
     FROM task_assignments a
     INNER JOIN users u ON u.id = a.user_id
     WHERE a.task_id = ?
     ORDER BY u.name COLLATE NOCASE`
  );
  const deleteStmt = db.prepare(
    `DELETE FROM task_assignments WHERE task_id = ? AND user_id = ?`
  );

  return {
    listByTask(taskId) {
      return listByTaskStmt.all(taskId);
    },
    assign(taskId, userId) {
      try {
        insertStmt.run(taskId, userId);
      } catch (error) {
        return { error: "Could not assign this member to the task." };
      }
      return { value: this.listByTask(taskId) };
    },
    unassign(taskId, userId) {
      deleteStmt.run(taskId, userId);
      return { value: this.listByTask(taskId) };
    },
  };
}

module.exports = { createAssignmentModel };
