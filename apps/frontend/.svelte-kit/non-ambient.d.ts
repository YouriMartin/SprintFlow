
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/login" | "/projects" | "/projects/[id]" | "/projects/[id]/backlog" | "/projects/[id]/sprints" | "/setup";
		RouteParams(): {
			"/projects/[id]": { id: string };
			"/projects/[id]/backlog": { id: string };
			"/projects/[id]/sprints": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/login": Record<string, never>;
			"/projects": { id?: string };
			"/projects/[id]": { id: string };
			"/projects/[id]/backlog": { id: string };
			"/projects/[id]/sprints": { id: string };
			"/setup": Record<string, never>
		};
		Pathname(): "/" | "/login" | "/login/" | "/projects" | "/projects/" | `/projects/${string}` & {} | `/projects/${string}/` & {} | `/projects/${string}/backlog` & {} | `/projects/${string}/backlog/` & {} | `/projects/${string}/sprints` & {} | `/projects/${string}/sprints/` & {} | "/setup" | "/setup/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}