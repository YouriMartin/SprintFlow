import { e as escape_html } from "../../chunks/escaping.js";
import "clsx";
import { T as TaskPriority, a as TaskStatus } from "../../chunks/types.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    ({
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM
    });
    $$renderer2.push(`<div class="page svelte-1uha8ag"><header class="page-header svelte-1uha8ag"><div><h1 class="svelte-1uha8ag">Dashboard</h1> <p class="subtitle svelte-1uha8ag">Welcome to SprintFlow</p></div></header> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="actions svelte-1uha8ag"><button class="btn btn-primary svelte-1uha8ag">${escape_html("New Task")}</button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-1uha8ag"><div class="spinner svelte-1uha8ag"></div> <p class="svelte-1uha8ag">Loading tasks...</p></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
