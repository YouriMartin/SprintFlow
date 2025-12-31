# SprintFlow Backend

The backend API for SprintFlow, built with NestJS and clean architecture principles.

## Architecture

This backend follows clean architecture with clear separation of concerns:

```
src/
├── domain/              # Business entities and repository interfaces
│   ├── entities/        # Database entities (Task, etc.)
│   └── repositories/    # Repository interfaces
├── application/         # Business logic
│   ├── use-cases/       # Business use cases
│   └── dtos/            # Data transfer objects
├── infrastructure/      # External dependencies
│   ├── database/        # Repository implementations
│   ├── config/          # Configuration files
│   ├── logging/         # Winston logger setup
│   └── telemetry/       # OpenTelemetry setup
├── presentation/        # API layer
│   ├── controllers/     # HTTP controllers
│   └── middlewares/     # HTTP middlewares
└── modules/             # NestJS modules
```

## Features

- **Clean Architecture**: Domain-driven design with dependency inversion
- **Database**: PostgreSQL with Kysely query builder
- **Validation**: class-validator for input validation
- **Documentation**: Swagger/OpenAPI at `/api` endpoint
- **Logging**: Winston with console and file transports
- **Telemetry**: OpenTelemetry for distributed tracing
- **Testing**: Jest with unit tests for use cases

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 16

## Installation

```bash
# From project root
npm install
```

## Configuration

Create a `.env` file in this directory:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=sprintflow

LOG_LEVEL=info

ENABLE_TELEMETRY=false
OTEL_SERVICE_NAME=sprintflow-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

## Running the Backend

```bash
# Development mode (from project root)
npm run backend:dev

# Production mode
npm run backend:build
npm run backend:start
```

The API will be available at `http://localhost:3000`

## API Documentation

Once running, visit `http://localhost:3000/api` for interactive Swagger documentation.

## Testing

```bash
# Run all tests
npm run backend:test

# Watch mode
npm run backend:test -- --watch

# Coverage
npm run backend:test -- --coverage
```

## API Endpoints

### Tasks

- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get a task by ID
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

### Example Request

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement authentication",
    "description": "Add JWT-based authentication",
    "priority": "high",
    "status": "todo"
  }'
```

## Technology Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **Query Builder**: Kysely
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Telemetry**: OpenTelemetry
- **Testing**: Jest

## Clean Architecture Benefits

1. **Testability**: Easy to unit test with mocked dependencies
2. **Maintainability**: Clear separation of concerns
3. **Scalability**: Easy to add new features
4. **Independence**: Business logic independent of frameworks

## Development

See the main [DEVELOPMENT.md](../../DEVELOPMENT.md) for detailed development guidelines.

## License

AGPL-3.0 with mandatory remuneration clause - see [LICENSE](../../LICENSE)
