# Database Migrations

This directory contains SQL migration scripts for the SprintFlow database.

## Running Migrations

### Option 1: Using psql directly

```bash
# Connect to your PostgreSQL database and run the migration
psql -h localhost -U postgres -d sprintflow -f migrations/001_initial_schema.sql
```

### Option 2: Using Docker

```bash
# If using the dockerized PostgreSQL from docker-compose
docker exec -i sprintflow-postgres psql -U postgres -d sprintflow < migrations/001_initial_schema.sql
```

### Option 3: Using npm script (recommended)

Add this script to your package.json:

```json
{
  "scripts": {
    "migrate": "psql -h localhost -U postgres -d sprintflow -f migrations/001_initial_schema.sql"
  }
}
```

Then run:

```bash
npm run migrate
```

## Migration Files

- `001_initial_schema.sql` - Creates the initial database schema with tasks, projects, and task_projects tables

## Database Schema

### Tables

1. **tasks** - Stores task information
   - id (UUID, PK)
   - title, description
   - status (todo, in_progress, done)
   - priority (low, medium, high, urgent)
   - assignee
   - due_date
   - created_at, updated_at

2. **projects** - Stores project information linked to Git repositories
   - id (UUID, PK)
   - name, description
   - repository_url
   - repository_type (gitlab, github)
   - repository_id
   - created_at, updated_at

3. **task_projects** - Many-to-many relationship between tasks and projects
   - task_id (UUID, FK to tasks)
   - project_id (UUID, FK to projects)
   - created_at
   - Primary key: (task_id, project_id)

## Notes

- All migrations are idempotent (can be run multiple times safely) using `IF NOT EXISTS` clauses
- Foreign keys use `ON DELETE CASCADE` to maintain referential integrity
- Indexes are created for commonly queried columns to improve performance
