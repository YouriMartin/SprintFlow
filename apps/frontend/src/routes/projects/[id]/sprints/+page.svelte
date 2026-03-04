<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import KanbanBoard from '$lib/components/KanbanBoard.svelte';
	import UserStoryModal from '$lib/components/UserStoryModal.svelte';
	import SprintModal from '$lib/components/SprintModal.svelte';
	import {
		type UserStory,
		type Sprint,
		type Epic,
		type Project,
		UserStoryStatus,
		UserStoryGroup,
		STATUS_META,
		SprintStatus,
		UserStoryPriority
	} from '$lib/types';
	import type { KanbanColumn } from '$lib/components/KanbanBoard.svelte';

	let projectId: string = $state('');
	let project: Project | null = $state(null);
	let sprints: Sprint[] = $state([]);
	let selectedSprintId: string = $state('');
	let allStories: UserStory[] = $state([]);
	let epics: Epic[] = $state([]);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);

	/** Active tab: 'kanban' = sprint actuel, 'backlog' = backlog de planification */
	let activeTab: 'kanban' | 'backlog' = $state('kanban');

	// Sprint modal state
	let showSprintModal: boolean = $state(false);
	let editingSprint: Sprint | null = $state(null);

	/** Next sprint number to pre-fill in the create modal */
	const nextSprintNumber = $derived(
		sprints.length > 0 ? Math.max(...sprints.map((s) => s.sprintNumber)) + 1 : 1
	);

	// Story modal state
	let showStoryModal: boolean = $state(false);
	let selectedStory: UserStory | null = $state(null);

	/** Stories belonging to the selected sprint, in DEVELOPMENT group */
	const sprintStories = $derived(
		allStories.filter(
			(s) =>
				s.sprintId === selectedSprintId &&
				STATUS_META[s.status].group === UserStoryGroup.DEVELOPMENT
		)
	);

	const selectedSprint = $derived(sprints.find((s) => s.id === selectedSprintId) ?? null);

	/**
	 * Stories at READY status with no sprint assigned yet — shown in the backlog planning tab.
	 */
	const backlogStories = $derived(
		allStories.filter((s) => s.status === UserStoryStatus.READY && !s.sprintId)
	);

	const devColumns: KanbanColumn[] = [
		{ label: 'À faire',     statuses: [UserStoryStatus.TODO],        accent: '#e0e7ff' },
		{ label: 'En cours',    statuses: [UserStoryStatus.IN_PROGRESS], accent: '#8b5cf6' },
		{ label: 'En revue',    statuses: [UserStoryStatus.CODE_REVIEW], accent: '#7c3aed' },
		{ label: 'Dev terminé', statuses: [UserStoryStatus.DEV_DONE],    accent: '#6d28d9' },
	];

	/**
	 * Returns the epic title for a given epicId, or an empty string if not found.
	 * @param epicId - UUID of the epic
	 */
	function getEpicTitle(epicId: string | undefined): string {
		if (!epicId) return '';
		return epics.find((e) => e.id === epicId)?.title ?? '';
	}

	/**
	 * Returns a CSS class name for a priority value.
	 * @param priority - Story priority
	 */
	function priorityClass(priority: UserStoryPriority): string {
		return {
			[UserStoryPriority.LOW]:    'priority-low',
			[UserStoryPriority.MEDIUM]: 'priority-medium',
			[UserStoryPriority.HIGH]:   'priority-high',
			[UserStoryPriority.URGENT]: 'priority-urgent',
		}[priority] ?? '';
	}

	/**
	 * Returns a French label for a priority value.
	 * @param priority - Story priority
	 */
	function priorityLabel(priority: UserStoryPriority): string {
		return {
			[UserStoryPriority.LOW]:    'Faible',
			[UserStoryPriority.MEDIUM]: 'Moyenne',
			[UserStoryPriority.HIGH]:   'Haute',
			[UserStoryPriority.URGENT]: 'Urgente',
		}[priority] ?? priority;
	}

	/**
	 * Fetches project, sprints, epics and all stories for this project.
	 */
	async function fetchData(): Promise<void> {
		try {
			loading = true;
			error = null;
			const [projectData, sprintsData, epicsData, storiesData] = await Promise.all([
				api.getProject(projectId),
				api.getSprintsByProject(projectId),
				api.getEpics(),
				api.getUserStories()
			]);
			project = projectData;
			sprints = sprintsData;
			epics = epicsData.filter((e) => e.projectId === projectId);
			const epicIds = new Set(epics.map((e) => e.id));
			allStories = storiesData.filter((s) => s.epicId != null && epicIds.has(s.epicId));

			// Auto-select the active sprint, or the first one
			if (!selectedSprintId || !sprints.find((s) => s.id === selectedSprintId)) {
				const active = sprints.find((s) => s.status === SprintStatus.ACTIVE);
				selectedSprintId = active?.id ?? sprints[0]?.id ?? '';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erreur de chargement';
		} finally {
			loading = false;
		}
	}

	/**
	 * Updates a story's status optimistically (local state first), then persists via API.
	 * On error, reverts by reloading data from the server.
	 * @param story - The story to update
	 * @param newStatus - Target status
	 */
	async function handleStatusChange(story: UserStory, newStatus: UserStoryStatus): Promise<void> {
		allStories = allStories.map((s) => (s.id === story.id ? { ...s, status: newStatus } : s));
		try {
			await api.updateUserStory(story.id, { status: newStatus });
		} catch (err) {
			await fetchData();
			error = err instanceof Error ? err.message : 'Erreur lors du changement de statut';
		}
	}

	/**
	 * Assigns a backlog story to a sprint and transitions it to TODO (development phase).
	 * Uses optimistic update — reverts on API error.
	 * @param story - The READY story to assign
	 * @param sprintId - Target sprint UUID
	 */
	async function assignToSprint(story: UserStory, sprintId: string): Promise<void> {
		allStories = allStories.map((s) =>
			s.id === story.id ? { ...s, sprintId, status: UserStoryStatus.TODO } : s
		);
		try {
			await api.updateUserStory(story.id, { sprintId, status: UserStoryStatus.TODO });
		} catch (err) {
			await fetchData();
			error = err instanceof Error ? err.message : "Erreur lors de l'assignation au sprint";
		}
	}

	/** Opens the sprint modal in create mode. */
	function openCreateSprint(): void {
		editingSprint = null;
		showSprintModal = true;
	}

	/** Called after sprint modal save. */
	async function handleSprintSaved(): Promise<void> {
		showSprintModal = false;
		editingSprint = null;
		await fetchData();
	}

	/** Opens the edit modal for a story. */
	function openEdit(story: UserStory): void {
		selectedStory = story;
		showStoryModal = true;
	}

	/** Called after story modal save. */
	async function handleStorySaved(): Promise<void> {
		showStoryModal = false;
		selectedStory = null;
		await fetchData();
	}

	/**
	 * Formats a date string for display.
	 * @param iso - ISO date string
	 */
	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
	}

	$effect(() => {
		const unsubscribe = page.subscribe((p) => {
			const id = p.params.id;
			if (id && id !== projectId) {
				projectId = id;
				void fetchData();
			}
		});
		return unsubscribe;
	});

	onMount(() => {});
</script>

<div class="page">
	<header class="page-header">
		<div class="page-title">
			<h1>Sprints</h1>
			{#if project}
				<span class="project-name">{project.name}</span>
			{/if}
		</div>
		{#if sprints.length > 0}
			<button class="btn btn-primary" onclick={openCreateSprint}>+ Nouveau sprint</button>
		{/if}
	</header>

	{#if loading}
		<div class="loading">Chargement…</div>
	{:else if error}
		<div class="error-banner">{error}</div>
	{:else if sprints.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🏃</div>
			<p class="empty-title">Aucun sprint</p>
			<p class="empty-sub">Créez votre premier sprint pour commencer à organiser le développement.</p>
			<button class="btn btn-primary" onclick={openCreateSprint}>+ Créer le premier sprint</button>
		</div>
	{:else}
		<!-- View tabs -->
		<div class="view-tabs">
			<button
				class="view-tab"
				class:active={activeTab === 'kanban'}
				onclick={() => (activeTab = 'kanban')}
			>
				Sprint actuel
			</button>
			<button
				class="view-tab"
				class:active={activeTab === 'backlog'}
				onclick={() => (activeTab = 'backlog')}
			>
				Backlog
				{#if backlogStories.length > 0}
					<span class="tab-badge">{backlogStories.length}</span>
				{/if}
			</button>
		</div>

		{#if activeTab === 'kanban'}
			<!-- Sprint selector -->
			<div class="sprint-selector">
				{#each sprints as sprint}
					<button
						class="sprint-tab"
						class:active={sprint.id === selectedSprintId}
						class:sprint-active={sprint.status === SprintStatus.ACTIVE}
						onclick={() => (selectedSprintId = sprint.id)}
					>
						<span class="sprint-name">{sprint.name}</span>
						{#if sprint.status === SprintStatus.ACTIVE}
							<span class="sprint-active-dot" title="Sprint actif"></span>
						{/if}
					</button>
				{/each}
			</div>

			{#if selectedSprint}
				<div class="sprint-meta">
					<span class="sprint-goal">{selectedSprint.goal ?? ''}</span>
					<span class="sprint-dates">
						{formatDate(selectedSprint.startDate)} → {formatDate(selectedSprint.endDate)}
					</span>
					<span class="sprint-count">{sprintStories.length} stories</span>
				</div>
			{/if}

			<!-- Dev Kanban -->
			{#if sprintStories.length === 0 && selectedSprintId}
				<div class="empty-state">
					<p class="empty-sub">Aucune story en développement dans ce sprint.</p>
				</div>
			{:else}
				<KanbanBoard
					columns={devColumns}
					stories={sprintStories}
					onEdit={openEdit}
					onStatusChange={handleStatusChange}
				/>
			{/if}

		{:else}
			<!-- Backlog planning tab -->
			{#if backlogStories.length === 0}
				<div class="empty-state">
					<div class="empty-icon">✅</div>
					<p class="empty-title">Backlog vide</p>
					<p class="empty-sub">Aucune story au statut « Prête » en attente d'un sprint.</p>
				</div>
			{:else}
				<div class="backlog-header">
					<p class="backlog-desc">
						{backlogStories.length} story{backlogStories.length > 1 ? 's' : ''} prête{backlogStories.length > 1 ? 's' : ''} à planifier
					</p>
				</div>
				<div class="backlog-list">
					{#each backlogStories as story (story.id)}
						<div class="backlog-card">
							<span class="priority-badge {priorityClass(story.priority)}" title="Priorité {priorityLabel(story.priority)}">
								{priorityLabel(story.priority)}
							</span>
							<div class="backlog-card-info">
								<span class="backlog-card-title">{story.title}</span>
								{#if story.epicId}
									<span class="backlog-card-epic">{getEpicTitle(story.epicId)}</span>
								{/if}
							</div>
							<div class="backlog-assign">
								<select
									class="sprint-select"
									onchange={(e) => {
										const val = (e.target as HTMLSelectElement).value;
										if (val) assignToSprint(story, val);
									}}
								>
									<option value="">Assigner à un sprint…</option>
									{#each sprints as sprint}
										<option value={sprint.id}>
											{sprint.name}{sprint.status === SprintStatus.ACTIVE ? ' (actif)' : ''}
										</option>
									{/each}
								</select>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	{/if}
</div>

<SprintModal
	open={showSprintModal}
	sprint={editingSprint}
	{projectId}
	{nextSprintNumber}
	onSave={handleSprintSaved}
	onClose={() => { showSprintModal = false; editingSprint = null; }}
/>

<UserStoryModal
	open={showStoryModal}
	story={selectedStory}
	{epics}
	onSave={handleStorySaved}
	onClose={() => { showStoryModal = false; selectedStory = null; }}
/>

<style>
	.page {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.page-title {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
	}

	.page-title h1 { margin: 0; font-size: 1.75rem; color: #1f2937; }
	.project-name  { font-size: 1rem; color: #6b7280; }

	.loading {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
	}

	.error-banner {
		padding: 0.875rem 1rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 8px;
		color: #dc2626;
		font-size: 0.875rem;
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 3rem 2rem;
		color: #6b7280;
		text-align: center;
	}

	.empty-icon  { font-size: 2.5rem; margin-bottom: 0.5rem; }
	.empty-title { margin: 0; font-size: 1.125rem; font-weight: 600; color: #374151; }
	.empty-sub   { margin: 0; font-size: 0.875rem; }

	/* View tabs (kanban / backlog) */
	.view-tabs {
		display: flex;
		gap: 0;
		border-bottom: 2px solid #e5e7eb;
	}

	.view-tab {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		border: none;
		background: none;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #6b7280;
		cursor: pointer;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
		transition: color 0.12s, border-color 0.12s;
	}

	.view-tab:hover { color: #374151; }

	.view-tab.active {
		color: #6366f1;
		border-bottom-color: #6366f1;
	}

	.tab-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.375rem;
		border-radius: 999px;
		background: #6366f1;
		color: #fff;
		font-size: 0.6875rem;
		font-weight: 700;
	}

	/* Sprint selector tabs */
	.sprint-selector {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.sprint-tab {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.875rem;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		background: #fff;
		font-size: 0.875rem;
		color: #6b7280;
		cursor: pointer;
		transition: background-color 0.12s, color 0.12s, border-color 0.12s;
	}

	.sprint-tab:hover { background: #f3f4f6; color: #1f2937; }

	.sprint-tab.active {
		background: #6366f1;
		border-color: #6366f1;
		color: #fff;
		font-weight: 600;
	}

	.sprint-active-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #22c55e;
		flex-shrink: 0;
	}

	.sprint-tab.active .sprint-active-dot { background: #bbf7d0; }

	/* Sprint meta */
	.sprint-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.8125rem;
		color: #6b7280;
		flex-wrap: wrap;
	}

	.sprint-goal  { font-style: italic; flex: 1; }
	.sprint-dates { color: #9ca3af; }
	.sprint-count { font-weight: 600; color: #374151; }

	/* Backlog */
	.backlog-header {
		display: flex;
		align-items: center;
	}

	.backlog-desc {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.backlog-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.backlog-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.875rem 1rem;
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		transition: box-shadow 0.12s;
	}

	.backlog-card:hover { box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

	.backlog-card-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.backlog-card-title {
		font-size: 0.9375rem;
		font-weight: 500;
		color: #111827;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.backlog-card-epic {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.backlog-assign { flex-shrink: 0; }

	.sprint-select {
		padding: 0.375rem 0.625rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.8125rem;
		color: #374151;
		background: #fff;
		cursor: pointer;
		min-width: 180px;
		transition: border-color 0.12s;
	}

	.sprint-select:hover { border-color: #6366f1; }
	.sprint-select:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }

	/* Priority badges */
	.priority-badge {
		flex-shrink: 0;
		display: inline-block;
		padding: 0.1875rem 0.5rem;
		border-radius: 4px;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.priority-low    { background: #f0fdf4; color: #16a34a; }
	.priority-medium { background: #fffbeb; color: #d97706; }
	.priority-high   { background: #fff7ed; color: #ea580c; }
	.priority-urgent { background: #fef2f2; color: #dc2626; }
</style>