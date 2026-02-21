<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import KanbanBoard from '$lib/components/KanbanBoard.svelte';
	import UserStoryModal from '$lib/components/UserStoryModal.svelte';
	import {
		type UserStory,
		type Sprint,
		type Epic,
		type Project,
		UserStoryStatus,
		UserStoryGroup,
		STATUSES_BY_GROUP,
		STATUS_META,
		SprintStatus
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

	// Modal state
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

	const devColumns: KanbanColumn[] = [
		{ label: 'À faire',   statuses: [UserStoryStatus.TODO],        accent: '#e0e7ff' },
		{ label: 'En cours',  statuses: [UserStoryStatus.IN_PROGRESS], accent: '#8b5cf6' },
		{ label: 'En revue',  statuses: [UserStoryStatus.CODE_REVIEW], accent: '#7c3aed' },
		{ label: 'Dev terminé', statuses: [UserStoryStatus.DEV_DONE], accent: '#6d28d9' },
	];

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
	 * Updates a story's status.
	 * @param story - The story to update
	 * @param newStatus - Target status
	 */
	async function handleStatusChange(story: UserStory, newStatus: UserStoryStatus): Promise<void> {
		try {
			await api.updateUserStory(story.id, { status: newStatus });
			await fetchData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erreur lors du changement de statut';
		}
	}

	/** Opens the edit modal for a story. */
	function openEdit(story: UserStory): void {
		selectedStory = story;
		showStoryModal = true;
	}

	/** Called after modal save. */
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
	</header>

	{#if loading}
		<div class="loading">Chargement…</div>
	{:else if error}
		<div class="error-banner">{error}</div>
	{:else if sprints.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🏃</div>
			<p class="empty-title">Aucun sprint</p>
			<p class="empty-sub">Créez un sprint via le backlog pour commencer à assigner des stories.</p>
		</div>
	{:else}
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
	{/if}
</div>

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
</style>
