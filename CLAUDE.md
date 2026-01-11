# Claude Code Instructions

## Project Overview

SprintFlow is a task management mono repo with:
- **Backend**: NestJS API with Clean Architecture + CQRS (port 3000)
- **Frontend**: Next.js with TypeScript and Tailwind CSS (port 3001)
- **Database**: PostgreSQL 16

## Commands

```bash
# Development
npm run backend:dev      # Start backend
npm run frontend:dev     # Start frontend

# Testing
npm run backend:test     # Run backend tests
npm run backend:test -- --watch  # Watch mode

# Building
npm run backend:build    # Build backend
npm run frontend:build   # Build frontend

# Docker
docker compose up -d     # Start all services
docker compose down      # Stop all services
```

## Architecture - Clean Architecture + CQRS (Backend)

```
apps/backend/src/
├── domain/              # Entities & repository interfaces (no dependencies)
├── application/
│   ├── commands/        # CQRS Commands
│   │   ├── impl/        # Command objects (CreateXCommand, UpdateXCommand, DeleteXCommand)
│   │   └── handlers/    # Command handlers (business logic for writes)
│   ├── queries/         # CQRS Queries
│   │   ├── impl/        # Query objects (GetAllXQuery, GetXByIdQuery)
│   │   └── handlers/    # Query handlers (business logic for reads)
│   └── dtos/            # Data transfer objects
├── infrastructure/      # Database, config, logging (implements domain interfaces)
├── presentation/        # Controllers (uses CommandBus & QueryBus)
└── modules/             # NestJS modules (wiring)
```

### CQRS Pattern

**Commands** (write operations):
- `CreateXCommand` - Create entity
- `UpdateXCommand` - Update entity
- `DeleteXCommand` - Delete entity

**Queries** (read operations):
- `GetAllXQuery` - Get all entities
- `GetXByIdQuery` - Get entity by ID

**Controller Pattern**:
```typescript
@Controller('entities')
export class EntityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll() {
    return this.queryBus.execute(new GetAllEntitiesQuery());
  }

  @Post()
  create(@Body() dto: CreateEntityDto) {
    return this.commandBus.execute(new CreateEntityCommand(dto));
  }
}
```

### Layer Rules

1. **Domain**: Pure business entities, no framework dependencies
2. **Application**: Commands/Queries with handlers, DTOs for validation
3. **Infrastructure**: Implements repository interfaces, external services
4. **Presentation**: HTTP controllers, use CommandBus/QueryBus

## Adding New Features (Backend)

Follow this order:
1. Entity in `domain/entities/`
2. Repository interface in `domain/repositories/`
3. DTOs in `application/dtos/`
4. Commands in `application/commands/impl/{entity}/`
5. Command handlers in `application/commands/handlers/{entity}/`
6. Queries in `application/queries/impl/{entity}/`
7. Query handlers in `application/queries/handlers/{entity}/`
8. Repository implementation in `infrastructure/database/`
9. Controller in `presentation/controllers/`
10. Module in `modules/` (import CqrsModule, register handlers)

### Example: Adding a New Entity "Sprint"

```bash
# Create directories
mkdir -p application/commands/impl/sprint
mkdir -p application/commands/handlers/sprint
mkdir -p application/queries/impl/sprint
mkdir -p application/queries/handlers/sprint
```

**Files to create:**
- `domain/entities/sprint.entity.ts`
- `domain/repositories/sprint.repository.interface.ts`
- `application/dtos/create-sprint.dto.ts`
- `application/dtos/update-sprint.dto.ts`
- `application/commands/impl/sprint/create-sprint.command.ts`
- `application/commands/handlers/sprint/create-sprint.handler.ts`
- `application/queries/impl/sprint/get-all-sprints.query.ts`
- `application/queries/handlers/sprint/get-all-sprints.handler.ts`
- `infrastructure/database/sprint.repository.ts`
- `presentation/controllers/sprint.controller.ts`
- `modules/sprint.module.ts`

## Code Conventions

### Backend (NestJS + CQRS)
- Use Kysely for database queries (type-safe)
- Repository pattern with interfaces
- DTOs with class-validator decorators
- Commands for write operations, Queries for read operations
- Handlers contain business logic
- Controllers are thin - only dispatch commands/queries
- Document endpoints with Swagger decorators

### Frontend (Next.js)
- Functional components with hooks
- TypeScript for type safety
- API client in `lib/api.ts`
- Types in `lib/types.ts`

## Database

- PostgreSQL with Kysely query builder
- UUID primary keys
- Soft delete with `deleted_at` column
- User tracking with `created_by`, `updated_by`, `deleted_by`
- Timestamps: `created_at`, `updated_at`

## Testing

- Jest for backend tests
- Mock repositories for isolated testing
- Test handlers individually
- Follow AAA pattern: Arrange, Act, Assert
- Test files: `*.spec.ts` next to source files

## Environment

Backend `.env`:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `PORT=3000`, `CORS_ORIGIN=http://localhost:3001`
- `LOG_LEVEL=info`, `ENABLE_TELEMETRY=false`

Frontend `.env.local`:
- `NEXT_PUBLIC_API_URL=http://localhost:3000`
