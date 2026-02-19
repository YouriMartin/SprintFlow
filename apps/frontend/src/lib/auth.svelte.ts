import type { AuthUser } from './types';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

let _accessToken: string | null = $state(null);
let _currentUser: AuthUser | null = $state(null);

/**
 * Auth store providing reactive access to the current session.
 * The access token is kept in JS memory (never localStorage) for XSS safety.
 * The refresh token lives in an HTTP-only cookie managed by the server.
 */
export const auth = {
	/** The current access token, or null if not authenticated */
	get token(): string | null {
		return _accessToken;
	},

	/** The currently authenticated user, or null */
	get user(): AuthUser | null {
		return _currentUser;
	},

	/**
	 * Stores the access token and user after a successful login or refresh.
	 * @param token - JWT access token
	 * @param user - Public user fields from the server
	 */
	setSession(token: string, user: AuthUser): void {
		_accessToken = token;
		_currentUser = user;
	},

	/** Clears the in-memory session (token + user). */
	clearSession(): void {
		_accessToken = null;
		_currentUser = null;
	},

	/**
	 * Attempts to refresh the access token using the HTTP-only cookie.
	 * On success, updates the in-memory token. On failure, clears the session.
	 * @returns True if the refresh succeeded, false otherwise
	 */
	async refresh(): Promise<boolean> {
		try {
			const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
				method: 'POST',
				credentials: 'include'
			});

			if (!res.ok) {
				auth.clearSession();
				return false;
			}

			const { accessToken } = (await res.json()) as { accessToken: string };

			// Fetch the user profile with the new token
			const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
				headers: { Authorization: `Bearer ${accessToken}` }
			});

			if (!meRes.ok) {
				auth.clearSession();
				return false;
			}

			const user = (await meRes.json()) as {
				sub: string;
				email: string;
				role: AuthUser['role'];
			};

			_accessToken = accessToken;
			_currentUser = { id: user.sub, name: user.email, email: user.email, role: user.role };
			return true;
		} catch {
			auth.clearSession();
			return false;
		}
	},

	/**
	 * Logs the current user out by calling the server logout endpoint,
	 * which revokes the refresh token and clears the cookie.
	 */
	async logout(): Promise<void> {
		try {
			await fetch(`${API_BASE_URL}/auth/logout`, {
				method: 'POST',
				credentials: 'include',
				headers: _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}
			});
		} finally {
			auth.clearSession();
		}
	}
};
