import { Inject, Injectable } from '@nestjs/common';
import type { IWorkflowRepository } from '../../domain/repositories/workflow.repository.interface';
import type {
  Workflow,
  WorkflowStatus,
  WorkflowTransition,
} from '../../domain/entities/workflow-status.entity';
import type {
  WorkflowStatusTable,
  WorkflowTransitionTable,
  KyselyDatabase,
} from '../config/kysely.config';

/** Default statuses seeded for every new project */
const DEFAULT_STATUSES: Array<{
  key: string;
  label: string;
  groupNames: string[];
  sortOrder: number;
  color: string;
  isInitial: boolean;
  isTerminal: boolean;
  posX: number;
  posY: number;
}> = [
  // SPECIFICATION
  {
    key: 'to_specify',
    label: 'To Specify',
    groupNames: ['SPECIFICATION'],
    sortOrder: 1,
    color: '#3b82f6',
    isInitial: true,
    isTerminal: false,
    posX: 50,
    posY: 50,
  },
  {
    key: 'writing',
    label: 'Writing',
    groupNames: ['SPECIFICATION'],
    sortOrder: 2,
    color: '#3b82f6',
    isInitial: false,
    isTerminal: false,
    posX: 250,
    posY: 50,
  },
  {
    key: 'to_validate',
    label: 'To Validate',
    groupNames: ['SPECIFICATION'],
    sortOrder: 3,
    color: '#3b82f6',
    isInitial: false,
    isTerminal: false,
    posX: 450,
    posY: 50,
  },
  {
    key: 'ready',
    label: 'Ready',
    groupNames: ['SPECIFICATION'],
    sortOrder: 4,
    color: '#3b82f6',
    isInitial: false,
    isTerminal: false,
    posX: 650,
    posY: 50,
  },
  // DEVELOPMENT
  {
    key: 'todo',
    label: 'To Do',
    groupNames: ['DEVELOPMENT'],
    sortOrder: 1,
    color: '#8b5cf6',
    isInitial: false,
    isTerminal: false,
    posX: 50,
    posY: 180,
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    groupNames: ['DEVELOPMENT'],
    sortOrder: 2,
    color: '#8b5cf6',
    isInitial: false,
    isTerminal: false,
    posX: 250,
    posY: 180,
  },
  {
    key: 'code_review',
    label: 'In Review',
    groupNames: ['DEVELOPMENT'],
    sortOrder: 3,
    color: '#8b5cf6',
    isInitial: false,
    isTerminal: false,
    posX: 450,
    posY: 180,
  },
  {
    key: 'dev_done',
    label: 'Dev Done',
    groupNames: ['DEVELOPMENT'],
    sortOrder: 4,
    color: '#8b5cf6',
    isInitial: false,
    isTerminal: false,
    posX: 650,
    posY: 180,
  },
  // DEPLOYMENT
  {
    key: 'to_deploy',
    label: 'To Deploy',
    groupNames: ['DEPLOYMENT'],
    sortOrder: 1,
    color: '#22c55e',
    isInitial: false,
    isTerminal: false,
    posX: 50,
    posY: 310,
  },
  {
    key: 'staging',
    label: 'Staging',
    groupNames: ['DEPLOYMENT'],
    sortOrder: 2,
    color: '#22c55e',
    isInitial: false,
    isTerminal: false,
    posX: 250,
    posY: 310,
  },
  {
    key: 'testing_staging',
    label: 'Testing (Staging)',
    groupNames: ['DEPLOYMENT'],
    sortOrder: 3,
    color: '#22c55e',
    isInitial: false,
    isTerminal: false,
    posX: 450,
    posY: 310,
  },
  {
    key: 'pre_prod',
    label: 'Pre-Prod',
    groupNames: ['DEPLOYMENT'],
    sortOrder: 4,
    color: '#22c55e',
    isInitial: false,
    isTerminal: false,
    posX: 650,
    posY: 310,
  },
  {
    key: 'testing_pre_prod',
    label: 'Testing (Pre-Prod)',
    groupNames: ['DEPLOYMENT'],
    sortOrder: 5,
    color: '#22c55e',
    isInitial: false,
    isTerminal: false,
    posX: 850,
    posY: 310,
  },
  {
    key: 'testing_prod',
    label: 'Testing (Prod)',
    groupNames: ['DEPLOYMENT'],
    sortOrder: 6,
    color: '#22c55e',
    isInitial: false,
    isTerminal: false,
    posX: 1050,
    posY: 310,
  },
  {
    key: 'in_production',
    label: 'In Production',
    groupNames: ['DEPLOYMENT'],
    sortOrder: 7,
    color: '#22c55e',
    isInitial: false,
    isTerminal: true,
    posX: 1250,
    posY: 310,
  },
  // CROSS-CUTTING: visible in both DEVELOPMENT and DEPLOYMENT views
  {
    key: 'test_failed',
    label: 'Test Failed',
    groupNames: ['DEVELOPMENT', 'DEPLOYMENT'],
    sortOrder: 0,
    color: '#ef4444',
    isInitial: false,
    isTerminal: false,
    posX: 850,
    posY: 180,
  },
  // TERMINAL: no group (shown everywhere as a terminal option)
  {
    key: 'cancelled',
    label: 'Cancelled',
    groupNames: [],
    sortOrder: 0,
    color: '#6b7280',
    isInitial: false,
    isTerminal: true,
    posX: 1050,
    posY: 50,
  },
];

/**
 * Ordered pairs of status keys representing default sequential transitions.
 * Each tuple [from, to] creates one allowed transition.
 */
const DEFAULT_TRANSITION_PAIRS: [string, string][] = [
  // SPECIFICATION flow
  ['to_specify', 'writing'],
  ['writing', 'to_validate'],
  ['to_validate', 'ready'],
  // DEVELOPMENT flow
  ['ready', 'todo'],
  ['todo', 'in_progress'],
  ['in_progress', 'code_review'],
  ['code_review', 'dev_done'],
  // DEPLOYMENT flow
  ['dev_done', 'to_deploy'],
  ['to_deploy', 'staging'],
  ['staging', 'testing_staging'],
  ['testing_staging', 'pre_prod'],
  ['pre_prod', 'testing_pre_prod'],
  ['testing_pre_prod', 'testing_prod'],
  ['testing_prod', 'in_production'],
  // Test failure loops (from any testing stage)
  ['testing_staging', 'test_failed'],
  ['testing_pre_prod', 'test_failed'],
  ['testing_prod', 'test_failed'],
  ['test_failed', 'in_progress'],
  // Cancellation from any key stage
  ['to_specify', 'cancelled'],
  ['todo', 'cancelled'],
  ['in_progress', 'cancelled'],
];

@Injectable()
export class WorkflowRepository implements IWorkflowRepository {
  constructor(
    @Inject('kysely')
    private readonly db: KyselyDatabase,
  ) {}

  /**
   * Returns the full workflow (statuses + transitions) for a project.
   * @param projectId - UUID of the project
   * @returns Workflow object with statuses ordered by sort_order
   */
  async findWorkflow(projectId: string): Promise<Workflow> {
    const [statuses, transitions] = await Promise.all([
      this.db
        .selectFrom('workflow_statuses')
        .selectAll()
        .where('project_id', '=', projectId)
        .orderBy('sort_order', 'asc')
        .execute(),
      this.db
        .selectFrom('workflow_transitions')
        .selectAll()
        .where('project_id', '=', projectId)
        .execute(),
    ]);

    return {
      statuses: statuses.map((s) => this.mapToStatus(s)),
      transitions: transitions.map((t) => this.mapToTransition(t)),
    };
  }

  /**
   * Finds a single workflow status by its ID.
   * @param id - UUID of the status
   * @returns The status or null if not found
   */
  async findStatus(id: string): Promise<WorkflowStatus | null> {
    const row = await this.db
      .selectFrom('workflow_statuses')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return row ? this.mapToStatus(row) : null;
  }

  /**
   * Creates a new workflow status for a project.
   * @param data - Status data without auto-generated fields
   * @returns The created status
   */
  async createStatus(
    data: Omit<WorkflowStatus, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<WorkflowStatus> {
    const now = new Date();
    const row = await this.db
      .insertInto('workflow_statuses')
      .values({
        id: crypto.randomUUID(),
        project_id: data.projectId,
        key: data.key,
        label: data.label,
        group_names: data.groupNames,
        sort_order: data.sortOrder,
        color: data.color,
        is_initial: data.isInitial,
        is_terminal: data.isTerminal,
        pos_x: data.posX,
        pos_y: data.posY,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToStatus(row);
  }

  /**
   * Updates an existing workflow status.
   * @param id - UUID of the status to update
   * @param data - Partial data to apply
   * @returns The updated status
   */
  async updateStatus(
    id: string,
    data: Partial<
      Omit<WorkflowStatus, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<WorkflowStatus> {
    const updateData: Partial<WorkflowStatusTable> = { updated_at: new Date() };

    if (data.label !== undefined) updateData.label = data.label;
    if (data.groupNames !== undefined) updateData.group_names = data.groupNames;
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.isInitial !== undefined) updateData.is_initial = data.isInitial;
    if (data.isTerminal !== undefined) updateData.is_terminal = data.isTerminal;
    if (data.posX !== undefined) updateData.pos_x = data.posX;
    if (data.posY !== undefined) updateData.pos_y = data.posY;

    const row = await this.db
      .updateTable('workflow_statuses')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToStatus(row);
  }

  /**
   * Deletes a workflow status by ID.
   * @param id - UUID of the status to delete
   */
  async deleteStatus(id: string): Promise<void> {
    await this.db
      .deleteFrom('workflow_statuses')
      .where('id', '=', id)
      .execute();
  }

  /**
   * Creates an allowed transition between two statuses.
   * @param data - Transition data without auto-generated fields
   * @returns The created transition
   */
  async createTransition(
    data: Omit<WorkflowTransition, 'id' | 'createdAt'>,
  ): Promise<WorkflowTransition> {
    const row = await this.db
      .insertInto('workflow_transitions')
      .values({
        id: crypto.randomUUID(),
        project_id: data.projectId,
        from_status_id: data.fromStatusId,
        to_status_id: data.toStatusId,
        created_at: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToTransition(row);
  }

  /**
   * Deletes a workflow transition by ID.
   * @param id - UUID of the transition to delete
   */
  async deleteTransition(id: string): Promise<void> {
    await this.db
      .deleteFrom('workflow_transitions')
      .where('id', '=', id)
      .execute();
  }

  /**
   * Seeds the default 17-status workflow for a project.
   * Inserts all statuses and default sequential transitions.
   * @param projectId - UUID of the project to seed
   */
  async seedDefaultWorkflow(projectId: string): Promise<void> {
    const now = new Date();

    // Insert all default statuses
    const insertedStatuses = await this.db
      .insertInto('workflow_statuses')
      .values(
        DEFAULT_STATUSES.map((s) => ({
          id: crypto.randomUUID(),
          project_id: projectId,
          key: s.key,
          label: s.label,
          group_names: s.groupNames,
          sort_order: s.sortOrder,
          color: s.color,
          is_initial: s.isInitial,
          is_terminal: s.isTerminal,
          pos_x: s.posX,
          pos_y: s.posY,
          created_at: now,
          updated_at: now,
        })),
      )
      .returningAll()
      .execute();

    // Build key → id map
    const keyToId = new Map<string, string>(
      insertedStatuses.map((s) => [s.key, s.id]),
    );

    // Insert all default transitions (skip any pair where a key is missing)
    const transitionValues = DEFAULT_TRANSITION_PAIRS.map(
      ([fromKey, toKey]) => {
        const fromId = keyToId.get(fromKey);
        const toId = keyToId.get(toKey);
        if (!fromId || !toId) return null;
        return {
          id: crypto.randomUUID(),
          project_id: projectId,
          from_status_id: fromId,
          to_status_id: toId,
          created_at: now,
        };
      },
    ).filter((v): v is NonNullable<typeof v> => v !== null);

    if (transitionValues.length > 0) {
      await this.db
        .insertInto('workflow_transitions')
        .values(transitionValues)
        .execute();
    }
  }

  private mapToStatus(row: WorkflowStatusTable): WorkflowStatus {
    return {
      id: row.id,
      projectId: row.project_id,
      key: row.key,
      label: row.label,
      groupNames: row.group_names,
      sortOrder: row.sort_order,
      color: row.color,
      isInitial: row.is_initial,
      isTerminal: row.is_terminal,
      posX: row.pos_x,
      posY: row.pos_y,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToTransition(row: WorkflowTransitionTable): WorkflowTransition {
    return {
      id: row.id,
      projectId: row.project_id,
      fromStatusId: row.from_status_id,
      toStatusId: row.to_status_id,
      createdAt: row.created_at,
    };
  }
}
