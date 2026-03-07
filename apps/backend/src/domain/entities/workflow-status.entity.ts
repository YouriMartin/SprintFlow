/**
 * Represents a single status in a project's workflow
 */
export interface WorkflowStatus {
  id: string;
  projectId: string;
  key: string;
  label: string;
  /** Phase groups this status belongs to — a status can appear in multiple views */
  groupNames: string[];
  sortOrder: number;
  color: string;
  isInitial: boolean;
  isTerminal: boolean;
  posX: number;
  posY: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents an allowed transition between two workflow statuses
 */
export interface WorkflowTransition {
  id: string;
  projectId: string;
  fromStatusId: string;
  toStatusId: string;
  createdAt: Date;
}

/**
 * Complete workflow for a project: statuses + transitions
 */
export interface Workflow {
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
}
