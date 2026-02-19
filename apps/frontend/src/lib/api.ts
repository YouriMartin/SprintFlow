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
import { auth } from './auth.svelte';

const API_BASE_URL = PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Performs an authenticated fetch, automatically injecting the Bearer token.
 * On a 401 response, attempts a silent token refresh and retries once.
 * @param input - URL or Request object
 * @param init - Fetch options (headers will be augmented with Authorization)
 * @returns The Response after at most one retry
 */
async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
	const buildHeaders = (token: string | null): HeadersInit => ({
		...(init.headers as Record<string, string>),
		...(token ? { Authorization: `Bearer ${token}` } : {})
	});

	const response = await fetch(input, {
		...init,
		credentials: 'include',
		headers: buildHeaders(auth.token)
	});

	if (response.status !== 401) {
		return response;
	}

	// Attempt silent refresh
	const refreshed = await auth.refresh();
	if (!refreshed) {
		return response;
	}

	// Retry original request with new token
	return fetch(input, {
		...init,
		credentials: 'include',
		headers: buildHeaders(auth.token)
	});
}

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
		const response = await authFetch(`${API_BASE_URL}/tasks`);
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
		const response = await authFetch(`${API_BASE_URL}/tasks/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
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
		const response = await authFetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
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
		const response = await authFetch(`${API_BASE_URL}/projects`);
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
		const response = await authFetch(`${API_BASE_URL}/projects/${id}`);
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
		const response = await authFetch(`${API_BASE_URL}/projects`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
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
		const response = await authFetch(`${API_BASE_URL}/projects/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
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
		const response = await authFetch(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE' });
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
		const response = await authFetch(`${API_BASE_URL}/epics`);
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
		const response = await authFetch(`${API_BASE_URL}/epics/${id}`);
		if (!response.ok) {
			throw new Error('Failed to fetch epic');
		}
		return response.json();
	},

	/**
	 * Creates a new epic
	 * @param data - Epic data to create
	 * @returns The created epic with generated ID and timestamps
	 * @throws Error if validation fails or request fails
	 */
	async createEpic(data: CreateEpicDto): Promise<Epic> {
		const response = await authFetch(`${API_BASE_URL}/epics`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
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
	 * @returns The updated epic
	 * @throws Error if epic not found or request fails
	 */
	async updateEpic(id: string, data: UpdateEpicDto): Promise<Epic> {
		const response = await authFetch(`${API_BASE_URL}/epics/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
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
	 * @throws Error if epic not found or request fails
	 */
	async deleteEpic(id: string): Promise<void> {
		const response = await authFetch(`${API_BASE_URL}/epics/${id}`, { method: 'DELETE' });
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
		const response = await authFetch(`${API_BASE_URL}/user-stories`);
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
		const response = await authFetch(`${API_BASE_URL}/user-stories/${id}`);
		if (!response.ok) {
			throw new Error('Failed to fetch user story');
		}
		return response.json();
	},

	/**
	 * Creates a new user story
	 * @param data - User story data to create
	 * @returns The created user story with generated ID and timestamps
	 * @throws Error if validation fails or request fails
	 */
	async createUserStory(data: CreateUserStoryDto): Promise<UserStory> {
		const response = await authFetch(`${API_BASE_URL}/user-stories`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
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
	 * @returns The updated user story
	 * @throws Error if user story not found or request fails
	 */
	async updateUserStory(id: string, data: UpdateUserStoryDto): Promise<UserStory> {
		const response = await authFetch(`${API_BASE_URL}/user-stories/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
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
	 * @throws Error if user story not found or request fails
	 */
	async deleteUserStory(id: string): Promise<void> {
		const response = await authFetch(`${API_BASE_URL}/user-stories/${id}`, { method: 'DELETE' });
		if (!response.ok) {
			throw new Error('Failed to delete user story');
		}
	},

	// ==================== SETUP ====================

	/**
	 * Checks whether initial application setup is required (no users in database)
	 * @returns Object with required flag set to true if setup is needed
	 * @throws Error if the request fails
	 */
	async getSetupStatus(): Promise<{ required: boolean }> {
		const response = await fetch(`${API_BASE_URL}/setup/status`);
		if (!response.ok) {
			throw new Error('Failed to fetch setup status');
		}
		return response.json();
	},

	/**
	 * Creates the first superadmin user during initial application setup
	 * @param data - Setup data with name, email, and password
	 * @throws Error if setup already completed or request fails
	 */
	async createSetup(data: { name: string; email: string; password: string }): Promise<void> {
		const response = await fetch(`${API_BASE_URL}/setup`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.message || 'Failed to complete setup');
		}
	},

	// ==================== AUTH ====================

	/**
	 * Authenticates a user with email and password.
	 * Sets the HTTP-only refresh token cookie on the browser.
	 * @param email - User email
	 * @param password - User password
	 * @returns Access token and public user fields
	 * @throws Error if credentials are invalid
	 */
	async login(email: string, password: string): Promise<{ accessToken: string; user: import('./types').AuthUser }> {
		const response = await fetch(`${API_BASE_URL}/auth/login`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});
		if (!response.ok) {
			const err = await response.json().catch(() => ({}));
			throw new Error(err.message || 'Login failed');
		}
		return response.json();
	}
};
