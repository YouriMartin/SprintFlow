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
		client: {start:"_app/immutable/entry/start.BJnSCQko.js",app:"_app/immutable/entry/app.ley66yuY.js",imports:["_app/immutable/entry/start.BJnSCQko.js","_app/immutable/chunks/C6jZLuX-.js","_app/immutable/chunks/CR4mJNBN.js","_app/immutable/chunks/D61hpZwH.js","_app/immutable/entry/app.ley66yuY.js","_app/immutable/chunks/CR4mJNBN.js","_app/immutable/chunks/paUPhQKv.js","_app/immutable/chunks/CAnKmzBQ.js","_app/immutable/chunks/BaaInQHT.js","_app/immutable/chunks/D61hpZwH.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
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
			},
			{
				id: "/setup",
				pattern: /^\/setup\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
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
