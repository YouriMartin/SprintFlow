<script lang="ts">
	import {
		type UserStory,
		UserStoryStatus,
		UserStoryPriority,
		STATUS_META,
		UserStoryGroup,
		prevStatus,
		nextStatus,
		getPhaseIndex
	} from '$lib/types';

	/**
	 * A Kanban card representing a single user story.
	 * Shows title, priority, assignee, a 4-phase progress bar,
	 * and ◀ ▶ arrows to move the story to the previous/next status
	 * within its current phase group.
	 */
	interface Props {
		/** The user story to display */
		story: UserStory;
		/** Called when the user clicks the card title (open edit modal) */
		onEdit: (story: UserStory) => void;
		/** Called when the user requests a status change via the arrows */
		onStatusChange: (story: UserStory, newStatus: UserStoryStatus) => void;
	}

	let { story, onEdit, onStatusChange }: Props = $props();

	const prev = $derived(prevStatus(story.status));
	const next = $derived(nextStatus(story.status));
	const phaseIndex = $derived(getPhaseIndex(story.status));
	const statusLabel = $derived(STATUS_META[story.status].label);

	/**
	 * Returns the CSS class for a priority badge.
	 * @param priority - User story priority
	 */
	function priorityClass(priority: UserStoryPriority): string {
		return {
			[UserStoryPriority.LOW]:    'priority-low',
			[UserStoryPriority.MEDIUM]: 'priority-medium',
			[UserStoryPriority.HIGH]:   'priority-high',
			[UserStoryPriority.URGENT]: 'priority-urgent',
		}[priority] ?? '';
	}

	/**
	 * Returns the phase label for the progress bar dot tooltip.
	 * @param phase - 1-based phase index
	 */
	function phaseLabel(phase: 1 | 2 | 3 | 4): string {
		return ['Spec', 'Dev', 'QA', 'Deploy'][phase - 1];
	}
</script>

<article class="kanban-card">
	<!-- Title -->
	<button class="card-title" onclick={() => onEdit(story)}>
		{story.title}
	</button>

	<!-- Phase progress bar -->
	<div class="phase-bar" aria-label="Progression : {phaseLabel(phaseIndex as 1|2|3|4)}">
		{#each [1, 2, 3, 4] as phase}
			<div
				class="phase-dot"
				class:done={phaseIndex > phase}
				class:active={phaseIndex === phase}
				class:pending={phaseIndex < phase}
				title={phaseLabel(phase as 1|2|3|4)}
			></div>
			{#if phase < 4}
				<div class="phase-line" class:done={phaseIndex > phase}></div>
			{/if}
		{/each}
	</div>

	<!-- Footer: priority + assignee + nav arrows -->
	<div class="card-footer">
		<div class="card-meta">
			<span class="badge {priorityClass(story.priority)}">{story.priority}</span>
			{#if story.assignee}
				<span class="assignee" title={story.assignee}>
					{story.assignee.split(' ')[0]}
				</span>
			{/if}
		</div>

		<div class="card-nav">
			<button
				class="nav-arrow"
				disabled={!prev}
				onclick={() => prev && onStatusChange(story, prev)}
				title={prev ? `← ${STATUS_META[prev].label}` : 'Premier statut du groupe'}
				aria-label="Statut précédent"
			>◀</button>
			<span class="status-label">{statusLabel}</span>
			<button
				class="nav-arrow"
				disabled={!next}
				onclick={() => next && onStatusChange(story, next)}
				title={next ? `→ ${STATUS_META[next].label}` : 'Dernier statut du groupe'}
				aria-label="Statut suivant"
			>▶</button>
		</div>
	</div>
</article>

<style>
	.kanban-card {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
		transition: box-shadow 0.15s;
	}

	.kanban-card:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	/* Title */
	.card-title {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		font: inherit;
		font-size: 0.875rem;
		font-weight: 600;
		color: #1f2937;
		text-align: left;
		cursor: pointer;
		line-height: 1.4;
	}

	.card-title:hover {
		color: #6366f1;
		text-decoration: underline;
	}

	/* Phase progress bar */
	.phase-bar {
		display: flex;
		align-items: center;
		gap: 0;
		margin: 0.125rem 0;
	}

	.phase-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
		transition: background-color 0.2s;
	}

	.phase-dot.done    { background-color: #6366f1; }
	.phase-dot.active  { background-color: #6366f1; box-shadow: 0 0 0 2px #e0e7ff; }
	.phase-dot.pending { background-color: #e5e7eb; }

	.phase-line {
		flex: 1;
		height: 2px;
		background-color: #e5e7eb;
		transition: background-color 0.2s;
	}

	.phase-line.done { background-color: #6366f1; }

	/* Footer */
	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.assignee {
		font-size: 0.72rem;
		color: #6b7280;
		background: #f3f4f6;
		border-radius: 4px;
		padding: 0.1rem 0.4rem;
	}

	/* Navigation arrows */
	.card-nav {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.nav-arrow {
		background: none;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 0.6rem;
		color: #6b7280;
		padding: 0;
		line-height: 1;
		transition: background-color 0.12s, color 0.12s;
	}

	.nav-arrow:hover:not(:disabled) {
		background-color: #6366f1;
		color: #fff;
		border-color: #6366f1;
	}

	.nav-arrow:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.status-label {
		font-size: 0.68rem;
		color: #9ca3af;
		white-space: nowrap;
		min-width: 60px;
		text-align: center;
	}
</style>
