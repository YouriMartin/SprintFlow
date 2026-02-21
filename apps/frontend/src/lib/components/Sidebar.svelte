<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import Modal from '$lib/components/Modal.svelte';
	import type { Project, CreateProjectDto } from '$lib/types';
	import { ProjectStatus } from '$lib/types';

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

	/** Project avatar colour palette — cycled deterministically by name */
	const AVATAR_COLORS = [
		'#6366f1',
		'#8b5cf6',
		'#0ea5e9',
		'#14b8a6',
		'#f59e0b',
		'#f43f5e',
		'#22c55e'
	];

	/**
	 * Returns a deterministic avatar colour based on the project name.
	 * @param name - Project name
	 */
	function avatarColor(name: string): string {
		let hash = 0;
		for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
		return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
	}

	/**
	 * Returns the one- or two-letter initials for a project name.
	 * @param name - Project name
	 */
	function initials(name: string): string {
		const words = name.trim().split(/\s+/);
		if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
		return (words[0][0] + words[1][0]).toUpperCase();
	}

	/**
	 * Fetches all projects from the API.
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
	 * Toggles a project's expanded/collapsed state.
	 * @param projectId - ID of the project to toggle
	 */
	function toggleProject(projectId: string): void {
		expandedProjects[projectId] = !expandedProjects[projectId];
	}

	/**
	 * Returns true if the given href matches the current route.
	 * @param href - The path to check
	 */
	function isActive(href: string): boolean {
		if (href === '/') return currentPath === '/';
		return currentPath.startsWith(href);
	}

	/**
	 * Returns true if the current route is inside a project.
	 * @param projectId - ID of the project
	 */
	function isProjectActive(projectId: string): boolean {
		return currentPath.startsWith(`/projects/${projectId}`);
	}

	/**
	 * Opens the create project modal with a fresh form.
	 */
	function openCreateProjectModal(): void {
		newProjectForm = { name: '', description: '', status: ProjectStatus.ACTIVE };
		createError = null;
		showCreateProjectModal = true;
	}

	/**
	 * Submits the create project form.
	 */
	async function createProject(): Promise<void> {
		try {
			createError = null;
			const created = await api.createProject(newProjectForm);
			showCreateProjectModal = false;
			await fetchProjects();
			expandedProjects[created.id] = true;
		} catch (err) {
			createError = err instanceof Error ? err.message : 'Failed to create project';
		}
	}

	onMount(() => {
		void fetchProjects();
	});

	$effect(() => {
		const unsubscribe = page.subscribe((p) => {
			currentPath = p.url.pathname;
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
	<!-- ── Logo ── -->
	<div class="sidebar-header">
		<a href="/" class="logo">
			<span class="logo-icon">
				<!-- Lightning bolt / flow icon -->
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none"/>
				</svg>
			</span>
			<span class="logo-text">SprintFlow</span>
		</a>
	</div>

	<!-- ── Main nav ── -->
	<nav class="sidebar-nav">
		<ul class="nav-list">
			<!-- Dashboard -->
			<li>
				<a href="/" class="nav-item" class:active={isActive('/')}>
					<span class="nav-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="3" width="7" height="7" rx="1.5"/>
							<rect x="14" y="3" width="7" height="7" rx="1.5"/>
							<rect x="3" y="14" width="7" height="7" rx="1.5"/>
							<rect x="14" y="14" width="7" height="7" rx="1.5"/>
						</svg>
					</span>
					<span class="nav-label">Dashboard</span>
				</a>
			</li>

			<!-- Projects section -->
			<li class="nav-section-header">
				<span class="nav-section-title">Projects</span>
				<button class="add-btn" onclick={openCreateProjectModal} title="New project" aria-label="New project">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
						<line x1="12" y1="5" x2="12" y2="19"/>
						<line x1="5" y1="12" x2="19" y2="12"/>
					</svg>
				</button>
			</li>

			{#if loadingProjects}
				<li class="nav-loading">Loading…</li>
			{:else if projects.length === 0}
				<li class="nav-empty">
					<button class="nav-empty-btn" onclick={openCreateProjectModal}>
						+ Create your first project
					</button>
				</li>
			{:else}
				{#each projects as project (project.id)}
					{@const color = avatarColor(project.name)}
					{@const isOpen = !!expandedProjects[project.id]}
					<li class="project-item">
						<button
							class="nav-item project-toggle"
							class:active={isProjectActive(project.id)}
							onclick={() => toggleProject(project.id)}
						>
							<span class="project-avatar" style="background:{color}">
								{initials(project.name)}
							</span>
							<span class="nav-label">{project.name}</span>
							<span class="chevron" class:open={isOpen}>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="9 18 15 12 9 6"/>
								</svg>
							</span>
						</button>

						{#if isOpen}
							<ul class="project-subnav">
								<li>
									<a
										href="/projects/{project.id}/backlog"
										class="nav-item subnav-item"
										class:active={isActive(`/projects/${project.id}/backlog`)}
									>
										<span class="nav-icon subnav-icon">
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
												<line x1="9" y1="6"  x2="20" y2="6"/>
												<line x1="9" y1="12" x2="20" y2="12"/>
												<line x1="9" y1="18" x2="20" y2="18"/>
												<circle cx="4" cy="6"  r="1.5" fill="currentColor" stroke="none"/>
												<circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
												<circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
											</svg>
										</span>
										<span class="nav-label">Backlog</span>
									</a>
								</li>
								<li>
									<a
										href="/projects/{project.id}/spec-qa"
										class="nav-item subnav-item"
										class:active={isActive(`/projects/${project.id}/spec-qa`)}
									>
										<span class="nav-icon subnav-icon">
											<!-- Clipboard check icon -->
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
												<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
												<rect x="9" y="3" width="6" height="4" rx="1"/>
												<polyline points="9 12 11 14 15 10"/>
											</svg>
										</span>
										<span class="nav-label">Spec & QA</span>
									</a>
								</li>
								<li>
									<a
										href="/projects/{project.id}/sprints"
										class="nav-item subnav-item"
										class:active={isActive(`/projects/${project.id}/sprints`)}
									>
										<span class="nav-icon subnav-icon">
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
												<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="none"/>
											</svg>
										</span>
										<span class="nav-label">Sprints</span>
									</a>
								</li>
								<li>
									<a
										href="/projects/{project.id}/deployment"
										class="nav-item subnav-item"
										class:active={isActive(`/projects/${project.id}/deployment`)}
									>
										<span class="nav-icon subnav-icon">
											<!-- Rocket icon -->
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
												<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
												<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
												<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
												<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
											</svg>
										</span>
										<span class="nav-label">Déploiement</span>
									</a>
								</li>
							</ul>
						{/if}
					</li>
				{/each}
			{/if}
		</ul>
	</nav>

	<!-- ── Footer ── -->
	<div class="sidebar-footer">
		<a href="/settings" class="nav-item footer-item" class:active={isActive('/settings')}>
			<span class="nav-icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="3"/>
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
				</svg>
			</span>
			<span class="nav-label">Settings</span>
		</a>
		<a href="/help" class="nav-item footer-item" class:active={isActive('/help')}>
			<span class="nav-icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/>
					<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
					<circle cx="12" cy="17" r="0.5" fill="currentColor"/>
				</svg>
			</span>
			<span class="nav-label">Help</span>
		</a>
	</div>
</aside>

<!-- Create Project Modal -->
<Modal open={showCreateProjectModal} title="New Project" onclose={() => (showCreateProjectModal = false)}>
	<form class="form" onsubmit={(e) => { e.preventDefault(); void createProject(); }}>
		{#if createError}
			<div class="form-error">{createError}</div>
		{/if}

		<div class="form-group">
			<label for="project-name">Name <span class="required">*</span></label>
			<input
				id="project-name"
				type="text"
				bind:value={newProjectForm.name}
				required
				placeholder="My Project"
			/>
		</div>

		<div class="form-group">
			<label for="project-description">Description</label>
			<textarea
				id="project-description"
				bind:value={newProjectForm.description}
				placeholder="What is this project about?"
				rows="3"
			></textarea>
		</div>

		<div class="form-actions">
			<button type="button" class="btn btn-secondary" onclick={() => (showCreateProjectModal = false)}>
				Cancel
			</button>
			<button type="submit" class="btn btn-primary">Create Project</button>
		</div>
	</form>
</Modal>

<style>
	/* ── Shell ── */
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: 240px;
		background-color: #111827;
		color: #d1d5db;
		display: flex;
		flex-direction: column;
		z-index: 100;
		border-right: 1px solid #1f2937;
	}

	/* ── Logo ── */
	.sidebar-header {
		padding: 0 1rem;
		min-height: 60px;
		display: flex;
		align-items: center;
		border-bottom: 1px solid #1f2937;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		text-decoration: none;
		color: inherit;
	}

	.logo-icon {
		width: 30px;
		height: 30px;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: #fff;
		padding: 6px;
	}

	.logo-icon svg {
		width: 100%;
		height: 100%;
	}

	.logo-text {
		font-weight: 700;
		font-size: 0.9375rem;
		color: #f9fafb;
		letter-spacing: -0.01em;
	}

	/* ── Nav ── */
	.sidebar-nav {
		flex: 1;
		padding: 0.75rem 0;
		overflow-y: auto;
	}

	.nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* Section header */
	.nav-section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 0.875rem 0.375rem;
	}

	.nav-section-title {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #4b5563;
	}

	.add-btn {
		width: 20px;
		height: 20px;
		border: none;
		background: transparent;
		color: #4b5563;
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 3px;
		transition: background 0.15s, color 0.15s;
	}

	.add-btn svg { width: 100%; height: 100%; }

	.add-btn:hover {
		background: #1f2937;
		color: #9ca3af;
	}

	/* Nav items */
	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.875rem;
		color: #9ca3af;
		text-decoration: none;
		font-size: 0.875rem;
		border-left: 2px solid transparent;
		transition: background 0.13s, color 0.13s, border-color 0.13s;
		width: 100%;
		background: transparent;
		border-right: none;
		border-top: none;
		border-bottom: none;
		font-family: inherit;
		cursor: pointer;
		text-align: left;
		border-radius: 0;
	}

	.nav-item:hover {
		background: #1a2234;
		color: #e5e7eb;
	}

	.nav-item.active {
		background: #1a2234;
		color: #f9fafb;
		border-left-color: #6366f1;
	}

	/* Icons */
	.nav-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-icon svg {
		width: 100%;
		height: 100%;
	}

	.subnav-icon {
		width: 16px;
		height: 16px;
	}

	.nav-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
	}

	/* Project avatar */
	.project-avatar {
		width: 22px;
		height: 22px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.625rem;
		font-weight: 700;
		color: #fff;
		flex-shrink: 0;
		letter-spacing: 0;
	}

	/* Chevron */
	.chevron {
		width: 14px;
		height: 14px;
		color: #4b5563;
		flex-shrink: 0;
		transition: transform 0.2s;
		display: flex;
		align-items: center;
	}

	.chevron svg { width: 100%; height: 100%; }

	.chevron.open {
		transform: rotate(90deg);
	}

	/* Sub-nav */
	.project-subnav {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.subnav-item {
		padding-left: 2.375rem;
		font-size: 0.8125rem;
	}

	/* States */
	.nav-loading,
	.nav-empty {
		padding: 0.375rem 0.875rem;
		font-size: 0.8125rem;
		color: #4b5563;
	}

	.nav-empty-btn {
		background: none;
		border: none;
		color: #4b5563;
		font-size: 0.8125rem;
		cursor: pointer;
		padding: 0;
		transition: color 0.15s;
	}

	.nav-empty-btn:hover { color: #6366f1; }

	/* ── Footer ── */
	.sidebar-footer {
		border-top: 1px solid #1f2937;
		padding: 0.5rem 0;
	}

	.footer-item {
		font-size: 0.8125rem;
	}

	/* ── Scrollbar ── */
	.sidebar-nav::-webkit-scrollbar { width: 4px; }
	.sidebar-nav::-webkit-scrollbar-track { background: transparent; }
	.sidebar-nav::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
	.sidebar-nav::-webkit-scrollbar-thumb:hover { background: #4b5563; }

	/* ── Modal form ── */
	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-error {
		padding: 0.75rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 6px;
		color: #dc2626;
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

	.required { color: #dc2626; }

	.form-group input,
	.form-group textarea {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		background: #fff;
		color: #1f2937;
		transition: border-color 0.15s, box-shadow 0.15s;
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
		margin-top: 0.25rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-primary { background: #6366f1; color: #fff; }
	.btn-primary:hover { background: #4f46e5; }
	.btn-secondary { background: #e5e7eb; color: #374151; }
	.btn-secondary:hover { background: #d1d5db; }
</style>
