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
    const epics = await this.db.selectFrom('epics').selectAll().execute();
    return epics.map((epic) => this.mapToEpic(epic));
  }

  async findById(id: string): Promise<Epic | null> {
    const epic = await this.db
      .selectFrom('epics')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return epic ? this.mapToEpic(epic) : null;
  }

  async create(
    epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>,
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
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToEpic(newEpic);
  }

  async update(
    id: string,
    epic: Partial<Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>>,
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

    const updatedEpic = await this.db
      .updateTable('epics')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return updatedEpic ? this.mapToEpic(updatedEpic) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.deleteFrom('epics').where('id', '=', id).execute();
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
      createdAt: dbEpic.created_at,
      updatedAt: dbEpic.updated_at,
    };
  }
}
