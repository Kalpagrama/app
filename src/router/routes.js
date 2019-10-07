const routes = [
  { path: '/', redirect: '/app' },
  {
    path: '/app',
    redirect: '/app/home',
    component: () => import('layouts/main_layout'),
    children: [
      { name: 'home', path: 'home', component: () => import('pages/app/home') },
      { name: 'hot', path: 'hot/:category?', component: () => import('pages/app/hot') },
      { name: 'user', path: 'user/:oid?/:page?', component: () => import('pages/app/user') },
      { name: 'sphere', path: 'sphere/:oid?', component: () => import('pages/app/sphere') },
      { name: 'content', path: 'content/:oid?', component: () => import('pages/app/content') },
      { name: 'chain', path: 'chain/:oid?', component: () => import('pages/app/chain') },
      { name: 'node', path: 'node/:oid', component: () => import('pages/app/node') },
      { name: 'workspace', path: 'workspace/:menu?', component: () => import('pages/app/workspace') },
      { name: 'create', path: 'create', component: () => import('pages/app/create') },
      { name: 'menu', path: 'menu', component: () => import('pages/app/menu') }
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
      // { name: '404', path: '*', component: () => import('pages/Error404.vue') }
    ]
  },
  {
    path: '/dev',
    component: () => import('layouts/dev_layout.vue')
  }
]

export default routes
