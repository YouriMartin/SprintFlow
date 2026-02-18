import { a as attr } from "../../../chunks/attributes.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let name = "";
    let email = "";
    let password = "";
    let confirmPassword = "";
    let submitting = false;
    $$renderer2.push(`<div class="setup-page svelte-g40i6i"><div class="setup-card svelte-g40i6i"><div class="setup-header svelte-g40i6i"><div class="logo svelte-g40i6i"><div class="logo-icon svelte-g40i6i">SF</div> <span class="logo-text svelte-g40i6i">SprintFlow</span></div> <h1 class="svelte-g40i6i">Bienvenue sur SprintFlow</h1> <p class="subtitle svelte-g40i6i">Créez votre compte administrateur pour commencer à utiliser l'application.</p></div> <form class="setup-form svelte-g40i6i">`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="field svelte-g40i6i"><label for="name" class="svelte-g40i6i">Nom complet</label> <input id="name" type="text"${attr("value", name)} placeholder="Jean Dupont" autocomplete="name"${attr("disabled", submitting, true)} required class="svelte-g40i6i"/></div> <div class="field svelte-g40i6i"><label for="email" class="svelte-g40i6i">Adresse email</label> <input id="email" type="email"${attr("value", email)} placeholder="admin@example.com" autocomplete="email"${attr("disabled", submitting, true)} required class="svelte-g40i6i"/></div> <div class="field svelte-g40i6i"><label for="password" class="svelte-g40i6i">Mot de passe</label> <input id="password" type="password"${attr("value", password)} placeholder="Minimum 8 caractères" autocomplete="new-password"${attr("disabled", submitting, true)} required class="svelte-g40i6i"/></div> <div class="field svelte-g40i6i"><label for="confirmPassword" class="svelte-g40i6i">Confirmer le mot de passe</label> <input id="confirmPassword" type="password"${attr("value", confirmPassword)} placeholder="Répétez votre mot de passe" autocomplete="new-password"${attr("disabled", submitting, true)} required class="svelte-g40i6i"/></div> <button type="submit" class="submit-btn svelte-g40i6i"${attr("disabled", submitting, true)}>`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`Créer le compte administrateur`);
    }
    $$renderer2.push(`<!--]--></button></form></div></div>`);
  });
}
export {
  _page as default
};
