<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { onMount } from 'svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let submitting = $state(false);

	onMount(async () => {
		try {
			const { required } = await api.getSetupStatus();
			if (!required) {
				goto('/');
			}
		} catch {
			// Backend unreachable — stay on setup page
		}
	});

	function validate(): string {
		if (!name.trim()) return 'Le nom complet est requis.';
		if (!email.trim()) return "L'adresse email est requise.";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "L'adresse email est invalide.";
		if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
		if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas.';
		return '';
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		const validationError = validate();
		if (validationError) {
			error = validationError;
			return;
		}

		submitting = true;
		try {
			await api.createSetup({ name: name.trim(), email: email.trim(), password });
			goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Une erreur est survenue.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="setup-page">
	<div class="setup-card">
		<div class="setup-header">
			<div class="logo">
				<div class="logo-icon">SF</div>
				<span class="logo-text">SprintFlow</span>
			</div>
			<h1>Bienvenue sur SprintFlow</h1>
			<p class="subtitle">
				Créez votre compte administrateur pour commencer à utiliser l'application.
			</p>
		</div>

		<form onsubmit={handleSubmit} class="setup-form">
			{#if error}
				<div class="error-banner" role="alert">{error}</div>
			{/if}

			<div class="field">
				<label for="name">Nom complet</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					placeholder="Jean Dupont"
					autocomplete="name"
					disabled={submitting}
					required
				/>
			</div>

			<div class="field">
				<label for="email">Adresse email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="admin@example.com"
					autocomplete="email"
					disabled={submitting}
					required
				/>
			</div>

			<div class="field">
				<label for="password">Mot de passe</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Minimum 8 caractères"
					autocomplete="new-password"
					disabled={submitting}
					required
				/>
			</div>

			<div class="field">
				<label for="confirmPassword">Confirmer le mot de passe</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					placeholder="Répétez votre mot de passe"
					autocomplete="new-password"
					disabled={submitting}
					required
				/>
			</div>

			<button type="submit" class="submit-btn" disabled={submitting}>
				{#if submitting}
					Création en cours…
				{:else}
					Créer le compte administrateur
				{/if}
			</button>
		</form>
	</div>
</div>

<style>
	.setup-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.setup-card {
		background: #ffffff;
		border-radius: 16px;
		padding: 2.5rem;
		width: 100%;
		max-width: 440px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.setup-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.logo {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.logo-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-size: 0.875rem;
		letter-spacing: 0.05em;
	}

	.logo-text {
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #6b7280;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.setup-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.error-banner {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #b91c1c;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	input {
		padding: 0.625rem 0.875rem;
		border: 1.5px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.9rem;
		color: #111827;
		background: #ffffff;
		transition: border-color 0.15s;
		outline: none;
	}

	input:focus {
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	input:disabled {
		background: #f9fafb;
		color: #9ca3af;
		cursor: not-allowed;
	}

	.submit-btn {
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s, transform 0.1s;
	}

	.submit-btn:hover:not(:disabled) {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
</style>
