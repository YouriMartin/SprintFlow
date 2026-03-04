<script lang="ts">
	import Modal from './Modal.svelte';
	import { api } from '$lib/api';
	import { type Sprint, type CreateSprintDto, type UpdateSprintDto, SprintStatus } from '$lib/types';

	/**
	 * Modal for creating or editing a sprint.
	 * When `sprint` is provided the modal is in edit mode; otherwise create mode.
	 */

	interface Props {
		/** Whether the modal is visible */
		open: boolean;
		/** Sprint to edit — omit or pass null for create mode */
		sprint?: Sprint | null;
		/** Project this sprint belongs to (required in create mode) */
		projectId?: string;
		/** Next sprint number to pre-fill in create mode */
		nextSprintNumber?: number;
		/** Called after a successful save — parent should refresh data */
		onSave: () => void;
		/** Called when the modal should close without saving */
		onClose: () => void;
	}

	let { open, sprint = null, projectId = '', nextSprintNumber = 1, onSave, onClose }: Props = $props();

	const isEdit = $derived(!!sprint);

	let form = $state<CreateSprintDto | UpdateSprintDto>(buildForm());
	let error: string | null = $state(null);

	/**
	 * Builds a fresh form object from the current sprint prop (edit) or defaults (create).
	 */
	function buildForm(): CreateSprintDto | UpdateSprintDto {
		if (sprint) {
			return {
				name: sprint.name,
				goal: sprint.goal ?? '',
				startDate: sprint.startDate.substring(0, 10),
				endDate: sprint.endDate.substring(0, 10),
				status: sprint.status,
				velocity: sprint.velocity,
				capacity: sprint.capacity
			} satisfies UpdateSprintDto;
		}
		const today = new Date();
		const twoWeeks = new Date(today);
		twoWeeks.setDate(today.getDate() + 13);
		return {
			name: `Sprint ${nextSprintNumber}`,
			goal: '',
			sprintNumber: nextSprintNumber,
			startDate: today.toISOString().substring(0, 10),
			endDate: twoWeeks.toISOString().substring(0, 10),
			status: SprintStatus.PLANNED,
			projectId
		} satisfies CreateSprintDto;
	}

	// Reset form each time the modal opens or the sprint changes
	$effect(() => {
		if (!open) return;
		void sprint;
		form = buildForm();
		error = null;
	});

	/**
	 * Submits the form: creates or updates the sprint.
	 */
	async function submit(): Promise<void> {
		try {
			if (sprint) {
				await api.updateSprint(sprint.id, form as UpdateSprintDto);
			} else {
				await api.createSprint(form as CreateSprintDto);
			}
			onSave();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error saving sprint';
		}
	}
</script>

<Modal open={open} title={isEdit ? 'Edit Sprint' : 'New Sprint'} onclose={onClose}>
	<form class="form" onsubmit={(e) => { e.preventDefault(); void submit(); }}>
		{#if error}
			<p class="form-error">{error}</p>
		{/if}

		<div class="form-row">
			<div class="form-group" style="flex: 2">
				<label for="sprint-name">Name <span class="required">*</span></label>
				<input id="sprint-name" type="text" bind:value={form.name} required placeholder="Sprint 1" />
			</div>
			{#if !isEdit}
				<div class="form-group" style="flex: 0 0 100px">
					<label for="sprint-number">No. <span class="required">*</span></label>
					<input
						id="sprint-number"
						type="number"
						min="1"
						bind:value={(form as CreateSprintDto).sprintNumber}
						required
					/>
				</div>
			{/if}
		</div>

		<div class="form-group">
			<label for="sprint-goal">Goal</label>
			<textarea
				id="sprint-goal"
				bind:value={form.goal}
				placeholder="What is the goal of this sprint?"
				rows="2"
			></textarea>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="sprint-start">Start date <span class="required">*</span></label>
				<input id="sprint-start" type="date" bind:value={form.startDate} required />
			</div>
			<div class="form-group">
				<label for="sprint-end">End date <span class="required">*</span></label>
				<input id="sprint-end" type="date" bind:value={form.endDate} required />
			</div>
		</div>

		{#if isEdit}
			<div class="form-group">
				<label for="sprint-status">Statut</label>
				<select id="sprint-status" bind:value={form.status}>
					{#each Object.values(SprintStatus) as s}
						<option value={s}>{s.replace('_', ' ')}</option>
					{/each}
				</select>
			</div>
		{/if}

		<div class="form-row">
			<div class="form-group">
				<label for="sprint-capacity">Capacity (pts)</label>
				<input id="sprint-capacity" type="number" min="0" bind:value={form.capacity} placeholder="—" />
			</div>
			<div class="form-group">
				<label for="sprint-velocity">Velocity (pts)</label>
				<input id="sprint-velocity" type="number" min="0" bind:value={form.velocity} placeholder="—" />
			</div>
		</div>

		<div class="form-actions">
			<button type="button" class="btn btn-secondary" onclick={onClose}>Cancel</button>
			<button type="submit" class="btn btn-primary">{isEdit ? 'Save' : 'Create Sprint'}</button>
		</div>
	</form>
</Modal>
