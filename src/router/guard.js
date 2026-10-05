// Decides where to send the user before entering a route.
// Returns null when the user can enter, or { path, message?, color?, icon? }.
export function getRedirect(to, user) {
  const isLoggedIn = Boolean(user?.id);

  if (to.meta.requiresAuth && !isLoggedIn) {
    return {
      path: "/login",
      message: "Por favor inicie sesión",
      color: "blue-8",
      icon: "info",
    };
  }

  if (to.meta.roles && !to.meta.roles.includes(user?.rol)) {
    return {
      path: "/dashboard",
      message: "Acceso restringido: Solo administradores",
      color: "red-8",
      icon: "block",
    };
  }

  if (to.path === "/login" && isLoggedIn) {
    return { path: "/dashboard" };
  }

  return null;
}
