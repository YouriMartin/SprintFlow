<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import Modal from '$lib/components/Modal.svelte';
	import {
		type Epic,
		type UserStory,
		type CreateEpicDto,
		type CreateUserStoryDto,
		EpicStatus,
		UserStoryStatus,
		UserStoryPriority
	} from '$lib/types';

	/** Temporary user ID for development */
	const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

	/** List of all epics */
	let epics: Epic[] = $state([]);

	/** List of all user stories */
	let userStories: UserStory[] = $state([]);

	/** Loading state */
	let loading: boolean = $state(true);

	/** Error message */
	let error: string | null = $state(null);

	/** Collapsed state for each epic */
	let collapsedEpics: Record<string, boolean> = $state({});

	/** Whether the create epic modal is open */
	let showCreateEpicModal: boolean = $state(false);

	/** Whether the create user story modal is open */
	let showCreateUserStoryModal: boolean = $state(false);

	/** Selected epic ID for creating a user story */
	let selectedEpicId: string | null = $state(null);

	/** Form data for creating a new epic */
	let newEpicForm: CreateEpicDto = $state({
		title: '',
		description: '',
		startDate: new Date().toISOString().split('T')[0],
		endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		status: EpicStatus.PLANNED,
		isVisibleInRoadmap: true
	});

	/** Form data for creating a new user story */
	let newUserStoryForm: CreateUserStoryDto = $state({
		title: '',
		description: '',
		status: UserStoryStatus.TODO,
		priority: UserStoryPriority.MEDIUM,
		epicId: undefined
	});

	/**
	 * Fetches epics and user stories from the API
	 */
	async function fetchData(): Promise<void> {
		try {
			loading = true;
			error = null;
			const [epicsData, userStoriesData] = await Promise.all([
				api.getEpics(),
				api.getUserStories()
			]);
			epics = epicsData;
			userStories = userStoriesData;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	/**
	 * Groups user stories by their epic ID
	 * @returns Map of epic ID to user stories array
	 */
	function getStoriesByEpic(): Map<string | null, UserStory[]> {
		const map = new Map<string | null, UserStory[]>();

		// Initialize with null key for stories without an epic
		map.set(null, []);

		// Initialize with all epic IDs
		for (const epic of epics) {
			map.set(epic.id, []);
		}

		// Group user stories
		for (const story of userStories) {
			const epicId = story.epicId ?? null;
			const existing = map.get(epicId) ?? [];
			existing.push(story);
			map.set(epicId, existing);
		}

		return map;
	}

	/**
	 * Toggles the collapsed state of an epic
	 * @param epicId - ID of the epic to toggle
	 */
	function toggleEpic(epicId: string): void {
		collapsedEpics[epicId] = !collapsedEpics[epicId];
	}

	/**
	 * Opens the create epic modal
	 */
	function openCreateEpicModal(): void {
		newEpicForm = {
			title: '',
			description: '',
			startDate: new Date().toISOString().split('T')[0],
			endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
			status: EpicStatus.PLANNED,
			isVisibleInRoadmap: true
		};
		showCreateEpicModal = true;
	}

	/**
	 * Opens the create user story modal
	 * @param epicId - Optional epic ID to pre-select
	 */
	function openCreateUserStoryModal(epicId: string | null = null): void {
		selectedEpicId = epicId;
		newUserStoryForm = {
			title: '',
			description: '',
			status: UserStoryStatus.TODO,
			priority: UserStoryPriority.MEDIUM,
			epicId: epicId ?? undefined
		};
		showCreateUserStoryModal = true;
	}

	/**
	 * Creates a new epic
	 */
	async function createEpic(): Promise<void> {
		try {
			await api.createEpic(newEpicForm, TEMP_USER_ID);
			showCreateEpicModal = false;
			await fetchData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create epic';
		}
	}

	/**
	 * Creates a new user story
	 */
	async function createUserStory(): Promise<void> {
		try {
			await api.createUserStory(newUserStoryForm, TEMP_USER_ID);
			showCreateUserStoryModal = false;
			await fetchData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create user story';
		}
	}

	/**
	 * Deletes an epic
	 * @param epicId - ID of the epic to delete
	 */
	async function deleteEpic(epicId: string): Promise<void> {
		if (!confirm('Are you sure you want to delete this epic?')) return;
		try {
			await api.deleteEpic(epicId, TEMP_USER_ID);
			await fetchData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete epic';
		}
	}

	/**
	 * Deletes a user story
	 * @param storyId - ID of the user story to delete
	 */
	async function deleteUserStory(storyId: string): Promise<void> {
		if (!confirm('Are you sure you want to delete this user story?')) return;
		try {
			await api.deleteUserStory(storyId, TEMP_USER_ID);
			await fetchData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete user story';
		}
	}

	/**
	 * Returns the CSS class for a status badge
	 * @param status - User story status
	 * @returns CSS class name
	 */
	function getStatusClass(status: UserStoryStatus): string {
		switch (status) {
			case UserStoryStatus.TODO:
				return 'status-todo';
			case UserStoryStatus.IN_PROGRESS:
				return 'status-in-progress';
			case UserStoryStatus.DONE:
				return 'status-done';
			default:
				return '';
		}
	}

	/**
	 * Returns the CSS class for a priority badge
	 * @param priority - User story priority
	 * @returns CSS class name
	 */
	function getPriorityClass(priority: UserStoryPriority): string {
		switch (priority) {
			case UserStoryPriority.LOW:
				return 'priority-low';
			case UserStoryPriority.MEDIUM:
				return 'priority-medium';
			case UserStoryPriority.HIGH:
				return 'priority-high';
			case UserStoryPriority.URGENT:
				return 'priority-urgent';
			default:
				return '';
		}
	}

	/**
	 * Returns the CSS class for an epic status
	 * @param status - Epic status
	 * @returns CSS class name
	 */
	function getEpicStatusClass(status: EpicStatus): string {
		switch (status) {
			case EpicStatus.PLANNED:
				return 'epic-planned';
			case EpicStatus.IN_PROGRESS:
				return 'epic-in-progress';
			case EpicStatus.COMPLETED:
				return 'epic-completed';
			case EpicStatus.CANCELLED:
				return 'epic-cancelled';
			default:
				return '';
		}
	}

	onMount(() => {
		fetchData();
	});

	// Derived state for grouped stories
	let storiesByEpic = $derived(getStoriesByEpic());
</script>

<div class="backlog-page">
	<header class="page-header">
		<h1>Backlog</h1>
		<div class="header-actions">
			<button class="btn btn-secondary" onclick={openCreateEpicModal}>
				+ New Epic
			</button>
			<button class="btn btn-primary" onclick={() => openCreateUserStoryModal(null)}>
				+ New User Story
			</button>
		</div>
	</header>

	{#if loading}
		<div class="loading">Loading...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else}
		<div class="backlog-content">
			<!-- Epics with their user stories -->
			{#each epics as epic (epic.id)}
				{@const stories = storiesByEpic.get(epic.id) ?? []}
				<div class="epic-group">
					<div class="epic-header" onclick={() => toggleEpic(epic.id)}>
						<div class="epic-header-left">
							<span class="collapse-icon">
								{collapsedEpics[epic.id] ? '>' : 'v'}
							</span>
							<h2 class="epic-title">{epic.title}</h2>
							<span class="epic-status {getEpicStatusClass(epic.status)}">
								{epic.status.replace('_', ' ')}
							</span>
							<span class="story-count">({stories.length})</span>
						</div>
						<div class="epic-header-right">
							<button
								class="btn btn-sm btn-ghost"
								onclick={(e) => { e.stopPropagation(); openCreateUserStoryModal(epic.id); }}
							>
								+ Story
							</button>
							<button
								class="btn btn-sm btn-danger-ghost"
								onclick={(e) => { e.stopPropagation(); deleteEpic(epic.id); }}
							>
								Delete
							</button>
						</div>
					</div>

					{#if !collapsedEpics[epic.id]}
						<div class="stories-list">
							{#if stories.length === 0}
								<p class="no-stories">No user stories in this epic</p>
							{:else}
								{#each stories as story (story.id)}
									<div class="story-card">
										<div class="story-info">
											<span class="story-title">{story.title}</span>
											{#if story.description}
												<span class="story-description">{story.description}</span>
											{/if}
										</div>
										<div class="story-meta">
											<span class="badge {getStatusClass(story.status)}">
												{story.status.replace('_', ' ')}
											</span>
											<span class="badge {getPriorityClass(story.priority)}">
												{story.priority}
											</span>
											<button
												class="btn btn-sm btn-danger-ghost"
												onclick={() => deleteUserStory(story.id)}
											>
												Delete
											</button>
										</div>
									</div>
								{/each}
							{/if}
						</div>
					{/if}
				</div>
			{/each}

			<!-- User stories without an epic -->
			{#each [storiesByEpic.get(null) ?? []] as unassignedStories}
				{#if unassignedStories.length > 0}
					<div class="epic-group unassigned">
						<div class="epic-header">
							<div class="epic-header-left">
								<h2 class="epic-title">Unassigned Stories</h2>
								<span class="story-count">({unassignedStories.length})</span>
							</div>
						</div>
						<div class="stories-list">
							{#each unassignedStories as story (story.id)}
								<div class="story-card">
									<div class="story-info">
										<span class="story-title">{story.title}</span>
										{#if story.description}
											<span class="story-description">{story.description}</span>
										{/if}
									</div>
									<div class="story-meta">
										<span class="badge {getStatusClass(story.status)}">
											{story.status.replace('_', ' ')}
										</span>
										<span class="badge {getPriorityClass(story.priority)}">
											{story.priority}
										</span>
										<button
											class="btn btn-sm btn-danger-ghost"
											onclick={() => deleteUserStory(story.id)}
										>
											Delete
										</button>
									</div>
								</div>
						{/each}
					</div>
				</div>
				{/if}
			{/each}

			<!-- Empty state -->
			{#if epics.length === 0 && userStories.length === 0}
				<div class="empty-state">
					<p>No epics or user stories yet.</p>
					<p>Create an epic to start organizing your backlog.</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Create Epic Modal -->
<Modal open={showCreateEpicModal} title="Create New Epic" onclose={() => showCreateEpicModal = false}>
	<form class="form" onsubmit={(e) => { e.preventDefault(); createEpic(); }}>
		<div class="form-group">
			<label for="epic-title">Title</label>
			<input
				id="epic-title"
				type="text"
				bind:value={newEpicForm.title}
				required
				placeholder="Enter epic title"
			/>
		</div>

		<div class="form-group">
			<label for="epic-description">Description</label>
			<textarea
				id="epic-description"
				bind:value={newEpicForm.description}
				placeholder="Enter epic description"
				rows="3"
			></textarea>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="epic-start-date">Start Date</label>
				<input
					id="epic-start-date"
					type="date"
					bind:value={newEpicForm.startDate}
					required
				/>
			</div>

			<div class="form-group">
				<label for="epic-end-date">End Date</label>
				<input
					id="epic-end-date"
					type="date"
					bind:value={newEpicForm.endDate}
					required
				/>
			</div>
		</div>

		<div class="form-group">
			<label for="epic-status">Status</label>
			<select id="epic-status" bind:value={newEpicForm.status}>
				{#each Object.values(EpicStatus) as status}
					<option value={status}>{status.replace('_', ' ')}</option>
				{/each}
			</select>
		</div>

		<div class="form-actions">
			<button type="button" class="btn btn-secondary" onclick={() => showCreateEpicModal = false}>
				Cancel
			</button>
			<button type="submit" class="btn btn-primary">
				Create Epic
			</button>
		</div>
	</form>
</Modal>

<!-- Create User Story Modal -->
<Modal open={showCreateUserStoryModal} title="Create New User Story" onclose={() => showCreateUserStoryModal = false}>
	<form class="form" onsubmit={(e) => { e.preventDefault(); createUserStory(); }}>
		<div class="form-group">
			<label for="story-title">Title</label>
			<input
				id="story-title"
				type="text"
				bind:value={newUserStoryForm.title}
				required
				placeholder="As a user, I want to..."
			/>
		</div>

		<div class="form-group">
			<label for="story-description">Description</label>
			<textarea
				id="story-description"
				bind:value={newUserStoryForm.description}
				placeholder="Enter story description"
				rows="3"
			></textarea>
		</div>

		<div class="form-group">
			<label for="story-epic">Epic</label>
			<select id="story-epic" bind:value={newUserStoryForm.epicId}>
				<option value={undefined}>No Epic</option>
				{#each epics as epic}
					<option value={epic.id}>{epic.title}</option>
				{/each}
			</select>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="story-status">Status</label>
				<select id="story-status" bind:value={newUserStoryForm.status}>
					{#each Object.values(UserStoryStatus) as status}
						<option value={status}>{status.replace('_', ' ')}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="story-priority">Priority</label>
				<select id="story-priority" bind:value={newUserStoryForm.priority}>
					{#each Object.values(UserStoryPriority) as priority}
						<option value={priority}>{priority}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="form-actions">
			<button type="button" class="btn btn-secondary" onclick={() => showCreateUserStoryModal = false}>
				Cancel
			</button>
			<button type="submit" class="btn btn-primary">
				Create User Story
			</button>
		</div>
	</form>
</Modal>

<style>
	.backlog-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.75rem;
		color: #1f2937;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
	}

	.loading,
	.error {
		text-align: center;
		padding: 2rem;
		color: #6b7280;
	}

	.error {
		color: #dc2626;
		background-color: #fef2f2;
		border-radius: 8px;
	}

	/* Epic groups */
	.epic-group {
		background-color: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		margin-bottom: 1rem;
		overflow: hidden;
	}

	.epic-group.unassigned {
		background-color: #f9fafb;
		border-style: dashed;
	}

	.epic-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		background-color: #f9fafb;
		cursor: pointer;
		user-select: none;
		transition: background-color 0.2s;
	}

	.epic-header:hover {
		background-color: #f3f4f6;
	}

	.epic-header-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.epic-header-right {
		display: flex;
		gap: 0.5rem;
	}

	.collapse-icon {
		font-family: monospace;
		width: 1rem;
		color: #6b7280;
	}

	.epic-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
	}

	.epic-status {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		text-transform: capitalize;
	}

	.epic-planned {
		background-color: #e0e7ff;
		color: #3730a3;
	}

	.epic-in-progress {
		background-color: #fef3c7;
		color: #92400e;
	}

	.epic-completed {
		background-color: #d1fae5;
		color: #065f46;
	}

	.epic-cancelled {
		background-color: #fee2e2;
		color: #991b1b;
	}

	.story-count {
		font-size: 0.875rem;
		color: #6b7280;
	}

	/* Stories list */
	.stories-list {
		padding: 0.5rem;
	}

	.no-stories {
		text-align: center;
		color: #9ca3af;
		padding: 1rem;
		font-style: italic;
	}

	.story-card {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 0.875rem 1rem;
		background-color: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		margin-bottom: 0.5rem;
		transition: box-shadow 0.2s;
	}

	.story-card:hover {
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.story-card:last-child {
		margin-bottom: 0;
	}

	.story-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
		min-width: 0;
	}

	.story-title {
		font-weight: 500;
		color: #1f2937;
	}

	.story-description {
		font-size: 0.875rem;
		color: #6b7280;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.story-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	/* Badges */
	.badge {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		text-transform: capitalize;
	}

	.status-todo {
		background-color: #e5e7eb;
		color: #374151;
	}

	.status-in-progress {
		background-color: #dbeafe;
		color: #1e40af;
	}

	.status-done {
		background-color: #d1fae5;
		color: #065f46;
	}

	.priority-low {
		background-color: #f3f4f6;
		color: #6b7280;
	}

	.priority-medium {
		background-color: #fef3c7;
		color: #92400e;
	}

	.priority-high {
		background-color: #fed7aa;
		color: #c2410c;
	}

	.priority-urgent {
		background-color: #fee2e2;
		color: #dc2626;
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s, color 0.2s;
	}

	.btn-primary {
		background-color: #6366f1;
		color: white;
	}

	.btn-primary:hover {
		background-color: #4f46e5;
	}

	.btn-secondary {
		background-color: #e5e7eb;
		color: #374151;
	}

	.btn-secondary:hover {
		background-color: #d1d5db;
	}

	.btn-ghost {
		background-color: transparent;
		color: #6366f1;
	}

	.btn-ghost:hover {
		background-color: #eef2ff;
	}

	.btn-danger-ghost {
		background-color: transparent;
		color: #dc2626;
	}

	.btn-danger-ghost:hover {
		background-color: #fef2f2;
	}

	.btn-sm {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
	}

	.empty-state p {
		margin: 0.5rem 0;
	}

	/* Form styles */
	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 80px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}
</style>
