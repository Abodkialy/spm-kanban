# SPM Kanban

A small web application for managing software projects and tasks.

This repository is the course project for Software Project Management.
Part 1 (this branch of work) covers projects, team members, and tasks.
Part 2 will cover assignment, Kanban status tracking, activity log, and reports.

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

## Git workflow

- `main`: stable production branch
- `dev`: integration branch
- `feature/*`: development branches

Do not push directly to `main` or `dev` while building a feature.
Open a pull request into `dev`, then request a code review from another team member before merge.

## Team responsibilities

- **Member 1 (Part 1):** projects, users/team members, tasks, priority, parent/subtask, database models, basic UI, ERD, shared structure
- **Member 2 (Part 2):** task assignment, Kanban board, status changes, activity log, reports
