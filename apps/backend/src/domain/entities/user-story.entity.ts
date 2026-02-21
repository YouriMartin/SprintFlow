export enum UserStoryStatus {
  // Functional view
  DRAFT = 'draft',
  ANALYSIS = 'analysis',
  READY_FOR_DEV = 'ready_for_dev',
  ACCEPTANCE = 'acceptance',
  // Development view
  IN_PROGRESS = 'in_progress',
  CODE_REVIEW = 'code_review',
  TESTING = 'testing',
  // Deployment view
  READY_TO_DEPLOY = 'ready_to_deploy',
  STAGING = 'staging',
  DEPLOYED = 'deployed',
  DONE = 'done',
  // Transversal
  ON_HOLD = 'on_hold',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled',
}

export enum UserStoryPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface UserStory {
  id: string;
  title: string;
  description: string | null;
  status: UserStoryStatus;
  priority: UserStoryPriority;
  assignee: string | null;
  dueDate: Date | null;
  epicId: string | null;
  sprintId: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
