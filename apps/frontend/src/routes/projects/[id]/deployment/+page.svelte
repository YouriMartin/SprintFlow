<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import KanbanBoard from '$lib/components/KanbanBoard.svelte';
	import UserStoryModal from '$lib/components/UserStoryModal.svelte';
	import {
		type UserStory,
		type Epic,
		type Sprint,
		type Project,
		UserStoryStatus,
		UserStoryGroup,
		STATUS_META
	} from '$lib/types';
	import type { KanbanColumn } from '$lib/components/KanbanBoard.svelte';

	let projectId: string = $state('');
	let project: Project | null = $state(null);
	let epics: Epic[] = $state([]);
	let sprints: Sprint[] = $state([]);
	let stories: UserStory[] = $state([]);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);

	// Filters
	let filterEpicId: string = $state('');
	let filterSprintId: string = $state('');

	// Modal state
	let showStoryModal: boolean = $state(false);
	let selectedStory: UserStory | null = $state(null);

	/** Stories in the DEPLOYMENT group, with optional epic/sprint filter */
	const deployStories = $derived(
		stories.filter((s) => {
			if (STATUS_META[s.status].group !== UserStoryGroup.DEPLOYMENT) return false;
			if (filterEpicId && s.epicId !== filterEpicId) return false;
			if (filterSprintId && s.sprintId !== filterSprintId) return false;
			return true;
		})
	);

	const deployColumns: KanbanColumn[] = [
		{ label: 'À déployer',   statuses: [UserStoryStatus.TO_DEPLOY],    accent: '#d1fae5' },
		{ label: 'Staging',      statuses: [UserStoryStatus.STAGING],       accent: '#6ee7b7' },
		{ label: 'Pré-prod',     statuses: [UserStoryStatus.PRE_PROD],      accent: '#34d399' },
		{ label: 'En production',statuses: [UserStoryStatus.IN_PRODUCTION], accent: '#059669' },
	];

	/**
	 * Fetches project, epics, sprints and user stories.
	 */
	async function fetchData(): Promise<void> {
		try {
			loading = true;
			error = null;
			const [projectData, epicsData, sprintsData, storiesData] = await Promise.all([
				api.getProject(projectId),
				api.getEpics(),
				api.getSprintsByProject(projectId),
				api.getUserStories()
			]);
			project = projectData;
			epics = epicsData.filter((e) => e.projectId === projectId);
			sprints = sprintsData;
			const epicIds = new Set(epics.map((e) => e.id));
			stories = storiesData.filter((s) => s.epicId != null && epicIds.has(s.epicId));
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
			<h1>Déploiement</h1>
			{#if project}
				<span class="project-name">{project.name}</span>
			{/if}
		</div>

		<!-- Filters -->
		<div class="filters">
			<select bind:value={filterEpicId} class="filter-select">
				<option value="">Tous les epics</option>
				{#each epics as epic}
					<option value={epic.id}>{epic.title}</option>
				{/each}
			</select>
			<select bind:value={filterSprintId} class="filter-select">
				<option value="">Tous les sprints</option>
				{#each sprints as sprint}
					<option value={sprint.id}>{sprint.name}</option>
				{/each}
			</select>
		</div>
	</header>

	{#if loading}
		<div class="loading">Chargement…</div>
	{:else if error}
		<div class="error-banner">{error}</div>
	{:else}
		<div class="board-wrapper">
			<KanbanBoard
				columns={deployColumns}
				stories={deployStories}
				onEdit={openEdit}
				onStatusChange={handleStatusChange}
			/>
		</div>

		{#if deployStories.length === 0}
			<div class="empty-state">
				<div class="empty-icon">🚀</div>
				<p class="empty-title">Aucune story en déploiement</p>
				<p class="empty-sub">Les stories passant la recette apparaîtront ici automatiquement.</p>
			</div>
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
		flex-wrap: wrap;
		gap: 1rem;
	}

	.page-title {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
	}

	.page-title h1 { margin: 0; font-size: 1.75rem; color: #1f2937; }
	.project-name  { font-size: 1rem; color: #6b7280; }

	/* Filters */
	.filters {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.filter-select {
		padding: 0.375rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		background: #fff;
		color: #1f2937;
		cursor: pointer;
	}

	.filter-select:focus {
		outline: none;
		border-color: #6366f1;
	}

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

	.board-wrapper {
		overflow-x: auto;
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
</style>
