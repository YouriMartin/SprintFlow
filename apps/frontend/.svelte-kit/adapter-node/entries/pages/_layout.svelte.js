import { w as attr_class, x as ensure_array_like, y as attr, z as head } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { e as escape_html } from "../../chunks/escaping.js";
function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let collapsed = false;
    let currentPath = "";
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
    $$renderer2.push(`<aside${attr_class("sidebar svelte-129hoe0", void 0, { "collapsed": collapsed })}><div class="sidebar-header svelte-129hoe0"><div class="logo svelte-129hoe0">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span class="logo-icon svelte-129hoe0">SF</span> <span class="logo-text svelte-129hoe0">SprintFlow</span>`);
    }
    $$renderer2.push(`<!--]--></div> <button class="collapse-btn svelte-129hoe0" aria-label="Toggle sidebar">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span class="icon">◀</span>`);
    }
    $$renderer2.push(`<!--]--></button></div> <nav class="sidebar-nav svelte-129hoe0"><ul class="nav-list svelte-129hoe0"><li><a href="/"${attr_class("nav-item svelte-129hoe0", void 0, { "active": isActive("/") })}><span class="nav-icon svelte-129hoe0">📊</span> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="nav-label svelte-129hoe0">Dashboard</span>`);
    }
    $$renderer2.push(`<!--]--></a></li> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<li class="nav-section-title svelte-129hoe0">Projects</li>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<li class="nav-loading svelte-129hoe0">`);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="nav-label svelte-129hoe0">Loading...</span>`);
      }
      $$renderer2.push(`<!--]--></li>`);
    }
    $$renderer2.push(`<!--]--></ul></nav> <div class="sidebar-footer svelte-129hoe0"><ul class="nav-list svelte-129hoe0"><!--[-->`);
    const each_array_1 = ensure_array_like(bottomItems);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let item = each_array_1[$$index_1];
      $$renderer2.push(`<li><a${attr("href", item.href)}${attr_class("nav-item svelte-129hoe0", void 0, { "active": isActive(item.href) })}><span class="nav-icon svelte-129hoe0">${escape_html(item.icon)}</span> `);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="nav-label svelte-129hoe0">${escape_html(item.label)}</span>`);
      }
      $$renderer2.push(`<!--]--></a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></aside>`);
  });
}
function _layout($$renderer, $$props) {
  let { children } = $$props;
  head("12qhfyh", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>SprintFlow</title>`);
    });
    $$renderer2.push(`<meta name="description" content="SprintFlow - Task Management Application"/>`);
  });
  $$renderer.push(`<div class="app-layout svelte-12qhfyh">`);
  Sidebar($$renderer);
  $$renderer.push(`<!----> <main class="main-content svelte-12qhfyh">`);
  children($$renderer);
  $$renderer.push(`<!----></main></div>`);
}
export {
  _layout as default
};
