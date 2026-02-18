import { Z as attr_class, _ as ensure_array_like, $ as store_get, a0 as head, a1 as unsubscribe_stores } from "../../chunks/index2.js";
import { g as getContext } from "../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { a as attr } from "../../chunks/attributes.js";
import { M as Modal } from "../../chunks/Modal.js";
import { P as ProjectStatus } from "../../chunks/types.js";
import { e as escape_html } from "../../chunks/escaping.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let currentPath = "";
    let showCreateProjectModal = false;
    let newProjectForm = { name: "", description: "", status: ProjectStatus.ACTIVE };
    const bottomItems = [
      { icon: "⚙️", label: "Settings", href: "/settings" },
      { icon: "❓", label: "Help", href: "/help" }
    ];
    function isActive(href) {
      if (href === "/") {
        return currentPath === "/";
      }
      return currentPath.startsWith(href);
    }
    $$renderer2.push(`<aside class="sidebar svelte-129hoe0"><div class="sidebar-header svelte-129hoe0"><div class="logo svelte-129hoe0"><span class="logo-icon svelte-129hoe0">SF</span> <span class="logo-text svelte-129hoe0">SprintFlow</span></div></div> <nav class="sidebar-nav svelte-129hoe0"><ul class="nav-list svelte-129hoe0"><li><a href="/"${attr_class("nav-item svelte-129hoe0", void 0, {
      "active": (
        // Subscribe to page store for current path
        // Auto-expand project if its child is active
        isActive("/")
      )
    })}><span class="nav-icon svelte-129hoe0">📊</span> <span class="nav-label svelte-129hoe0">Dashboard</span></a></li> <li class="nav-section-header svelte-129hoe0"><span class="nav-section-title svelte-129hoe0">Projects</span> <button class="add-project-btn svelte-129hoe0" title="New project">+</button></li> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<li class="nav-loading svelte-129hoe0"><span class="nav-label svelte-129hoe0">Loading...</span></li>`);
    }
    $$renderer2.push(`<!--]--></ul></nav> <div class="sidebar-footer svelte-129hoe0"><ul class="nav-list svelte-129hoe0"><!--[-->`);
    const each_array_1 = ensure_array_like(bottomItems);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let item = each_array_1[$$index_1];
      $$renderer2.push(`<li><a${attr("href", item.href)}${attr_class("nav-item svelte-129hoe0", void 0, { "active": isActive(item.href) })}><span class="nav-icon svelte-129hoe0">${escape_html(item.icon)}</span> <span class="nav-label svelte-129hoe0">${escape_html(item.label)}</span></a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></aside> `);
    Modal($$renderer2, {
      open: showCreateProjectModal,
      title: "New Project",
      onclose: () => showCreateProjectModal = false,
      children: ($$renderer3) => {
        $$renderer3.push(`<form class="form svelte-129hoe0">`);
        {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> <div class="form-group svelte-129hoe0"><label for="project-name" class="svelte-129hoe0">Name</label> <input id="project-name" type="text"${attr("value", newProjectForm.name)} required placeholder="Enter project name" class="svelte-129hoe0"/></div> <div class="form-group svelte-129hoe0"><label for="project-description" class="svelte-129hoe0">Description</label> <textarea id="project-description" placeholder="Enter project description (optional)" rows="3" class="svelte-129hoe0">`);
        const $$body = escape_html(newProjectForm.description);
        if ($$body) {
          $$renderer3.push(`${$$body}`);
        }
        $$renderer3.push(`</textarea></div> <div class="form-actions svelte-129hoe0"><button type="button" class="btn btn-secondary svelte-129hoe0">Cancel</button> <button type="submit" class="btn btn-primary svelte-129hoe0">Create Project</button></div></form>`);
      }
    });
    $$renderer2.push(`<!---->`);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { children } = $$props;
    let isSetupPage = store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/setup");
    head("12qhfyh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>SprintFlow</title>`);
      });
      $$renderer3.push(`<meta name="description" content="SprintFlow - Task Management Application"/>`);
    });
    if (isSetupPage) {
      $$renderer2.push("<!--[-->");
      children($$renderer2);
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="app-layout svelte-12qhfyh">`);
      Sidebar($$renderer2);
      $$renderer2.push(`<!----> <main class="main-content svelte-12qhfyh">`);
      children($$renderer2);
      $$renderer2.push(`<!----></main></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
