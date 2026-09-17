const { readBody, sendJson, sendError } = require("../http/utils");

function createTaskController(projectModel, taskModel) {
  return {
    async list(_req, res, projectId) {
      const project = projectModel.getById(Number(projectId));
      if (!project) {
        sendJson(res, 404, { error: "Project not found." });
        return;
      }
      sendJson(res, 200, { tasks: taskModel.listByProject(Number(projectId)) });
    },
    async create(req, res, projectId) {
      const project = projectModel.getById(Number(projectId));
      if (!project) {
        sendJson(res, 404, { error: "Project not found." });
        return;
      }
      try {
        const body = await readBody(req);
        const result = taskModel.create(Number(projectId), body);
        if (result.error) {
          sendError(res, result);
          return;
        }
        sendJson(res, 201, { task: result.value });
      } catch (error) {
        sendError(res, error, 400);
      }
    },
    async update(req, res, id) {
      try {
        const body = await readBody(req);
        const result = taskModel.update(Number(id), body);
        if (result.error) {
          sendError(res, result);
          return;
        }
        sendJson(res, 200, { task: result.value });
      } catch (error) {
        sendError(res, error, 400);
      }
    },
    async remove(_req, res, id) {
      const result = taskModel.remove(Number(id));
      if (result.error) {
        sendError(res, result);
        return;
      }
      sendJson(res, 200, { task: result.value });
    },
  };
}

module.exports = { createTaskController };
