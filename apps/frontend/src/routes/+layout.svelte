<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let isSetupPage = $derived($page.url.pathname.startsWith('/setup'));
</script>

<svelte:head>
	<title>SprintFlow</title>
	<meta name="description" content="SprintFlow - Task Management Application" />
</svelte:head>

{#if isSetupPage}
	{@render children()}
{:else}
	<div class="app-layout">
		<Sidebar />
		<main class="main-content">
			{@render children()}
		</main>
	</div>
{/if}

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
	}
</style>
