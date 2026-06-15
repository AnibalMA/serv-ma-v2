import { useUserStore } from "src/stores/user";
import { Notify } from "quasar";

const blockTemporaryAccess = (featureName) => (to, from, next) => {
  Notify.create({
    color: "orange-9",
    textColor: "white",
    icon: "warning",
    message: `${featureName} se encuentra temporalmente deshabilitado`,
  });
  next("/dashboard");
};

const routes = [
  {
    path: "/",
    name: "home",
    beforeEnter: (to, from, next) => {
      // console.log('to', to);
      // console.log('from', from);
      const oUser = useUserStore().user;
      if (oUser?.id) {
        if (to.path === "/") {
          next("/dashboard");
        } else {
          next();
        }
      } else {
        Notify.create({
          color: "blue-8",
          textColor: "white",
          icon: "info",
          message: "Por favor inicie sesión",
        });

        next("/login");
      }
    },
    component: () => import("layouts/MainLayout.vue"),
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
      },
      {
        name: "users-pendientes",
        path: "users-pendientes",
        component: () => import("pages/boletas-pendientes/boletas-view.vue"),
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
        beforeEnter: (to, from, next) => {
          const oUser = useUserStore().user;
          if (oUser?.id && ["ROL_ADM", "ROL_ADM_SU"].includes(oUser.rol)) {
            next();
          } else {
            Notify.create({
              color: "red-8",
              textColor: "white",
              icon: "block",
              message: "Acceso restringido: Solo administradores",
            });
            next("/dashboard");
          }
        },
      },
      {
        name: "admin-tickets",
        path: "admin-tickets",
        component: () => import("pages/admin-tickets/admin-tickets-view.vue"),
        beforeEnter: (to, from, next) => {
          const oUser = useUserStore().user;
          if (oUser?.id && ["ROL_ADM", "ROL_ADM_SU"].includes(oUser.rol)) {
            next();
          } else {
            Notify.create({
              color: "red-8",
              textColor: "white",
              icon: "block",
              message: "Acceso restringido: Solo administradores",
            });
            next("/dashboard");
          }
        },
      },
      {
        name: "admin-payments",
        path: "admin-payments",
        component: () => import("pages/admin-payments/admin-payments-view.vue"),
        beforeEnter: (to, from, next) => {
          const oUser = useUserStore().user;
          if (oUser?.id && ["ROL_ADM", "ROL_ADM_SU"].includes(oUser.rol)) {
            next();
          } else {
            Notify.create({
              color: "red-8",
              textColor: "white",
              icon: "block",
              message: "Acceso restringido: Solo administradores",
            });
            next("/dashboard");
          }
        },
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    beforeEnter: (to, from, next) => {
      const oUser = useUserStore().user;
      if (oUser?.id) {
        next("/dashboard");
      } else {
        next();
      }
    },
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
    children: [
      {
        path: "",
        component: () => import("pages/platforms/PlatformsView.vue"),
        meta: { requiresAuth: true },
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
