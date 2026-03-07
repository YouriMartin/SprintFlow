/**
 * Role enum for users
 */
export enum UserRole {
	SUPERADMIN = 'superadmin',
	DEV = 'dev'
}

/**
 * Authenticated user as returned by the login and /auth/me endpoints
 */
export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: UserRole;
}

/**
 * Status enum for projects
 */
export enum ProjectStatus {
	ACTIVE = 'active',
	ARCHIVED = 'archived',
	ON_HOLD = 'on_hold'
}

/**
 * Project entity representing a workspace
 */
export interface Project {
	id: string;
	name: string;
	description?: string;
	status: ProjectStatus;
	createdAt: string;
	updatedAt: string;
}

/**
 * DTO for creating a new project
 */
export interface CreateProjectDto {
	name: string;
	description?: string;
	status?: ProjectStatus;
}

/**
 * DTO for updating an existing project
 */
export interface UpdateProjectDto {
	name?: string;
	description?: string;
	status?: ProjectStatus;
}

/**
 * Status enum for tasks
 */
export enum TaskStatus {
	TODO = 'todo',
	IN_PROGRESS = 'in_progress',
	DONE = 'done'
}

/**
 * Priority enum for tasks
 */
export enum TaskPriority {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	URGENT = 'urgent'
}

/**
 * Task entity representing a work item
 */
export interface Task {
	id: string;
	title: string;
	description?: string;
	status: TaskStatus;
	priority: TaskPriority;
	assignee?: string;
	dueDate?: Date;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * DTO for creating a new task
 */
export interface CreateTaskDto {
	title: string;
	description?: string;
	status?: TaskStatus;
	priority?: TaskPriority;
	assignee?: string;
	dueDate?: Date;
}

/**
 * DTO for updating an existing task
 */
export interface UpdateTaskDto {
	title?: string;
	description?: string;
	status?: TaskStatus;
	priority?: TaskPriority;
	assignee?: string;
	dueDate?: Date;
}

/**
 * Status enum for epics
 */
export enum EpicStatus {
	PLANNED = 'planned',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled'
}

// ─────────────────────────────────────────────────────────────────────────────
// User Story status system — 4 lifecycle phases + terminal CANCELLED
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Status enum for user stories — 4 spec + 4 dev + 7 deployment + 1 cross-cutting + 1 terminal
 */
export enum UserStoryStatus {
	// SPECIFICATION
	TO_SPECIFY  = 'to_specify',
	WRITING     = 'writing',
	TO_VALIDATE = 'to_validate',
	READY       = 'ready',
	// DEVELOPMENT
	TODO        = 'todo',
	IN_PROGRESS = 'in_progress',
	CODE_REVIEW = 'code_review',
	DEV_DONE    = 'dev_done',
	// DEPLOYMENT (incl. per-stage testing)
	TO_DEPLOY        = 'to_deploy',
	STAGING          = 'staging',
	TESTING_STAGING  = 'testing_staging',
	PRE_PROD         = 'pre_prod',
	TESTING_PRE_PROD = 'testing_pre_prod',
	TESTING_PROD     = 'testing_prod',
	IN_PRODUCTION    = 'in_production',
	// CROSS-CUTTING (visible in dev, deployment & QA views)
	TEST_FAILED = 'test_failed',
	// TERMINAL
	CANCELLED   = 'cancelled',
}

/**
 * Phase groups for user story statuses
 */
export enum UserStoryGroup {
	SPECIFICATION = 'SPECIFICATION',
	DEVELOPMENT   = 'DEVELOPMENT',
	QA            = 'QA',
	DEPLOYMENT    = 'DEPLOYMENT',
}

/**
 * Metadata for each status: human-readable label and phase group.
 */
export const STATUS_META: Record<UserStoryStatus, { label: string; group: UserStoryGroup | null; order: number }> = {
	[UserStoryStatus.TO_SPECIFY]:      { label: 'To Specify',         group: UserStoryGroup.SPECIFICATION, order: 1 },
	[UserStoryStatus.WRITING]:         { label: 'Writing',            group: UserStoryGroup.SPECIFICATION, order: 2 },
	[UserStoryStatus.TO_VALIDATE]:     { label: 'To Validate',        group: UserStoryGroup.SPECIFICATION, order: 3 },
	[UserStoryStatus.READY]:           { label: 'Ready',              group: UserStoryGroup.SPECIFICATION, order: 4 },
	[UserStoryStatus.TODO]:            { label: 'To Do',              group: UserStoryGroup.DEVELOPMENT,   order: 1 },
	[UserStoryStatus.IN_PROGRESS]:     { label: 'In Progress',        group: UserStoryGroup.DEVELOPMENT,   order: 2 },
	[UserStoryStatus.CODE_REVIEW]:     { label: 'In Review',          group: UserStoryGroup.DEVELOPMENT,   order: 3 },
	[UserStoryStatus.DEV_DONE]:        { label: 'Dev Done',           group: UserStoryGroup.DEVELOPMENT,   order: 4 },
	[UserStoryStatus.TO_DEPLOY]:       { label: 'To Deploy',          group: UserStoryGroup.DEPLOYMENT,    order: 1 },
	[UserStoryStatus.STAGING]:         { label: 'Staging',            group: UserStoryGroup.DEPLOYMENT,    order: 2 },
	[UserStoryStatus.TESTING_STAGING]: { label: 'Testing (Staging)',  group: UserStoryGroup.DEPLOYMENT,    order: 3 },
	[UserStoryStatus.PRE_PROD]:        { label: 'Pre-Prod',           group: UserStoryGroup.DEPLOYMENT,    order: 4 },
	[UserStoryStatus.TESTING_PRE_PROD]:{ label: 'Testing (Pre-Prod)', group: UserStoryGroup.DEPLOYMENT,    order: 5 },
	[UserStoryStatus.TESTING_PROD]:    { label: 'Testing (Prod)',     group: UserStoryGroup.DEPLOYMENT,    order: 6 },
	[UserStoryStatus.IN_PRODUCTION]:   { label: 'In Production',      group: UserStoryGroup.DEPLOYMENT,    order: 7 },
	[UserStoryStatus.TEST_FAILED]:     { label: 'Test Failed',        group: null,                         order: 0 },
	[UserStoryStatus.CANCELLED]:       { label: 'Cancelled',          group: null,                         order: 0 },
};

/**
 * Ordered list of statuses within each group.
 */
export const STATUSES_BY_GROUP: Record<UserStoryGroup, UserStoryStatus[]> = {
	[UserStoryGroup.SPECIFICATION]: [
		UserStoryStatus.TO_SPECIFY, UserStoryStatus.WRITING,
		UserStoryStatus.TO_VALIDATE, UserStoryStatus.READY,
	],
	[UserStoryGroup.DEVELOPMENT]: [
		UserStoryStatus.TODO, UserStoryStatus.IN_PROGRESS,
		UserStoryStatus.CODE_REVIEW, UserStoryStatus.DEV_DONE,
	],
	/** QA testing is now embedded in the DEPLOYMENT group per stage — this list is intentionally empty. */
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
 * Returns the previous status in the same group, or null if already first.
 * @param status - Current status
 */
export function prevStatus(status: UserStoryStatus): UserStoryStatus | null {
	const meta = STATUS_META[status];
	if (!meta.group) return null;
	const list = STATUSES_BY_GROUP[meta.group];
	const idx = list.indexOf(status);
	return idx > 0 ? list[idx - 1] : null;
}

/**
 * Returns the next status in the same group, or null if already last.
 * @param status - Current status
 */
export function nextStatus(status: UserStoryStatus): UserStoryStatus | null {
	const meta = STATUS_META[status];
	if (!meta.group) return null;
	const list = STATUSES_BY_GROUP[meta.group];
	const idx = list.indexOf(status);
	return idx < list.length - 1 ? list[idx + 1] : null;
}

/**
 * Returns a 0–4 phase index for the progress bar (0 = cancelled/unknown).
 * SPECIFICATION=1, DEVELOPMENT=2, QA=3, DEPLOYMENT=4
 */
export function getPhaseIndex(status: UserStoryStatus): 0 | 1 | 2 | 3 | 4 {
	const group = STATUS_META[status].group;
	if (!group) return 0;
	return { SPECIFICATION: 1, DEVELOPMENT: 2, QA: 3, DEPLOYMENT: 4 }[group] as 1 | 2 | 3 | 4;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Priority enum for user stories
 */
export enum UserStoryPriority {
	LOW    = 'low',
	MEDIUM = 'medium',
	HIGH   = 'high',
	URGENT = 'urgent'
}

/**
 * Epic entity representing a large feature or initiative
 */
export interface Epic {
	id: string;
	title: string;
	description?: string;
	status: EpicStatus;
	startDate: string;
	endDate: string;
	projectId?: string;
	isVisibleInRoadmap: boolean;
	createdBy: string;
	updatedBy?: string;
	deletedBy?: string;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

/**
 * DTO for creating a new epic
 */
export interface CreateEpicDto {
	title: string;
	description?: string;
	status?: EpicStatus;
	startDate: string;
	endDate: string;
	projectId?: string;
	isVisibleInRoadmap?: boolean;
}

/**
 * DTO for updating an existing epic
 */
export interface UpdateEpicDto {
	title?: string;
	description?: string;
	status?: EpicStatus;
	startDate?: string;
	endDate?: string;
	projectId?: string;
	isVisibleInRoadmap?: boolean;
}

/**
 * User story entity representing a backlog item
 */
export interface UserStory {
	id: string;
	title: string;
	description?: string;
	status: UserStoryStatus;
	priority: UserStoryPriority;
	assignee?: string;
	dueDate?: string;
	epicId?: string;
	sprintId?: string;
	createdBy: string;
	updatedBy?: string;
	deletedBy?: string;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

/**
 * DTO for creating a new user story
 */
export interface CreateUserStoryDto {
	title: string;
	description?: string;
	status?: UserStoryStatus;
	priority?: UserStoryPriority;
	assignee?: string;
	dueDate?: string;
	epicId?: string;
	sprintId?: string;
}

/**
 * DTO for updating an existing user story
 */
export interface UpdateUserStoryDto {
	title?: string;
	description?: string;
	status?: UserStoryStatus;
	priority?: UserStoryPriority;
	assignee?: string;
	dueDate?: string;
	epicId?: string;
	sprintId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sprint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Status enum for sprints
 */
export enum SprintStatus {
	PLANNED   = 'planned',
	ACTIVE    = 'active',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled'
}

/**
 * Sprint entity representing a time-boxed iteration
 */
export interface Sprint {
	id: string;
	name: string;
	goal?: string;
	sprintNumber: number;
	startDate: string;
	endDate: string;
	status: SprintStatus;
	velocity?: number;
	capacity?: number;
	projectId?: string;
	createdBy: string;
	updatedBy?: string;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

/**
 * DTO for creating a new sprint
 */
export interface CreateSprintDto {
	name: string;
	goal?: string;
	sprintNumber: number;
	startDate: string;
	endDate: string;
	status?: SprintStatus;
	velocity?: number;
	capacity?: number;
	projectId?: string;
}

/**
 * DTO for updating an existing sprint
 */
export interface UpdateSprintDto {
	name?: string;
	goal?: string;
	startDate?: string;
	endDate?: string;
	status?: SprintStatus;
	velocity?: number;
	capacity?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single status in a project's workflow.
 * A status can belong to multiple groups and will appear in each group's view.
 */
export interface WorkflowStatus {
	id: string;
	projectId: string;
	key: string;
	label: string;
	/** Phase groups this status belongs to — empty array means no specific group (e.g. Cancelled) */
	groupNames: string[];
	sortOrder: number;
	color: string;
	isInitial: boolean;
	isTerminal: boolean;
	posX: number;
	posY: number;
}

/**
 * An allowed transition between two workflow statuses
 */
export interface WorkflowTransition {
	id: string;
	projectId: string;
	fromStatusId: string;
	toStatusId: string;
}

/**
 * Complete workflow for a project: statuses + transitions
 */
export interface Workflow {
	statuses: WorkflowStatus[];
	transitions: WorkflowTransition[];
}

/**
 * DTO for creating a new workflow status
 */
export interface CreateWorkflowStatusDto {
	key: string;
	label: string;
	groupNames?: string[];
	sortOrder?: number;
	color?: string;
	isInitial?: boolean;
	isTerminal?: boolean;
	posX?: number;
	posY?: number;
}

/**
 * DTO for updating a workflow status
 */
export interface UpdateWorkflowStatusDto {
	label?: string;
	groupNames?: string[];
	sortOrder?: number;
	color?: string;
	isInitial?: boolean;
	isTerminal?: boolean;
	posX?: number;
	posY?: number;
}

/**
 * DTO for creating a workflow transition
 */
export interface CreateWorkflowTransitionDto {
	fromStatusId: string;
	toStatusId: string;
}
