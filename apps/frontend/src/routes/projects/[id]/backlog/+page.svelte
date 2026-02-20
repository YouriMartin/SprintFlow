<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import Modal from '$lib/components/Modal.svelte';
	import {
		type Epic,
		type UserStory,
		type Project,
		type CreateEpicDto,
		type CreateUserStoryDto,
		EpicStatus,
		UserStoryStatus,
		UserStoryPriority
	} from '$lib/types';

	/** Temporary user ID for development */
	const TEMP_USER_ID = '00000000-0000-0000-0000-000000000001';

	/** Project ID from route params */
	let projectId: string = $state('');

	/** Current project */
	let project: Project | null = $state(null);

	/** List of all epics for this project */
	let epics: Epic[] = $state([]);

	/** List of all user stories belonging to epics of this project */
	let userStories: UserStory[] = $state([]);

	/** Loading state */
	let loading: boolean = $state(true);

	/** Error message */
	let error: string | null = $state(null);

	/** Collapsed state for each epic (expanded by default) */
	let collapsedEpics: Record<string, boolean> = $state({});

	/** Whether the create epic modal is open */
	let showCreateEpicModal: boolean = $state(false);

	/** Whether the create user story modal is open */
	let showCreateUserStoryModal: boolean = $state(false);

	/** Epic ID that is receiving a new user story */
	let targetEpicId: string = $state('');

	/** Epic currently shown in the detail modal */
	let selectedEpic: Epic | null = $state(null);

	/** User story currently shown in the detail modal */
	let selectedStory: UserStory | null = $state(null);

	/** Form data for creating a new epic */
	let newEpicForm: CreateEpicDto = $state({
		title: '',
		description: '',
		startDate: new Date().toISOString().split('T')[0],
		endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		status: EpicStatus.PLANNED,
		isVisibleInRoadmap: true,
		projectId: ''
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
	 * Fetches project, epics and user stories from the API.
	 * Only stories that belong to one of this project's epics are loaded.
	 */
	async function fetchData(): Promise<void> {
		try {
			loading = true;
			error = null;
			const [projectData, epicsData, userStoriesData] = await Promise.all([
				api.getProject(projectId),
				api.getEpics(),
				api.getUserStories()
			]);
			project = projectData;
			epics = epicsData.filter((e) => e.projectId === projectId);
			const epicIds = new Set(epics.map((e) => e.id));
			userStories = userStoriesData.filter((s) => s.epicId != null && epicIds.has(s.epicId));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	/**
	 * Returns user stories that belong to a given epic.
	 * @param epicId - The epic's ID
	 */
	function getStoriesForEpic(epicId: string): UserStory[] {
		return userStories.filter((s) => s.epicId === epicId);
	}

	/**
	 * Toggles the collapsed/expanded state of an epic card.
	 * @param epicId - ID of the epic to toggle
	 */
	function toggleEpic(epicId: string): void {
		collapsedEpics[epicId] = !collapsedEpics[epicId];
	}

	/**
	 * Opens the create epic modal with a fresh form.
	 */
	function openCreateEpicModal(): void {
		newEpicForm = {
			title: '',
			description: '',
			startDate: new Date().toISOString().split('T')[0],
			endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
			status: EpicStatus.PLANNED,
			isVisibleInRoadmap: true,
			projectId
		};
		showCreateEpicModal = true;
	}

	/**
	 * Opens the create user story modal pre-bound to a specific epic.
	 * @param epicId - The epic the new story will belong to
	 */
	function openCreateUserStoryModal(epicId: string): void {
		targetEpicId = epicId;
		newUserStoryForm = {
			title: '',
			description: '',
			status: UserStoryStatus.TODO,
			priority: UserStoryPriority.MEDIUM,
			epicId
		};
		showCreateUserStoryModal = true;
	}

	/**
	 * Submits the create epic form.
	 */
	async function createEpic(): Promise<void> {
		try {
			await api.createEpic(newEpicForm);
			showCreateEpicModal = false;
			await fetchData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create epic';
		}
	}

	/**
	 * Submits the create user story form.
	 */
	async function createUserStory(): Promise<void> {
		try {
			await api.createUserStory(newUserStoryForm);
			showCreateUserStoryModal = false;
			await fetchData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create user story';
		}
	}

	/**
	 * Deletes an epic after user confirmation.
	 * @param epicId - ID of the epic to delete
	 */
	async function deleteEpic(epicId: string): Promise<void> {
		if (!confirm('Delete this epic? All its user stories will also be removed.')) return;
		try {
			await api.deleteEpic(epicId);
			await fetchData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete epic';
		}
	}

	/**
	 * Deletes a user story after user confirmation.
	 * @param storyId - ID of the user story to delete
	 */
	async function deleteUserStory(storyId: string): Promise<void> {
		if (!confirm('Delete this user story?')) return;
		try {
			await api.deleteUserStory(storyId);
			await fetchData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete user story';
		}
	}

	/**
	 * Returns the CSS class for a user story status badge.
	 * @param status - User story status
	 */
	function getStatusClass(status: UserStoryStatus): string {
		const map: Record<UserStoryStatus, string> = {
			[UserStoryStatus.TODO]: 'status-todo',
			[UserStoryStatus.IN_PROGRESS]: 'status-in-progress',
			[UserStoryStatus.DONE]: 'status-done'
		};
		return map[status] ?? '';
	}

	/**
	 * Returns the CSS class for a user story priority badge.
	 * @param priority - User story priority
	 */
	function getPriorityClass(priority: UserStoryPriority): string {
		const map: Record<UserStoryPriority, string> = {
			[UserStoryPriority.LOW]: 'priority-low',
			[UserStoryPriority.MEDIUM]: 'priority-medium',
			[UserStoryPriority.HIGH]: 'priority-high',
			[UserStoryPriority.URGENT]: 'priority-urgent'
		};
		return map[priority] ?? '';
	}

	/**
	 * Returns the CSS class for an epic status badge.
	 * @param status - Epic status
	 */
	function getEpicStatusClass(status: EpicStatus): string {
		const map: Record<EpicStatus, string> = {
			[EpicStatus.PLANNED]: 'epic-planned',
			[EpicStatus.IN_PROGRESS]: 'epic-in-progress',
			[EpicStatus.COMPLETED]: 'epic-completed',
			[EpicStatus.CANCELLED]: 'epic-cancelled'
		};
		return map[status] ?? '';
	}

	/**
	 * Formats an ISO date string to a short locale date.
	 * @param iso - ISO 8601 date string
	 */
	function formatDate(iso: string | null | undefined): string {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	}

	/**
	 * Opens the detail modal for an epic.
	 * @param epic - The epic to display
	 */
	function openEpicDetail(epic: Epic): void {
		selectedEpic = epic;
	}

	/**
	 * Opens the detail modal for a user story.
	 * @param story - The user story to display
	 */
	function openStoryDetail(story: UserStory): void {
		selectedStory = story;
	}

	// Sync projectId from route params and trigger data load
	$effect(() => {
		const unsubscribe = page.subscribe((p) => {
			const newProjectId = p.params.id;
			if (newProjectId && newProjectId !== projectId) {
				projectId = newProjectId;
				void fetchData();
			}
		});
		return unsubscribe;
	});

	onMount(() => {
		// Initial fetch is triggered by the $effect above when projectId is set
	});
</script>

<div class="backlog-page">
	<header class="page-header">
		<div class="page-title">
			<h1>Backlog</h1>
			{#if project}
				<span class="project-name">{project.name}</span>
			{/if}
		</div>
		<button class="btn btn-primary" onclick={openCreateEpicModal}>+ New Epic</button>
	</header>

	{#if loading}
		<div class="loading">Loading…</div>
	{:else if error}
		<div class="error-banner">{error}</div>
	{:else if epics.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📋</div>
			<p class="empty-title">No epics yet</p>
			<p class="empty-sub">Create an epic to start organising your backlog.</p>
			<button class="btn btn-primary" onclick={openCreateEpicModal}>+ New Epic</button>
		</div>
	{:else}
		<div class="epics-list">
			{#each epics as epic (epic.id)}
				{@const stories = getStoriesForEpic(epic.id)}
				{@const collapsed = !!collapsedEpics[epic.id]}

				<div class="epic-card">
					<!-- Epic card header -->
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div class="epic-header" onclick={() => toggleEpic(epic.id)}>
						<div class="epic-header-left">
							<span class="chevron" class:collapsed>{collapsed ? '▶' : '▼'}</span>
							<div class="epic-meta">
								<div class="epic-title-row">
									<button
										class="title-link"
										onclick={(e) => { e.stopPropagation(); openEpicDetail(epic); }}
									>{epic.title}</button>
									<span class="badge {getEpicStatusClass(epic.status)}">
										{epic.status.replace('_', ' ')}
									</span>
								</div>
								{#if epic.description}
									<span class="epic-desc">{epic.description}</span>
								{/if}
								<div class="epic-dates">
									<span>{formatDate(epic.startDate)} → {formatDate(epic.endDate)}</span>
									<span class="story-count">{stories.length} {stories.length === 1 ? 'story' : 'stories'}</span>
								</div>
							</div>
						</div>

						<div class="epic-header-right">
							<button
								class="btn btn-sm btn-ghost"
								onclick={(e) => { e.stopPropagation(); openCreateUserStoryModal(epic.id); }}
							>
								+ Add Story
							</button>
							<button
								class="btn btn-sm btn-danger-ghost btn-icon"
								aria-label="Delete epic"
								onclick={(e) => { e.stopPropagation(); void deleteEpic(epic.id); }}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="3 6 5 6 21 6"/>
									<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
									<path d="M10 11v6M14 11v6"/>
									<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
								</svg>
							</button>
						</div>
					</div>

					<!-- Stories table -->
					{#if !collapsed}
						<div class="stories-section">
							{#if stories.length === 0}
								<p class="no-stories">
									No user stories yet —
									<button
										class="inline-link"
										onclick={() => openCreateUserStoryModal(epic.id)}
									>add one</button>
								</p>
							{:else}
								<table class="stories-table">
									<thead>
										<tr>
											<th class="col-title">Title</th>
											<th class="col-desc">Description</th>
											<th class="col-status">Status</th>
											<th class="col-priority">Priority</th>
											<th class="col-actions"></th>
										</tr>
									</thead>
									<tbody>
										{#each stories as story (story.id)}
											<tr class="story-row">
												<td class="col-title">
													<span class="story-title">{story.title}</span>
												</td>
												<td class="col-desc">
													<span class="story-desc-text">{story.description ?? '—'}</span>
												</td>
												<td class="col-status">
													<span class="badge {getStatusClass(story.status)}">
														{story.status.replace('_', ' ')}
													</span>
												</td>
												<td class="col-priority">
													<span class="badge {getPriorityClass(story.priority)}">
														{story.priority}
													</span>
												</td>
												<td class="col-actions">
													<button
														class="btn btn-sm btn-danger-ghost btn-icon"
														aria-label="Delete story"
														onclick={() => void deleteUserStory(story.id)}
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
															<polyline points="3 6 5 6 21 6"/>
															<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
															<path d="M10 11v6M14 11v6"/>
															<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
														</svg>
													</button>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create Epic Modal -->
<Modal open={showCreateEpicModal} title="Create New Epic" onclose={() => (showCreateEpicModal = false)}>
	<form class="form" onsubmit={(e) => { e.preventDefault(); void createEpic(); }}>
		<div class="form-group">
			<label for="epic-title">Title <span class="required">*</span></label>
			<input
				id="epic-title"
				type="text"
				bind:value={newEpicForm.title}
				required
				placeholder="Epic title"
			/>
		</div>

		<div class="form-group">
			<label for="epic-description">Description</label>
			<textarea
				id="epic-description"
				bind:value={newEpicForm.description}
				placeholder="What does this epic cover?"
				rows="3"
			></textarea>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="epic-start-date">Start Date <span class="required">*</span></label>
				<input id="epic-start-date" type="date" bind:value={newEpicForm.startDate} required />
			</div>
			<div class="form-group">
				<label for="epic-end-date">End Date <span class="required">*</span></label>
				<input id="epic-end-date" type="date" bind:value={newEpicForm.endDate} required />
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
			<button type="button" class="btn btn-secondary" onclick={() => (showCreateEpicModal = false)}>
				Cancel
			</button>
			<button type="submit" class="btn btn-primary">Create Epic</button>
		</div>
	</form>
</Modal>

<!-- Create User Story Modal -->
<Modal
	open={showCreateUserStoryModal}
	title="Add User Story"
	onclose={() => (showCreateUserStoryModal = false)}
>
	<form class="form" onsubmit={(e) => { e.preventDefault(); void createUserStory(); }}>
		<div class="form-group">
			<label for="story-title">Title <span class="required">*</span></label>
			<input
				id="story-title"
				type="text"
				bind:value={newUserStoryForm.title}
				required
				placeholder="As a user, I want to…"
			/>
		</div>

		<div class="form-group">
			<label for="story-description">Description</label>
			<textarea
				id="story-description"
				bind:value={newUserStoryForm.description}
				placeholder="Acceptance criteria, context…"
				rows="3"
			></textarea>
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
			<button
				type="button"
				class="btn btn-secondary"
				onclick={() => (showCreateUserStoryModal = false)}
			>
				Cancel
			</button>
			<button type="submit" class="btn btn-primary">Add Story</button>
		</div>
	</form>
</Modal>

<!-- Epic detail modal -->
<Modal open={!!selectedEpic} title="Epic details" onclose={() => (selectedEpic = null)}>
	{#if selectedEpic}
		<div class="detail-body">
			<div class="detail-header-row">
				<h3 class="detail-title">{selectedEpic.title}</h3>
				<span class="badge {getEpicStatusClass(selectedEpic.status)}">
					{selectedEpic.status.replace('_', ' ')}
				</span>
			</div>

			{#if selectedEpic.description}
				<p class="detail-description">{selectedEpic.description}</p>
			{/if}

			<dl class="detail-grid">
				<div class="detail-field">
					<dt>Start date</dt>
					<dd>{formatDate(selectedEpic.startDate)}</dd>
				</div>
				<div class="detail-field">
					<dt>End date</dt>
					<dd>{formatDate(selectedEpic.endDate)}</dd>
				</div>
				<div class="detail-field">
					<dt>Visible in roadmap</dt>
					<dd>{selectedEpic.isVisibleInRoadmap ? 'Yes' : 'No'}</dd>
				</div>
				<div class="detail-field">
					<dt>Stories</dt>
					<dd>{getStoriesForEpic(selectedEpic.id).length}</dd>
				</div>
				<div class="detail-field">
					<dt>Created</dt>
					<dd>{formatDate(selectedEpic.createdAt)}</dd>
				</div>
				<div class="detail-field">
					<dt>Last updated</dt>
					<dd>{formatDate(selectedEpic.updatedAt)}</dd>
				</div>
			</dl>
		</div>
	{/if}
</Modal>

<!-- User story detail modal -->
<Modal open={!!selectedStory} title="User story details" onclose={() => (selectedStory = null)}>
	{#if selectedStory}
		<div class="detail-body">
			<div class="detail-header-row">
				<h3 class="detail-title">{selectedStory.title}</h3>
				<div class="detail-badges">
					<span class="badge {getStatusClass(selectedStory.status)}">
						{selectedStory.status.replace('_', ' ')}
					</span>
					<span class="badge {getPriorityClass(selectedStory.priority)}">
						{selectedStory.priority}
					</span>
				</div>
			</div>

			{#if selectedStory.description}
				<p class="detail-description">{selectedStory.description}</p>
			{/if}

			<dl class="detail-grid">
				{#if selectedStory.assignee}
					<div class="detail-field">
						<dt>Assignee</dt>
						<dd>{selectedStory.assignee}</dd>
					</div>
				{/if}
				{#if selectedStory.dueDate}
					<div class="detail-field">
						<dt>Due date</dt>
						<dd>{formatDate(selectedStory.dueDate)}</dd>
					</div>
				{/if}
				{#if selectedStory.epicId}
					<div class="detail-field">
						<dt>Epic</dt>
						<dd>{epics.find((e) => e.id === selectedStory?.epicId)?.title ?? '—'}</dd>
					</div>
				{/if}
				{#if selectedStory.sprintId}
					<div class="detail-field">
						<dt>Sprint</dt>
						<dd>{selectedStory.sprintId}</dd>
					</div>
				{/if}
				<div class="detail-field">
					<dt>Created</dt>
					<dd>{formatDate(selectedStory.createdAt)}</dd>
				</div>
				<div class="detail-field">
					<dt>Last updated</dt>
					<dd>{formatDate(selectedStory.updatedAt)}</dd>
				</div>
			</dl>
		</div>
	{/if}
</Modal>

<style>
	/* ── Page shell ── */
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

	.page-title {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
	}

	.page-title h1 {
		margin: 0;
		font-size: 1.75rem;
		color: #1f2937;
	}

	.project-name {
		font-size: 1rem;
		color: #6b7280;
	}

	/* ── States ── */
	.loading {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
	}

	.error-banner {
		padding: 0.875rem 1rem;
		background-color: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 8px;
		color: #dc2626;
		font-size: 0.875rem;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 4rem 2rem;
		color: #6b7280;
		text-align: center;
	}

	.empty-icon {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.empty-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #374151;
	}

	.empty-sub {
		margin: 0 0 1rem;
		font-size: 0.875rem;
	}

	/* ── Epic cards ── */
	.epics-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.epic-card {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		overflow: hidden;
	}

	.epic-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 1rem 1.25rem;
		background-color: #f9fafb;
		cursor: pointer;
		user-select: none;
		transition: background-color 0.15s;
		gap: 1rem;
	}

	.epic-header:hover {
		background-color: #f3f4f6;
	}

	.epic-header-left {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.chevron {
		font-size: 0.65rem;
		color: #9ca3af;
		margin-top: 0.35rem;
		flex-shrink: 0;
		transition: transform 0.15s;
	}

	.epic-meta {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.epic-title-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.epic-title {
		font-weight: 600;
		font-size: 0.9375rem;
		color: #1f2937;
	}

	.epic-desc {
		font-size: 0.8125rem;
		color: #6b7280;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.epic-dates {
		display: flex;
		gap: 1rem;
		font-size: 0.75rem;
		color: #9ca3af;
		margin-top: 0.125rem;
	}

	.story-count {
		font-weight: 500;
		color: #6b7280;
	}

	.epic-header-right {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	/* ── Epic status badges ── */
	.epic-planned { background-color: #e0e7ff; color: #3730a3; }
	.epic-in-progress { background-color: #fef3c7; color: #92400e; }
	.epic-completed { background-color: #d1fae5; color: #065f46; }
	.epic-cancelled { background-color: #fee2e2; color: #991b1b; }

	/* ── Stories table ── */
	.stories-section {
		padding: 0.75rem 1.25rem 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.no-stories {
		margin: 0.5rem 0;
		font-size: 0.875rem;
		color: #9ca3af;
		font-style: italic;
	}

	.inline-link {
		background: none;
		border: none;
		padding: 0;
		color: #6366f1;
		font-size: inherit;
		cursor: pointer;
		text-decoration: underline;
		font-style: normal;
	}

	.stories-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.stories-table thead th {
		text-align: left;
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #9ca3af;
		border-bottom: 1px solid #e5e7eb;
	}

	.story-row td {
		padding: 0.625rem 0.75rem;
		vertical-align: middle;
		border-bottom: 1px solid #f3f4f6;
		color: #374151;
	}

	.story-row:last-child td {
		border-bottom: none;
	}

	.story-row:hover td {
		background-color: #fafafa;
	}

	/* Column widths */
	.col-title   { width: 28%; }
	.col-desc    { width: 36%; }
	.col-status  { width: 12%; }
	.col-priority{ width: 12%; }
	.col-actions { width: 12%; text-align: right; }

	.story-title {
		font-weight: 500;
		color: #1f2937;
	}

	.story-desc-text {
		color: #6b7280;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* ── Badges ── */
	.badge {
		display: inline-block;
		font-size: 0.72rem;
		font-weight: 500;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		text-transform: capitalize;
		white-space: nowrap;
	}

	.status-todo       { background-color: #e5e7eb; color: #374151; }
	.status-in-progress{ background-color: #dbeafe; color: #1e40af; }
	.status-done       { background-color: #d1fae5; color: #065f46; }

	.priority-low    { background-color: #f3f4f6; color: #6b7280; }
	.priority-medium { background-color: #fef3c7; color: #92400e; }
	.priority-high   { background-color: #fed7aa; color: #c2410c; }
	.priority-urgent { background-color: #fee2e2; color: #dc2626; }

	/* ── Buttons ── */
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
		transition: background-color 0.15s, color 0.15s;
	}

	.btn-sm { padding: 0.25rem 0.6rem; font-size: 0.75rem; }

	.btn-primary { background-color: #6366f1; color: #fff; }
	.btn-primary:hover { background-color: #4f46e5; }

	.btn-secondary { background-color: #e5e7eb; color: #374151; }
	.btn-secondary:hover { background-color: #d1d5db; }

	.btn-ghost { background-color: transparent; color: #6366f1; }
	.btn-ghost:hover { background-color: #eef2ff; }

	.btn-danger-ghost { background-color: transparent; color: #dc2626; }
	.btn-danger-ghost:hover { background-color: #fef2f2; }

	.btn-icon { padding: 0.25rem; width: 28px; height: 28px; }

	/* ── Clickable titles ── */
	.title-link {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		cursor: pointer;
		font: inherit;
		color: #1f2937;
		text-align: left;
		font-weight: 600;
	}
	.title-link:hover {
		color: #6366f1;
		text-decoration: underline;
	}

	/* ── Detail modals ── */
	.detail-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.detail-header-row {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.detail-title {
		margin: 0;
		font-size: 1.0625rem;
		font-weight: 600;
		color: #1f2937;
		flex: 1;
	}
	.detail-badges {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.detail-description {
		margin: 0;
		font-size: 0.875rem;
		color: #4b5563;
		line-height: 1.6;
		white-space: pre-wrap;
	}
	.detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem 1.5rem;
		margin: 0;
		padding-top: 0.5rem;
		border-top: 1px solid #f3f4f6;
	}
	.detail-field {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.detail-field dt {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #9ca3af;
	}
	.detail-field dd {
		margin: 0;
		font-size: 0.875rem;
		color: #1f2937;
	}

	/* ── Form ── */
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

	.required { color: #dc2626; }

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		transition: border-color 0.15s, box-shadow 0.15s;
		background: #fff;
		color: #1f2937;
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
		margin-top: 0.25rem;
	}
</style>
