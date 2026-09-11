# Entity Relationship Diagram

This ERD covers the official entities for the course project. Assignment, Kanban status, activity log, and reports are prepared in the data model for part 2.

```mermaid
erDiagram
  PROJECTS {
    int id PK
    text name
    text description
    text start_date
    text expected_end_date
    text created_at
  }

  USERS {
    int id PK
    text name
    text created_at
  }

  TASKS {
    int id PK
    int project_id FK
    int parent_id FK
    text title
    text description
    text priority
    text status
    text created_at
  }

  TASK_ASSIGNMENTS {
    int id PK
    int task_id FK
    int user_id FK
    text assigned_at
  }

  ACTIVITY_LOGS {
    int id PK
    int task_id FK
    text from_status
    text to_status
    text changed_at
  }

  PROJECTS ||--o{ TASKS : contains
  TASKS ||--o{ TASKS : parent_of
  TASKS ||--o{ TASK_ASSIGNMENTS : assigned_through
  USERS ||--o{ TASK_ASSIGNMENTS : receives
  TASKS ||--o{ ACTIVITY_LOGS : records
```

## Relationships

- One project has many tasks.
- A task may have one parent task. `parent_id` is null for a main task.
- Priority is stored on the task as `high`, `medium`, or `low`.
- Status is stored on the task as `new`, `in_progress`, or `done` for the Kanban board in part 2.
- A task can be assigned to many users through `task_assignments`.
- Status changes are stored in `activity_logs` with a timestamp.
