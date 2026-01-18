import type { Task, CreateTaskDto, UpdateTaskDto } from './types';
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
	}
};
