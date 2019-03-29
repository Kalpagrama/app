
const routes = [
  {
    path: '/',
    component: () => import('layouts/mobile/MobileLayout.vue'),
    children: [
      { path: '', component: () => import('pages/mobile/Home.vue') },
      { path: '/home', component: () => import('pages/mobile/Home.vue') },
      { path: '/search', component: () => import('pages/mobile/Search.vue') },
      { path: '/create', component: () => import('pages/mobile/Create.vue') },
      { path: '/bell', component: () => import('pages/mobile/Bell.vue') },
      { path: '/profile', component: () => import('pages/mobile/Profile.vue') },
      { path: '/view/:id', component: () => import('pages/mobile/View.vue') },
      { path: '/sphere/:id', component: () => import('pages/mobile/Sphere.vue') },
      { path: '/promo', component: () => import('pages/mobile/Promo.vue') },
      { path: '/auth/login', component: () => import('pages/mobile/Auth/Login.vue') },
      { path: '/auth/register', component: () => import('pages/mobile/Auth/Registration.vue') },
      { path: '/auth/register/email', component: () => import('pages/mobile/Auth/RegistrationEmail.vue') },
      { path: '/auth/restore', component: () => import('pages/mobile/Auth/RecoverPassword.vue') },
      { path: '/auth/register/phone', component: () => import('pages/mobile/Auth/RegistrationPhone.vue') },
      { path: '/greeting', component: () => import('pages/mobile/Greeting.vue') },
      { path: '/lessons', component: () => import('pages/mobile/Lessons.vue') },
      { path: '/test', component: () => import('pages/mobile/Test.vue') },
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
