import type {
	Task,
	CreateTaskDto,
	UpdateTaskDto,
	Project,
	CreateProjectDto,
	UpdateProjectDto,
	Epic,
	CreateEpicDto,
	UpdateEpicDto,
	UserStory,
	CreateUserStoryDto,
	UpdateUserStoryDto
} from './types';
import { PUBLIC_API_URL } from '$env/static/public';

const API_BASE_URL = PUBLIC_API_URL || 'http://localhost:3000';

/**
 * API client for communicating with the backend
 */
export const api = {
	/**
	 * Fetches all tasks from the backend
	 * @returns Array of tasks
	 * @throws Error if the request fails
	 */
	async getTasks(): Promise<Task[]> {
		const response = await fetch(`${API_BASE_URL}/tasks`);
		if (!response.ok) {
			throw new Error('Failed to fetch tasks');
		}
		return response.json();
	},

	/**
	 * Fetches a single task by ID
	 * @param id - UUID of the task
	 * @returns The task object
	 * @throws Error if the task is not found or request fails
	 */
	async getTask(id: string): Promise<Task> {
		const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
		if (!response.ok) {
			throw new Error('Failed to fetch task');
		}
		return response.json();
	},

	/**
	 * Creates a new task
	 * @param data - Task data to create
	 * @returns The created task with generated ID and timestamps
	 * @throws Error if validation fails or request fails
	 */
	async createTask(data: CreateTaskDto): Promise<Task> {
		const response = await fetch(`${API_BASE_URL}/tasks`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		if (!response.ok) {
			throw new Error('Failed to create task');
		}
		return response.json();
	},

	/**
	 * Updates an existing task
	 * @param id - UUID of the task to update
	 * @param data - Partial task data to update
	 * @returns The updated task
	 * @throws Error if task not found or request fails
	 */
	async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
		const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		if (!response.ok) {
			throw new Error('Failed to update task');
		}
		return response.json();
	},

	/**
	 * Deletes a task
	 * @param id - UUID of the task to delete
	 * @throws Error if task not found or request fails
	 */
	async deleteTask(id: string): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
			method: 'DELETE'
		});
		if (!response.ok) {
			throw new Error('Failed to delete task');
		}
	},

	// ==================== PROJECTS ====================

	/**
	 * Fetches all projects from the backend
	 * @returns Array of projects
	 * @throws Error if the request fails
	 */
	async getProjects(): Promise<Project[]> {
		const response = await fetch(`${API_BASE_URL}/projects`);
		if (!response.ok) {
			throw new Error('Failed to fetch projects');
		}
		return response.json();
	},

	/**
	 * Fetches a single project by ID
	 * @param id - UUID of the project
	 * @returns The project object
	 * @throws Error if the project is not found or request fails
	 */
	async getProject(id: string): Promise<Project> {
		const response = await fetch(`${API_BASE_URL}/projects/${id}`);
		if (!response.ok) {
			throw new Error('Failed to fetch project');
		}
		return response.json();
	},

	/**
	 * Creates a new project
	 * @param data - Project data to create
	 * @returns The created project with generated ID and timestamps
	 * @throws Error if validation fails or request fails
	 */
	async createProject(data: CreateProjectDto): Promise<Project> {
		const response = await fetch(`${API_BASE_URL}/projects`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		if (!response.ok) {
			throw new Error('Failed to create project');
		}
		return response.json();
	},

	/**
	 * Updates an existing project
	 * @param id - UUID of the project to update
	 * @param data - Partial project data to update
	 * @returns The updated project
	 * @throws Error if project not found or request fails
	 */
	async updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
		const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		if (!response.ok) {
			throw new Error('Failed to update project');
		}
		return response.json();
	},

	/**
	 * Deletes a project
	 * @param id - UUID of the project to delete
	 * @throws Error if project not found or request fails
	 */
	async deleteProject(id: string): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
			method: 'DELETE'
		});
		if (!response.ok) {
			throw new Error('Failed to delete project');
		}
	},

	// ==================== EPICS ====================

	/**
	 * Fetches all epics from the backend
	 * @returns Array of epics
	 * @throws Error if the request fails
	 */
	async getEpics(): Promise<Epic[]> {
		const response = await fetch(`${API_BASE_URL}/epics`);
		if (!response.ok) {
			throw new Error('Failed to fetch epics');
		}
		return response.json();
	},

	/**
	 * Fetches a single epic by ID
	 * @param id - UUID of the epic
	 * @returns The epic object
	 * @throws Error if the epic is not found or request fails
	 */
	async getEpic(id: string): Promise<Epic> {
		const response = await fetch(`${API_BASE_URL}/epics/${id}`);
		if (!response.ok) {
			throw new Error('Failed to fetch epic');
		}
		return response.json();
	},

	/**
	 * Creates a new epic
	 * @param data - Epic data to create
	 * @param userId - UUID of the user creating the epic
	 * @returns The created epic with generated ID and timestamps
	 * @throws Error if validation fails or request fails
	 */
	async createEpic(data: CreateEpicDto, userId: string): Promise<Epic> {
		const response = await fetch(`${API_BASE_URL}/epics`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-user-id': userId
			},
			body: JSON.stringify(data)
		});
		if (!response.ok) {
			throw new Error('Failed to create epic');
		}
		return response.json();
	},

	/**
	 * Updates an existing epic
	 * @param id - UUID of the epic to update
	 * @param data - Partial epic data to update
	 * @param userId - UUID of the user updating the epic
	 * @returns The updated epic
	 * @throws Error if epic not found or request fails
	 */
	async updateEpic(id: string, data: UpdateEpicDto, userId: string): Promise<Epic> {
		const response = await fetch(`${API_BASE_URL}/epics/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'x-user-id': userId
			},
			body: JSON.stringify(data)
		});
		if (!response.ok) {
			throw new Error('Failed to update epic');
		}
		return response.json();
	},

	/**
	 * Deletes an epic (soft delete)
	 * @param id - UUID of the epic to delete
	 * @param userId - UUID of the user deleting the epic
	 * @throws Error if epic not found or request fails
	 */
	async deleteEpic(id: string, userId: string): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/epics/${id}`, {
			method: 'DELETE',
			headers: {
				'x-user-id': userId
			}
		});
		if (!response.ok) {
			throw new Error('Failed to delete epic');
		}
	},

	// ==================== USER STORIES ====================

	/**
	 * Fetches all user stories from the backend
	 * @returns Array of user stories
	 * @throws Error if the request fails
	 */
	async getUserStories(): Promise<UserStory[]> {
		const response = await fetch(`${API_BASE_URL}/user-stories`);
		if (!response.ok) {
			throw new Error('Failed to fetch user stories');
		}
		return response.json();
	},

	/**
	 * Fetches a single user story by ID
	 * @param id - UUID of the user story
	 * @returns The user story object
	 * @throws Error if the user story is not found or request fails
	 */
	async getUserStory(id: string): Promise<UserStory> {
		const response = await fetch(`${API_BASE_URL}/user-stories/${id}`);
		if (!response.ok) {
			throw new Error('Failed to fetch user story');
		}
		return response.json();
	},

	/**
	 * Creates a new user story
	 * @param data - User story data to create
	 * @param userId - UUID of the user creating the user story
	 * @returns The created user story with generated ID and timestamps
	 * @throws Error if validation fails or request fails
	 */
	async createUserStory(data: CreateUserStoryDto, userId: string): Promise<UserStory> {
		const response = await fetch(`${API_BASE_URL}/user-stories`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-user-id': userId
			},
			body: JSON.stringify(data)
		});
		if (!response.ok) {
			throw new Error('Failed to create user story');
		}
		return response.json();
	},

	/**
	 * Updates an existing user story
	 * @param id - UUID of the user story to update
	 * @param data - Partial user story data to update
	 * @param userId - UUID of the user updating the user story
	 * @returns The updated user story
	 * @throws Error if user story not found or request fails
	 */
	async updateUserStory(id: string, data: UpdateUserStoryDto, userId: string): Promise<UserStory> {
		const response = await fetch(`${API_BASE_URL}/user-stories/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'x-user-id': userId
			},
			body: JSON.stringify(data)
		});
		if (!response.ok) {
			throw new Error('Failed to update user story');
		}
		return response.json();
	},

	/**
	 * Deletes a user story (soft delete)
	 * @param id - UUID of the user story to delete
	 * @param userId - UUID of the user deleting the user story
	 * @throws Error if user story not found or request fails
	 */
	async deleteUserStory(id: string, userId: string): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/user-stories/${id}`, {
			method: 'DELETE',
			headers: {
				'x-user-id': userId
			}
		});
		if (!response.ok) {
			throw new Error('Failed to delete user story');
		}
	}
};
