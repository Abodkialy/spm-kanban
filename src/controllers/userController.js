const { readBody, sendJson, sendError } = require("../http/utils");

function createUserController(userModel) {
  return {
    async list(_req, res) {
      sendJson(res, 200, { users: userModel.list() });
    },
    async create(req, res) {
      try {
        const body = await readBody(req);
        const result = userModel.create(body);
        if (result.error) {
          sendError(res, result);
          return;
        }
        sendJson(res, 201, { user: result.value });
      } catch (error) {
        sendError(res, error, 400);
      }
    },
    async remove(_req, res, id) {
      const result = userModel.remove(Number(id));
      if (result.error) {
        sendError(res, result);
        return;
      }
      sendJson(res, 200, { user: result.value });
    },
  };
}

module.exports = { createUserController };
