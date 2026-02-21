<script lang="ts">
	import Modal from './Modal.svelte';
	import { api } from '$lib/api';
	import {
		type Epic,
		type UserStory,
		type CreateUserStoryDto,
		type UpdateUserStoryDto,
		UserStoryStatus,
		UserStoryPriority,
		UserStoryGroup,
		STATUSES_BY_GROUP,
		STATUS_META
	} from '$lib/types';

	/**
	 * Modal for creating or editing a user story.
	 * When `story` is provided the modal is in edit mode; otherwise create mode.
	 */

	interface Props {
		/** Whether the modal is visible */
		open: boolean;
		/** Story to edit — omit or pass null for create mode */
		story?: UserStory | null;
		/** List of epics available for selection */
		epics: Epic[];
		/** Pre-selected epic ID in create mode */
		defaultEpicId?: string;
		/** Called after a successful save — parent should refresh data and close */
		onSave: () => void;
		/** Called when the modal should close without saving */
		onClose: () => void;
	}

	let { open, story = null, epics, defaultEpicId = '', onSave, onClose }: Props = $props();

	const isEdit = $derived(!!story);

	/** Internal form state, reset whenever the modal opens or the story changes */
	let form = $state<CreateUserStoryDto | UpdateUserStoryDto>(buildForm());

	let error: string | null = $state(null);

	/**
	 * Builds a fresh form object from the current story prop (edit) or defaults (create).
	 */
	function buildForm(): CreateUserStoryDto | UpdateUserStoryDto {
		if (story) {
			return {
				title: story.title,
				description: story.description ?? '',
				status: story.status,
				priority: story.priority,
				assignee: story.assignee ?? '',
				dueDate: story.dueDate?.split('T')[0] ?? '',
				epicId: story.epicId ?? ''
			} satisfies UpdateUserStoryDto;
		}
		return {
			title: '',
			description: '',
			status: UserStoryStatus.TO_SPECIFY,
			priority: UserStoryPriority.MEDIUM,
			assignee: '',
			dueDate: '',
			epicId: defaultEpicId
		} satisfies CreateUserStoryDto;
	}

	// Reset form each time the modal opens or the story changes
	$effect(() => {
		if (!open) return;
		void story;
		void defaultEpicId;
		form = buildForm();
		error = null;
	});

	/**
	 * Submits the form: creates or updates the user story.
	 */
	async function submit(): Promise<void> {
		try {
			if (story) {
				await api.updateUserStory(story.id, form as UpdateUserStoryDto);
			} else {
				await api.createUserStory(form as CreateUserStoryDto);
			}
			onSave();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save user story';
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
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<Modal open={open} title={isEdit ? 'Edit user story' : 'Add user story'} onclose={onClose}>
	<form class="form" onsubmit={(e) => { e.preventDefault(); void submit(); }}>
		{#if error}
			<p class="form-error">{error}</p>
		{/if}

		<div class="form-group">
			<label for="story-title">Title <span class="required">*</span></label>
			<input
				id="story-title"
				type="text"
				bind:value={form.title}
				required
				placeholder="As a user, I want to…"
			/>
		</div>

		<div class="form-group">
			<label for="story-description">Description</label>
			<textarea
				id="story-description"
				bind:value={form.description}
				placeholder="Acceptance criteria, context…"
				rows="3"
			></textarea>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="story-status">Status</label>
				<select id="story-status" bind:value={form.status}>
					{#each Object.values(UserStoryGroup) as group}
						<optgroup label={group}>
							{#each STATUSES_BY_GROUP[group] as status}
								<option value={status}>{STATUS_META[status].label}</option>
							{/each}
						</optgroup>
					{/each}
					<optgroup label="TERMINAL">
						<option value={UserStoryStatus.CANCELLED}>{STATUS_META[UserStoryStatus.CANCELLED].label}</option>
					</optgroup>
				</select>
			</div>
			<div class="form-group">
				<label for="story-priority">Priority</label>
				<select id="story-priority" bind:value={form.priority}>
					{#each Object.values(UserStoryPriority) as priority}
						<option value={priority}>{priority}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="story-assignee">Assignee</label>
				<input
					id="story-assignee"
					type="text"
					bind:value={form.assignee}
					placeholder="Name or email"
				/>
			</div>
			<div class="form-group">
				<label for="story-due">Due date</label>
				<input id="story-due" type="date" bind:value={form.dueDate} />
			</div>
		</div>

		<div class="form-group">
			<label for="story-epic">Epic</label>
			<select id="story-epic" bind:value={form.epicId}>
				<option value="">— None —</option>
				{#each epics as epic}
					<option value={epic.id}>{epic.title}</option>
				{/each}
			</select>
		</div>

		{#if isEdit && story}
			<div class="detail-meta">
				<span>Created {formatDate(story.createdAt)}</span>
				<span>Updated {formatDate(story.updatedAt)}</span>
			</div>
		{/if}

		<div class="form-actions">
			<button type="button" class="btn btn-secondary" onclick={onClose}>Cancel</button>
			<button type="submit" class="btn btn-primary">{isEdit ? 'Save' : 'Add story'}</button>
		</div>
	</form>
</Modal>
