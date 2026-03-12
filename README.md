# SprintFlow

**Jira and Monday's Killer** - A modern task management application built with a mono repo architecture.

## Architecture

This is a mono repo application with the following structure:

- **Backend**: NestJS API with Clean Architecture + CQRS, PostgreSQL, logging, and telemetry
- **Frontend**: SvelteKit application with TypeScript and native CSS
- **Database**: PostgreSQL 16
- **Container**: Docker Compose for easy deployment

## Features

### Backend (NestJS)
- Clean Architecture (Domain, Application, Infrastructure, Presentation layers)
- CQRS pattern (Commands & Queries with separate handlers)
- Kysely with PostgreSQL (type-safe query builder)
- JWT authentication with refresh tokens (HTTP-only cookies)
- Winston Logger for comprehensive logging
- OpenTelemetry for observability and tracing
- Swagger/OpenAPI documentation
- Jest testing framework
- Input validation with class-validator
- RESTful API endpoints

### Frontend (SvelteKit)
- TypeScript support
- Svelte 5 with runes (`$state`, `$effect`, `$props`)
- Native CSS with scoped component styles
- JWT auth with in-memory access tokens
- Responsive design

### Infrastructure
- Docker containerization
- Docker Compose orchestration
- PostgreSQL 16 database
- Environment-based configuration

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker and Docker Compose (for containerized deployment)

## Installation & Setup

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YouriMartin/SprintFlow.git
   cd SprintFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Backend:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

   Frontend:
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env
   ```

4. **Run PostgreSQL** (if not using Docker)
   ```bash
   docker run -d \
     --name postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=sprintflow \
     -p 5432:5432 \
     postgres:16-alpine
   ```

5. **Start the backend**
   ```bash
   npm run backend:dev
   ```

   The backend will be available at `http://localhost:3000`
   Swagger documentation: `http://localhost:3000/api`

6. **Start the frontend** (in a new terminal)
   ```bash
   npm run frontend:dev
   ```

   The frontend will be available at `http://localhost:3001`

### Docker Deployment

1. **Build and start all services**
   ```bash
   docker compose up -d
   ```

2. **Access the applications**
   - Frontend: `http://localhost:3001`
   - Backend API: `http://localhost:3000`
   - Swagger Docs: `http://localhost:3000/api`
   - PostgreSQL: `localhost:5432`

3. **Stop all services**
   ```bash
   docker compose down
   ```

## API Documentation

Once the backend is running, visit `http://localhost:3000/api` for the interactive Swagger documentation.

### Main Endpoints

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| Users | `GET/POST /users`, `GET/PATCH/DELETE /users/:id` |
| Projects | `GET/POST /projects`, `GET/PATCH/DELETE /projects/:id` |
| Epics | `GET/POST /epics`, `GET/PATCH/DELETE /epics/:id` |
| Sprints | `GET/POST /sprints`, `GET/PATCH/DELETE /sprints/:id` |
| User Stories | `GET/POST /user-stories`, `GET/PATCH/DELETE /user-stories/:id` |
| Code Repos | `GET/POST /code-repositories`, `GET/PATCH/DELETE /code-repositories/:id` |

### Example Request

```bash
# Create a user story
curl -X POST http://localhost:3000/user-stories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Implement authentication",
    "priority": "high",
    "status": "todo",
    "sprintId": "<sprint-uuid>",
    "createdBy": "<user-uuid>"
  }'
```

## Testing

### Backend Tests

```bash
# Run all tests
npm run backend:test

# Run tests in watch mode
npm run backend:test -- --watch

# Run tests with coverage
npm run backend:test -- --coverage
```

## Project Structure

```
SprintFlow/
├── apps/
│   ├── backend/              # NestJS backend
│   │   ├── src/
│   │   │   ├── domain/       # Domain entities and repository interfaces
│   │   │   ├── application/  # Commands, queries, handlers, DTOs
│   │   │   ├── infrastructure/   # Database, config, logging, auth
│   │   │   ├── presentation/     # Controllers
│   │   │   └── modules/      # NestJS feature modules
│   │   ├── migrations/       # SQL migration files
│   │   └── Dockerfile
│   └── frontend/             # SvelteKit frontend
│       ├── src/
│       │   ├── lib/          # API client, types, auth store
│       │   └── routes/       # SvelteKit file-based routing
│       └── Dockerfile
├── docker-compose.yml        # Docker orchestration
└── package.json             # Root workspace configuration
```

## Technology Stack

### Backend
- **Framework**: NestJS 11
- **Language**: TypeScript
- **Architecture**: Clean Architecture + CQRS
- **Database**: PostgreSQL 16
- **Query Builder**: Kysely
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Telemetry**: OpenTelemetry
- **Testing**: Jest

### Frontend
- **Framework**: SvelteKit
- **Language**: TypeScript
- **UI**: Svelte 5 (runes API)
- **Styling**: Native CSS (scoped per component)

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=sprintflow

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

LOG_LEVEL=info

ENABLE_TELEMETRY=false
OTEL_SERVICE_NAME=sprintflow-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

### Frontend (.env)
```env
PUBLIC_API_URL=http://localhost:3000
```

## Development Workflow

1. Create a feature branch
2. Make changes
3. Run tests: `npm run backend:test`
4. Build the backend: `npm run backend:build`
5. Build the frontend: `npm run frontend:build`
6. Commit and push changes
7. Create a pull request

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) with a **mandatory remuneration clause** - see the [LICENSE](LICENSE) file for details.

### Important License Notice

**Commercial Use Requires Remuneration**: Any commercial use, deployment, or distribution of this software requires mandatory remuneration to the copyright holder(s). This includes:

- Using the software in a commercial environment
- Offering services based on this software
- Integrating this software into commercial products
- Using this software to generate revenue

**Contact Required**: You must contact the copyright holder(s) for licensing terms and remuneration arrangements before any commercial use.

For non-commercial use, this software is available under the standard AGPL-3.0 terms.

## Authors

- **Youri Martin** - Initial work

## Acknowledgments

- NestJS team for the amazing framework
- SvelteKit team for the powerful meta-framework
- The open-source community
