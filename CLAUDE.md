# Claude Code Instructions

## Project Overview

SprintFlow is a task management mono repo with:
- **Backend**: NestJS API with Clean Architecture + CQRS (port 3000)
- **Frontend**: Next.js with TypeScript and Tailwind CSS (port 3001)
- **Database**: PostgreSQL 16

## Domain Entities

```
Project (workspace)
├── Epic (roadmap planning, has start/end dates)
│   └── UserStory (backlog items)
├── Sprint (time-boxed iterations)
│   └── UserStory (assigned to sprint)
└── Users (team members)

CodeRepository (GitLab/GitHub repos linked to UserStories)
```

### Entity Details

| Entity | Status Enum | Key Fields |
|--------|-------------|------------|
| **User** | `superadmin`, `dev` | email, name, password, role |
| **Project** | `active`, `archived`, `on_hold` | name, description |
| **Epic** | `planned`, `in_progress`, `completed`, `cancelled` | title, startDate, endDate, projectId, isVisibleInRoadmap |
| **Sprint** | `planned`, `active`, `completed`, `cancelled` | name, goal, sprintNumber, startDate, endDate, velocity, capacity, projectId |
| **UserStory** | `todo`, `in_progress`, `done` | title, priority (low/medium/high/urgent), epicId, sprintId, assignee |
| **CodeRepository** | - | name, repositoryUrl, repositoryType (gitlab/github) |

### Soft Delete Pattern
Entities with audit trail have: `createdBy`, `updatedBy`, `deletedBy`, `createdAt`, `updatedAt`, `deletedAt`

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

## Best Practices

### Function Documentation (MANDATORY)

**Every function MUST have a JSDoc comment** explaining its purpose, parameters, and return value.

```typescript
/**
 * Creates a new sprint in the database
 * @param sprint - Sprint data without auto-generated fields (id, timestamps)
 * @returns The created sprint with all fields populated
 * @throws Error if project doesn't exist or sprint number is duplicate
 */
async create(
  sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
): Promise<Sprint> {
  // implementation
}
```

```typescript
/**
 * Finds all sprints for a given project
 * @param projectId - UUID of the project
 * @returns Array of sprints ordered by sprint number, empty array if none found
 */
async findByProjectId(projectId: string): Promise<Sprint[]> {
  // implementation
}
```

```typescript
/**
 * Soft deletes a sprint by setting deleted_at and deleted_by
 * @param id - UUID of the sprint to delete
 * @param userId - UUID of the user performing the deletion
 */
async delete(id: string, userId: string): Promise<void> {
  // implementation
}
```

### JSDoc Format

| Tag | Usage |
|-----|-------|
| `@param name - description` | Document each parameter |
| `@returns description` | Document return value |
| `@throws Error description` | Document possible errors |
| `@example` | Provide usage example if complex |

### When to Add Comments

- **Always**: Public methods, exported functions, repository methods, handlers
- **Optional**: Private helper methods (if logic is complex)
- **Never**: Obvious getters/setters, trivial one-liners

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| **Files** | kebab-case | `create-sprint.command.ts`, `sprint.repository.ts` |
| **Classes** | PascalCase | `SprintRepository`, `CreateSprintHandler` |
| **Interfaces** | PascalCase with `I` prefix (repos only) | `ISprintRepository`, `Sprint` |
| **Methods** | camelCase, verb first | `findById()`, `createSprint()`, `handleDelete()` |
| **Variables** | camelCase | `sprintNumber`, `projectId`, `isActive` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_SPRINT_DURATION`, `DEFAULT_STATUS` |
| **Enums** | PascalCase (type), SCREAMING_SNAKE_CASE (values) | `SprintStatus.ACTIVE` |
| **Database columns** | snake_case | `sprint_number`, `project_id`, `created_at` |
| **API endpoints** | kebab-case, plural nouns | `/user-stories`, `/code-repositories` |

### Data Validation

**Always validate input data using class-validator in DTOs:**

```typescript
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString, Min, Max } from 'class-validator';

export class CreateSprintDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsInt()
  @Min(1)
  sprintNumber: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsUUID()
  createdBy: string;
}
```

**Validation Rules:**
- Use `@IsNotEmpty()` for required string fields
- Use `@IsOptional()` for nullable fields
- Use `@IsUUID()` for all ID fields
- Use `@IsEnum()` for status/type fields
- Use `@IsDateString()` for dates (ISO 8601 format)
- Use `@Min()`, `@Max()` for numeric constraints
- Use `@IsEmail()` for email fields
- Use `@Length(min, max)` for string length constraints

### Error Handling

**Use NestJS HttpException for API errors:**

```typescript
import { HttpException, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';

// In handlers - throw specific exceptions
@CommandHandler(CreateSprintCommand)
export class CreateSprintHandler {
  async execute(command: CreateSprintCommand): Promise<Sprint> {
    // Validate business rules
    const project = await this.projectRepository.findById(command.projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${command.projectId} not found`);
    }

    const existingSprint = await this.sprintRepository.findByNumber(command.sprintNumber);
    if (existingSprint) {
      throw new BadRequestException(`Sprint number ${command.sprintNumber} already exists`);
    }

    // Create sprint...
  }
}
```

**Standard Error Responses:**

| Status | Exception | Use Case |
|--------|-----------|----------|
| 400 | `BadRequestException` | Invalid input, business rule violation |
| 401 | `UnauthorizedException` | Missing or invalid authentication |
| 403 | `ForbiddenException` | Authenticated but not authorized |
| 404 | `NotFoundException` | Resource not found |
| 409 | `ConflictException` | Duplicate resource, version conflict |
| 500 | `InternalServerErrorException` | Unexpected server error |

**Error Message Format:**
- Be specific: `"Sprint with ID abc-123 not found"` not `"Not found"`
- Include context: `"Cannot delete sprint: has 5 active user stories"`
- Don't expose internals: Never include stack traces or SQL in responses

### Security

**SQL Injection Prevention:**
- Always use Kysely parameterized queries (automatic)
- Never concatenate user input into queries
```typescript
// GOOD - Kysely handles escaping
const sprint = await this.db
  .selectFrom('sprints')
  .where('id', '=', userProvidedId)  // Safe
  .execute();

// BAD - Never do this
const sprint = await this.db.raw(`SELECT * FROM sprints WHERE id = '${userProvidedId}'`);
```

**XSS Prevention:**
- Sanitize HTML input if storing rich text
- React/Next.js escapes output by default
- Never use `dangerouslySetInnerHTML` with user content

**Authentication & Authorization:**
- Validate `createdBy`, `updatedBy` against authenticated user
- Check project membership before allowing access
- Use guards for route protection
```typescript
@UseGuards(AuthGuard)
@Controller('sprints')
export class SprintController {
  // All routes require authentication
}
```

**Input Sanitization:**
- Trim whitespace from strings
- Validate UUIDs format
- Limit string lengths to prevent DoS
- Validate date ranges (endDate > startDate)

**Sensitive Data:**
- Never log passwords or tokens
- Use `@Exclude()` from class-transformer for sensitive fields
- Don't return password field in user responses
```typescript
export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: string;
  // password is NOT included
}
```

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

## Migrations

Migrations are SQL files in `apps/backend/migrations/`. Naming convention: `XXX_description.sql`

### Creating a New Migration

```bash
# Create migration file
touch apps/backend/migrations/003_add_feature.sql
```

### Running Migrations

```bash
# With Docker
docker compose exec postgres psql -U postgres -d sprintflow -f /migrations/XXX_migration.sql

# Without Docker
psql -U postgres -d sprintflow -f apps/backend/migrations/XXX_migration.sql
```

### Migration Checklist

When adding a new entity, create migration with:
1. `CREATE TABLE` with all columns
2. Foreign key constraints (`REFERENCES table(id) ON DELETE ...`)
3. `CREATE INDEX` for frequently queried columns (status, foreign keys, deleted_at)
4. `COMMENT ON TABLE/COLUMN` for documentation

Also update `infrastructure/config/kysely.config.ts`:
- Add table interface (e.g., `SprintTable`)
- Add to `Database` interface

## Frontend Structure

```
apps/frontend/
├── app/              # Next.js App Router pages
├── lib/
│   ├── api.ts        # API client (fetch wrapper)
│   └── types.ts      # TypeScript types (mirrors backend DTOs)
└── public/           # Static assets
```

## API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Users | `GET/POST /users`, `GET/PATCH/DELETE /users/:id` |
| Projects | `GET/POST /projects`, `GET/PATCH/DELETE /projects/:id` |
| Epics | `GET/POST /epics`, `GET/PATCH/DELETE /epics/:id` |
| Sprints | `GET/POST /sprints`, `GET/PATCH/DELETE /sprints/:id` |
| User Stories | `GET/POST /user-stories`, `GET/PATCH/DELETE /user-stories/:id` |
| Code Repos | `GET/POST /code-repositories`, `GET/PATCH/DELETE /code-repositories/:id` |
| Links | `POST /user-stories/:id/link`, `DELETE /user-stories/:id/unlink` |

## Quick Reference

```bash
# Start everything
docker compose up -d && npm run backend:dev

# Run specific migration
docker compose exec postgres psql -U postgres -d sprintflow -f /migrations/002_add_sprints.sql

# Check database
docker compose exec postgres psql -U postgres -d sprintflow -c "\dt"

# View table structure
docker compose exec postgres psql -U postgres -d sprintflow -c "\d sprints"
```
