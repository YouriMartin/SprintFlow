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
