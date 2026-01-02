import { registerAs } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

// Database schema interface
export interface Database {
  tasks: TaskTable;
  projects: ProjectTable;
  task_projects: TaskProjectTable;
}

export interface TaskTable {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string | null;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectTable {
  id: string;
  name: string;
  description: string | null;
  repository_url: string;
  repository_type: 'gitlab' | 'github';
  repository_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TaskProjectTable {
  task_id: string;
  project_id: string;
  created_at: Date;
}

export type KyselyDatabase = Kysely<Database>;

export default registerAs('kysely', () => {
  const dialect = new PostgresDialect({
    pool: new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'sprintflow',
    }),
  });

  return new Kysely<Database>({
    dialect,
    log:
      process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  });
});
