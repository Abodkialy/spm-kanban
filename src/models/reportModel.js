function createReportModel(db) {
  const totalsStmt = db.prepare(
    `SELECT
       COUNT(*) AS total_tasks,
       SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed_tasks
     FROM tasks
     WHERE project_id = ?`
  );
  const perMemberStmt = db.prepare(
    `SELECT u.id AS user_id, u.name AS user_name,
            COUNT(t.id) AS completed_tasks
     FROM users u
     INNER JOIN task_assignments a ON a.user_id = u.id
     INNER JOIN tasks t ON t.id = a.task_id
     WHERE t.project_id = ? AND t.status = 'done'
     GROUP BY u.id, u.name
     ORDER BY u.name COLLATE NOCASE`
  );

  return {
    getProjectReport(projectId) {
      const totals = totalsStmt.get(projectId);
      const totalTasks = Number(totals.total_tasks || 0);
      const completedTasks = Number(totals.completed_tasks || 0);
      const completionRate = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

      return {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        completion_rate: completionRate,
        completed_tasks_per_member: perMemberStmt.all(projectId),
      };
    },
  };
}

module.exports = { createReportModel };
