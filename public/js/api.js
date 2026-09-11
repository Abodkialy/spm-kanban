async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

function showError(element, message) {
  if (!element) {
    return;
  }
  element.hidden = !message;
  element.textContent = message || "";
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}
