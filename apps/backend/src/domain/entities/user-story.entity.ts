export enum UserStoryStatus {
  // SPECIFICATION
  TO_SPECIFY = 'to_specify',
  WRITING = 'writing',
  TO_VALIDATE = 'to_validate',
  READY = 'ready',
  // DEVELOPMENT
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  CODE_REVIEW = 'code_review',
  DEV_DONE = 'dev_done',
  // DEPLOYMENT (incl. per-stage testing)
  TO_DEPLOY = 'to_deploy',
  STAGING = 'staging',
  TESTING_STAGING = 'testing_staging',
  PRE_PROD = 'pre_prod',
  TESTING_PRE_PROD = 'testing_pre_prod',
  TESTING_PROD = 'testing_prod',
  IN_PRODUCTION = 'in_production',
  // CROSS-CUTTING (test failure — visible in dev, deployment & QA views)
  TEST_FAILED = 'test_failed',
  // TERMINAL
  CANCELLED = 'cancelled',
}

export enum UserStoryGroup {
  SPECIFICATION = 'SPECIFICATION',
  DEVELOPMENT = 'DEVELOPMENT',
  QA = 'QA',
  DEPLOYMENT = 'DEPLOYMENT',
}

/**
 * Metadata for each status: which group it belongs to, its order within the group,
 * and a human-readable label.
 * TEST_FAILED has group=null because it is cross-cutting (shown in dev, deployment & QA views).
 */
export const STATUS_META: Record<
  UserStoryStatus,
  { group: UserStoryGroup | null; order: number; label: string }
> = {
  [UserStoryStatus.TO_SPECIFY]:     { group: UserStoryGroup.SPECIFICATION, order: 1, label: 'To Specify' },
  [UserStoryStatus.WRITING]:        { group: UserStoryGroup.SPECIFICATION, order: 2, label: 'Writing' },
  [UserStoryStatus.TO_VALIDATE]:    { group: UserStoryGroup.SPECIFICATION, order: 3, label: 'To Validate' },
  [UserStoryStatus.READY]:          { group: UserStoryGroup.SPECIFICATION, order: 4, label: 'Ready' },
  [UserStoryStatus.TODO]:           { group: UserStoryGroup.DEVELOPMENT,   order: 1, label: 'To Do' },
  [UserStoryStatus.IN_PROGRESS]:    { group: UserStoryGroup.DEVELOPMENT,   order: 2, label: 'In Progress' },
  [UserStoryStatus.CODE_REVIEW]:    { group: UserStoryGroup.DEVELOPMENT,   order: 3, label: 'In Review' },
  [UserStoryStatus.DEV_DONE]:       { group: UserStoryGroup.DEVELOPMENT,   order: 4, label: 'Dev Done' },
  [UserStoryStatus.TO_DEPLOY]:      { group: UserStoryGroup.DEPLOYMENT,    order: 1, label: 'To Deploy' },
  [UserStoryStatus.STAGING]:        { group: UserStoryGroup.DEPLOYMENT,    order: 2, label: 'Staging' },
  [UserStoryStatus.TESTING_STAGING]:{ group: UserStoryGroup.DEPLOYMENT,    order: 3, label: 'Testing (Staging)' },
  [UserStoryStatus.PRE_PROD]:       { group: UserStoryGroup.DEPLOYMENT,    order: 4, label: 'Pre-Prod' },
  [UserStoryStatus.TESTING_PRE_PROD]:{ group: UserStoryGroup.DEPLOYMENT,   order: 5, label: 'Testing (Pre-Prod)' },
  [UserStoryStatus.TESTING_PROD]:   { group: UserStoryGroup.DEPLOYMENT,    order: 6, label: 'Testing (Prod)' },
  [UserStoryStatus.IN_PRODUCTION]:  { group: UserStoryGroup.DEPLOYMENT,    order: 7, label: 'In Production' },
  [UserStoryStatus.TEST_FAILED]:    { group: null,                         order: 0, label: 'Test Failed' },
  [UserStoryStatus.CANCELLED]:      { group: null,                         order: 0, label: 'Cancelled' },
};

/**
 * Statuses ordered within each group (used for prev/next arrow navigation).
 * QA is empty — QA testing is now embedded in the DEPLOYMENT group per stage.
 */
export const STATUSES_BY_GROUP: Record<UserStoryGroup, UserStoryStatus[]> = {
  [UserStoryGroup.SPECIFICATION]: [
    UserStoryStatus.TO_SPECIFY,
    UserStoryStatus.WRITING,
    UserStoryStatus.TO_VALIDATE,
    UserStoryStatus.READY,
  ],
  [UserStoryGroup.DEVELOPMENT]: [
    UserStoryStatus.TODO,
    UserStoryStatus.IN_PROGRESS,
    UserStoryStatus.CODE_REVIEW,
    UserStoryStatus.DEV_DONE,
  ],
  [UserStoryGroup.QA]: [],
  [UserStoryGroup.DEPLOYMENT]: [
    UserStoryStatus.TO_DEPLOY,
    UserStoryStatus.STAGING,
    UserStoryStatus.TESTING_STAGING,
    UserStoryStatus.PRE_PROD,
    UserStoryStatus.TESTING_PRE_PROD,
    UserStoryStatus.TESTING_PROD,
    UserStoryStatus.IN_PRODUCTION,
  ],
};

/**
 * Automatic cross-group transitions triggered when a story reaches certain statuses.
 * No automatic transitions remain — all status moves are now explicit user actions.
 */
export const AUTO_TRANSITIONS: Partial<Record<UserStoryStatus, UserStoryStatus>> = {};

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
