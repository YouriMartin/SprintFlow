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

/**
 * Status enum for user stories
 */
export enum UserStoryStatus {
	TODO = 'todo',
	IN_PROGRESS = 'in_progress',
	DONE = 'done'
}

/**
 * Priority enum for user stories
 */
export enum UserStoryPriority {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
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
