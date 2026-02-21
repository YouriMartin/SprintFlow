<script lang="ts">
	import { type UserStory, type UserStoryStatus, STATUS_META } from '$lib/types';
	import KanbanCard from './KanbanCard.svelte';

	/**
	 * A configurable Kanban board that renders columns from a list of status values.
	 * Stories are distributed into columns based on their current status.
	 */

	/** A single column definition */
	export interface KanbanColumn {
		/** Statuses that belong to this column */
		statuses: UserStoryStatus[];
		/** Column header label */
		label: string;
		/** Optional accent colour for the column header strip */
		accent?: string;
	}

	interface Props {
		/** Column definitions */
		columns: KanbanColumn[];
		/** All stories to distribute across columns */
		stories: UserStory[];
		/** Called when the user wants to edit a story */
		onEdit: (story: UserStory) => void;
		/** Called when the user changes a story's status via the arrows */
		onStatusChange: (story: UserStory, newStatus: UserStoryStatus) => void;
		/** Optional: render an extra action slot per card (e.g. "Renvoyer en dev") */
		extraAction?: (story: UserStory) => { label: string; onClick: () => void } | null;
	}

	let { columns, stories, onEdit, onStatusChange, extraAction }: Props = $props();

	/**
	 * Returns the stories that belong to a given column.
	 * @param col - Column definition
	 */
	function storiesForColumn(col: KanbanColumn): UserStory[] {
		const set = new Set<string>(col.statuses);
		return stories.filter((s) => set.has(s.status));
	}
</script>

<div class="kanban-board">
	{#each columns as col}
		{@const colStories = storiesForColumn(col)}
		<div class="kanban-column">
			<header class="column-header" style={col.accent ? `border-top: 3px solid ${col.accent}` : ''}>
				<span class="column-title">{col.label}</span>
				<span class="column-count">{colStories.length}</span>
			</header>

			<div class="column-body">
				{#if colStories.length === 0}
					<p class="column-empty">Aucune story</p>
				{:else}
					{#each colStories as story (story.id)}
						{@const extra = extraAction ? extraAction(story) : null}
						<div class="card-wrapper">
							<KanbanCard {story} {onEdit} {onStatusChange} />
							{#if extra}
								<button class="extra-action" onclick={extra.onClick}>
									{extra.label}
								</button>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.kanban-board {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		overflow-x: auto;
		padding-bottom: 1rem;
	}

	/* Column */
	.kanban-column {
		flex: 0 0 260px;
		min-width: 260px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.column-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.875rem;
		background: #f3f4f6;
		border-bottom: 1px solid #e5e7eb;
	}

	.column-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #374151;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.column-count {
		font-size: 0.75rem;
		font-weight: 600;
		color: #9ca3af;
		background: #e5e7eb;
		border-radius: 10px;
		padding: 0.1rem 0.5rem;
	}

	/* Column body */
	.column-body {
		padding: 0.625rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-height: 80px;
	}

	.column-empty {
		font-size: 0.8125rem;
		color: #d1d5db;
		text-align: center;
		padding: 1rem 0;
		font-style: italic;
	}

	/* Extra action button (e.g. "Renvoyer en dev") */
	.card-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.extra-action {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 6px;
		color: #dc2626;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		text-align: center;
		transition: background-color 0.12s;
	}

	.extra-action:hover {
		background: #fee2e2;
	}
</style>
