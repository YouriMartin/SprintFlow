import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.-4rcJl8r.js","_app/immutable/chunks/C6jZLuX-.js","_app/immutable/chunks/CR4mJNBN.js","_app/immutable/chunks/D61hpZwH.js","_app/immutable/chunks/paUPhQKv.js","_app/immutable/chunks/BmKr277m.js","_app/immutable/chunks/CAnKmzBQ.js","_app/immutable/chunks/BaaInQHT.js","_app/immutable/chunks/B_9wCMUX.js","_app/immutable/chunks/B7Xa6XnF.js","_app/immutable/chunks/DkanCsHN.js","_app/immutable/chunks/CfpsT7fc.js"];
export const stylesheets = ["_app/immutable/assets/Modal.Bf4mPTub.css","_app/immutable/assets/0.CQr6Sd1B.css"];
export const fonts = [];
