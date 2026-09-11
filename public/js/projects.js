const listEl = document.getElementById("project-list");
const form = document.getElementById("project-form");
const errorEl = document.getElementById("project-error");

function renderProjects(projects) {
  if (!projects.length) {
    listEl.innerHTML = '<p class="empty">No projects yet.</p>';
    return;
  }
  listEl.innerHTML = projects
    .map(
      (project) => `
        <article class="item">
          <div class="item-head">
            <strong><a href="/project.html?id=${project.id}">${escapeHtml(project.name)}</a></strong>
            <button class="danger" data-delete="${project.id}">Delete</button>
          </div>
          <p class="muted">${escapeHtml(project.start_date)} to ${escapeHtml(project.expected_end_date)}</p>
          <p>${escapeHtml(project.description || "")}</p>
        </article>`
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function loadProjects() {
  const data = await request("/api/projects");
  renderProjects(data.projects);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError(errorEl, "");
  try {
    await request("/api/projects", {
      method: "POST",
      body: JSON.stringify(formData(form)),
    });
    form.reset();
    await loadProjects();
  } catch (error) {
    showError(errorEl, error.message);
  }
});

listEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) {
    return;
  }
  if (!window.confirm("Delete this project and its tasks?")) {
    return;
  }
  await request(`/api/projects/${button.dataset.delete}`, { method: "DELETE" });
  await loadProjects();
});

loadProjects().catch((error) => showError(errorEl, error.message));
