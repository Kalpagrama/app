import AuthGuard from './auth-guard';

const routes = [
  {
    path: '/',
    component: () => import('layouts/mobile/MobileLayout.vue'),
    children: [
      { path: '', component: () => import('pages/mobile/Home.vue'), beforeEnter: AuthGuard },
      { path: '/home', component: () => import('pages/mobile/Home.vue'), beforeEnter: AuthGuard },
      { path: '/search', component: () => import('pages/mobile/Search.vue'), beforeEnter: AuthGuard },
      { path: '/create', component: () => import('pages/mobile/Create.vue'), beforeEnter: AuthGuard },
      { path: '/bell', component: () => import('pages/mobile/Bell.vue'), beforeEnter: AuthGuard },
      { path: '/profile', component: () => import('pages/mobile/Profile.vue'), beforeEnter: AuthGuard },
      { path: '/view/:id', component: () => import('pages/mobile/View.vue'), beforeEnter: AuthGuard },
      { path: '/sphere/:id', component: () => import('pages/mobile/Sphere.vue'), beforeEnter: AuthGuard },
      { path: '/promo', component: () => import('pages/mobile/Promo.vue') },
      { path: '/auth/login', component: () => import('pages/mobile/Auth/Login.vue') },
      { path: '/auth/register', component: () => import('pages/mobile/Auth/Registration.vue') },
      { path: '/auth/register/email', component: () => import('pages/mobile/Auth/RegistrationEmail.vue') },
      { path: '/auth/restore', component: () => import('pages/mobile/Auth/RecoverPassword.vue') },
      { path: '/auth/register/phone', component: () => import('pages/mobile/Auth/RegistrationPhone.vue') },
      { path: '/greeting', component: () => import('pages/mobile/Greeting.vue') },
      { path: '/lessons', component: () => import('pages/mobile/Lessons.vue') },
      { path: '/setting', component: () => import('pages/mobile/Setting.vue') },
    ],
  },
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue'),
  });
}

export default routes;
export const USER_ROUTES = ['/'];
export const GUEST_ROUTES = ['/', '/login', '/register', '/restore'];
