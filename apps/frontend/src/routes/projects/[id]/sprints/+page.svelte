<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import type { Project } from '$lib/types';

	/** Project ID from route params */
	let projectId: string = $state('');

	/** Current project */
	let project: Project | null = $state(null);

	/** Loading state */
	let loading: boolean = $state(true);

	/** Error message */
	let error: string | null = $state(null);

	/**
	 * Fetches project data from the API
	 */
	async function fetchData(): Promise<void> {
		try {
			loading = true;
			error = null;
			project = await api.getProject(projectId);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load project';
		} finally {
			loading = false;
		}
	}

	// Subscribe to page store for route params
	$effect(() => {
		const unsubscribe = page.subscribe((p) => {
			const newProjectId = p.params.id;
			if (newProjectId && newProjectId !== projectId) {
				projectId = newProjectId;
				fetchData();
			}
		});
		return unsubscribe;
	});

	onMount(() => {
		// Initial fetch is triggered by the $effect when projectId is set
	});
</script>

<div class="sprints-page">
	<header class="page-header">
		<div class="page-title">
			<h1>Sprints</h1>
			{#if project}
				<span class="project-name">{project.name}</span>
			{/if}
		</div>
		<div class="header-actions">
			<button class="btn btn-primary" disabled>
				+ New Sprint
			</button>
		</div>
	</header>

	{#if loading}
		<div class="loading">Loading...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else}
		<div class="sprints-content">
			<div class="empty-state">
				<p>Sprint management coming soon.</p>
				<p>This page will allow you to create and manage sprints for this project.</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.sprints-page {
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
		gap: 1rem;
	}

	.page-title h1 {
		margin: 0;
		font-size: 1.75rem;
		color: #1f2937;
	}

	.project-name {
		font-size: 1rem;
		color: #6b7280;
		font-weight: 400;
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

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
		background-color: #ffffff;
		border: 1px dashed #e5e7eb;
		border-radius: 8px;
	}

	.empty-state p {
		margin: 0.5rem 0;
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

	.btn-primary:disabled {
		background-color: #c7d2fe;
		cursor: not-allowed;
	}
</style>
