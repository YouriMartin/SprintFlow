import { redirect } from "@sveltejs/kit";
const API_BASE_URL = "http://localhost:3000";
const load = async ({ fetch, url }) => {
  if (url.pathname.startsWith("/setup")) {
    return {};
  }
  try {
    const response = await fetch(`${API_BASE_URL}/setup/status`);
    if (response.ok) {
      const { required } = await response.json();
      if (required) {
        redirect(302, "/setup");
      }
    }
  } catch {
  }
  return {};
};
export {
  load
};
