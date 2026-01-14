import { Inject, Injectable } from '@nestjs/common';
import { Sprint, SprintStatus } from '../../domain/entities/sprint.entity';
import { ISprintRepository } from '../../domain/repositories/sprint.repository.interface';
import type { SprintTable, KyselyDatabase } from '../config/kysely.config';

@Injectable()
export class SprintRepository implements ISprintRepository {
  constructor(
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  async findAll(): Promise<Sprint[]> {
    const sprints = await this.db
      .selectFrom('sprints')
      .selectAll()
      .where('deleted_at', 'is', null)
      .orderBy('sprint_number', 'asc')
      .execute();
    return sprints.map((sprint) => this.mapToSprint(sprint));
  }

  async findById(id: string): Promise<Sprint | null> {
    const sprint = await this.db
      .selectFrom('sprints')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return sprint ? this.mapToSprint(sprint) : null;
  }

  async findByProjectId(projectId: string): Promise<Sprint[]> {
    const sprints = await this.db
      .selectFrom('sprints')
      .selectAll()
      .where('project_id', '=', projectId)
      .where('deleted_at', 'is', null)
      .orderBy('sprint_number', 'asc')
      .execute();

    return sprints.map((sprint) => this.mapToSprint(sprint));
  }

  async findActiveByProjectId(projectId: string): Promise<Sprint | null> {
    const sprint = await this.db
      .selectFrom('sprints')
      .selectAll()
      .where('project_id', '=', projectId)
      .where('status', '=', 'active')
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return sprint ? this.mapToSprint(sprint) : null;
  }

  async create(
    sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'deletedBy' | 'deletedAt'>,
  ): Promise<Sprint> {
    const now = new Date();
    const newSprint = await this.db
      .insertInto('sprints')
      .values({
        id: crypto.randomUUID(),
        name: sprint.name,
        goal: sprint.goal || null,
        sprint_number: sprint.sprintNumber,
        start_date: sprint.startDate,
        end_date: sprint.endDate,
        status: sprint.status || SprintStatus.PLANNED,
        velocity: sprint.velocity || null,
        capacity: sprint.capacity || null,
        project_id: sprint.projectId || null,
        created_by: sprint.createdBy,
        updated_by: null,
        deleted_by: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToSprint(newSprint);
  }

  async update(
    id: string,
    sprint: Partial<Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'deletedBy' | 'deletedAt'>>,
  ): Promise<Sprint | null> {
    const updateData: Partial<SprintTable> = {
      updated_at: new Date(),
    };

    if (sprint.name !== undefined) updateData.name = sprint.name;
    if (sprint.goal !== undefined) updateData.goal = sprint.goal;
    if (sprint.sprintNumber !== undefined) updateData.sprint_number = sprint.sprintNumber;
    if (sprint.startDate !== undefined) updateData.start_date = sprint.startDate;
    if (sprint.endDate !== undefined) updateData.end_date = sprint.endDate;
    if (sprint.status !== undefined) updateData.status = sprint.status;
    if (sprint.velocity !== undefined) updateData.velocity = sprint.velocity;
    if (sprint.capacity !== undefined) updateData.capacity = sprint.capacity;
    if (sprint.projectId !== undefined) updateData.project_id = sprint.projectId;
    if (sprint.updatedBy !== undefined) updateData.updated_by = sprint.updatedBy;

    const updatedSprint = await this.db
      .updateTable('sprints')
      .set(updateData)
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .returningAll()
      .executeTakeFirst();

    return updatedSprint ? this.mapToSprint(updatedSprint) : null;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.db
      .updateTable('sprints')
      .set({
        deleted_by: userId,
        deleted_at: new Date(),
      })
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .execute();
  }

  private mapToSprint(dbSprint: SprintTable): Sprint {
    return {
      id: dbSprint.id,
      name: dbSprint.name,
      goal: dbSprint.goal,
      sprintNumber: dbSprint.sprint_number,
      startDate: dbSprint.start_date,
      endDate: dbSprint.end_date,
      status: dbSprint.status as SprintStatus,
      velocity: dbSprint.velocity,
      capacity: dbSprint.capacity,
      projectId: dbSprint.project_id,
      createdBy: dbSprint.created_by,
      updatedBy: dbSprint.updated_by,
      deletedBy: dbSprint.deleted_by,
      createdAt: dbSprint.created_at,
      updatedAt: dbSprint.updated_at,
      deletedAt: dbSprint.deleted_at,
    };
  }
}
