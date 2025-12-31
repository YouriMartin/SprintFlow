# Development Guide

## Getting Started

This guide will help you set up and work with the SprintFlow mono repo.

## Architecture Overview

### Backend (NestJS - Clean Architecture)

The backend follows clean architecture principles with clear separation of concerns:

```
apps/backend/src/
├── domain/              # Business entities and repository interfaces
│   ├── entities/        # Database entities (Task, etc.)
│   └── repositories/    # Repository interfaces
├── application/         # Business logic
│   ├── use-cases/       # Business use cases
│   └── dtos/           # Data transfer objects
├── infrastructure/      # External dependencies
│   ├── database/       # Repository implementations
│   ├── config/         # Configuration files
│   ├── logging/        # Winston logger setup
│   └── telemetry/      # OpenTelemetry setup
├── presentation/        # API layer
│   ├── controllers/    # HTTP controllers
│   └── middlewares/    # HTTP middlewares
└── modules/            # NestJS modules
```

### Clean Architecture Benefits

1. **Domain Layer**: Pure business logic, no dependencies on frameworks
2. **Application Layer**: Use cases coordinate domain entities
3. **Infrastructure Layer**: Implements interfaces from domain layer
4. **Presentation Layer**: Handles HTTP requests/responses

### Frontend (Next.js)

```
apps/frontend/
├── app/                # Next.js app router
│   ├── page.tsx       # Home page
│   ├── layout.tsx     # Root layout
│   └── globals.css    # Global styles
└── lib/               # Utilities
    ├── api.ts         # API client
    └── types.ts       # TypeScript types
```

## Development Workflow

### Running Locally

1. **Start PostgreSQL**
   ```bash
   docker run -d \
     --name postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=sprintflow \
     -p 5432:5432 \
     postgres:16-alpine
   ```

2. **Start Backend**
   ```bash
   npm run backend:dev
   ```
   - API runs on http://localhost:3000
   - Swagger docs: http://localhost:3000/api

3. **Start Frontend**
   ```bash
   npm run frontend:dev
   ```
   - App runs on http://localhost:3001

### Testing

#### Backend Tests

```bash
# Run all tests
npm run backend:test

# Watch mode
npm run backend:test -- --watch

# Coverage
npm run backend:test -- --coverage

# Specific test file
npm run backend:test -- task.use-cases.spec
```

#### Writing Tests

Follow the existing patterns in `src/application/use-cases/task.use-cases.spec.ts`:

```typescript
describe('YourUseCase', () => {
  let useCase: YourUseCase;
  let mockRepository: jest.Mocked<IRepository>;

  beforeEach(async () => {
    // Setup test module
  });

  it('should...', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Building

```bash
# Build backend
npm run backend:build

# Build frontend
npm run frontend:build

# Build all
npm run backend:build && npm run frontend:build
```

### Docker

```bash
# Build images
npm run docker:build

# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Code Style

### Backend

- Use clean architecture layers
- Implement repository pattern for data access
- Use DTOs for request/response
- Write unit tests for use cases
- Use dependency injection
- Keep controllers thin - delegate to use cases

### Frontend

- Use functional components with hooks
- Keep components focused and small
- Use TypeScript for type safety
- Follow Next.js conventions

## Adding New Features

### Backend - Adding a New Entity

1. **Create Entity** (`domain/entities/your-entity.entity.ts`)
   ```typescript
   export interface YourEntity {
     id: string;
     // ... fields
     createdAt: Date;
     updatedAt: Date;
   }
   ```

2. **Create Repository Interface** (`domain/repositories/your-entity.repository.interface.ts`)
   ```typescript
   export interface IYourRepository {
     findAll(): Promise<YourEntity[]>;
     // ... methods
   }
   ```

3. **Implement Repository** (`infrastructure/database/your-entity.repository.ts`)
   ```typescript
   @Injectable()
   export class YourRepository implements IYourRepository {
     constructor(private readonly db: Kysely<Database>) {}
     // ... implementation using Kysely queries
   }
   ```

4. **Create DTOs** (`application/dtos/`)
   - `create-your-entity.dto.ts`
   - `update-your-entity.dto.ts`

5. **Create Use Cases** (`application/use-cases/your-entity.use-cases.ts`)
   ```typescript
   @Injectable()
   export class YourEntityUseCases {
     // ... business logic
   }
   ```

6. **Create Controller** (`presentation/controllers/your-entity.controller.ts`)
   ```typescript
   @Controller('your-entities')
   export class YourEntityController {
     // ... endpoints
   }
   ```

7. **Create Module** (`modules/your-entity.module.ts`)
   ```typescript
   @Module({
     providers: [YourEntityUseCases, YourRepository],
     controllers: [YourEntityController],
   })
   ```

8. **Write Tests** (`application/use-cases/your-entity.use-cases.spec.ts`)

### Frontend - Adding a New Page

1. Create page in `app/your-page/page.tsx`
2. Add API calls in `lib/api.ts`
3. Add types in `lib/types.ts`

## Environment Variables

### Backend

Copy `.env.example` to `.env` and configure:

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
```

### Frontend

Copy `.env.local.example` to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Logging

The backend uses Winston for logging:

```typescript
// In your code
import { Logger } from '@nestjs/common';

export class YourClass {
  private readonly logger = new Logger(YourClass.name);

  someMethod() {
    this.logger.log('Info message');
    this.logger.error('Error message');
    this.logger.warn('Warning message');
    this.logger.debug('Debug message');
  }
}
```

Logs are written to:
- Console (colored output)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## Telemetry

OpenTelemetry is configured but disabled by default. To enable:

1. Set `ENABLE_TELEMETRY=true` in `.env`
2. Configure collector endpoint: `OTEL_EXPORTER_OTLP_ENDPOINT`
3. Run an OTLP collector (Jaeger, Zipkin, etc.)

## Database Migrations

The project uses Kysely for database queries, which provides type-safe query building. For schema management:

1. Create migration files using Kysely migrations
2. Run migrations on deployment
3. Keep the schema in sync with TypeScript types

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Issues

1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Check database exists: `psql -U postgres -l`

### Docker Issues

```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Check logs
docker-compose logs
```

## Best Practices

1. **Never commit sensitive data** (.env files are gitignored)
2. **Write tests** for new features
3. **Follow clean architecture** - respect layer boundaries
4. **Use DTOs** for data validation
5. **Keep controllers thin** - business logic in use cases
6. **Use proper HTTP status codes**
7. **Document API endpoints** with Swagger decorators
8. **Handle errors gracefully**
9. **Log important events**

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Kysely Documentation](https://kysely.dev/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
