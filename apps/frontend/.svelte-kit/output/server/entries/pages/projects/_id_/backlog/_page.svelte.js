import { y as attr, x as ensure_array_like } from "../../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { e as escape_html } from "../../../../../chunks/escaping.js";
import "clsx";
import { E as EpicStatus, U as UserStoryPriority, b as UserStoryStatus } from "../../../../../chunks/types.js";
function Modal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open, title, onclose, children } = $$props;
    if (open) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="modal-backdrop svelte-ta60gp" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal svelte-ta60gp"><div class="modal-header svelte-ta60gp"><h2 id="modal-title" class="modal-title svelte-ta60gp">${escape_html(title)}</h2> <button class="modal-close svelte-ta60gp" aria-label="Close modal"><span aria-hidden="true">×</span></button></div> <div class="modal-body svelte-ta60gp">`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let epics = [];
    let userStories = [];
    let showCreateEpicModal = false;
    let showCreateUserStoryModal = false;
    let newEpicForm = {
      title: "",
      description: "",
      startDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
      status: EpicStatus.PLANNED
    };
    let newUserStoryForm = {
      title: "",
      description: "",
      status: UserStoryStatus.TODO,
      priority: UserStoryPriority.MEDIUM,
      epicId: void 0
    };
    function getStoriesByEpic() {
      const map = /* @__PURE__ */ new Map();
      map.set(null, []);
      for (const epic of epics) {
        map.set(epic.id, []);
      }
      for (const story of userStories) {
        const epicId = story.epicId ?? null;
        const existing = map.get(epicId) ?? [];
        existing.push(story);
        map.set(epicId, existing);
      }
      return map;
    }
    getStoriesByEpic();
    $$renderer2.push(`<div class="backlog-page svelte-2t0dr"><header class="page-header svelte-2t0dr"><div class="page-title svelte-2t0dr"><h1 class="svelte-2t0dr">Backlog</h1> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="header-actions svelte-2t0dr"><button class="btn btn-secondary svelte-2t0dr">+ New Epic</button> <button class="btn btn-primary svelte-2t0dr">+ New User Story</button></div></header> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="loading svelte-2t0dr">Loading...</div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    Modal($$renderer2, {
      open: showCreateEpicModal,
      title: "Create New Epic",
      onclose: () => showCreateEpicModal = false,
      children: ($$renderer3) => {
        $$renderer3.push(`<form class="form svelte-2t0dr"><div class="form-group svelte-2t0dr"><label for="epic-title" class="svelte-2t0dr">Title</label> <input id="epic-title" type="text"${attr("value", newEpicForm.title)} required placeholder="Enter epic title" class="svelte-2t0dr"/></div> <div class="form-group svelte-2t0dr"><label for="epic-description" class="svelte-2t0dr">Description</label> <textarea id="epic-description" placeholder="Enter epic description" rows="3" class="svelte-2t0dr">`);
        const $$body = escape_html(newEpicForm.description);
        if ($$body) {
          $$renderer3.push(`${$$body}`);
        }
        $$renderer3.push(`</textarea></div> <div class="form-row svelte-2t0dr"><div class="form-group svelte-2t0dr"><label for="epic-start-date" class="svelte-2t0dr">Start Date</label> <input id="epic-start-date" type="date"${attr("value", newEpicForm.startDate)} required class="svelte-2t0dr"/></div> <div class="form-group svelte-2t0dr"><label for="epic-end-date" class="svelte-2t0dr">End Date</label> <input id="epic-end-date" type="date"${attr("value", newEpicForm.endDate)} required class="svelte-2t0dr"/></div></div> <div class="form-group svelte-2t0dr"><label for="epic-status" class="svelte-2t0dr">Status</label> `);
        $$renderer3.select(
          { id: "epic-status", value: newEpicForm.status, class: "" },
          ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            const each_array_4 = ensure_array_like(Object.values(EpicStatus));
            for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
              let status = each_array_4[$$index_4];
              $$renderer4.option({ value: status }, ($$renderer5) => {
                $$renderer5.push(`${escape_html(status.replace("_", " "))}`);
              });
            }
            $$renderer4.push(`<!--]-->`);
          },
          "svelte-2t0dr"
        );
        $$renderer3.push(`</div> <div class="form-actions svelte-2t0dr"><button type="button" class="btn btn-secondary svelte-2t0dr">Cancel</button> <button type="submit" class="btn btn-primary svelte-2t0dr">Create Epic</button></div></form>`);
      }
    });
    $$renderer2.push(`<!----> `);
    Modal($$renderer2, {
      open: showCreateUserStoryModal,
      title: "Create New User Story",
      onclose: () => showCreateUserStoryModal = false,
      children: ($$renderer3) => {
        $$renderer3.push(`<form class="form svelte-2t0dr"><div class="form-group svelte-2t0dr"><label for="story-title" class="svelte-2t0dr">Title</label> <input id="story-title" type="text"${attr("value", newUserStoryForm.title)} required placeholder="As a user, I want to..." class="svelte-2t0dr"/></div> <div class="form-group svelte-2t0dr"><label for="story-description" class="svelte-2t0dr">Description</label> <textarea id="story-description" placeholder="Enter story description" rows="3" class="svelte-2t0dr">`);
        const $$body_1 = escape_html(newUserStoryForm.description);
        if ($$body_1) {
          $$renderer3.push(`${$$body_1}`);
        }
        $$renderer3.push(`</textarea></div> <div class="form-group svelte-2t0dr"><label for="story-epic" class="svelte-2t0dr">Epic</label> `);
        $$renderer3.select(
          { id: "story-epic", value: newUserStoryForm.epicId, class: "" },
          ($$renderer4) => {
            $$renderer4.option({ value: void 0 }, ($$renderer5) => {
              $$renderer5.push(`No Epic`);
            });
            $$renderer4.push(`<!--[-->`);
            const each_array_5 = ensure_array_like(epics);
            for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
              let epic = each_array_5[$$index_5];
              $$renderer4.option({ value: epic.id }, ($$renderer5) => {
                $$renderer5.push(`${escape_html(epic.title)}`);
              });
            }
            $$renderer4.push(`<!--]-->`);
          },
          "svelte-2t0dr"
        );
        $$renderer3.push(`</div> <div class="form-row svelte-2t0dr"><div class="form-group svelte-2t0dr"><label for="story-status" class="svelte-2t0dr">Status</label> `);
        $$renderer3.select(
          {
            id: "story-status",
            value: newUserStoryForm.status,
            class: ""
          },
          ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            const each_array_6 = ensure_array_like(Object.values(UserStoryStatus));
            for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
              let status = each_array_6[$$index_6];
              $$renderer4.option({ value: status }, ($$renderer5) => {
                $$renderer5.push(`${escape_html(status.replace("_", " "))}`);
              });
            }
            $$renderer4.push(`<!--]-->`);
          },
          "svelte-2t0dr"
        );
        $$renderer3.push(`</div> <div class="form-group svelte-2t0dr"><label for="story-priority" class="svelte-2t0dr">Priority</label> `);
        $$renderer3.select(
          {
            id: "story-priority",
            value: newUserStoryForm.priority,
            class: ""
          },
          ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            const each_array_7 = ensure_array_like(Object.values(UserStoryPriority));
            for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
              let priority = each_array_7[$$index_7];
              $$renderer4.option({ value: priority }, ($$renderer5) => {
                $$renderer5.push(`${escape_html(priority)}`);
              });
            }
            $$renderer4.push(`<!--]-->`);
          },
          "svelte-2t0dr"
        );
        $$renderer3.push(`</div></div> <div class="form-actions svelte-2t0dr"><button type="button" class="btn btn-secondary svelte-2t0dr">Cancel</button> <button type="submit" class="btn btn-primary svelte-2t0dr">Create User Story</button></div></form>`);
      }
    });
    $$renderer2.push(`<!---->`);
  });
}
export {
  _page as default
};
