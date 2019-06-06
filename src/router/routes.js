
const routes = [
  { path: '/', redirect: '/app/home' },
  {
    path: '/app',
    redirect: '/app/home',
    component: () => import('layouts/main_layout.vue'),
    children: [
      { name: 'home', path: 'home', component: () => import('pages/app/home') },
      { name: 'node', path: 'node', component: () => import('pages/app/node') },
      { name: 'search', path: 'search', component: () => import('pages/app/hot') },
      { name: 'create', path: 'create', component: () => import('pages/app/create') },
      { name: 'notifications', path: 'notifications', component: () => import('pages/app/notifications') },
      { name: 'settings', path: 'settings', component: () => import('pages/app/settings') }
    ]
  },
  {
    path: '/login',
    component: () => import('layouts/login_layout.vue'),
    children: [
      { name: 'index', path: '', component: () => import('pages/login/index.vue') },
      { name: 'vk', path: 'vk', component: () => import('pages/login/vk') },
      { name: 'email', path: 'email', component: () => import('pages/login/email') },
      { name: 'phone', path: 'phone', component: () => import('pages/login/phone') },
      { name: '404', path: '*', component: () => import('pages/Error404.vue') }
    ]
  },
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
