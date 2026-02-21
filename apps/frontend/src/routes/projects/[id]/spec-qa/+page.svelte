<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import KanbanBoard from '$lib/components/KanbanBoard.svelte';
	import UserStoryModal from '$lib/components/UserStoryModal.svelte';
	import {
		type UserStory,
		type Epic,
		type Project,
		UserStoryStatus,
		UserStoryGroup,
		STATUSES_BY_GROUP,
		STATUS_META
	} from '$lib/types';
	import type { KanbanColumn } from '$lib/components/KanbanBoard.svelte';

	let projectId: string = $state('');
	let project: Project | null = $state(null);
	let epics: Epic[] = $state([]);
	let stories: UserStory[] = $state([]);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);

	// Modal state
	let showStoryModal: boolean = $state(false);
	let selectedStory: UserStory | null = $state(null);

	// Dev summary counts (read-only middle band)
	const devStatuses = STATUSES_BY_GROUP[UserStoryGroup.DEVELOPMENT];
	const devCounts = $derived(
		Object.fromEntries(
			devStatuses.map((s) => [s, stories.filter((st) => st.status === s).length])
		) as Record<UserStoryStatus, number>
	);
	const totalDev = $derived(devStatuses.reduce((acc, s) => acc + (devCounts[s] ?? 0), 0));

	/** Stories visible on the Spec board (SPECIFICATION group only) */
	const specStories = $derived(
		stories.filter((s) => STATUS_META[s.status].group === UserStoryGroup.SPECIFICATION)
	);

	/** Stories visible on the QA board (QA group only) */
	const qaStories = $derived(
		stories.filter((s) => STATUS_META[s.status].group === UserStoryGroup.QA)
	);

	// Column definitions
	const specColumns: KanbanColumn[] = [
		{ label: 'À spécifier',  statuses: [UserStoryStatus.TO_SPECIFY],  accent: '#e0e7ff' },
		{ label: 'En rédaction', statuses: [UserStoryStatus.WRITING],      accent: '#c7d2fe' },
		{ label: 'À valider',    statuses: [UserStoryStatus.TO_VALIDATE],  accent: '#a5b4fc' },
		{ label: 'Prête',        statuses: [UserStoryStatus.READY],        accent: '#6366f1' },
	];

	const qaColumns: KanbanColumn[] = [
		{ label: 'À recetter', statuses: [UserStoryStatus.TO_TEST],     accent: '#fef3c7' },
		{ label: 'En recette', statuses: [UserStoryStatus.TESTING],     accent: '#fde68a' },
		{ label: 'Recette OK', statuses: [UserStoryStatus.TEST_PASSED], accent: '#6ee7b7' },
		{ label: 'Recette KO', statuses: [UserStoryStatus.TEST_FAILED], accent: '#fca5a5' },
	];

	/**
	 * Fetches project, epics and user stories from the API.
	 */
	async function fetchData(): Promise<void> {
		try {
			loading = true;
			error = null;
			const [projectData, epicsData, storiesData] = await Promise.all([
				api.getProject(projectId),
				api.getEpics(),
				api.getUserStories()
			]);
			project = projectData;
			epics = epicsData.filter((e) => e.projectId === projectId);
			const epicIds = new Set(epics.map((e) => e.id));
			stories = storiesData.filter(
				(s) => s.epicId != null && epicIds.has(s.epicId) && s.status !== UserStoryStatus.CANCELLED
			);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erreur de chargement';
		} finally {
			loading = false;
		}
	}

	/**
	 * Updates a story's status via the API, then refreshes data.
	 * @param story - The story to update
	 * @param newStatus - The target status
	 */
	async function handleStatusChange(story: UserStory, newStatus: UserStoryStatus): Promise<void> {
		try {
			await api.updateUserStory(story.id, { status: newStatus });
			await fetchData();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erreur lors du changement de statut';
		}
	}

	/**
	 * Sends a test-failed story back to development (TODO).
	 * @param story - The story to send back
	 */
	async function sendBackToDev(story: UserStory): Promise<void> {
		await handleStatusChange(story, UserStoryStatus.TODO);
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
			<h1>Spécification & QA</h1>
			{#if project}
				<span class="project-name">{project.name}</span>
			{/if}
		</div>
	</header>

	{#if loading}
		<div class="loading">Chargement…</div>
	{:else if error}
		<div class="error-banner">{error}</div>
	{:else}
		<!-- ── SPECIFICATION section ── -->
		<section class="board-section">
			<div class="section-label spec-label">
				<span class="section-icon">📋</span>
				Spécification
				<span class="section-count">{specStories.length}</span>
			</div>
			<KanbanBoard
				columns={specColumns}
				stories={specStories}
				onEdit={openEdit}
				onStatusChange={handleStatusChange}
			/>
		</section>

		<!-- ── DEV SUMMARY band (read-only) ── -->
		<section class="dev-summary">
			<div class="summary-label">
				<span class="section-icon">🏃</span>
				Développement
				<span class="section-count">{totalDev}</span>
				<a href="/projects/{projectId}/sprints" class="summary-link">Voir les sprints →</a>
			</div>
			<div class="dev-counts">
				{#each devStatuses as status}
					{@const count = devCounts[status] ?? 0}
					<div class="dev-count-item" class:has-stories={count > 0}>
						<span class="dev-count-num">{count}</span>
						<span class="dev-count-label">{STATUS_META[status].label}</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- ── QA section ── -->
		<section class="board-section">
			<div class="section-label qa-label">
				<span class="section-icon">✅</span>
				QA / Recette
				<span class="section-count">{qaStories.length}</span>
			</div>
			<KanbanBoard
				columns={qaColumns}
				stories={qaStories}
				onEdit={openEdit}
				onStatusChange={handleStatusChange}
				extraAction={(story) =>
					story.status === UserStoryStatus.TEST_FAILED
						? { label: '↩ Renvoyer en dev', onClick: () => sendBackToDev(story) }
						: null}
			/>
		</section>
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
		gap: 2rem;
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

	.page-title h1 {
		margin: 0;
		font-size: 1.75rem;
		color: #1f2937;
	}

	.project-name {
		font-size: 1rem;
		color: #6b7280;
	}

	/* Loading / error */
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

	/* Board sections */
	.board-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #374151;
	}

	.spec-label { color: #3730a3; }
	.qa-label   { color: #92400e; }

	.section-icon { font-size: 1rem; }

	.section-count {
		background: #e5e7eb;
		color: #6b7280;
		border-radius: 10px;
		padding: 0.1rem 0.5rem;
		font-size: 0.75rem;
	}

	/* Dev summary band */
	.dev-summary {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.summary-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #5b21b6;
	}

	.summary-link {
		margin-left: auto;
		font-size: 0.8125rem;
		font-weight: 500;
		color: #6366f1;
		text-decoration: none;
		text-transform: none;
		letter-spacing: 0;
	}

	.summary-link:hover { text-decoration: underline; }

	.dev-counts {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.dev-count-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
		padding: 0.5rem 0.875rem;
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		min-width: 90px;
		opacity: 0.5;
		transition: opacity 0.15s;
	}

	.dev-count-item.has-stories { opacity: 1; }

	.dev-count-num {
		font-size: 1.25rem;
		font-weight: 700;
		color: #5b21b6;
	}

	.dev-count-label {
		font-size: 0.72rem;
		color: #6b7280;
		text-align: center;
	}
</style>
