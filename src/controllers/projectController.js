const { readBody, sendJson, sendError } = require("../http/utils");

function createProjectController(projectModel) {
  return {
    async list(_req, res) {
      sendJson(res, 200, { projects: projectModel.list() });
    },
    async get(_req, res, id) {
      const project = projectModel.getById(Number(id));
      if (!project) {
        sendJson(res, 404, { error: "Project not found." });
        return;
      }
      sendJson(res, 200, { project });
    },
    async create(req, res) {
      try {
        const body = await readBody(req);
        const result = projectModel.create(body);
        if (result.error) {
          sendError(res, result);
          return;
        }
        sendJson(res, 201, { project: result.value });
      } catch (error) {
        sendError(res, error, 400);
      }
    },
    async update(req, res, id) {
      try {
        const body = await readBody(req);
        const result = projectModel.update(Number(id), body);
        if (result.error) {
          sendError(res, result);
          return;
        }
        sendJson(res, 200, { project: result.value });
      } catch (error) {
        sendError(res, error, 400);
      }
    },
    async remove(_req, res, id) {
      const result = projectModel.remove(Number(id));
      if (result.error) {
        sendError(res, result);
        return;
      }
      sendJson(res, 200, { project: result.value });
    },
  };
}

module.exports = { createProjectController };
