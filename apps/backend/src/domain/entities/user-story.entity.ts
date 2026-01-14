export enum UserStoryStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
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
