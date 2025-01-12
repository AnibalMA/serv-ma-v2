import { useUserStore } from "src/stores/user";
import { Notify } from "quasar";
const routes = [
  {
    path: "/",
    name: "home",
    beforeEnter: (to, from, next) => {
      // console.log('to', to);
      // console.log('from', from);
      const oUser = useUserStore().getUser();
      if (oUser.sToken) {
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
        name: "servicios",
        path: "servicios",
        component: () => import("pages/servicios/servicios-view.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    beforeEnter: (to, from, next) => {
      const oUser = useUserStore().getUser();
      if (oUser.sToken) {
        next("/dashboard");
      } else {
        next();
      }
    },
    component: () => import("pages/login/login-view.vue"),
  },
  {
    path: '/reset-password/:token',
    component: () => import('pages/reset-password/reset-password.vue'),
    name: 'reset-password'
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
