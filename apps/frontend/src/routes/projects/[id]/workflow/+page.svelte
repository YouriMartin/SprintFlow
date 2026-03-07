<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api';
	import type {
		Workflow,
		WorkflowStatus,
		WorkflowTransition
	} from '$lib/types';

	// ── Route params ──────────────────────────────────────────────────
	let projectId = $state('');

	$effect(() => {
		const unsubscribe = page.subscribe((p) => {
			projectId = p.params.id;
		});
		return unsubscribe;
	});

	// ── State ─────────────────────────────────────────────────────────
	let workflow: Workflow = $state({ statuses: [], transitions: [] });
	let loading = $state(true);
	let error: string | null = $state(null);

	/** ID of the currently selected status box */
	let selectedId: string | null = $state(null);

	/** Whether "Connect" mode is active */
	let connectMode = $state(false);

	/** First status clicked in connect mode (source) */
	let connectSource: string | null = $state(null);

	// ── Drag state ────────────────────────────────────────────────────
	let dragging: string | null = $state(null);
	let dragOffsetX = $state(0);
	let dragOffsetY = $state(0);
	/** True if the mouse actually moved during the current drag — suppresses the click event */
	let didDrag = $state(false);

	// ── Edit panel form ───────────────────────────────────────────────
	let editLabel = $state('');
	/** Multi-group selection: a status can appear in multiple views */
	let editGroupNames: string[] = $state([]);
	let editColor = $state('#6b7280');
	let editIsInitial = $state(false);
	let editIsTerminal = $state(false);
	let editSaving = $state(false);
	let editError: string | null = $state(null);

	const ALL_GROUPS = ['SPECIFICATION', 'DEVELOPMENT', 'DEPLOYMENT'] as const;

	/**
	 * Toggles a group in the multi-group selection.
	 * @param group - The group name to toggle
	 */
	function toggleGroup(group: string): void {
		if (editGroupNames.includes(group)) {
			editGroupNames = editGroupNames.filter((g) => g !== group);
		} else {
			editGroupNames = [...editGroupNames, group];
		}
	}

	// ── SVG canvas dimensions ─────────────────────────────────────────
	const BOX_W = 160;
	const BOX_H = 54;
	const CANVAS_W = 1500;
	const CANVAS_H = 600;

	// ── Group colour map ──────────────────────────────────────────────
	const GROUP_COLORS: Record<string, string> = {
		SPECIFICATION: '#3b82f6',
		DEVELOPMENT: '#8b5cf6',
		DEPLOYMENT: '#22c55e'
	};

	// ── Derived helpers ───────────────────────────────────────────────

	/**
	 * Returns the status object for the given ID.
	 * @param id - UUID of the status
	 */
	function statusById(id: string): WorkflowStatus | undefined {
		return workflow.statuses.find((s) => s.id === id);
	}

	/**
	 * Returns the currently selected status, or null.
	 */
	function selectedStatus(): WorkflowStatus | null {
		return selectedId ? (statusById(selectedId) ?? null) : null;
	}

	/**
	 * Returns the left border colour for a status box.
	 * Uses the first group's colour, or gray when the status has no group.
	 * @param status - The workflow status
	 */
	function boxBorderColor(status: WorkflowStatus): string {
		const first = status.groupNames[0];
		return first ? (GROUP_COLORS[first] ?? '#6b7280') : '#6b7280';
	}

	// ── Data fetching ─────────────────────────────────────────────────

	/**
	 * Fetches the workflow for the current project.
	 */
	async function fetchWorkflow(): Promise<void> {
		try {
			loading = true;
			error = null;
			workflow = await api.getWorkflow(projectId);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load workflow';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void fetchWorkflow();
	});

	// ── Selection & edit panel ────────────────────────────────────────

	/**
	 * Opens the edit panel for the given status.
	 * @param status - The status to edit
	 */
	function openEditPanel(status: WorkflowStatus): void {
		selectedId = status.id;
		editLabel = status.label;
		editGroupNames = [...status.groupNames];
		editColor = status.color;
		editIsInitial = status.isInitial;
		editIsTerminal = status.isTerminal;
		editError = null;
	}

	/**
	 * Closes the edit panel and deselects the current status.
	 */
	function closeEditPanel(): void {
		selectedId = null;
		connectSource = null;
	}

	// ── Drag ──────────────────────────────────────────────────────────

	/**
	 * Begins dragging a status box.
	 * @param e - The mouse event
	 * @param statusId - UUID of the status being dragged
	 */
	function onBoxMouseDown(e: MouseEvent, statusId: string): void {
		if (connectMode) return; // handled by click, not drag
		e.stopPropagation();
		dragging = statusId;
		didDrag = false;
		const s = statusById(statusId)!;
		dragOffsetX = e.clientX - s.posX;
		dragOffsetY = e.clientY - s.posY;
	}

	/**
	 * Handles mouse move on the canvas for dragging.
	 * @param e - The mouse event
	 */
	function onCanvasMouseMove(e: MouseEvent): void {
		if (!dragging) return;
		const s = workflow.statuses.find((st) => st.id === dragging);
		if (!s) return;
		s.posX = Math.max(0, e.clientX - dragOffsetX);
		s.posY = Math.max(0, e.clientY - dragOffsetY);
		didDrag = true;
	}

	/**
	 * Finishes dragging and persists the new position.
	 */
	async function onCanvasMouseUp(): Promise<void> {
		if (!dragging) return;
		const s = statusById(dragging);
		if (s) {
			try {
				await api.updateWorkflowStatus(projectId, s.id, { posX: s.posX, posY: s.posY });
			} catch {
				// position update is best-effort; no UI error shown
			}
		}
		dragging = null;
	}

	// ── Connect mode ──────────────────────────────────────────────────

	/**
	 * Handles a click on a status box.
	 * In connect mode: selects source then creates a transition.
	 * In normal mode: opens the edit panel.
	 * @param status - The status that was clicked
	 */
	async function onBoxClick(status: WorkflowStatus): Promise<void> {
		if (didDrag) {
			didDrag = false;
			return;
		}

		if (!connectMode) {
			openEditPanel(status);
			return;
		}

		if (!connectSource) {
			connectSource = status.id;
			return;
		}

		if (connectSource === status.id) {
			connectSource = null;
			return;
		}

		// Create transition
		try {
			const transition = await api.createWorkflowTransition(projectId, {
				fromStatusId: connectSource,
				toStatusId: status.id
			});
			workflow.transitions = [...workflow.transitions, transition];
		} catch {
			// duplicate transition or other error — silently ignore
		}
		connectSource = null;
	}

	/**
	 * Toggles connect mode on/off.
	 */
	function toggleConnectMode(): void {
		connectMode = !connectMode;
		connectSource = null;
		if (connectMode) selectedId = null;
	}

	// ── Transition delete ─────────────────────────────────────────────

	/**
	 * Deletes a workflow transition after confirmation.
	 * @param transition - The transition to delete
	 */
	async function deleteTransition(transition: WorkflowTransition): Promise<void> {
		if (!confirm('Delete this transition?')) return;
		try {
			await api.deleteWorkflowTransition(projectId, transition.id);
			workflow.transitions = workflow.transitions.filter((t) => t.id !== transition.id);
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete transition');
		}
	}

	// ── Add Status ────────────────────────────────────────────────────

	/**
	 * Creates a new status with default values at position (100, 100).
	 */
	async function addStatus(): Promise<void> {
		try {
			const created = await api.createWorkflowStatus(projectId, {
				key: `status_${Date.now()}`,
				label: 'New Status',
				posX: 100,
				posY: 100
			});
			workflow.statuses = [...workflow.statuses, created];
			openEditPanel(created);
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to create status');
		}
	}

	// ── Save Status ───────────────────────────────────────────────────

	/**
	 * Saves changes from the edit panel to the selected status.
	 */
	async function saveStatus(): Promise<void> {
		if (!selectedId) return;
		editSaving = true;
		editError = null;
		try {
			const updated = await api.updateWorkflowStatus(projectId, selectedId, {
				label: editLabel,
				groupNames: editGroupNames,
				color: editColor,
				isInitial: editIsInitial,
				isTerminal: editIsTerminal
			});
			workflow.statuses = workflow.statuses.map((s) => (s.id === updated.id ? updated : s));
		} catch (err) {
			editError = err instanceof Error ? err.message : 'Failed to save status';
		} finally {
			editSaving = false;
		}
	}

	// ── Delete Status ─────────────────────────────────────────────────

	/**
	 * Deletes the currently selected status after confirmation.
	 */
	async function deleteStatus(): Promise<void> {
		if (!selectedId) return;
		if (!confirm('Delete this status? Any stories using it will need to be updated.')) return;
		try {
			await api.deleteWorkflowStatus(projectId, selectedId);
			workflow.statuses = workflow.statuses.filter((s) => s.id !== selectedId);
			workflow.transitions = workflow.transitions.filter(
				(t) => t.fromStatusId !== selectedId && t.toStatusId !== selectedId
			);
			selectedId = null;
		} catch (err) {
			editError = err instanceof Error ? err.message : 'Failed to delete status';
		}
	}

	// ── SVG arrow helpers ─────────────────────────────────────────────

	/** px: horizontal stub out of/into a box before the first bend */
	const STUB = 30;
	/** px: corner rounding radius */
	const CORNER_R = 8;
	/** px: clearance between the routed corridor and obstacle box edges */
	const LANE_PAD = 16;

	/**
	 * Returns all statuses (excluding from/to) whose bounding box overlaps
	 * the rectangular region spanning the two connected boxes.
	 * @param from - Source status
	 * @param to - Target status
	 */
	function obstaclesInBand(from: WorkflowStatus, to: WorkflowStatus): WorkflowStatus[] {
		const xMin = Math.min(from.posX + BOX_W, to.posX);
		const xMax = Math.max(from.posX + BOX_W, to.posX);
		const yMin = Math.min(from.posY, to.posY);
		const yMax = Math.max(from.posY + BOX_H, to.posY + BOX_H);
		return workflow.statuses.filter((s) => {
			if (s.id === from.id || s.id === to.id) return false;
			return s.posX < xMax && s.posX + BOX_W > xMin && s.posY < yMax && s.posY + BOX_H > yMin;
		});
	}

	/**
	 * Picks a horizontal corridor Y that clears all obstacle boxes,
	 * preferring the option (above or below) closest to the midpoint of y1/y2.
	 * @param obstacles - Boxes to avoid
	 * @param y1 - Source center Y
	 * @param y2 - Target center Y
	 */
	function findCorridorY(obstacles: WorkflowStatus[], y1: number, y2: number): number {
		const topY = Math.min(...obstacles.map((s) => s.posY)) - LANE_PAD;
		const botY = Math.max(...obstacles.map((s) => s.posY + BOX_H)) + LANE_PAD;
		const mid = (y1 + y2) / 2;
		return Math.abs(topY - mid) <= Math.abs(botY - mid) ? topY : botY;
	}

	/**
	 * Builds an orthogonal SVG path with right-angle bends and rounded corners,
	 * routing from (x1, y1) through a horizontal corridor at cy to (x2, y2).
	 * Works for both forward (x2 > x1) and backward (x2 < x1) transitions.
	 * @param x1 - Source exit X
	 * @param y1 - Source exit Y
	 * @param x2 - Target entry X
	 * @param y2 - Target entry Y
	 * @param cy - Corridor Y to route through
	 */
	function buildOrthogonalPath(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		cy: number
	): string {
		const lx = x1 + STUB; // X after exit stub
		const rx = x2 - STUB; // X before entry stub
		const r = Math.min(CORNER_R, Math.abs(cy - y1) / 2, Math.abs(y2 - cy) / 2);
		if (r < 1) {
			// Degenerate: fall back to bezier
			const cx = (x1 + x2) / 2;
			return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
		}
		const v1 = cy >= y1 ? 1 : -1; // direction: source Y → corridor
		const v2 = y2 >= cy ? 1 : -1; // direction: corridor → target Y
		return [
			`M ${x1} ${y1}`,
			`H ${lx - r}`,
			`Q ${lx} ${y1} ${lx} ${y1 + v1 * r}`,      // corner A: right → vertical
			`V ${cy - v1 * r}`,
			`Q ${lx} ${cy} ${lx + r} ${cy}`,             // corner B: vertical → corridor
			`H ${rx - r}`,
			`Q ${rx} ${cy} ${rx} ${cy + v2 * r}`,        // corner C: corridor → vertical
			`V ${y2 - v2 * r}`,
			`Q ${rx} ${y2} ${rx + r} ${y2}`,             // corner D: vertical → right
			`H ${x2}`,
		].join(' ');
	}

	/**
	 * Builds a C-shape path: exit right → vertical segment → enter left.
	 * Used when the target is to the left but at a different vertical position.
	 * The rightmost X of the C is x1 + STUB (just past the source box).
	 * @param x1 - Source exit X (right edge of source)
	 * @param y1 - Source exit Y (center of source)
	 * @param x2 - Target entry X (left edge of target)
	 * @param y2 - Target entry Y (center of target)
	 */
	function buildCShapePath(x1: number, y1: number, x2: number, y2: number): string {
		const lx = x1 + STUB; // rightmost X of the C
		const v = y2 > y1 ? 1 : -1;
		const r = Math.min(CORNER_R, Math.abs(y2 - y1) / 2, (lx - x2) / 2);
		if (r < 1) {
			const cx = (x1 + x2) / 2;
			return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
		}
		return [
			`M ${x1} ${y1}`,
			`H ${lx - r}`,
			`Q ${lx} ${y1} ${lx} ${y1 + v * r}`, // corner: right → vertical
			`V ${y2 - v * r}`,
			`Q ${lx} ${y2} ${lx - r} ${y2}`,      // corner: vertical → left
			`H ${x2}`,
		].join(' ');
	}

	/**
	 * Decides which routing strategy to use and returns the SVG path.
	 *
	 * - Forward (target to the right): horizontal corridor routing, avoiding obstacles.
	 * - Backward + vertical offset (target left and below/above): C-shape routing.
	 * - Backward + same row (target left, similar Y): loop below both boxes.
	 * @param from - Source status
	 * @param to - Target status
	 */
	function arrowPath(from: WorkflowStatus, to: WorkflowStatus): string {
		const x1 = from.posX + BOX_W;
		const y1 = from.posY + BOX_H / 2;
		const x2 = to.posX;
		const y2 = to.posY + BOX_H / 2;

		// Backward (target is to the left of source exit)
		if (x2 < x1 - STUB * 2) {
			if (Math.abs(y2 - y1) > STUB * 2) {
				// Vertically offset: C-shape (right → vertical → left)
				return buildCShapePath(x1, y1, x2, y2);
			}
			// Same row: loop below both boxes
			const loopY = Math.max(from.posY + BOX_H, to.posY + BOX_H) + LANE_PAD + 10;
			return buildOrthogonalPath(x1, y1, x2, y2, loopY);
		}

		// Forward: check for obstacles and route around them
		const obstacles = obstaclesInBand(from, to);
		if (obstacles.length === 0) {
			if (Math.abs(y1 - y2) < 4) return `M ${x1} ${y1} H ${x2}`;
			const cx = (x1 + x2) / 2;
			return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
		}
		const cy = findCorridorY(obstacles, y1, y2);
		return buildOrthogonalPath(x1, y1, x2, y2, cy);
	}

	/**
	 * Returns the midpoint of the arrow path for placing the delete button,
	 * using the same routing decision as arrowPath.
	 * @param from - Source status
	 * @param to - Target status
	 */
	function arrowMidpoint(from: WorkflowStatus, to: WorkflowStatus): { x: number; y: number } {
		const x1 = from.posX + BOX_W;
		const y1 = from.posY + BOX_H / 2;
		const x2 = to.posX;
		const y2 = to.posY + BOX_H / 2;

		if (x2 < x1 - STUB * 2) {
			if (Math.abs(y2 - y1) > STUB * 2) {
				// C-shape: midpoint is at the rightmost X, halfway vertically
				return { x: x1 + STUB, y: (y1 + y2) / 2 };
			}
			// Loop: midpoint is at the bottom of the loop
			const loopY = Math.max(from.posY + BOX_H, to.posY + BOX_H) + LANE_PAD + 10;
			return { x: (x1 + x2) / 2, y: loopY };
		}

		const obstacles = obstaclesInBand(from, to);
		if (obstacles.length > 0) {
			const cy = findCorridorY(obstacles, y1, y2);
			return { x: (x1 + STUB + (x2 - STUB)) / 2, y: cy };
		}
		return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
	}
</script>

<div class="workflow-page">
	<!-- ── Toolbar ── -->
	<div class="toolbar">
		<h1 class="page-title">Workflow Editor</h1>
		<div class="toolbar-actions">
			<button class="btn btn-secondary" onclick={addStatus}>
				+ Add Status
			</button>
			<button
				class="btn"
				class:btn-primary={connectMode}
				class:btn-secondary={!connectMode}
				onclick={toggleConnectMode}
			>
				{connectMode ? 'Cancel Connect' : 'Connect →'}
			</button>
		</div>
		{#if connectMode}
			<span class="connect-hint">
				{connectSource
					? `Click the target status to connect from "${statusById(connectSource)?.label}"`
					: 'Click a source status'}
			</span>
		{/if}
	</div>

	<!-- ── Main area ── -->
	<div class="main">
		<!-- ── Canvas ── -->
		<div
			class="canvas-wrapper"
			role="application"
			aria-label="Workflow canvas"
			onmousemove={onCanvasMouseMove}
			onmouseup={onCanvasMouseUp}
		>
			{#if loading}
				<div class="canvas-state">Loading workflow…</div>
			{:else if error}
				<div class="canvas-state canvas-error">{error}</div>
			{:else}
				<!-- SVG layer for arrows -->
				<svg
					class="arrow-layer"
					width={CANVAS_W}
					height={CANVAS_H}
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						<marker
							id="arrowhead"
							markerWidth="8"
							markerHeight="8"
							refX="6"
							refY="3"
							orient="auto"
						>
							<path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
						</marker>
					</defs>

					{#each workflow.transitions as t (t.id)}
						{@const from = statusById(t.fromStatusId)}
						{@const to = statusById(t.toStatusId)}
						{#if from && to}
							{@const mid = arrowMidpoint(from, to)}
							<path
								class="arrow-path"
								d={arrowPath(from, to)}
								marker-end="url(#arrowhead)"
							/>
							<!-- Invisible wider hit area for clicking -->
							<path
								class="arrow-hit"
								d={arrowPath(from, to)}
								onclick={() => deleteTransition(t)}
								role="button"
								aria-label="Delete transition"
								tabindex="0"
								onkeydown={(e) => e.key === 'Enter' && deleteTransition(t)}
							/>
							<!-- Delete icon dot -->
							<circle
								class="arrow-delete-dot"
								cx={mid.x}
								cy={mid.y}
								r="7"
								onclick={() => deleteTransition(t)}
								role="button"
								aria-label="Delete transition"
								tabindex="0"
								onkeydown={(e) => e.key === 'Enter' && deleteTransition(t)}
							/>
							<text
								class="arrow-delete-x"
								x={mid.x}
								y={mid.y + 4}
								text-anchor="middle"
								onclick={() => deleteTransition(t)}
							>×</text>
						{/if}
					{/each}
				</svg>

				<!-- Status boxes (absolutely positioned) -->
				{#each workflow.statuses as s (s.id)}
					{@const isSelected = selectedId === s.id}
					{@const isConnectSrc = connectSource === s.id}
					{@const borderColor = boxBorderColor(s)}
					<div
						class="status-box"
						class:selected={isSelected}
						class:connect-source={isConnectSrc}
						class:connect-mode={connectMode}
						style="left: {s.posX}px; top: {s.posY}px; width: {BOX_W}px; height: {BOX_H}px; border-left-color: {borderColor};"
						role="button"
						tabindex="0"
						aria-label="Status: {s.label}"
						aria-pressed={isSelected}
						onmousedown={(e) => onBoxMouseDown(e, s.id)}
						onclick={() => onBoxClick(s)}
						onkeydown={(e) => e.key === 'Enter' && onBoxClick(s)}
					>
						<span class="status-key">{s.key}</span>
						<span class="status-label">{s.label}</span>
						{#if s.isInitial}
							<span class="status-badge badge-initial">start</span>
						{/if}
						{#if s.isTerminal}
							<span class="status-badge badge-terminal">end</span>
						{/if}
					</div>
				{/each}
			{/if}
		</div>

		<!-- ── Edit Panel ── -->
		{#if selectedId && !connectMode}
			{@const sel = selectedStatus()}
			{#if sel}
				<aside class="edit-panel">
					<div class="edit-panel-header">
						<span class="edit-panel-title">Edit Status</span>
						<button class="close-btn" onclick={closeEditPanel} aria-label="Close panel">×</button>
					</div>

					{#if editError}
						<div class="edit-error">{editError}</div>
					{/if}

					<div class="form-group">
						<label for="edit-key">Key</label>
						<input id="edit-key" type="text" value={sel.key} disabled />
					</div>

					<div class="form-group">
						<label for="edit-label">Label</label>
						<input id="edit-label" type="text" bind:value={editLabel} />
					</div>

					<div class="form-group">
						<span class="groups-label">Views (can select multiple)</span>
						<div class="groups-list">
							{#each ALL_GROUPS as group}
								<label class="group-check">
									<input
										type="checkbox"
										checked={editGroupNames.includes(group)}
										onchange={() => toggleGroup(group)}
									/>
									<span
										class="group-dot"
										style="background: {GROUP_COLORS[group] ?? '#6b7280'}"
									></span>
									{group.charAt(0) + group.slice(1).toLowerCase()}
								</label>
							{/each}
						</div>
					</div>

					<div class="form-group">
						<label for="edit-color">Color</label>
						<div class="color-row">
							<input id="edit-color" type="color" bind:value={editColor} />
							<span class="color-value">{editColor}</span>
						</div>
					</div>

					<div class="form-group checkbox-group">
						<label>
							<input type="checkbox" bind:checked={editIsInitial} />
							Initial status (new stories start here)
						</label>
					</div>

					<div class="form-group checkbox-group">
						<label>
							<input type="checkbox" bind:checked={editIsTerminal} />
							Terminal status (final state)
						</label>
					</div>

					<div class="edit-actions">
						<button
							class="btn btn-danger"
							onclick={deleteStatus}
						>
							Delete
						</button>
						<button
							class="btn btn-primary"
							onclick={saveStatus}
							disabled={editSaving}
						>
							{editSaving ? 'Saving…' : 'Save'}
						</button>
					</div>
				</aside>
			{/if}
		{/if}
	</div>
</div>

<style>
	.workflow-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
		background: #f8fafc;
	}

	/* ── Toolbar ── */
	.toolbar {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1.5rem;
		background: #fff;
		border-bottom: 1px solid #e2e8f0;
		flex-shrink: 0;
		flex-wrap: wrap;
	}

	.page-title {
		font-size: 1.0625rem;
		font-weight: 600;
		color: #0f172a;
		margin: 0;
		flex: 1;
	}

	.toolbar-actions {
		display: flex;
		gap: 0.5rem;
	}

	.connect-hint {
		font-size: 0.8125rem;
		color: #6366f1;
		font-style: italic;
		width: 100%;
	}

	/* ── Main layout ── */
	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ── Canvas ── */
	.canvas-wrapper {
		flex: 1;
		position: relative;
		overflow: auto;
		background:
			radial-gradient(circle, #cbd5e1 1px, transparent 1px) 0 0 / 24px 24px;
		cursor: default;
		min-width: 0;
	}

	.canvas-state {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #94a3b8;
		font-size: 0.875rem;
	}

	.canvas-error {
		color: #dc2626;
	}

	/* ── SVG arrows ── */
	.arrow-layer {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		overflow: visible;
	}

	.arrow-path {
		fill: none;
		stroke: #94a3b8;
		stroke-width: 1.5;
		marker-end: url(#arrowhead);
	}

	.arrow-hit {
		fill: none;
		stroke: transparent;
		stroke-width: 12;
		pointer-events: stroke;
		cursor: pointer;
	}

	.arrow-delete-dot {
		fill: #ef4444;
		cursor: pointer;
		pointer-events: all;
		opacity: 0;
		transition: opacity 0.15s;
	}

	.arrow-delete-x {
		fill: #fff;
		font-size: 12px;
		font-weight: 700;
		pointer-events: none;
		opacity: 0;
	}

	.canvas-wrapper:hover .arrow-delete-dot,
	.canvas-wrapper:hover .arrow-delete-x {
		opacity: 1;
	}

	/* ── Status boxes ── */
	.status-box {
		position: absolute;
		background: #fff;
		border: 1px solid #e2e8f0;
		border-left: 4px solid #6b7280;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0.375rem 0.625rem;
		cursor: grab;
		user-select: none;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
		transition: box-shadow 0.13s, border-color 0.13s;
		overflow: hidden;
	}

	.status-box:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
	}

	.status-box.selected {
		outline: 2px solid #6366f1;
		outline-offset: 1px;
	}

	.status-box.connect-source {
		outline: 2px solid #f59e0b;
		outline-offset: 1px;
		box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
	}

	.status-box.connect-mode {
		cursor: crosshair;
	}

	.status-key {
		font-size: 0.625rem;
		color: #94a3b8;
		font-family: monospace;
		line-height: 1;
		margin-bottom: 2px;
	}

	.status-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: #1e293b;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status-badge {
		position: absolute;
		top: 3px;
		right: 4px;
		font-size: 0.5rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 1px 4px;
		border-radius: 3px;
	}

	.badge-initial {
		background: #dbeafe;
		color: #1d4ed8;
	}

	.badge-terminal {
		background: #d1fae5;
		color: #065f46;
	}

	/* ── Edit Panel ── */
	.edit-panel {
		width: 260px;
		min-width: 260px;
		background: #fff;
		border-left: 1px solid #e2e8f0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		overflow-y: auto;
		flex-shrink: 0;
	}

	.edit-panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.edit-panel-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #0f172a;
	}

	.close-btn {
		width: 24px;
		height: 24px;
		border: none;
		background: transparent;
		color: #94a3b8;
		font-size: 1.125rem;
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		line-height: 1;
	}

	.close-btn:hover {
		background: #f1f5f9;
		color: #475569;
	}

	.edit-error {
		padding: 0.5rem 0.75rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 6px;
		color: #dc2626;
		font-size: 0.8125rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-group label {
		font-size: 0.75rem;
		font-weight: 500;
		color: #64748b;
	}

	.form-group input[type='text'],
	.form-group select {
		padding: 0.375rem 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 0.8125rem;
		color: #1e293b;
		background: #fff;
	}

	.form-group input[type='text']:focus,
	.form-group select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
	}

	.form-group input:disabled {
		background: #f8fafc;
		color: #94a3b8;
	}

	.color-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.form-group input[type='color'] {
		width: 36px;
		height: 28px;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		padding: 2px;
		cursor: pointer;
		background: #fff;
	}

	.color-value {
		font-size: 0.75rem;
		color: #64748b;
		font-family: monospace;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: #374151;
		cursor: pointer;
		font-weight: 400;
	}

	.checkbox-group input[type='checkbox'] {
		width: 14px;
		height: 14px;
		cursor: pointer;
	}

	/* Multi-group checkboxes */
	.groups-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: #64748b;
		margin-bottom: 0.25rem;
		display: block;
	}

	.groups-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.group-check {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: #374151;
		cursor: pointer;
	}

	.group-check input[type='checkbox'] {
		width: 14px;
		height: 14px;
		cursor: pointer;
		flex-shrink: 0;
	}

	.group-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.edit-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	/* ── Buttons ── */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.4375rem 0.875rem;
		border: none;
		border-radius: 6px;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.13s, opacity 0.13s;
		white-space: nowrap;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: #6366f1;
		color: #fff;
		flex: 1;
	}

	.btn-primary:hover:not(:disabled) {
		background: #4f46e5;
	}

	.btn-secondary {
		background: #f1f5f9;
		color: #374151;
	}

	.btn-secondary:hover {
		background: #e2e8f0;
	}

	.btn-danger {
		background: #fef2f2;
		color: #dc2626;
		border: 1px solid #fecaca;
	}

	.btn-danger:hover {
		background: #fee2e2;
	}
</style>
