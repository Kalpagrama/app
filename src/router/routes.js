
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
