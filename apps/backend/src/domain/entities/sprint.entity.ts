export enum SprintStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  sprintNumber: number;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  velocity: number | null;
  capacity: number | null;
  projectId: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
