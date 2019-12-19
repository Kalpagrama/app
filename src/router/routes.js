import { checkUpdate, clearCache } from 'src/system/service_worker'

const routes = [
  {
    path: '/',
    component: () => import('layouts/main_layout'),
    children: [
      // mobile
      { name: 'home', path: '', component: () => import('pages/app/home') },
      { name: 'trends', path: 'trends/:category?/:sort?', component: () => import('pages/app/trends') },
      { name: 'create', path: 'create/:page?', component: () => import('components/node_composer') },
      { name: 'workspace', path: 'workspace/:page?', component: () => import('components/workspace') },
      { name: 'menu', path: 'menu', component: () => import('pages/app/menu') },
      // rest
      { name: 'invite', path: 'invite', component: () => import('components/k_invite') },
      { name: 'user', path: 'user/:oid?/:page?', component: () => import('pages/app/user') },
      { name: 'sphere', path: 'sphere/:oid?', component: () => import('pages/app/sphere') },
      { name: 'content', path: 'content/:oid?', component: () => import('pages/app/content') },
      { name: 'chain', path: 'chain/:oid?', component: () => import('pages/app/chain') },
      { name: 'node', path: 'node/:oid', component: () => import('components/node_explorer') },
      { name: 'subscriptions', path: 'subscriptions', component: () => import('pages/app/subscriptions') },
      { name: 'notifications', path: 'notifications', component: () => import('pages/app/notifications') },
      { name: 'settings', path: 'settings', component: () => import('pages/app/settings') },
      {
        name: 'refresh',
        path: 'refresh',
        component: null,
        beforeEnter: async (to, from, next) => {
          console.log('refresh app!!!')
          await checkUpdate()
          await clearCache()
          localStorage.clear()
          await next('/')
        }
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
      { name: 'signIn', path: 'sign_in', component: () => import('pages/login/sign_in') },
      // { name: '404', path: '*', component: () => import('pages/Error404.vue') }
    ]
  },
  {
    path: '/dev',
    component: () => import('layouts/dev_layout.vue')
  }
]

export default routes
