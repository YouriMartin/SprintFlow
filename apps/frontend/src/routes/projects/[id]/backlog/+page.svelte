<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import EpicModal from '$lib/components/EpicModal.svelte';
	import UserStoryModal from '$lib/components/UserStoryModal.svelte';
	import DeleteButton from '$lib/components/DeleteButton.svelte';
	import { type Epic, type UserStory, type Project, EpicStatus, UserStoryStatus, UserStoryPriority } from '$lib/types';

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

	/** Collapsed state per epic (expanded by default) */
	let collapsedEpics: Record<string, boolean> = $state({});

	// ── Epic modal state ──

	/** Whether the epic modal is open */
	let showEpicModal: boolean = $state(false);

	/** Epic being edited (null = create mode) */
	let selectedEpic: Epic | null = $state(null);

	// ── User story modal state ──

	/** Whether the user story modal is open */
	let showStoryModal: boolean = $state(false);

	/** Story being edited (null = create mode) */
	let selectedStory: UserStory | null = $state(null);

	/** Pre-selected epic ID when creating a new story */
	let defaultEpicId: string = $state('');

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

	// ── Epic modal helpers ──

	/** Opens the epic modal in create mode. */
	function openCreateEpic(): void {
		selectedEpic = null;
		showEpicModal = true;
	}

	/**
	 * Opens the epic modal in edit mode.
	 * @param epic - Epic to edit
	 */
	function openEditEpic(epic: Epic): void {
		selectedEpic = epic;
		showEpicModal = true;
	}

	/** Closes the epic modal and clears selection. */
	function closeEpicModal(): void {
		showEpicModal = false;
		selectedEpic = null;
	}

	/** Called by EpicModal after a successful save. */
	async function handleEpicSaved(): Promise<void> {
		closeEpicModal();
		await fetchData();
	}

	// ── User story modal helpers ──

	/**
	 * Opens the story modal in create mode, pre-bound to an epic.
	 * @param epicId - The epic the new story will belong to
	 */
	function openCreateStory(epicId: string): void {
		selectedStory = null;
		defaultEpicId = epicId;
		showStoryModal = true;
	}

	/**
	 * Opens the story modal in edit mode.
	 * @param story - Story to edit
	 */
	function openEditStory(story: UserStory): void {
		selectedStory = story;
		showStoryModal = true;
	}

	/** Closes the story modal and clears selection. */
	function closeStoryModal(): void {
		showStoryModal = false;
		selectedStory = null;
	}

	/** Called by UserStoryModal after a successful save. */
	async function handleStorySaved(): Promise<void> {
		closeStoryModal();
		await fetchData();
	}

	// ── Delete handlers ──

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

	// ── Badge helpers ──

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
		<button class="btn btn-primary" onclick={openCreateEpic}>+ New Epic</button>
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
			<button class="btn btn-primary" onclick={openCreateEpic}>+ New Epic</button>
		</div>
	{:else}
		<div class="epics-list">
			{#each epics as epic (epic.id)}
				{@const stories = getStoriesForEpic(epic.id)}
				{@const collapsed = !!collapsedEpics[epic.id]}

				<div class="epic-card">
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div class="epic-header" onclick={() => toggleEpic(epic.id)}>
						<div class="epic-header-left">
							<span class="chevron" class:collapsed>{collapsed ? '▶' : '▼'}</span>
							<div class="epic-meta">
								<div class="epic-title-row">
									<button
										class="title-link"
										onclick={(e) => { e.stopPropagation(); openEditEpic(epic); }}
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
								onclick={(e) => { e.stopPropagation(); openCreateStory(epic.id); }}
							>
								+ Add Story
							</button>
							<DeleteButton
								label="Delete epic"
								onclick={(e) => { e.stopPropagation(); void deleteEpic(epic.id); }}
							/>
						</div>
					</div>

					{#if !collapsed}
						<div class="stories-section">
							{#if stories.length === 0}
								<p class="no-stories">
									No user stories yet —
									<button class="inline-link" onclick={() => openCreateStory(epic.id)}>add one</button>
								</p>
							{:else}
								<table class="stories-table">
									<thead>
										<tr>
											<th class="col-title">Title</th>
											<th class="col-status">Status</th>
											<th class="col-priority">Priority</th>
											<th class="col-actions"></th>
										</tr>
									</thead>
									<tbody>
										{#each stories as story (story.id)}
											<tr class="story-row">
												<td class="col-title">
													<button class="title-link" onclick={() => openEditStory(story)}>
														{story.title}
													</button>
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
													<DeleteButton
														label="Delete story"
														onclick={() => void deleteUserStory(story.id)}
													/>
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

<EpicModal
	open={showEpicModal}
	epic={selectedEpic}
	projectId={projectId}
	storyCount={selectedEpic ? getStoriesForEpic(selectedEpic.id).length : 0}
	onSave={handleEpicSaved}
	onClose={closeEpicModal}
/>

<UserStoryModal
	open={showStoryModal}
	story={selectedStory}
	epics={epics}
	defaultEpicId={defaultEpicId}
	onSave={handleStorySaved}
	onClose={closeStoryModal}
/>

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

	.empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
	.empty-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: #374151; }
	.empty-sub   { margin: 0 0 1rem; font-size: 0.875rem; }

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

	.epic-header:hover { background-color: #f3f4f6; }

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

	.story-count { font-weight: 500; color: #6b7280; }

	.epic-header-right {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

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

	.story-row:last-child td { border-bottom: none; }
	.story-row:hover td { background-color: #fafafa; }

	.col-title    { width: 52%; }
	.col-status   { width: 16%; }
	.col-priority { width: 16%; }
	.col-actions  { width: 16%; text-align: right; }
</style>
