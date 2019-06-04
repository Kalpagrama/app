// import AuthGuard from './auth-guard'

const routes = [
  { path: '/', redirect: '/app/home' },
  {
    path: '/app',
    redirect: '/app/home',
    component: () => import('layouts/main_layout.vue'),
    children: [
      // { name: 'home', path: '', component: () => import('pages/mobile/Home.vue') },
      // { name: 'home', path: 'home', component: () => import('pages/mobile/Home.vue') },
      // { name: 'search', path: 'search', component: () => import('pages/mobile/Search.vue') },
      // { path: '/create', component: () => import('pages/mobile/Create.vue') },
      { name: 'home', path: 'home', component: () => import('pages/app/home') },
      { name: 'node', path: 'node', component: () => import('pages/app/node') },
      { name: 'search', path: 'search', component: () => import('pages/app/hot') },
      { name: 'create', path: 'create', component: () => import('pages/app/create') },
      { name: 'notifications', path: 'notifications', component: () => import('pages/app/notifications') },
      { name: 'settings', path: 'settings', component: () => import('pages/app/settings') },
      // { path: 'bell', component: () => import('pages/mobile/Bell.vue') },
      // { path: 'profile', component: () => import('pages/mobile/Profile.vue') },
      // { path: 'view/:id', component: () => import('pages/mobile/View.vue') },
      // { path: 'sphere/:id', component: () => import('pages/mobile/Sphere.vue') },
      // { path: 'promo', component: () => import('pages/mobile/Promo.vue') },
      // { name: 'login', path: '/auth/login', component: () => import('pages/mobile/auth/Auth.vue') },
      // { path: '/auth/login/email', component: () => import('pages/mobile/auth/login/LoginEmail.vue') },
      // { path: '/auth/register', component: () => import('pages/mobile/auth/register/Registration.vue') },
      // { path: '/auth/register/email', component: () => import('pages/mobile/auth/register/RegistrationEmail.vue') },
      // { path: '/auth/login/phone', component: () => import('pages/mobile/auth/login/LoginPhone.vue') },
      // { path: '/auth/restore', component: () => import('pages/mobile/auth/recover/RecoverPassword.vue') },
      // { path: '/greeting', component: () => import('pages/mobile/Greeting.vue') },
      // { path: '/lessons', component: () => import('pages/mobile/Lessons.vue') },
      // { name: 'settings', path: 'setting', component: () => import('pages/mobile/Setting.vue') },
      // { name: '404', path: '*', component: () => import('pages/Error404.vue') }
    ]
  },
  {
    path: '/login',
    component: () => import('layouts/login_layout.vue'),
    children: [
      { name: 'index', path: '', component: () => import('pages/login/index.vue') },
      { name: 'vk', path: 'vk', component: () => import('pages/login/vk') },
      { name: 'email', path: 'email', component: () => import('pages/login/email') }
      // { name: '404', path: '*', component: () => import('pages/Error404.vue') }
    ]
  },
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

// // Always leave this as last one
// if (process.env.MODE !== 'ssr') {
//   routes.push({
//     path: '*',
//     component: () => import('pages/Error404.vue'),
//   });
// }

export default routes;
