// import { checkUpdate, clearCache } from 'src/system/service_worker'

const routes = [
  {
    path: '/auth',
    component: () => import('layouts/auth_layout.vue'),
    children: [
      { name: 'index', path: '', component: () => import('pages/auth/signin.vue') },
      { name: 'signup', path: 'signup', component: () => import('pages/auth/signup.vue')}
      // { name: 'vk', path: 'vk', component: () => import('pages/login/vk') },
      // { name: 'email', path: 'email', component: () => import('pages/login/email') },
      // { name: 'phone', path: 'phone', component: () => import('pages/login/phone') },
      // { name: 'signIn', path: 'sign_in', component: () => import('pages/login/sign_in') },
      // { name: '404', path: '*', component: () => import('pages/Error404.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/main_layout'),
    children: [
      // mobile
      { name: 'welcome', path: 'welcome', component: () => import('pages/app/welcome')},
      { name: 'home', path: '', component: () => import('pages/app/home') },
      { name: 'trends', path: 'trends/:category?/:sort?', component: () => import('pages/app/trends') },
      // { name: 'create', path: 'create', component: () => import('components/node_editor') },
      { name: 'share', path: 'share_target/:page?', component: () => import('layouts/share_layout.vue') },
      { name: 'workspace', path: 'workspace/:page?/:oid?', component: () => import('components/workspace') },
      { name: 'menu', path: 'menu', component: () => import('pages/app/menu') },
      // rest
      // { name: 'invite', path: 'invite', component: () => import('components/k_invite') },
      { name: 'user', path: 'user/:oid?/:page?', component: () => import('pages/app/user') },
      { name: 'account', path: 'account/:oid?/:page?', component: () => import('pages/app/user') },
      { name: 'sphere', path: 'sphere/:oid?', component: () => import('pages/app/sphere') },
      { name: 'content', path: 'content/:oid?', component: () => import('pages/app/content') },
      // { name: 'chain', path: 'chain/:oid?', component: () => import('pages/app/chain') },
      { name: 'node', path: 'node/:oid?', component: () => import('pages/app/node') },
      { name: 'subscriptions', path: 'subscriptions', component: () => import('pages/app/subscriptions') },
      { name: 'notifications', path: 'notifications', component: () => import('pages/app/notifications') },
      { name: 'settings', path: 'settings', component: () => import('pages/app/settings') },
      { name: 'debug', path: 'debug', component: () => import('pages/app/debug') },
      { name: 'help', path: 'help', component: () => import('pages/app/help') },
      { name: 'byte', path: 'byte', component: () => import('pages/app/byte') },
      { name: 'refresh', path: 'refresh', component: () => import('pages/app/refresh') },
      { name: 'report', path: 'report', component: () => import('pages/app/report') }
      // {
      //   name: 'refresh',
      //   path: 'refresh',
      //   component: null,
      //   beforeEnter: async (to, from, next) => {
      //     console.log('refresh app!!!')
      //     await checkUpdate()
      //     await clearCache()
      //     localStorage.clear()
      //     await next('/')
      //   }
      // }
    ]
  },
  {
    path: '/help',
    component: () => import('layouts/help_layout.vue'),
    children: [
      {name: 'policy', path: 'policy', component: () => import('pages/help/policy')}
    ]
  },
  {
    path: '/dev',
    component: () => import('layouts/dev_layout.vue')
  },
  {
    path: '/refresh',
    component: () => import('layouts/refresh_layout.vue')
  }
]

export default routes
