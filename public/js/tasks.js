const params = new URLSearchParams(window.location.search);

const projectId = params.get("id");

const errorEl = document.getElementById("task-error");

const form = document.getElementById("task-form");

const listEl = document.getElementById("task-list");

const parentSelect =
  form.querySelector('[name="parent_id"]');


function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

}


function groupTasks(tasks) {

  const parents =
    tasks.filter(task => task.parent_id === null);

  const children =
    tasks.filter(task => task.parent_id !== null);

  return parents.map(parent => ({

    ...parent,

    subtasks:
      children.filter(
        child =>
          Number(child.parent_id) === Number(parent.id)
      )

  }));

}


/* =========================
   MEMBERS
========================= */

async function loadMembersForTask(taskId) {

  const data =
    await request(`/api/tasks/${taskId}/assignments`);

  return data.assignments || [];

}


async function getMembers() {

  const data =
    await request("/api/users");

  return data.users || [];

}


/* =========================
   ASSIGN MEMBER
========================= */

async function assignMember(taskId, userId) {

  await request(
    `/api/tasks/${taskId}/assignments`,
    {
      method: "POST",

      body: JSON.stringify({
        user_id: Number(userId)
      })
    }
  );

  await loadTasks();

}


/* =========================
   CHANGE STATUS
========================= */

async function changeStatus(taskId, status) {

  const data =
    await request(`/api/tasks/${taskId}`);

}


/*
   Update task status
*/

async function updateTaskStatus(task, status) {

  await request(`/api/tasks/${task.id}`, {

    method: "PUT",

    body: JSON.stringify({

      title: task.title,

      description: task.description,

      priority: task.priority,

      parent_id: task.parent_id,

      status: status

    })

  });

  await loadTasks();

  await loadActivityLog();

  await loadReport();

}


/* =========================
   TASK CARD
========================= */

async function createTaskCard(task) {

  const members =
    await getMembers();

  const assignments =
    await loadMembersForTask(task.id);

  const assignedIds =
    assignments.map(a => Number(a.user_id));


  const memberOptions = members
    .map(member => {

      const selected =
        assignedIds.includes(Number(member.id))
          ? "selected"
          : "";

      return `
        <option value="${member.id}" ${selected}>
          ${escapeHtml(member.name)}
        </option>
      `;

    })
    .join("");


  return `

    <article
      class="kanban-task"
      draggable="true"
      data-task-id="${task.id}"
    >

      <strong>
        ${escapeHtml(task.title)}
      </strong>

      <p>
        ${escapeHtml(task.description || "")}
      </p>


      <div>

        <span class="badge">
          ${escapeHtml(task.priority)}
        </span>

      </div>


      <label>

        Assigned member

        <select
          data-assign="${task.id}"
          class="assignment-select"
        >

          <option value="">
            Select member
          </option>

          ${memberOptions}

        </select>

      </label>


      <label>

        Status

        <select
          data-status="${task.id}"
          class="status-select"
        >

          <option
            value="new"
            ${task.status === "new" ? "selected" : ""}
          >
            New
          </option>

          <option
            value="in_progress"
            ${task.status === "in_progress" ? "selected" : ""}
          >
            In Progress
          </option>

          <option
            value="done"
            ${task.status === "done" ? "selected" : ""}
          >
            Done
          </option>

        </select>

      </label>


      <div>

        <button
          class="danger"
          data-delete="${task.id}"
        >
          Delete
        </button>

      </div>

    </article>

  `;

}


/* =========================
   RENDER KANBAN
========================= */

async function renderKanban(tasks) {

  const newEl =
    document.getElementById("kanban-new");

  const progressEl =
    document.getElementById("kanban-in-progress");

  const doneEl =
    document.getElementById("kanban-done");


  newEl.innerHTML = "";

  progressEl.innerHTML = "";

  doneEl.innerHTML = "";


  for (const task of tasks) {

    const card =
      await createTaskCard(task);


    if (task.status === "new") {

      newEl.innerHTML += card;

    }

    else if (task.status === "in_progress") {

      progressEl.innerHTML += card;

    }

    else if (task.status === "done") {

      doneEl.innerHTML += card;

    }

  }

}


/* =========================
   NORMAL TASK LIST
========================= */

function taskCard(task, isSubtask) {

  return `

    <article class="item ${isSubtask ? "subtask" : ""}">

      <div class="item-head">

        <strong>
          ${escapeHtml(task.title)}
        </strong>

        <button
          class="danger"
          data-delete="${task.id}"
        >
          Delete
        </button>

      </div>


      <div>

        <span class="badge">
          ${escapeHtml(task.priority)}
        </span>

        <span class="badge">
          ${escapeHtml(
            task.status.replaceAll("_", " ")
          )}
        </span>

        <span class="badge">
          ${isSubtask ? "subtask" : "parent task"}
        </span>

      </div>


      <p>
        ${escapeHtml(task.description || "")}
      </p>

    </article>

  `;

}


function renderTasks(tasks) {

  const grouped =
    groupTasks(tasks);


  if (!tasks.length) {

    listEl.innerHTML =
      '<p class="empty">No tasks yet.</p>';

    return;

  }


  listEl.innerHTML =

    grouped
      .map(
        parent =>
          taskCard(parent, false) +

          parent.subtasks
            .map(
              child =>
                taskCard(child, true)
            )
            .join("")
      )
      .join("");


  const current =
    parentSelect.value;


  parentSelect.innerHTML =

    '<option value="">None (main task)</option>' +

    grouped
      .map(
        parent =>

          `<option value="${parent.id}">
            ${escapeHtml(parent.title)}
          </option>`
      )
      .join("");


  parentSelect.value = current;

}


/* =========================
   PROJECT
========================= */

async function loadProject() {

  const data =
    await request(
      `/api/projects/${projectId}`
    );


  document.getElementById(
    "project-title"
  ).textContent =
    data.project.name;


  document.getElementById(
    "project-meta"
  ).textContent =

    `${data.project.start_date} to ${data.project.expected_end_date}`;


  document.getElementById(
    "project-description"
  ).textContent =
    data.project.description || "";

}


/* =========================
   TASKS
========================= */

async function loadTasks() {

  const data =
    await request(
      `/api/projects/${projectId}/tasks`
    );


  renderTasks(data.tasks);

  await renderKanban(data.tasks);

}


/* =========================
   ACTIVITY LOG
========================= */

async function loadActivityLog() {

  const data =
    await request(
      `/api/projects/${projectId}/activity-logs`
    );


  const logs =
    data.activity_logs || [];


  const container =
    document.getElementById("activity-log");


  if (!logs.length) {

    container.innerHTML =
      '<p class="empty">No activity yet.</p>';

    return;

  }


  container.innerHTML = logs
    .slice()
    .reverse()
    .map(log => {

      const from =
        log.from_status
          ? log.from_status.replaceAll("_", " ")
          : "created";

      const to =
        log.to_status.replaceAll("_", " ");


      return `

        <div class="activity-item">

          <strong>
            ${escapeHtml(log.task_title)}
          </strong>

          <p>
            Status changed from
            <b>${escapeHtml(from)}</b>
            to
            <b>${escapeHtml(to)}</b>
          </p>

          <small>
            ${escapeHtml(log.changed_at)}
          </small>

        </div>

      `;

    })
    .join("");

}


/* =========================
   REPORT
========================= */

async function loadReport() {

  const data =
    await request(
      `/api/projects/${projectId}/report`
    );


  const report =
    data.report;


  const container =
    document.getElementById("report");


  container.innerHTML = `

    <div class="report-grid">

      <div>
        <strong>
          Total Tasks
        </strong>

        <span>
          ${report.total_tasks}
        </span>
      </div>


      <div>
        <strong>
          Completed Tasks
        </strong>

        <span>
          ${report.completed_tasks}
        </span>
      </div>


      <div>
        <strong>
          Completion Rate
        </strong>

        <span>
          ${report.completion_rate.toFixed(1)}%
        </span>
      </div>

    </div>


    <h3>
      Completed Tasks per Member
    </h3>


    <ul class="plain-list">

      ${
        report.completed_tasks_per_member
          .map(member => `

            <li>

              <span>
                ${escapeHtml(member.user_name)}
              </span>

              <span>
                ${member.completed_tasks}
              </span>

            </li>

          `)
          .join("")
      }

    </ul>

  `;

}


/* =========================
   CREATE TASK
========================= */

form.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    showError(errorEl, "");

    try {

      const payload =
        formData(form);


      if (!payload.parent_id) {

        payload.parent_id = null;

      }


      await request(
        `/api/projects/${projectId}/tasks`,
        {
          method: "POST",

          body: JSON.stringify(payload)

        }
      );


      form.reset();

      form.querySelector(
        '[name="priority"]'
      ).value = "medium";


      await loadTasks();

      await loadActivityLog();

      await loadReport();


    } catch (error) {

      showError(
        errorEl,
        error.message
      );

    }

  }
);


/* =========================
   CLICK EVENTS
========================= */

listEl.addEventListener(
  "click",
  async event => {

    const button =
      event.target.closest("[data-delete]");


    if (!button) {
      return;
    }


    await request(
      `/api/tasks/${button.dataset.delete}`,
      {
        method: "DELETE"
      }
    );


    await loadTasks();

    await loadActivityLog();

    await loadReport();

  }
);


/* =========================
   CHANGE EVENTS
========================= */

document.addEventListener(
  "change",
  async event => {


    /* Assignment */

    const assignment =
      event.target.closest(
        "[data-assign]"
      );


    if (assignment) {

      if (!assignment.value) {
        return;
      }


      try {

        await assignMember(
          assignment.dataset.assign,
          assignment.value
        );

      } catch (error) {

        showError(
          document.getElementById(
            "kanban-error"
          ),
          error.message
        );

      }

      return;

    }


    /* Status */

    const status =
      event.target.closest(
        "[data-status]"
      );


    if (status) {

      const taskId =
        Number(status.dataset.status);


      const data =
        await request(
          `/api/projects/${projectId}/tasks`
        );


      const task =
        data.tasks.find(
          t => Number(t.id) === taskId
        );


      if (!task) {
        return;
      }


      await updateTaskStatus(
        task,
        status.value
      );

    }

  }
);


/* =========================
   START
========================= */

if (!projectId) {

  showError(
    errorEl,
    "Missing project id."
  );

} else {

  Promise.all([

    loadProject(),

    loadTasks(),

    loadActivityLog(),

    loadReport()

  ]).catch(
    error =>
      showError(
        errorEl,
        error.message
      )
  );

}