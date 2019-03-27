
const routes = [
  {
    path: '/',
    component: () => import('layouts/mobile/MobileLayout.vue'),
    children: [
      { path: '', component: () => import('pages/mobile/Home.vue') },
      { path: '/home', component: () => import('pages/mobile/Home.vue') },
      { path: '/promo', component: () => import('pages/mobile/Promo.vue') },
      { path: '/login', component: () => import('pages/mobile/Auth/Login.vue') },
      { path: '/registration', component: () => import('pages/mobile/Auth/Registration.vue') },
      { path: '/restore', component: () => import('pages/mobile/Auth/RecoverPassword.vue') },
      { path: 'registration-email', component: () => import('pages/mobile/Auth/RegistrationEmail.vue') },
      { path: '/search', component: () => import('pages/mobile/Search.vue') },
      { path: '/create', component: () => import('pages/mobile/Create.vue') },
      { path: '/bell', component: () => import('pages/mobile/Bell.vue') },
      { path: '/profile', component: () => import('pages/mobile/Profile.vue') },
      { path: '/greeting', component: () => import('pages/mobile/Greeting.vue') },
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
