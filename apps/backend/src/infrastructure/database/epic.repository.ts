import { Inject, Injectable } from '@nestjs/common';
import { Epic, EpicStatus } from '../../domain/entities/epic.entity';
import { IEpicRepository } from '../../domain/repositories/epic.repository.interface';
import type { EpicTable, KyselyDatabase } from '../config/kysely.config';

@Injectable()
export class EpicRepository implements IEpicRepository {
  constructor(
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  async findAll(): Promise<Epic[]> {
    const epics = await this.db
      .selectFrom('epics')
      .selectAll()
      .where('deleted_at', 'is', null)
      .execute();
    return epics.map((epic) => this.mapToEpic(epic));
  }

  async findById(id: string): Promise<Epic | null> {
    const epic = await this.db
      .selectFrom('epics')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return epic ? this.mapToEpic(epic) : null;
  }

  async create(
    epic: Omit<
      Epic,
      'id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'deletedBy' | 'deletedAt'
    >,
  ): Promise<Epic> {
    const now = new Date();
    const newEpic = await this.db
      .insertInto('epics')
      .values({
        id: crypto.randomUUID(),
        title: epic.title,
        description: epic.description || null,
        status: epic.status || EpicStatus.PLANNED,
        start_date: epic.startDate,
        end_date: epic.endDate,
        project_id: epic.projectId || null,
        is_visible_in_roadmap: epic.isVisibleInRoadmap ?? true,
        created_by: epic.createdBy,
        updated_by: null,
        deleted_by: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEpic(newEpic);
  }

  async update(
    id: string,
    epic: Partial<
      Omit<
        Epic,
        | 'id'
        | 'createdAt'
        | 'updatedAt'
        | 'createdBy'
        | 'deletedBy'
        | 'deletedAt'
      >
    >,
  ): Promise<Epic | null> {
    const updateData: Partial<EpicTable> = {
      updated_at: new Date(),
    };

    if (epic.title !== undefined) updateData.title = epic.title;
    if (epic.description !== undefined)
      updateData.description = epic.description;
    if (epic.status !== undefined) updateData.status = epic.status;
    if (epic.startDate !== undefined) updateData.start_date = epic.startDate;
    if (epic.endDate !== undefined) updateData.end_date = epic.endDate;
    if (epic.projectId !== undefined) updateData.project_id = epic.projectId;
    if (epic.isVisibleInRoadmap !== undefined)
      updateData.is_visible_in_roadmap = epic.isVisibleInRoadmap;
    if (epic.updatedBy !== undefined) updateData.updated_by = epic.updatedBy;

    const updatedEpic = await this.db
      .updateTable('epics')
      .set(updateData)
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .returningAll()
      .executeTakeFirst();

    return updatedEpic ? this.mapToEpic(updatedEpic) : null;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.db
      .updateTable('epics')
      .set({
        deleted_by: userId,
        deleted_at: new Date(),
      })
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .execute();
  }

  private mapToEpic(dbEpic: EpicTable): Epic {
    return {
      id: dbEpic.id,
      title: dbEpic.title,
      description: dbEpic.description,
      status: dbEpic.status as EpicStatus,
      startDate: dbEpic.start_date,
      endDate: dbEpic.end_date,
      projectId: dbEpic.project_id,
      isVisibleInRoadmap: dbEpic.is_visible_in_roadmap,
      createdBy: dbEpic.created_by,
      updatedBy: dbEpic.updated_by,
      deletedBy: dbEpic.deleted_by,
      createdAt: dbEpic.created_at,
      updatedAt: dbEpic.updated_at,
      deletedAt: dbEpic.deleted_at,
    };
  }
}
