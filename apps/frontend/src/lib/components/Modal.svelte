<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Reusable modal dialog component
	 * Displays content in an overlay with close functionality
	 */

	interface Props {
		/** Whether the modal is visible */
		open: boolean;
		/** Title displayed in the modal header */
		title: string;
		/** Callback when the modal should close */
		onclose: () => void;
		/** Modal content */
		children?: Snippet;
	}

	let { open, title, onclose, children }: Props = $props();

	/**
	 * Handles keyboard events for accessibility
	 * @param event - Keyboard event
	 */
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape' && open) {
			onclose();
		}
	}

	/**
	 * Handles click on the backdrop to close the modal
	 * @param event - Mouse event
	 */
	function handleBackdropClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			onclose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="modal-backdrop" onclick={handleBackdropClick} onkeydown={handleKeydown} role="presentation">
		<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
			<div class="modal-header">
				<h2 id="modal-title" class="modal-title">{title}</h2>
				<button class="modal-close" onclick={onclose} aria-label="Close modal">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		background-color: #f9fafb;
	}

	.modal-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
	}

	.modal-close {
		background: transparent;
		border: none;
		font-size: 1.5rem;
		color: #6b7280;
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
		border-radius: 4px;
		transition: background-color 0.2s, color 0.2s;
	}

	.modal-close:hover {
		background-color: #e5e7eb;
		color: #1f2937;
	}

	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
	}
</style>
