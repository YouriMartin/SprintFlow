# Claude Code Instructions

## Project Overview

SprintFlow is a task management mono repo with:
- **Backend**: NestJS API with clean architecture (port 3000)
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

## Architecture - Clean Architecture (Backend)

```
apps/backend/src/
├── domain/              # Entities & repository interfaces (no dependencies)
├── application/         # Use cases & DTOs (depends on domain)
├── infrastructure/      # Database, config, logging (implements domain interfaces)
├── presentation/        # Controllers (depends on application)
└── modules/             # NestJS modules (wiring)
```

### Layer Rules

1. **Domain**: Pure business entities, no framework dependencies
2. **Application**: Business logic in use cases, DTOs for validation
3. **Infrastructure**: Implements repository interfaces, external services
4. **Presentation**: HTTP controllers, thin - delegate to use cases

## Adding New Features (Backend)

Follow this order:
1. Entity in `domain/entities/`
2. Repository interface in `domain/repositories/`
3. DTOs in `application/dtos/`
4. Use cases in `application/use-cases/`
5. Repository implementation in `infrastructure/database/`
6. Controller in `presentation/controllers/`
7. Module in `modules/`
8. Tests in `*.spec.ts`

## Code Conventions

### Backend (NestJS)
- Use Kysely for database queries (type-safe)
- Repository pattern with interfaces
- DTOs with class-validator decorators
- Keep controllers thin - business logic in use cases
- Document endpoints with Swagger decorators
- Write unit tests for use cases

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
- Follow AAA pattern: Arrange, Act, Assert
- Test files: `*.spec.ts` next to source files

## Environment

Backend `.env`:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `PORT=3000`, `CORS_ORIGIN=http://localhost:3001`
- `LOG_LEVEL=info`, `ENABLE_TELEMETRY=false`

Frontend `.env.local`:
- `NEXT_PUBLIC_API_URL=http://localhost:3000`
