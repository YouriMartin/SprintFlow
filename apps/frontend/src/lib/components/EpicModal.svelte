<script lang="ts">
	import Modal from './Modal.svelte';
	import { api } from '$lib/api';
	import { type Epic, type UpdateEpicDto, type CreateEpicDto, EpicStatus } from '$lib/types';

	/**
	 * Modal for creating or editing an epic.
	 * When `epic` is provided the modal is in edit mode; otherwise create mode.
	 */

	interface Props {
		/** Whether the modal is visible */
		open: boolean;
		/** Epic to edit — omit or pass null for create mode */
		epic?: Epic | null;
		/** Required in create mode: the project this epic belongs to */
		projectId?: string;
		/** Number of stories in this epic (shown in edit mode footer) */
		storyCount?: number;
		/** Called after a successful save — parent should refresh data and close */
		onSave: () => void;
		/** Called when the modal should close without saving */
		onClose: () => void;
	}

	let { open, epic = null, projectId = '', storyCount = 0, onSave, onClose }: Props = $props();

	const isEdit = $derived(!!epic);

	/** Internal form state, reset whenever the modal opens or the epic changes */
	let form = $state<CreateEpicDto | UpdateEpicDto>(buildForm());

	let error: string | null = $state(null);

	/**
	 * Builds a fresh form object from the current epic prop (edit) or defaults (create).
	 */
	function buildForm(): CreateEpicDto | UpdateEpicDto {
		if (epic) {
			return {
				title: epic.title,
				description: epic.description ?? '',
				status: epic.status,
				startDate: epic.startDate?.substring(0, 7) ?? '',
				endDate: epic.endDate?.substring(0, 7) ?? '',
				isVisibleInRoadmap: epic.isVisibleInRoadmap
			} satisfies UpdateEpicDto;
		}
		const now = new Date();
		const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
		return {
			title: '',
			description: '',
			status: EpicStatus.PLANNED,
			startDate: now.toISOString().substring(0, 7),
			endDate: nextMonth.toISOString().substring(0, 7),
			isVisibleInRoadmap: true,
			projectId
		} satisfies CreateEpicDto;
	}

	// Reset form each time the modal opens or the epic changes
	$effect(() => {
		if (!open) return;
		// reading `epic` here ensures the effect re-runs when it changes
		void epic;
		form = buildForm();
		error = null;
	});

	/**
	 * Submits the form: creates or updates the epic.
	 */
	async function submit(): Promise<void> {
		try {
			if (epic) {
				await api.updateEpic(epic.id, form as UpdateEpicDto);
			} else {
				await api.createEpic(form as CreateEpicDto);
			}
			onSave();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save epic';
		}
	}

	/**
	 * Formats an ISO date string to a short locale date.
	 * @param iso - ISO 8601 date string
	 */
	function formatDate(iso: string | null | undefined): string {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString(undefined, {
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<Modal open={open} title={isEdit ? 'Edit epic' : 'New epic'} onclose={onClose}>
	<form class="form" onsubmit={(e) => { e.preventDefault(); void submit(); }}>
		{#if error}
			<p class="form-error">{error}</p>
		{/if}

		<div class="form-group">
			<label for="epic-title">Title <span class="required">*</span></label>
			<input id="epic-title" type="text" bind:value={form.title} required placeholder="Epic title" />
		</div>

		<div class="form-group">
			<label for="epic-description">Description</label>
			<textarea
				id="epic-description"
				bind:value={form.description}
				placeholder="What does this epic cover?"
				rows="3"
			></textarea>
		</div>

		<div class="form-group">
			<label for="epic-status">Status</label>
			<select id="epic-status" bind:value={form.status}>
				{#each Object.values(EpicStatus) as status}
					<option value={status}>{status.replace('_', ' ')}</option>
				{/each}
			</select>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="epic-start">Start month <span class="required">*</span></label>
				<input id="epic-start" type="month" bind:value={form.startDate} required />
			</div>
			<div class="form-group">
				<label for="epic-end">End month <span class="required">*</span></label>
				<input id="epic-end" type="month" bind:value={form.endDate} required />
			</div>
		</div>

		<div class="form-group form-group-inline">
			<input id="epic-roadmap" type="checkbox" bind:checked={form.isVisibleInRoadmap} />
			<label for="epic-roadmap">Visible in roadmap</label>
		</div>

		{#if isEdit && epic}
			<div class="detail-meta">
				<span>{storyCount} {storyCount === 1 ? 'story' : 'stories'}</span>
				<span>Created {formatDate(epic.createdAt)}</span>
				<span>Updated {formatDate(epic.updatedAt)}</span>
			</div>
		{/if}

		<div class="form-actions">
			<button type="button" class="btn btn-secondary" onclick={onClose}>Cancel</button>
			<button type="submit" class="btn btn-primary">{isEdit ? 'Save' : 'Create epic'}</button>
		</div>
	</form>
</Modal>
