import { describe, it, expect } from "vitest";
import { createRouter, createMemoryHistory } from "vue-router";
import routes from "src/router/routes";
import { getRedirect } from "src/router/guard";

// Real routes with empty components, so no .vue file is loaded
function withEmptyComponents(list) {
  return list.map((route) => ({
    ...route,
    component: { render: () => null },
    children: route.children && withEmptyComponents(route.children),
  }));
}

async function navigate(path, user) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: withEmptyComponents(routes),
  });
  router.beforeEach((to) => {
    const redirect = getRedirect(to, user);
    return redirect ? redirect.path : true;
  });
  await router.push(path);
  return router.currentRoute.value.path;
}

const admin = { id: 1, rol: "ROL_ADM" };
const user = { id: 3, rol: "ROL_USER" };

describe("routes + guard", () => {
  it("sends guests to login from any private page", async () => {
    expect(await navigate("/", null)).toBe("/login");
    expect(await navigate("/boletas", null)).toBe("/login");
    expect(await navigate("/platforms", null)).toBe("/login");
  });

  it("sends logged-in users from / to the dashboard", async () => {
    expect(await navigate("/", user)).toBe("/dashboard");
  });

  it("blocks admin pages for normal users", async () => {
    for (const path of [
      "/boletas-gen",
      "/users-pendientes",
      "/admin-users",
      "/admin-tickets",
      "/admin-payments",
      "/platforms",
    ]) {
      expect(await navigate(path, user)).toBe("/dashboard");
    }
  });

  it("lets admins into admin pages", async () => {
    expect(await navigate("/platforms", admin)).toBe("/platforms");
    expect(await navigate("/admin-users", admin)).toBe("/admin-users");
  });

  it("keeps public pages open", async () => {
    expect(await navigate("/login", null)).toBe("/login");
    expect(await navigate("/reset-password/abc", null)).toBe(
      "/reset-password/abc"
    );
  });

  it("sends logged-in users away from login", async () => {
    expect(await navigate("/login", user)).toBe("/dashboard");
  });
});
