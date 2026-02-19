// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

export const load = async ({ fetch, url }: Parameters<LayoutLoad>[0]) => {
	if (url.pathname.startsWith('/setup')) {
		return {};
	}

	let setupRequired = false;

	try {
		const response = await fetch(`${API_BASE_URL}/setup/status`);
		if (response.ok) {
			const { required } = await response.json();
			setupRequired = required;
		}
	} catch {
		// Backend unreachable — continue to app without redirecting
	}

	if (setupRequired) {
		redirect(302, '/setup');
	}

	return {};
};
