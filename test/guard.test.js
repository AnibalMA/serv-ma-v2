import { describe, it, expect } from "vitest";
import { getRedirect } from "src/router/guard";
import { ADMIN_ROLES, isAdmin } from "src/utils/roles";

const admin = { id: 1, rol: "ROL_ADM" };
const superAdmin = { id: 2, rol: "ROL_ADM_SU" };
const user = { id: 3, rol: "ROL_USER" };
const admin2 = { id: 4, rol: "ROL_ADM_2" };

const dashboard = { path: "/dashboard", meta: { requiresAuth: true } };
const adminPage = {
  path: "/admin-users",
  meta: { requiresAuth: true, roles: ADMIN_ROLES },
};
const login = { path: "/login", meta: {} };
const resetPassword = { path: "/reset-password/abc", meta: {} };

describe("isAdmin", () => {
  it("is true only for ROL_ADM and ROL_ADM_SU", () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(superAdmin)).toBe(true);
    expect(isAdmin(admin2)).toBe(false);
    expect(isAdmin(user)).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});

describe("getRedirect", () => {
  it("sends guests to login when the route needs a session", () => {
    expect(getRedirect(dashboard, null)).toEqual({
      path: "/login",
      message: "Por favor inicie sesión",
      color: "blue-8",
      icon: "info",
    });
    expect(getRedirect(adminPage, {})).toMatchObject({ path: "/login" });
  });

  it("lets logged-in users into normal pages", () => {
    expect(getRedirect(dashboard, user)).toBeNull();
  });

  it("sends non-admins to the dashboard on admin pages", () => {
    const blocked = {
      path: "/dashboard",
      message: "Acceso restringido: Solo administradores",
      color: "red-8",
      icon: "block",
    };
    expect(getRedirect(adminPage, user)).toEqual(blocked);
    expect(getRedirect(adminPage, admin2)).toEqual(blocked);
  });

  it("lets admins into admin pages", () => {
    expect(getRedirect(adminPage, admin)).toBeNull();
    expect(getRedirect(adminPage, superAdmin)).toBeNull();
  });

  it("sends logged-in users from login to the dashboard without a message", () => {
    expect(getRedirect(login, user)).toEqual({ path: "/dashboard" });
  });

  it("lets guests into public pages", () => {
    expect(getRedirect(login, null)).toBeNull();
    expect(getRedirect(resetPassword, null)).toBeNull();
  });
});
