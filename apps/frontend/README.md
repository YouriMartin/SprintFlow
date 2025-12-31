# SprintFlow Frontend

The web interface for SprintFlow, built with Next.js and TypeScript.

## Features

- **Next.js 16**: Modern React framework with App Router
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **API Integration**: Seamless connection to the backend API
- **Responsive Design**: Mobile-friendly interface
- **Modern React**: Hooks and functional components

## Prerequisites

- Node.js 20.x or higher
- SprintFlow backend running (see [backend README](../backend/README.md))

## Installation

```bash
# From project root
npm install
```

## Configuration

Create a `.env.local` file in this directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Running the Frontend

```bash
# Development mode (from project root)
npm run frontend:dev

# Production build
npm run frontend:build
npm run frontend:start
```

The application will be available at `http://localhost:3001`

## Project Structure

```
app/
├── page.tsx           # Home page with task list
├── layout.tsx         # Root layout
└── globals.css        # Global styles (Tailwind)

lib/
├── api.ts             # API client for backend communication
└── types.ts           # TypeScript type definitions
```

## Features Overview

### Task Management

- **View Tasks**: See all tasks in a clean, organized list
- **Create Tasks**: Add new tasks with title, description, priority, and status
- **Update Tasks**: Modify existing task details
- **Delete Tasks**: Remove tasks from the system
- **Priority Levels**: Low, Medium, High, Urgent
- **Status Tracking**: Todo, In Progress, Done

### UI Components

- Task list with color-coded priorities
- Task creation form with validation
- Responsive design for mobile and desktop
- Loading states and error handling
- Modern, clean interface

## Development

### Adding New Pages

Create a new directory in `app/` with a `page.tsx` file:

```typescript
// app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>;
}
```

### Adding API Calls

Add new functions to `lib/api.ts`:

```typescript
export async function newApiCall() {
  const response = await fetch(`${API_URL}/endpoint`);
  return response.json();
}
```

### Adding Types

Define new types in `lib/types.ts`:

```typescript
export interface NewType {
  id: string;
  // ... other fields
}
```

## Technology Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: React 19
- **Font**: Geist (optimized with next/font)

## Building for Production

```bash
# Build the application
npm run frontend:build

# Start production server
npm run frontend:start
```

The production build is optimized for performance with:
- Static page generation where possible
- Automatic code splitting
- Image optimization
- Font optimization

## Environment Variables

- `NEXT_PUBLIC_API_URL`: The backend API URL (required)

**Note**: Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Development Guidelines

See the main [DEVELOPMENT.md](../../DEVELOPMENT.md) for detailed development guidelines.

## License

AGPL-3.0 with mandatory remuneration clause - see [LICENSE](../../LICENSE)
