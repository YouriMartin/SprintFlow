# SprintFlow Scripts

This directory contains bash scripts to manage SprintFlow development and deployment workflows.

## Docker Scripts

### `docker-start.sh`
Builds and starts all services in Docker (frontend, backend, PostgreSQL).

```bash
npm run docker:start
```

**What it does:**
- Builds Docker images
- Starts all containers in detached mode
- Shows service URLs

### `docker-stop.sh`
Stops all running Docker containers.

```bash
npm run docker:stop
```

### `docker-restart.sh`
Restarts all Docker services (stops and starts again).

```bash
npm run docker:restart
```

### `docker-logs.sh`
View logs from Docker containers.

```bash
# View all logs
npm run docker:logs

# View specific service logs
./scripts/docker-logs.sh backend
./scripts/docker-logs.sh frontend
./scripts/docker-logs.sh postgres
```

### `docker-clean.sh`
Complete cleanup of Docker environment (removes containers, volumes, and images).

```bash
npm run docker:clean
```

**⚠️ Warning:** This removes all data. Use with caution!

## Development Scripts

### `dev-postgres.sh`
Starts PostgreSQL in a Docker container for local development.

```bash
npm run dev:postgres
```

**What it does:**
- Creates/starts a PostgreSQL container
- Configures default credentials
- Exposes port 5432

**Connection string:**
```
postgresql://postgres:postgres@localhost:5432/sprintflow
```

### `dev-backend.sh`
Runs the NestJS backend in development/watch mode.

```bash
npm run dev:backend
```

**Features:**
- Hot-reload enabled
- Automatic restart on file changes
- Runs on http://localhost:3000
- Swagger docs at http://localhost:3000/api

**Prerequisites:**
- PostgreSQL must be running (use `npm run dev:postgres`)

### `dev-frontend.sh`
Runs the Next.js frontend in development/watch mode.

```bash
npm run dev:frontend
```

**Features:**
- Hot-reload enabled
- Fast refresh on file changes
- Runs on http://localhost:3001

**Prerequisites:**
- Backend must be running at http://localhost:3000

### `dev-all.sh`
Starts the entire development environment (PostgreSQL, backend, frontend).

```bash
npm run dev:all
```

**What it does:**
- Starts PostgreSQL container
- Opens backend in watch mode (new terminal tab)
- Opens frontend in watch mode (new terminal tab)

**Note:** Works with GNOME Terminal, Konsole, or xterm. Falls back to sequential mode if terminal emulator is not detected.

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run docker:start` | Start all services in Docker |
| `npm run docker:stop` | Stop Docker services |
| `npm run docker:restart` | Restart Docker services |
| `npm run docker:logs` | View Docker logs |
| `npm run docker:clean` | Clean Docker environment |
| `npm run dev:postgres` | Start PostgreSQL for development |
| `npm run dev:backend` | Run backend in watch mode |
| `npm run dev:frontend` | Run frontend in watch mode |
| `npm run dev:all` | Run all services in watch mode |

## Workflow Examples

### Local Development
```bash
# Start PostgreSQL
npm run dev:postgres

# In terminal 1: Start backend
npm run dev:backend

# In terminal 2: Start frontend
npm run dev:frontend
```

Or use the all-in-one command:
```bash
npm run dev:all
```

### Docker Development
```bash
# Start everything
npm run docker:start

# View logs
npm run docker:logs

# Stop when done
npm run docker:stop
```

### Clean Start
```bash
# Clean everything
npm run docker:clean

# Rebuild and start
npm run docker:start
```

## Script Permissions

All scripts are executable. If you encounter permission issues:

```bash
chmod +x scripts/*.sh
```

## Environment Variables

Scripts use the default environment variables from `.env` files:
- Backend: `apps/backend/.env`
- Frontend: `apps/frontend/.env.local`

Make sure these files exist before running development scripts.
