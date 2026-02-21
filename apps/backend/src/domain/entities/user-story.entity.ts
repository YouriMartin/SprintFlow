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
  // QA / RECETTE
  TO_TEST = 'to_test',
  TESTING = 'testing',
  TEST_PASSED = 'test_passed',
  TEST_FAILED = 'test_failed',
  // DEPLOYMENT
  TO_DEPLOY = 'to_deploy',
  STAGING = 'staging',
  PRE_PROD = 'pre_prod',
  IN_PRODUCTION = 'in_production',
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
 * and (for non-terminal statuses) the next/previous statuses in sequence.
 */
export const STATUS_META: Record<
  UserStoryStatus,
  { group: UserStoryGroup | null; order: number; label: string }
> = {
  [UserStoryStatus.TO_SPECIFY]:   { group: UserStoryGroup.SPECIFICATION, order: 1, label: 'À spécifier' },
  [UserStoryStatus.WRITING]:      { group: UserStoryGroup.SPECIFICATION, order: 2, label: 'En rédaction' },
  [UserStoryStatus.TO_VALIDATE]:  { group: UserStoryGroup.SPECIFICATION, order: 3, label: 'À valider' },
  [UserStoryStatus.READY]:        { group: UserStoryGroup.SPECIFICATION, order: 4, label: 'Prête' },
  [UserStoryStatus.TODO]:         { group: UserStoryGroup.DEVELOPMENT,   order: 1, label: 'À faire' },
  [UserStoryStatus.IN_PROGRESS]:  { group: UserStoryGroup.DEVELOPMENT,   order: 2, label: 'En cours' },
  [UserStoryStatus.CODE_REVIEW]:  { group: UserStoryGroup.DEVELOPMENT,   order: 3, label: 'En revue' },
  [UserStoryStatus.DEV_DONE]:     { group: UserStoryGroup.DEVELOPMENT,   order: 4, label: 'Dev terminé' },
  [UserStoryStatus.TO_TEST]:      { group: UserStoryGroup.QA,            order: 1, label: 'À recetter' },
  [UserStoryStatus.TESTING]:      { group: UserStoryGroup.QA,            order: 2, label: 'En recette' },
  [UserStoryStatus.TEST_PASSED]:  { group: UserStoryGroup.QA,            order: 3, label: 'Recette OK' },
  [UserStoryStatus.TEST_FAILED]:  { group: UserStoryGroup.QA,            order: 4, label: 'Recette KO' },
  [UserStoryStatus.TO_DEPLOY]:    { group: UserStoryGroup.DEPLOYMENT,    order: 1, label: 'À déployer' },
  [UserStoryStatus.STAGING]:      { group: UserStoryGroup.DEPLOYMENT,    order: 2, label: 'Staging' },
  [UserStoryStatus.PRE_PROD]:     { group: UserStoryGroup.DEPLOYMENT,    order: 3, label: 'Pré-prod' },
  [UserStoryStatus.IN_PRODUCTION]:{ group: UserStoryGroup.DEPLOYMENT,    order: 4, label: 'En production' },
  [UserStoryStatus.CANCELLED]:    { group: null,                         order: 0, label: 'Annulée' },
};

/**
 * Statuses ordered within each group (excludes CANCELLED which is terminal).
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
  [UserStoryGroup.QA]: [
    UserStoryStatus.TO_TEST,
    UserStoryStatus.TESTING,
    UserStoryStatus.TEST_PASSED,
    UserStoryStatus.TEST_FAILED,
  ],
  [UserStoryGroup.DEPLOYMENT]: [
    UserStoryStatus.TO_DEPLOY,
    UserStoryStatus.STAGING,
    UserStoryStatus.PRE_PROD,
    UserStoryStatus.IN_PRODUCTION,
  ],
};

/**
 * Automatic cross-group transitions triggered when a story reaches certain statuses.
 * The handler applies these after a regular status update.
 */
export const AUTO_TRANSITIONS: Partial<Record<UserStoryStatus, UserStoryStatus>> = {
  [UserStoryStatus.DEV_DONE]:    UserStoryStatus.TO_TEST,
  [UserStoryStatus.TEST_PASSED]: UserStoryStatus.TO_DEPLOY,
  [UserStoryStatus.TEST_FAILED]: UserStoryStatus.TODO,
};

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
