
const routes = [
  {
    path: '/auth',
    component: () => import('layouts/auth_layout.vue'),
    children: [
      { name: 'index', path: '', component: () => import('pages/auth/signin.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/main_layout'),
    children: [
      { name: 'welcome', path: 'welcome', component: () => import('pages/app/welcome')},
      // menu
      { name: 'user', path: 'user/:oid?/:page?', component: () => import('pages/app/user') },
      { name: 'home', path: '', component: () => import('pages/app/home') },
      { name: 'trends', path: 'trends/:category?/:sort?', component: () => import('pages/app/trends') },
      { name: 'workspace', path: 'workspace/:page?/:oid?', component: () => import('components/workspace') },
      { name: 'subscriptions', path: 'subscriptions', component: () => import('pages/app/subscriptions') },
      { name: 'notifications', path: 'notifications', component: () => import('pages/app/notifications') },
      { name: 'settings', path: 'settings', component: () => import('pages/app/settings') },
      { name: 'refresh', path: 'refresh', component: () => import('pages/app/refresh') },
      { name: 'report', path: 'report', component: () => import('pages/app/report') },
      { name: 'logout', path: 'logout', component: () => import('pages/app/logout') },
      // pages
      // { name: 'account', path: 'account/:oid?/:page?', component: () => import('pages/app/user') },
      { name: 'sphere', path: 'sphere/:oid?', component: () => import('pages/app/sphere') },
      { name: 'content', path: 'content/:oid?', component: () => import('pages/app/content') },
      { name: 'chain', path: 'chain/:oid?', component: () => import('pages/app/chain') },
      { name: 'node', path: 'node/:oid?', component: () => import('pages/app/node') },
    ]
  },
  {
    path: '/help',
    component: () => import('layouts/help_layout.vue'),
    children: [
      {name: 'policy', path: 'policy', component: () => import('pages/help/policy')}
    ]
  }
]

export default routes
