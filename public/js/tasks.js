const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");
const errorEl = document.getElementById("task-error");
const form = document.getElementById("task-form");
const listEl = document.getElementById("task-list");
const parentSelect = form.querySelector('[name="parent_id"]');

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function groupTasks(tasks) {
  const parents = tasks.filter((task) => task.parent_id === null);
  const children = tasks.filter((task) => task.parent_id !== null);
  return parents.map((parent) => ({
    ...parent,
    subtasks: children.filter((child) => Number(child.parent_id) === Number(parent.id)),
  }));
}

function taskCard(task, isSubtask) {
  return `
    <article class="item ${isSubtask ? "subtask" : ""}">
      <div class="item-head">
        <strong>${escapeHtml(task.title)}</strong>
        <button class="danger" data-delete="${task.id}">Delete</button>
      </div>
      <div>
        <span class="badge">${escapeHtml(task.priority)}</span>
        <span class="badge">${escapeHtml(task.status.replaceAll("_", " "))}</span>
        <span class="badge">${isSubtask ? "subtask" : "parent task"}</span>
      </div>
      <p>${escapeHtml(task.description || "")}</p>
    </article>`;
}

function renderTasks(tasks) {
  const grouped = groupTasks(tasks);
  const orphanSubtasks = tasks.filter(
    (task) => task.parent_id !== null && !tasks.some((parent) => Number(parent.id) === Number(task.parent_id))
  );
  if (!tasks.length) {
    listEl.innerHTML = '<p class="empty">No tasks yet.</p>';
    return;
  }
  listEl.innerHTML =
    grouped
      .map(
        (parent) =>
          taskCard(parent, false) + parent.subtasks.map((child) => taskCard(child, true)).join("")
      )
      .join("") + orphanSubtasks.map((task) => taskCard(task, true)).join("");

  const current = parentSelect.value;
  parentSelect.innerHTML =
    '<option value="">None (main task)</option>' +
    grouped
      .map((parent) => `<option value="${parent.id}">${escapeHtml(parent.title)}</option>`)
      .join("");
  parentSelect.value = current;
}

async function loadProject() {
  const data = await request(`/api/projects/${projectId}`);
  document.getElementById("project-title").textContent = data.project.name;
  document.getElementById("project-meta").textContent =
    `${data.project.start_date} to ${data.project.expected_end_date}`;
  document.getElementById("project-description").textContent = data.project.description || "";
}

async function loadTasks() {
  const data = await request(`/api/projects/${projectId}/tasks`);
  renderTasks(data.tasks);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError(errorEl, "");
  try {
    const payload = formData(form);
    if (!payload.parent_id) {
      payload.parent_id = null;
    }
    await request(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    form.reset();
    form.querySelector('[name="priority"]').value = "medium";
    await loadTasks();
  } catch (error) {
    showError(errorEl, error.message);
  }
});

listEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) {
    return;
  }
  await request(`/api/tasks/${button.dataset.delete}`, { method: "DELETE" });
  await loadTasks();
});

if (!projectId) {
  showError(errorEl, "Missing project id.");
} else {
  Promise.all([loadProject(), loadTasks()]).catch((error) => showError(errorEl, error.message));
}
