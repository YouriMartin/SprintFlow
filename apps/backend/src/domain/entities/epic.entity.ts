export enum EpicStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Epic {
  id: string;
  title: string;
  description: string | null;
  status: EpicStatus;
  startDate: Date;
  endDate: Date;
  projectId: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
