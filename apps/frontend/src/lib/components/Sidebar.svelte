<script lang="ts">
	/**
	 * Navigation sidebar component inspired by GitLab
	 * Collapsible left navigation with icons and labels
	 */

	/** Whether the sidebar is collapsed (icons only) */
	let collapsed: boolean = $state(false);

	/** Navigation items configuration */
	const navItems = [
		{ icon: '📊', label: 'Dashboard', href: '/', active: true },
		{ icon: '📁', label: 'Projects', href: '/projects', active: false },
		{ icon: '📋', label: 'Backlog', href: '/backlog', active: false },
		{ icon: '🏃', label: 'Sprints', href: '/sprints', active: false },
		{ icon: '👥', label: 'Team', href: '/team', active: false },
	];

	/** Bottom navigation items */
	const bottomItems = [
		{ icon: '⚙️', label: 'Settings', href: '/settings' },
		{ icon: '❓', label: 'Help', href: '/help' },
	];

	/**
	 * Toggles the sidebar collapsed state
	 */
	function toggleSidebar(): void {
		collapsed = !collapsed;
	}
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
			{#each navItems as item}
				<li>
					<a href={item.href} class="nav-item" class:active={item.active}>
						<span class="nav-icon">{item.icon}</span>
						{#if !collapsed}
							<span class="nav-label">{item.label}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="sidebar-footer">
		<ul class="nav-list">
			{#each bottomItems as item}
				<li>
					<a href={item.href} class="nav-item">
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

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 1rem;
		color: #d1d5db;
		text-decoration: none;
		transition: background-color 0.2s, color 0.2s;
		border-left: 3px solid transparent;
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
	}

	.sidebar.collapsed .nav-item {
		justify-content: center;
		padding: 0.75rem;
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
