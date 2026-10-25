import { ADMIN_ROLES } from "src/utils/roles";

// Access rules are checked in router/index.js (beforeEach):
// - meta.requiresAuth: needs a logged-in user (children inherit it)
// - meta.roles: only these roles can enter
const routes = [
  {
    path: "/",
    name: "home",
    redirect: "/dashboard",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        name: "dashboard",
        path: "dashboard",
        component: () => import("pages/IndexPage.vue"),
      },
      {
        name: "boletas",
        path: "boletas",
        component: () => import("pages/boletas/boletas-view.vue"),
      },
      {
        name: "boletas_gen",
        path: "boletas-gen",
        component: () => import("pages/boletas-gen/boletas-view.vue"),
        meta: { roles: ADMIN_ROLES },
      },
      {
        name: "users-pendientes",
        path: "users-pendientes",
        component: () => import("pages/boletas-pendientes/boletas-view.vue"),
        meta: { roles: ADMIN_ROLES },
      },
      {
        name: "servicios",
        path: "servicios",
        component: () => import("pages/servicios/servicios-view.vue"),
      },
      {
        name: "dox",
        path: "dox",
        component: () => import("pages/dox/dox-view.vue"),
      },
      {
        name: "admin-users",
        path: "admin-users",
        component: () => import("pages/admin-users/admin-users-view.vue"),
        meta: { roles: ADMIN_ROLES },
      },
      {
        name: "admin-tickets",
        path: "admin-tickets",
        component: () => import("pages/admin-tickets/admin-tickets-view.vue"),
        meta: { roles: ADMIN_ROLES },
      },
      {
        name: "admin-payments",
        path: "admin-payments",
        component: () => import("pages/admin-payments/admin-payments-view.vue"),
        meta: { roles: ADMIN_ROLES },
      },
      {
        name: "perfil",
        path: "perfil",
        component: () => import("pages/perfil/perfil-view.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("pages/login/login-view.vue"),
  },
  {
    path: "/reset-password/:token",
    component: () => import("pages/reset-password/reset-password.vue"),
    name: "reset-password",
  },
  {
    path: "/platforms",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        component: () => import("pages/platforms/PlatformsView.vue"),
        meta: { roles: ADMIN_ROLES },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
