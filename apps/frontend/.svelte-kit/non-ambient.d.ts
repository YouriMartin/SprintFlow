
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
		RouteId(): "/" | "/projects" | "/projects/[id]" | "/projects/[id]/backlog" | "/projects/[id]/sprints";
		RouteParams(): {
			"/projects/[id]": { id: string };
			"/projects/[id]/backlog": { id: string };
			"/projects/[id]/sprints": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/projects": { id?: string };
			"/projects/[id]": { id: string };
			"/projects/[id]/backlog": { id: string };
			"/projects/[id]/sprints": { id: string }
		};
		Pathname(): "/" | "/projects" | "/projects/" | `/projects/${string}` & {} | `/projects/${string}/` & {} | `/projects/${string}/backlog` & {} | `/projects/${string}/backlog/` & {} | `/projects/${string}/sprints` & {} | `/projects/${string}/sprints/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}