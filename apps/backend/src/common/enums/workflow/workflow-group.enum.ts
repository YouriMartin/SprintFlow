export const WorkflowGroupEnum = {
  SPECIFICATION: 'specification',
  DEVELOPMENT: 'development',
  QA: 'qa',
  DEPLOYMENT: 'deployment',
} as const;

export type WorkflowGroupEnum =
  (typeof WorkflowGroupEnum)[keyof typeof WorkflowGroupEnum];
