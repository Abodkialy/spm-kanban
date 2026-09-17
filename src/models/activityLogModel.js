function createActivityLogModel(db) {
  const listByTaskStmt = db.prepare(
    `SELECT id, task_id, from_status, to_status, changed_at
     FROM activity_logs
     WHERE task_id = ?
     ORDER BY changed_at ASC, id ASC`
  );
  const listByProjectStmt = db.prepare(
    `SELECT l.id, l.task_id, l.from_status, l.to_status, l.changed_at, t.title AS task_title
     FROM activity_logs l
     INNER JOIN tasks t ON t.id = l.task_id
     WHERE t.project_id = ?
     ORDER BY l.changed_at ASC, l.id ASC`
  );

  return {
    listByTask(taskId) {
      return listByTaskStmt.all(taskId);
    },
    listByProject(projectId) {
      return listByProjectStmt.all(projectId);
    },
  };
}

module.exports = { createActivityLogModel };
