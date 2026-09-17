# SPM Kanban

A small web application for managing software projects and tasks.

This repository is the course project for Software Project Management.
Part 1 (this branch of work) covers projects, team members, and tasks.
Part 2 will cover assignment, Kanban status tracking, activity log, and reports.

## Features (part 1)

- Create a project with name, description, start date, and expected end date
- Add team members
- Create tasks inside a project
- Set task priority: High, Medium, Low
- Create a parent task and attach subtasks
- SQLite models ready for assignment, Kanban status, activity log, and reports

## Technologies

- HTML, CSS, and JavaScript for the user interface
- Node.js (built-in HTTP server)
- SQLite (`node:sqlite`) with prepared statements

## Installation / Run

Requirements: Node.js 22 or later.

```bash
git clone <repository-url>
cd spm-kanban
git checkout dev
node src/server.js
```

Open http://localhost:3000

The SQLite file is created at `data/app.db` on first run.

## Project structure

```text
public/             User interface (HTML, CSS, JS)
src/server.js       HTTP server and routes
src/controllers/    Request handlers
src/models/         Database access
src/db/             Schema and connection
docs/erd.md         Entity relationship diagram
```

## Git workflow

- `main`: stable production branch
- `dev`: integration branch
- `feature/*`: development branches

Do not push directly to `main` or `dev` while building a feature.
Open a pull request into `dev`, then request a code review from another team member before merge.

## Team responsibilities

- **Member 1 (Part 1):** projects, users/team members, tasks, priority, parent/subtask, database models, basic UI, ERD, shared structure
- **Member 2 (Part 2):** task assignment, Kanban board, status changes, activity log, reports
