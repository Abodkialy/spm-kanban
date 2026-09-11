const listEl = document.getElementById("member-list");
const form = document.getElementById("member-form");
const errorEl = document.getElementById("member-error");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderMembers(users) {
  if (!users.length) {
    listEl.innerHTML = '<li class="empty">No team members yet.</li>';
    return;
  }
  listEl.innerHTML = users
    .map(
      (user) => `
        <li>
          <span>${escapeHtml(user.name)}</span>
          <button class="danger" data-delete="${user.id}">Delete</button>
        </li>`
    )
    .join("");
}

async function loadMembers() {
  const data = await request("/api/users");
  renderMembers(data.users);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError(errorEl, "");
  try {
    await request("/api/users", {
      method: "POST",
      body: JSON.stringify(formData(form)),
    });
    form.reset();
    await loadMembers();
  } catch (error) {
    showError(errorEl, error.message);
  }
});

listEl.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) {
    return;
  }
  await request(`/api/users/${button.dataset.delete}`, { method: "DELETE" });
  await loadMembers();
});

loadMembers().catch((error) => showError(errorEl, error.message));
