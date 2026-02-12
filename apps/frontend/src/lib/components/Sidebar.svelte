<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import Modal from '$lib/components/Modal.svelte';
	import type { Project, CreateProjectDto } from '$lib/types';
	import { ProjectStatus } from '$lib/types';

	/**
	 * Navigation sidebar component inspired by GitLab
	 * Fixed left navigation with project dropdowns
	 */

	/** List of projects loaded from API */
	let projects: Project[] = $state([]);

	/** Loading state for projects */
	let loadingProjects: boolean = $state(true);

	/** Expanded state for each project dropdown */
	let expandedProjects: Record<string, boolean> = $state({});

	/** Current path for active state */
	let currentPath: string = $state('');

	/** Whether the create project modal is open */
	let showCreateProjectModal: boolean = $state(false);

	/** Form data for creating a new project */
	let newProjectForm: CreateProjectDto = $state({
		name: '',
		description: '',
		status: ProjectStatus.ACTIVE
	});

	/** Error message for project creation */
	let createError: string | null = $state(null);

	/** Bottom navigation items */
	const bottomItems = [
		{ icon: '⚙️', label: 'Settings', href: '/settings' },
		{ icon: '❓', label: 'Help', href: '/help' }
	];

	/**
	 * Fetches all projects from the API
	 */
	async function fetchProjects(): Promise<void> {
		try {
			loadingProjects = true;
			projects = await api.getProjects();
		} catch (err) {
			console.error('Failed to fetch projects:', err);
		} finally {
			loadingProjects = false;
		}
	}

	/**
	 * Toggles a project's expanded state
	 * @param projectId - ID of the project to toggle
	 */
	function toggleProject(projectId: string): void {
		expandedProjects[projectId] = !expandedProjects[projectId];
	}

	/**
	 * Checks if a nav item is active based on current path
	 * @param href - The href to check
	 * @returns True if the item is active
	 */
	function isActive(href: string): boolean {
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href);
	}

	/**
	 * Checks if a project has an active child route
	 * @param projectId - ID of the project
	 * @returns True if the project has an active child
	 */
	function isProjectActive(projectId: string): boolean {
		return currentPath.startsWith(`/projects/${projectId}`);
	}

	/**
	 * Opens the create project modal
	 */
	function openCreateProjectModal(): void {
		newProjectForm = {
			name: '',
			description: '',
			status: ProjectStatus.ACTIVE
		};
		createError = null;
		showCreateProjectModal = true;
	}

	/**
	 * Creates a new project
	 */
	async function createProject(): Promise<void> {
		try {
			createError = null;
			const created = await api.createProject(newProjectForm);
			showCreateProjectModal = false;
			await fetchProjects();
			// Auto-expand the newly created project
			expandedProjects[created.id] = true;
		} catch (err) {
			createError = err instanceof Error ? err.message : 'Failed to create project';
		}
	}

	onMount(() => {
		fetchProjects();
	});

	// Subscribe to page store for current path
	$effect(() => {
		const unsubscribe = page.subscribe((p) => {
			currentPath = p.url.pathname;
			// Auto-expand project if its child is active
			for (const project of projects) {
				if (isProjectActive(project.id)) {
					expandedProjects[project.id] = true;
				}
			}
		});
		return unsubscribe;
	});
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<div class="logo">
			<span class="logo-icon">SF</span>
			<span class="logo-text">SprintFlow</span>
		</div>
	</div>

	<nav class="sidebar-nav">
		<ul class="nav-list">
			<!-- Dashboard -->
			<li>
				<a href="/" class="nav-item" class:active={isActive('/')}>
					<span class="nav-icon">📊</span>
					<span class="nav-label">Dashboard</span>
				</a>
			</li>

			<!-- Projects Section -->
			<li class="nav-section-header">
				<span class="nav-section-title">Projects</span>
				<button
					class="add-project-btn"
					onclick={openCreateProjectModal}
					title="New project"
				>
					+
				</button>
			</li>

			{#if loadingProjects}
				<li class="nav-loading">
					<span class="nav-label">Loading...</span>
				</li>
			{:else if projects.length === 0}
				<li class="nav-empty">
					<span class="nav-label">No projects</span>
				</li>
			{:else}
				{#each projects as project (project.id)}
					<li class="project-item">
						<button
							class="nav-item project-toggle"
							class:active={isProjectActive(project.id)}
							onclick={() => toggleProject(project.id)}
						>
							<span class="nav-icon">📁</span>
							<span class="nav-label">{project.name}</span>
							<span class="expand-icon">
								{expandedProjects[project.id] ? '▼' : '▶'}
							</span>
						</button>

						{#if expandedProjects[project.id]}
							<ul class="project-subnav">
								<li>
									<a
										href="/projects/{project.id}/backlog"
										class="nav-item subnav-item"
										class:active={isActive(`/projects/${project.id}/backlog`)}
									>
										<span class="nav-icon">📋</span>
										<span class="nav-label">Backlog</span>
									</a>
								</li>
								<li>
									<a
										href="/projects/{project.id}/sprints"
										class="nav-item subnav-item"
										class:active={isActive(`/projects/${project.id}/sprints`)}
									>
										<span class="nav-icon">🏃</span>
										<span class="nav-label">Sprints</span>
									</a>
								</li>
							</ul>
						{/if}
					</li>
				{/each}
			{/if}
		</ul>
	</nav>

	<div class="sidebar-footer">
		<ul class="nav-list">
			{#each bottomItems as item}
				<li>
					<a href={item.href} class="nav-item" class:active={isActive(item.href)}>
						<span class="nav-icon">{item.icon}</span>
						<span class="nav-label">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</aside>

<!-- Create Project Modal -->
<Modal open={showCreateProjectModal} title="New Project" onclose={() => showCreateProjectModal = false}>
	<form class="form" onsubmit={(e) => { e.preventDefault(); createProject(); }}>
		{#if createError}
			<div class="form-error">{createError}</div>
		{/if}

		<div class="form-group">
			<label for="project-name">Name</label>
			<input
				id="project-name"
				type="text"
				bind:value={newProjectForm.name}
				required
				placeholder="Enter project name"
			/>
		</div>

		<div class="form-group">
			<label for="project-description">Description</label>
			<textarea
				id="project-description"
				bind:value={newProjectForm.description}
				placeholder="Enter project description (optional)"
				rows="3"
			></textarea>
		</div>

		<div class="form-actions">
			<button type="button" class="btn btn-secondary" onclick={() => showCreateProjectModal = false}>
				Cancel
			</button>
			<button type="submit" class="btn btn-primary">
				Create Project
			</button>
		</div>
	</form>
</Modal>

<style>
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: 240px;
		background-color: #1f2937;
		color: #e5e7eb;
		display: flex;
		flex-direction: column;
		z-index: 100;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #374151;
		min-height: 64px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.logo-icon {
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: white;
		font-weight: 700;
		font-size: 1.1rem;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.logo-text {
		font-weight: 600;
		font-size: 1.1rem;
		white-space: nowrap;
	}

	.sidebar-nav {
		flex: 1;
		padding: 1rem 0;
		overflow-y: auto;
	}

	.nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1rem 0.5rem;
	}

	.nav-section-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		color: #6b7280;
		letter-spacing: 0.05em;
	}

	.add-project-btn {
		background-color: #374151;
		border: none;
		color: #9ca3af;
		width: 20px;
		height: 20px;
		border-radius: 4px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s, color 0.2s;
	}

	.add-project-btn:hover {
		background-color: #6366f1;
		color: #ffffff;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 1rem;
		color: #d1d5db;
		text-decoration: none;
		transition: background-color 0.2s, color 0.2s;
		border-left: 3px solid transparent;
		width: 100%;
		background: transparent;
		border-right: none;
		border-top: none;
		border-bottom: none;
		font-size: inherit;
		font-family: inherit;
		cursor: pointer;
		text-align: left;
	}

	.nav-item:hover {
		background-color: #374151;
		color: #ffffff;
	}

	.nav-item.active {
		background-color: #374151;
		color: #ffffff;
		border-left-color: #6366f1;
	}

	.nav-icon {
		font-size: 1.25rem;
		width: 24px;
		text-align: center;
		flex-shrink: 0;
	}

	.nav-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
	}

	/* Project toggle specific styles */
	.project-toggle {
		position: relative;
	}

	.expand-icon {
		font-size: 0.625rem;
		color: #6b7280;
		margin-left: auto;
	}

	.project-subnav {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.subnav-item {
		padding-left: 2.5rem;
	}

	.subnav-item .nav-icon {
		font-size: 1rem;
		width: 20px;
	}

	.nav-loading,
	.nav-empty {
		padding: 0.5rem 1rem;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.sidebar-footer {
		border-top: 1px solid #374151;
		padding: 0.5rem 0;
	}

	/* Scrollbar styling */
	.sidebar-nav::-webkit-scrollbar {
		width: 6px;
	}

	.sidebar-nav::-webkit-scrollbar-track {
		background: transparent;
	}

	.sidebar-nav::-webkit-scrollbar-thumb {
		background-color: #4b5563;
		border-radius: 3px;
	}

	.sidebar-nav::-webkit-scrollbar-thumb:hover {
		background-color: #6b7280;
	}

	/* Form styles for modal */
	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-error {
		color: #dc2626;
		background-color: #fef2f2;
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
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
	.form-group textarea {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 80px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

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
</style>
