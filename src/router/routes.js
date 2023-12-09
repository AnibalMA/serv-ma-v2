
const routes = [
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'dashboard', component: () => import('pages/IndexPage.vue') },
      { path: 'boletas', component: () => import('pages/login/login-view.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('pages/login/login-view.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
