<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>SprintFlow</title>
	<meta name="description" content="SprintFlow - Task Management Application" />
</svelte:head>

<div class="app-layout">
	<Sidebar />
	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			sans-serif;
		background-color: #f3f4f6;
		color: #111827;
		line-height: 1.5;
	}

	.app-layout {
		display: flex;
		min-height: 100vh;
	}

	.main-content {
		flex: 1;
		margin-left: 240px;
		padding: 2rem;
		transition: margin-left 0.2s ease;
	}

	/* Handle collapsed sidebar */
	:global(.sidebar.collapsed) ~ .main-content {
		margin-left: 64px;
	}
</style>
