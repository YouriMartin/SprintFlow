<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import type { Project } from '$lib/types';

	/**
	 * Navigation sidebar component inspired by GitLab
	 * Collapsible left navigation with project dropdowns
	 */

	/** Whether the sidebar is collapsed (icons only) */
	let collapsed: boolean = $state(false);

	/** List of projects loaded from API */
	let projects: Project[] = $state([]);

	/** Loading state for projects */
	let loadingProjects: boolean = $state(true);

	/** Expanded state for each project dropdown */
	let expandedProjects: Record<string, boolean> = $state({});

	/** Current path for active state */
	let currentPath: string = $state('');

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
	 * Toggles the sidebar collapsed state
	 */
	function toggleSidebar(): void {
		collapsed = !collapsed;
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

<aside class="sidebar" class:collapsed>
	<div class="sidebar-header">
		<div class="logo">
			{#if collapsed}
				<span class="logo-icon">SF</span>
			{:else}
				<span class="logo-icon">SF</span>
				<span class="logo-text">SprintFlow</span>
			{/if}
		</div>
		<button class="collapse-btn" onclick={toggleSidebar} aria-label="Toggle sidebar">
			{#if collapsed}
				<span class="icon">▶</span>
			{:else}
				<span class="icon">◀</span>
			{/if}
		</button>
	</div>

	<nav class="sidebar-nav">
		<ul class="nav-list">
			<!-- Dashboard -->
			<li>
				<a href="/" class="nav-item" class:active={isActive('/')}>
					<span class="nav-icon">📊</span>
					{#if !collapsed}
						<span class="nav-label">Dashboard</span>
					{/if}
				</a>
			</li>

			<!-- Projects Section -->
			{#if !collapsed}
				<li class="nav-section-title">Projects</li>
			{/if}

			{#if loadingProjects}
				<li class="nav-loading">
					{#if !collapsed}
						<span class="nav-label">Loading...</span>
					{/if}
				</li>
			{:else if projects.length === 0}
				<li class="nav-empty">
					{#if !collapsed}
						<span class="nav-label">No projects</span>
					{/if}
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
							{#if !collapsed}
								<span class="nav-label">{project.name}</span>
								<span class="expand-icon">
									{expandedProjects[project.id] ? '▼' : '▶'}
								</span>
							{/if}
						</button>

						{#if !collapsed && expandedProjects[project.id]}
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
						{#if !collapsed}
							<span class="nav-label">{item.label}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</aside>

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
		transition: width 0.2s ease;
		z-index: 100;
	}

	.sidebar.collapsed {
		width: 64px;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid #374151;
		min-height: 64px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		overflow: hidden;
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

	.collapse-btn {
		background: transparent;
		border: none;
		color: #9ca3af;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
	}

	.collapse-btn:hover {
		background-color: #374151;
		color: #e5e7eb;
	}

	.sidebar.collapsed .collapse-btn {
		display: none;
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

	.nav-section-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		color: #6b7280;
		padding: 1rem 1rem 0.5rem;
		letter-spacing: 0.05em;
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

	.sidebar.collapsed .nav-item {
		justify-content: center;
		padding: 0.75rem;
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
</style>