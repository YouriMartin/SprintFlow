<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import { TaskStatus, TaskPriority, type Task, type CreateTaskDto } from '$lib/types';

	/** List of tasks loaded from the API */
	let tasks: Task[] = $state([]);

	/** Loading state while fetching tasks */
	let loading: boolean = $state(true);

	/** Error message if API call fails */
	let error: string | null = $state(null);

	/** Whether the create task form is visible */
	let showForm: boolean = $state(false);

	/** Form data for creating a new task */
	let formData: CreateTaskDto = $state({
		title: '',
		description: '',
		status: TaskStatus.TODO,
		priority: TaskPriority.MEDIUM
	});

	/**
	 * Loads all tasks from the API
	 */
	async function loadTasks(): Promise<void> {
		try {
			loading = true;
			tasks = await api.getTasks();
			error = null;
		} catch (err) {
			error = 'Failed to load tasks';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Handles form submission to create a new task
	 * @param e - Form submit event
	 */
	async function handleCreateTask(e: SubmitEvent): Promise<void> {
		e.preventDefault();
		try {
			await api.createTask(formData);
			formData = {
				title: '',
				description: '',
				status: TaskStatus.TODO,
				priority: TaskPriority.MEDIUM
			};
			showForm = false;
			await loadTasks();
		} catch (err) {
			error = 'Failed to create task';
			console.error(err);
		}
	}

	/**
	 * Deletes a task by ID
	 * @param id - UUID of the task to delete
	 */
	async function handleDeleteTask(id: string): Promise<void> {
		try {
			await api.deleteTask(id);
			await loadTasks();
		} catch (err) {
			error = 'Failed to delete task';
			console.error(err);
		}
	}

	/**
	 * Returns CSS class for task status badge
	 * @param status - Task status
	 * @returns CSS class name
	 */
	function getStatusClass(status: TaskStatus): string {
		switch (status) {
			case TaskStatus.TODO:
				return 'badge-gray';
			case TaskStatus.IN_PROGRESS:
				return 'badge-blue';
			case TaskStatus.DONE:
				return 'badge-green';
			default:
				return 'badge-gray';
		}
	}

	/**
	 * Returns CSS class for task priority badge
	 * @param priority - Task priority
	 * @returns CSS class name
	 */
	function getPriorityClass(priority: TaskPriority): string {
		switch (priority) {
			case TaskPriority.LOW:
				return 'badge-gray';
			case TaskPriority.MEDIUM:
				return 'badge-yellow';
			case TaskPriority.HIGH:
				return 'badge-orange';
			case TaskPriority.URGENT:
				return 'badge-red';
			default:
				return 'badge-gray';
		}
	}

	/**
	 * Formats status for display
	 * @param status - Task status
	 * @returns Formatted status string
	 */
	function formatStatus(status: TaskStatus): string {
		return status.replace('_', ' ');
	}

	onMount(() => {
		loadTasks();
	});
</script>

<div class="page">
	<header class="page-header">
		<div>
			<h1>Dashboard</h1>
			<p class="subtitle">Welcome to SprintFlow</p>
		</div>
	</header>

	{#if error}
		<div class="error-banner">
			{error}
		</div>
	{/if}

	<div class="actions">
		<button class="btn btn-primary" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Cancel' : 'New Task'}
		</button>
	</div>

	{#if showForm}
		<div class="card form-card">
			<h2>Create New Task</h2>
			<form onsubmit={handleCreateTask}>
				<div class="form-group">
					<label for="title">Title</label>
					<input
						type="text"
						id="title"
						required
						bind:value={formData.title}
						class="input"
					/>
				</div>

				<div class="form-group">
					<label for="description">Description</label>
					<textarea
						id="description"
						bind:value={formData.description}
						class="input textarea"
						rows="3"
					></textarea>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="status">Status</label>
						<select id="status" bind:value={formData.status} class="input">
							<option value={TaskStatus.TODO}>To Do</option>
							<option value={TaskStatus.IN_PROGRESS}>In Progress</option>
							<option value={TaskStatus.DONE}>Done</option>
						</select>
					</div>

					<div class="form-group">
						<label for="priority">Priority</label>
						<select id="priority" bind:value={formData.priority} class="input">
							<option value={TaskPriority.LOW}>Low</option>
							<option value={TaskPriority.MEDIUM}>Medium</option>
							<option value={TaskPriority.HIGH}>High</option>
							<option value={TaskPriority.URGENT}>Urgent</option>
						</select>
					</div>
				</div>

				<button type="submit" class="btn btn-success">Create Task</button>
			</form>
		</div>
	{/if}

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Loading tasks...</p>
		</div>
	{:else if tasks.length === 0}
		<div class="card empty-state">
			<p>No tasks yet. Create your first task!</p>
		</div>
	{:else}
		<div class="task-list">
			{#each tasks as task (task.id)}
				<div class="card task-card">
					<div class="task-header">
						<h3>{task.title}</h3>
						<button class="btn btn-danger btn-small" onclick={() => handleDeleteTask(task.id)}>
							Delete
						</button>
					</div>

					{#if task.description}
						<p class="task-description">{task.description}</p>
					{/if}

					<div class="badges">
						<span class="badge {getStatusClass(task.status)}">
							{formatStatus(task.status)}
						</span>
						<span class="badge {getPriorityClass(task.priority)}">
							{task.priority}
						</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page {
		max-width: 1200px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.page-header h1 {
		font-size: 1.75rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.error-banner {
		background-color: #fef2f2;
		color: #dc2626;
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.actions {
		margin-bottom: 1.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.btn-primary {
		background-color: #2563eb;
		color: white;
	}

	.btn-primary:hover {
		background-color: #1d4ed8;
	}

	.btn-success {
		background-color: #16a34a;
		color: white;
	}

	.btn-success:hover {
		background-color: #15803d;
	}

	.btn-danger {
		background-color: transparent;
		color: #dc2626;
	}

	.btn-danger:hover {
		color: #b91c1c;
	}

	.btn-small {
		padding: 0.25rem 0.75rem;
		font-size: 0.875rem;
	}

	.card {
		background-color: white;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
	}

	.form-card {
		margin-bottom: 2rem;
	}

	.form-card h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.25rem;
	}

	.input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.textarea {
		resize: vertical;
		min-height: 80px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.loading {
		text-align: center;
		padding: 3rem;
	}

	.spinner {
		display: inline-block;
		width: 3rem;
		height: 3rem;
		border: 3px solid #e5e7eb;
		border-top-color: #2563eb;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading p {
		margin-top: 1rem;
		color: #6b7280;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
	}

	.task-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.task-card {
		transition: box-shadow 0.2s;
	}

	.task-card:hover {
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.task-header h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
	}

	.task-description {
		color: #6b7280;
		margin-bottom: 1rem;
	}

	.badges {
		display: flex;
		gap: 0.5rem;
	}

	.badge {
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.badge-gray {
		background-color: #e5e7eb;
		color: #374151;
	}

	.badge-blue {
		background-color: #dbeafe;
		color: #1d4ed8;
	}

	.badge-green {
		background-color: #dcfce7;
		color: #16a34a;
	}

	.badge-yellow {
		background-color: #fef3c7;
		color: #d97706;
	}

	.badge-orange {
		background-color: #ffedd5;
		color: #ea580c;
	}

	.badge-red {
		background-color: #fee2e2;
		color: #dc2626;
	}

	@media (max-width: 640px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.header h1 {
			font-size: 2rem;
		}
	}
</style>
