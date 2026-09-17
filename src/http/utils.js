function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendError(res, error, fallbackStatus) {
  const status = error.status || fallbackStatus || 400;
  sendJson(res, status, { error: error.error || error.message || "Request failed." });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error("Request body must be valid JSON."), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

function matchRoute(method, urlPath, routes) {
  for (const route of routes) {
    if (route.method !== method) {
      continue;
    }
    const match = urlPath.match(route.pattern);
    if (match) {
      return { handler: route.handler, params: match.slice(1) };
    }
  }
  return null;
}

module.exports = { sendJson, sendError, readBody, matchRoute };
