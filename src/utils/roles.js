// Roles that can see the admin pages (same as the backend menu config)
export const ADMIN_ROLES = ["ROL_ADM", "ROL_ADM_SU"];

export function isAdmin(user) {
  return ADMIN_ROLES.includes(user?.rol);
}
