const http = require("http");
const fs = require("fs");
const path = require("path");
const { createDatabase } = require("./db/database");
const { createProjectModel } = require("./models/projectModel");
const { createUserModel } = require("./models/userModel");
const { createTaskModel } = require("./models/taskModel");
const { createAssignmentModel } = require("./models/assignmentModel");
const { createActivityLogModel } = require("./models/activityLogModel");
const { createReportModel } = require("./models/reportModel");
const { createProjectController } = require("./controllers/projectController");
const { createUserController } = require("./controllers/userController");
const { createTaskController } = require("./controllers/taskController");
const { sendJson, matchRoute } = require("./http/utils");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "..", "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

function createApp() {
  const db = createDatabase();
  const projectModel = createProjectModel(db);
  const userModel = createUserModel(db);
  const taskModel = createTaskModel(db);
  const assignmentModel = createAssignmentModel(db);
  const activityLogModel = createActivityLogModel(db);
  const reportModel = createReportModel(db);

  const projects = createProjectController(projectModel);
  const users = createUserController(userModel);
  const tasks = createTaskController(projectModel, taskModel);

  const routes = [
    { method: "GET", pattern: /^\/api\/projects$/, handler: (req, res) => projects.list(req, res) },
    { method: "POST", pattern: /^\/api\/projects$/, handler: (req, res) => projects.create(req, res) },
    { method: "GET", pattern: /^\/api\/projects\/(\d+)$/, handler: (req, res, id) => projects.get(req, res, id) },
    { method: "PUT", pattern: /^\/api\/projects\/(\d+)$/, handler: (req, res, id) => projects.update(req, res, id) },
    { method: "DELETE", pattern: /^\/api\/projects\/(\d+)$/, handler: (req, res, id) => projects.remove(req, res, id) },
    { method: "GET", pattern: /^\/api\/projects\/(\d+)\/tasks$/, handler: (req, res, id) => tasks.list(req, res, id) },
    { method: "POST", pattern: /^\/api\/projects\/(\d+)\/tasks$/, handler: (req, res, id) => tasks.create(req, res, id) },
    { method: "PUT", pattern: /^\/api\/tasks\/(\d+)$/, handler: (req, res, id) => tasks.update(req, res, id) },
    { method: "DELETE", pattern: /^\/api\/tasks\/(\d+)$/, handler: (req, res, id) => tasks.remove(req, res, id) },
    { method: "GET", pattern: /^\/api\/users$/, handler: (req, res) => users.list(req, res) },
    { method: "POST", pattern: /^\/api\/users$/, handler: (req, res) => users.create(req, res) },
    { method: "DELETE", pattern: /^\/api\/users\/(\d+)$/, handler: (req, res, id) => users.remove(req, res, id) },
    {
      method: "GET",
      pattern: /^\/api\/projects\/(\d+)\/report$/,
      handler: (req, res, id) => {
        if (!projectModel.getById(Number(id))) {
          sendJson(res, 404, { error: "Project not found." });
          return;
        }
        sendJson(res, 200, { report: reportModel.getProjectReport(Number(id)) });
      },
    },
    {
      method: "GET",
      pattern: /^\/api\/tasks\/(\d+)\/assignments$/,
      handler: (req, res, id) => {
        if (!taskModel.getById(Number(id))) {
          sendJson(res, 404, { error: "Task not found." });
          return;
        }
        sendJson(res, 200, { assignments: assignmentModel.listByTask(Number(id)) });
      },
    },
    {
      method: "GET",
      pattern: /^\/api\/projects\/(\d+)\/activity-logs$/,
      handler: (req, res, id) => {
        if (!projectModel.getById(Number(id))) {
          sendJson(res, 404, { error: "Project not found." });
          return;
        }
        sendJson(res, 200, { activity_logs: activityLogModel.listByProject(Number(id)) });
      },
    },
  ];

  function serveStatic(urlPath, res) {
    const relativePath = urlPath === "/" ? "/index.html" : urlPath;
    const filePath = path.normalize(path.join(publicDir, relativePath));
    if (!filePath.startsWith(publicDir)) {
      sendJson(res, 403, { error: "Forbidden." });
      return;
    }
    fs.readFile(filePath, (error, content) => {
      if (error) {
        sendJson(res, 404, { error: "Page not found." });
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(content);
    });
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const matched = matchRoute(req.method, url.pathname, routes);
    if (matched) {
      Promise.resolve(matched.handler(req, res, ...matched.params)).catch(() => {
        sendJson(res, 500, { error: "Unexpected server error." });
      });
      return;
    }
    if (req.method === "GET" && !url.pathname.startsWith("/api/")) {
      serveStatic(url.pathname, res);
      return;
    }
    sendJson(res, 404, { error: "Route not found." });
  });

  return server;
}

if (require.main === module) {
  const server = createApp();
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = { createApp };
