const routes = [
  { path: '/', redirect: '/app' },
  {
    path: '/app',
    redirect: '/app/home',
    component: () => import('layouts/main_layout'),
    children: [
      { name: 'home', path: 'home', component: () => import('pages/app/home') },
      { name: 'user', path: 'user/:oid?/:page?', component: () => import('pages/app/user') },
      { name: 'sphere', path: 'sphere/:oid', component: () => import('pages/app/sphere') },
      { name: 'content', path: 'content/:oid', component: () => import('pages/app/content') },
      { name: 'chain', path: 'chain/:oid', component: () => import('pages/app/chain') },
      { name: 'node', path: 'node/:oid', component: () => import('pages/app/node') },
      // {
      //   name: 'workspace',
      //   path: 'workspace',
      //   // redirect: 'workspace/nodes',
      //   component: () => import('pages/app/workspace'),
      //   children: [
      //     {name: 'videos', path: 'videos', component: () => import('pages/app/workspace/videos')},
      //     {name: 'images', path: 'images', component: () => import('pages/app/workspace/images')},
      //     {name: 'books', path: 'books', component: () => import('pages/app/workspace/books')},
      //     {name: 'nodes', path: 'nodes', component: () => import('pages/app/workspace/nodes')},
      //     {name: 'chains', path: 'chains', component: () => import('pages/app/workspace/chains')}
      //   ]
      // },
      {
        path: 'create',
        component: () => import('pages/app/create'),
        children: [
          { path: 'node', component: () => import('components/node_creator') },
          { path: 'chain', component: () => import('components/chain_creator') }
        ]
      }
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
  }
]

export default routes
