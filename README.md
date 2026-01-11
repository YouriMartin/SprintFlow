# SprintFlow

**Jira and Monday's Killer** - A modern task management application built with a mono repo architecture.

## 🏗️ Architecture

This is a mono repo application with the following structure:

- **Backend**: NestJS API with clean architecture, PostgreSQL, logging, and telemetry
- **Frontend**: Next.js application with TypeScript and Tailwind CSS
- **Database**: PostgreSQL
- **Container**: Docker Compose for easy deployment

## 🚀 Features

### Backend (NestJS)
- ✅ Clean Architecture (Domain, Application, Infrastructure, Presentation layers)
- ✅ Kysely with PostgreSQL
- ✅ Winston Logger for comprehensive logging
- ✅ OpenTelemetry for observability and tracing
- ✅ Swagger/OpenAPI documentation
- ✅ Jest testing framework
- ✅ Input validation with class-validator
- ✅ RESTful API endpoints

### Frontend (Next.js)
- ✅ TypeScript support
- ✅ Tailwind CSS for styling
- ✅ Client-side task management
- ✅ Modern React with hooks
- ✅ Responsive design

### Infrastructure
- ✅ Docker containerization
- ✅ Docker Compose orchestration
- ✅ PostgreSQL database
- ✅ Environment-based configuration

## 📋 Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker and Docker Compose (for containerized deployment)

## 🛠️ Installation & Setup

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
   cp apps/frontend/.env.local.example apps/frontend/.env.local
   ```

4. **Run PostgreSQL** (if not using Docker)
   ```bash
   # Using Docker for PostgreSQL only
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
   npm run docker:build
   npm run docker:up
   ```

2. **Access the applications**
   - Frontend: `http://localhost:3001`
   - Backend API: `http://localhost:3000`
   - Swagger Docs: `http://localhost:3000/api`
   - PostgreSQL: `localhost:5432`

3. **Stop all services**
   ```bash
   npm run docker:down
   ```

## 📚 API Documentation

Once the backend is running, visit `http://localhost:3000/api` for the interactive Swagger documentation.

### Main Endpoints

- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get a task by ID
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

### Example Request

```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement authentication",
    "description": "Add JWT-based authentication",
    "priority": "high",
    "status": "todo"
  }'
```

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
npm run backend:test

# Run tests in watch mode
npm run backend:test -- --watch

# Run tests with coverage
npm run backend:test -- --coverage
```

## 📁 Project Structure

```
SprintFlow/
├── apps/
│   ├── backend/              # NestJS backend
│   │   ├── src/
│   │   │   ├── domain/       # Domain entities and repositories
│   │   │   ├── application/  # Use cases and DTOs
│   │   │   ├── infrastructure/   # Database, config, logging, telemetry
│   │   │   ├── presentation/     # Controllers and middlewares
│   │   │   └── modules/      # Feature modules
│   │   ├── test/             # E2E tests
│   │   └── Dockerfile
│   └── frontend/             # Next.js frontend
│       ├── app/              # Next.js app directory
│       ├── lib/              # API client and utilities
│       └── Dockerfile
├── docker-compose.yml        # Docker orchestration
└── package.json             # Root workspace configuration
```

## 🔧 Technology Stack

### Backend
- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **Query Builder**: Kysely
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Telemetry**: OpenTelemetry
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: React 19

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose

## 🔐 Environment Variables

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

LOG_LEVEL=info

ENABLE_TELEMETRY=false
OTEL_SERVICE_NAME=sprintflow-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📝 Development Workflow

1. Create a feature branch
2. Make changes
3. Run tests: `npm run backend:test`
4. Build the backend: `npm run backend:build`
5. Build the frontend: `npm run frontend:build`
6. Commit and push changes
7. Create a pull request

## 📖 Documentation

- [Quick Start Guide](docs/QUICKSTART.md) - Get started in 5 minutes
- [Development Guide](docs/DEVELOPMENT.md) - Development guidelines
- [Implementation Summary](docs/IMPLEMENTATION.md) - Technical details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) with a **mandatory remuneration clause** - see the [LICENSE](LICENSE) file for details.

### ⚠️ Important License Notice

**Commercial Use Requires Remuneration**: Any commercial use, deployment, or distribution of this software requires mandatory remuneration to the copyright holder(s). This includes:

- Using the software in a commercial environment
- Offering services based on this software
- Integrating this software into commercial products
- Using this software to generate revenue

**Contact Required**: You must contact the copyright holder(s) for licensing terms and remuneration arrangements before any commercial use.

For non-commercial use, this software is available under the standard AGPL-3.0 terms.

## 🎯 Roadmap

- [ ] User authentication and authorization
- [ ] Real-time updates with WebSockets
- [ ] Sprint management
- [ ] Team collaboration features
- [ ] Advanced filtering and search
- [ ] File attachments
- [ ] Email notifications
- [ ] Mobile app

## 👥 Authors

- **Youri Martin** - Initial work

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Next.js team for the powerful React framework
- The open-source community

