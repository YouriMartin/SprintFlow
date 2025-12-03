# Quick Start Guide

Get SprintFlow up and running in 5 minutes!

## Option 1: Docker (Recommended)

The fastest way to get started:

```bash
# 1. Clone the repository
git clone https://github.com/YouriMartin/SprintFlow.git
cd SprintFlow

# 2. Build and start all services
docker compose up -d

# 3. Access the applications
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
# Swagger Docs: http://localhost:3000/api
```

That's it! All services (frontend, backend, and PostgreSQL) are now running.

### Stop Services

```bash
docker compose down
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

## Option 2: Local Development

For active development:

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL 16 (or use Docker for database only)

### Setup

```bash
# 1. Clone and install
git clone https://github.com/YouriMartin/SprintFlow.git
cd SprintFlow
npm install

# 2. Start PostgreSQL (if not already running)
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sprintflow \
  -p 5432:5432 \
  postgres:16-alpine

# 3. Set up environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local

# 4. Start backend (terminal 1)
npm run backend:dev

# 5. Start frontend (terminal 2)
npm run frontend:dev
```

### Access

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api

## First Steps

1. **Access the frontend** at http://localhost:3001
2. **Create your first task** by clicking "New Task"
3. **Fill in task details** (title, description, priority, status)
4. **View your tasks** in the task list
5. **Explore the API** at http://localhost:3000/api (Swagger UI)

## API Examples

### Create a Task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Task",
    "description": "Getting started with SprintFlow",
    "priority": "high",
    "status": "todo"
  }'
```

### Get All Tasks

```bash
curl http://localhost:3000/tasks
```

### Update a Task

```bash
curl -X PUT http://localhost:3000/tasks/{task-id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done"
  }'
```

### Delete a Task

```bash
curl -X DELETE http://localhost:3000/tasks/{task-id}
```

## Next Steps

- Read the [README.md](README.md) for detailed documentation
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for development guidelines
- Explore the clean architecture in the backend
- Customize the frontend UI
- Add new features!

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 <PID>
```

### Docker Issues

```bash
# Clean up and restart
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Database Connection Failed

1. Ensure PostgreSQL is running
2. Check credentials in `apps/backend/.env`
3. Verify database exists: `psql -U postgres -l`

## Support

For issues, questions, or contributions, please visit:
- GitHub Issues: https://github.com/YouriMartin/SprintFlow/issues
- Documentation: [README.md](README.md)
- Development Guide: [DEVELOPMENT.md](DEVELOPMENT.md)
