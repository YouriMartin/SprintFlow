<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { auth } from '$lib/auth.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		loading = true;

		try {
			const { accessToken, user } = await api.login(email, password);
			auth.setSession(accessToken, user);
			await goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="login-page">
	<div class="login-card">
		<h1 class="logo">SprintFlow</h1>
		<p class="tagline">Sign in to your account</p>

		<form onsubmit={handleSubmit}>
			<div class="field">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					autocomplete="email"
					placeholder="you@example.com"
				/>
			</div>

			<div class="field">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					autocomplete="current-password"
					placeholder="••••••••"
				/>
			</div>

			{#if error}
				<p class="error" role="alert">{error}</p>
			{/if}

			<button type="submit" disabled={loading} class="btn-primary">
				{loading ? 'Signing in…' : 'Sign in'}
			</button>
		</form>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f3f4f6;
	}

	.login-card {
		background: #fff;
		padding: 2.5rem;
		border-radius: 0.75rem;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		width: 100%;
		max-width: 400px;
	}

	.logo {
		font-size: 1.75rem;
		font-weight: 700;
		color: #4f46e5;
		margin-bottom: 0.25rem;
	}

	.tagline {
		color: #6b7280;
		margin-bottom: 2rem;
		font-size: 0.95rem;
	}

	.field {
		margin-bottom: 1.25rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.375rem;
	}

	input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.95rem;
		transition: border-color 0.15s;
	}

	input:focus {
		outline: none;
		border-color: #4f46e5;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
	}

	.error {
		color: #dc2626;
		font-size: 0.875rem;
		margin-bottom: 1rem;
		padding: 0.5rem 0.75rem;
		background: #fef2f2;
		border-radius: 0.375rem;
		border: 1px solid #fecaca;
	}

	.btn-primary {
		width: 100%;
		padding: 0.75rem;
		background: #4f46e5;
		color: #fff;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
		margin-top: 0.5rem;
	}

	.btn-primary:hover:not(:disabled) {
		background: #4338ca;
	}

	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
