import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';
import { auth } from '$lib/auth.svelte';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

const PUBLIC_PATHS = ['/login', '/setup'];

export const load: LayoutLoad = async ({ fetch, url }) => {
	const isPublicPath = PUBLIC_PATHS.some((p) => url.pathname.startsWith(p));

	// Always check setup status so the setup flow works (skip on login page itself)
	if (!url.pathname.startsWith('/login')) {
		let setupRequired = false;
		try {
			const response = await fetch(`${API_BASE_URL}/setup/status`);
			if (response.ok) {
				const { required } = await response.json();
				setupRequired = required;
			}
		} catch {
			// Backend unreachable — continue
		}

		if (setupRequired) {
			redirect(302, '/setup');
		}
	}

	if (isPublicPath) {
		return {};
	}

	// Auth state lives in JS memory — only meaningful on the client.
	// During SSR we allow the page through; the client will redirect to /login
	// if the refresh cookie is absent or invalid.
	if (browser && !auth.token) {
		const refreshed = await auth.refresh();
		if (!refreshed) {
			redirect(302, '/login');
		}
	}

	return { user: auth.user };
};
