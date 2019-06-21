
const routes2 = [
  { path: '/', redirect: '/app/home' },
  {
    path: '/app/:apppage',
    component: () => import('layouts/main_layout.vue'),
    children: [
      { path: 'home', component: () => import('pages/app/home') },
      { name: 'node', path: 'node', component: () => import('pages/app/node') },
      { name: 'search', path: 'search', component: () => import('pages/app/search') },
      { name: 'create', path: 'create', component: () => import('pages/app/create') },
      { name: 'notifications', path: 'notifications', component: () => import('pages/app/notifications') },
      { name: 'menu', path: 'menu', component: () => import('pages/app/menu') },
      { name: 'sphere', path: 'sphere', component: () => import('pages/app/sphere') },
      { name: 'workspace',
        path: '/app/workspace/:workspacepage',
        component: () => import('pages/app/workspace'),
        children: [
          {path: 'videos', component: () => import('pages/app/workspace/videos')},
          {name: 'images', path: 'images', component: () => import('pages/app/workspace/images')},
          {name: 'books', path: 'books', component: () => import('pages/app/workspace/books')},
          {name: 'nodes', path: 'nodes', component: () => import('pages/app/workspace/nodes')},
          {name: 'chains', path: 'chains', component: () => import('pages/app/workspace/chains')}
        ]
      },
      {
        name: 'settings',
        path: 'settings',
        component: () => import('pages/app/settings'),
        children: []
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
  },
  {
    path: '/share',
    component: () => import('layouts/share_layout.vue')
  },
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

const routes = [
  { path: '/', redirect: '/app' },
  {
    path: '/app',
    redirect: '/app/home',
    component: () => import('layouts/main_layout'),
    children: [
      { name: 'home', path: 'home', component: () => import('pages/app/home') },
      { name: 'node', path: 'node', component: () => import('pages/app/node') },
      {
        name: 'workspace',
        path: 'workspace',
        redirect: 'workspace/videos',
        component: () => import('pages/app/workspace'),
        children: [
          {name: 'videos', path: 'videos', component: () => import('pages/app/workspace/videos')},
          {name: 'images', path: 'images', component: () => import('pages/app/workspace/images')},
          {name: 'books', path: 'books', component: () => import('pages/app/workspace/books')},
          {name: 'nodes', path: 'nodes', component: () => import('pages/app/workspace/nodes')},
          {name: 'chains', path: 'chains', component: () => import('pages/app/workspace/chains')}
        ]
      },
      {
        name: 'create',
        path: 'create',
        component: () => import('pages/app/create'),
        children: [
          {name: 'editor', path: 'editor', component: () => import('components/video_editor')}
        ]
      },
      {
        name: 'sphere',
        path: 'sphere',
        component: () => import('pages/app/sphere')
      },
      {
        name: 'settings',
        path: 'settings',
        redirect: 'settings/general',
        component: () => import('pages/app/settings'),
        children: [
          {name: 'general', path: 'general', component: () => import('pages/app/settings/general')},
          {name: 'security', path: 'security', component: () => import('pages/app/settings/security')},
          {name: 'privacy', path: 'privacy', component: () => import('pages/app/settings/privacy')},
          {name: 'notifications', path: 'notifications', component: () => import('pages/app/settings/notifications')},
          {name: 'payments', path: 'payments', component: () => import('pages/app/settings/payments')}
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
