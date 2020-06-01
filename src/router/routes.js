
const routes = [
  {
    path: '/auth',
    component: () => import('layouts/auth_layout.vue'),
    children: [
      { name: 'index', path: '', component: () => import('pages/auth/index.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/main_layout'),
    children: [
      { name: 'welcome', path: 'welcome', component: () => import('pages/app/welcome') },
      { name: 'home', path: '', component: () => import('components/home_explorer') },
      // { name: ''}
      { name: 'settings', path: 'settings/:page?', component: () => import('pages/app/settings') },
      { name: 'report', path: 'report', component: () => import('pages/app/report') },
      // items
      { name: 'user', path: 'user/:oid?/:page?', component: () => import('pages/app/user') },
      { name: 'node', path: 'node/:oid/:page?', component: () => import('pages/app/node') },
      { name: 'sphere', path: 'sphere/:oid?', component: () => import('pages/app/sphere') },
      { name: 'trends', path: 'trends/:oid?', component: () => import('pages/app/sphere') },
      { name: 'content', path: 'content/:oid?/:page?', component: () => import('pages/app/content') },
      { name: 'chain', path: 'chain/:oid?', component: () => import('pages/app/chain') },
      {
        name: 'workspace',
        path: 'workspace/:page?/:id?',
        component: () => import('components/workspace'),
        // children: [
        //   { path: 'content/:id', component: () => import('components/workspace/ws_content_explorer') }
        // ]
      },
    ]
  }
]

export default routes
