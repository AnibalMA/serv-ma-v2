import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import { Notify } from 'quasar'
import { useUserStore } from 'src/stores/user'
import routes from './routes'
import { getRedirect } from './guard'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Login and role checks for every route (see meta in routes.js)
  Router.beforeEach((to) => {
    const redirect = getRedirect(to, useUserStore().user)
    if (!redirect) return true

    if (redirect.message) {
      Notify.create({
        color: redirect.color,
        textColor: 'white',
        icon: redirect.icon,
        message: redirect.message
      })
    }
    return redirect.path
  })

  return Router
})
