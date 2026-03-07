import type {
  Workflow,
  WorkflowStatus,
  WorkflowTransition,
} from '../entities/workflow-status.entity';

export const WORKFLOW_REPOSITORY = 'WORKFLOW_REPOSITORY';

export interface IWorkflowRepository {
  /**
   * Returns the full workflow (statuses + transitions) for a project.
   * @param projectId - UUID of the project
   */
  findWorkflow(projectId: string): Promise<Workflow>;

  /**
   * Finds a single workflow status by its ID.
   * @param id - UUID of the status
   * @returns The status or null if not found
   */
  findStatus(id: string): Promise<WorkflowStatus | null>;

  /**
   * Creates a new workflow status for a project.
   * @param data - Status data without auto-generated fields
   * @returns The created status
   */
  createStatus(
    data: Omit<WorkflowStatus, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<WorkflowStatus>;

  /**
   * Updates an existing workflow status.
   * A status can belong to multiple groups (it will appear in multiple views).
   * @param id - UUID of the status to update
   * @param data - Partial status data to update
   * @returns The updated status
   */
  updateStatus(
    id: string,
    data: Partial<Omit<WorkflowStatus, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<WorkflowStatus>;

  /**
   * Deletes a workflow status by ID.
   * @param id - UUID of the status to delete
   */
  deleteStatus(id: string): Promise<void>;

  /**
   * Creates an allowed transition between two statuses.
   * @param data - Transition data without auto-generated fields
   * @returns The created transition
   */
  createTransition(
    data: Omit<WorkflowTransition, 'id' | 'createdAt'>,
  ): Promise<WorkflowTransition>;

  /**
   * Deletes a workflow transition by ID.
   * @param id - UUID of the transition to delete
   */
  deleteTransition(id: string): Promise<void>;

  /**
   * Seeds the default 17-status workflow for a project.
   * Should be called when a new project is created.
   * @param projectId - UUID of the project to seed
   */
  seedDefaultWorkflow(projectId: string): Promise<void>;
}
