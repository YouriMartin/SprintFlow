export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.D8jmpfyq.js",app:"_app/immutable/entry/app.aB_hMxE4.js",imports:["_app/immutable/entry/start.D8jmpfyq.js","_app/immutable/chunks/Q6LpRXnx.js","_app/immutable/chunks/DpUKlOTm.js","_app/immutable/entry/app.aB_hMxE4.js","_app/immutable/chunks/DpUKlOTm.js","_app/immutable/chunks/4Mh_maa4.js","_app/immutable/chunks/DT90_JrZ.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/projects/[id]/backlog",
				pattern: /^\/projects\/([^/]+?)\/backlog\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/projects/[id]/sprints",
				pattern: /^\/projects\/([^/]+?)\/sprints\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
