import { e as escape_html } from "./escaping.js";
import "clsx";
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
export {
  Modal as M
};
