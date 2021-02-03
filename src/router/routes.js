import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { AuthApi } from 'src/api/auth'
import { systemInit } from 'src/system/services'
import assert from 'assert'
import { vueRoutesRegexp } from 'public/scripts/common_func'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.ROUTER)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.ROUTER)

function startPage () {
   let res = '/home'
   if (AuthApi.isGuest()) res = '/trends'
   return res
}

const routes = [
   {
      path: '/auth',
      redirect: '/auth/sign-in',
      component: () => import('layouts/auth_layout.vue'),
      children: [
         { name: 'signIn', path: 'sign-in', component: () => import('pages/auth/sign_in') },
      ],
      beforeEnter: (to, from, next) => {
         // alert('/auth beforeEnter... from=' + from.path + JSON.stringify(from.query) + '. to=' + to.path + JSON.stringify(to.query))
         // // если уже авторизованы, то нельзя переходить на /auth (сначала надо выйти по кнопке logout)
         if (localStorage.getItem('k_user_oid')) {
            logD('user is Auth! goto /root')
            return next('/')
         } else return next()
      }
   },
   {
      path: '/docs/:id?',
      component: () => import('layouts/docs_layout.vue')
   },
   {
      path: '/share' // этот маршрут обрабатыватся хуком в initPWA()
   },
   {
      path: '/',
      component: () => import('layouts/main_layout'),
      children: [
         {
            name: 'about',
            path: 'about',
            component: () => import('pages/app/about/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'feeds',
            path: 'feeds/:id?',
            component: () => import('pages/app/feeds/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'settings',
            path: 'settings',
            redirect: 'settings/account',
            component: () => import('pages/app/settings'),
            children: [
               {
                  name: 'settings.account',
                  path: 'account',
                  component: () => import('pages/app/settings/view_account/index.vue'),
                  meta: { roleMinimal: 'MEMBER' }
               }
            ],
            meta: { roleMinimal: 'MEMBER' }
         },
         {
            path: 'user/:oid',
            component: () => import('pages/app/user/index.vue'),
            children: [
               {
                  path: ':tab?',
                  name: 'user',
                  component: () => import('pages/app/user/page_profile/index.vue')
               }
            ],
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'node',
            path: 'node/:oid',
            component: () => import('pages/app/node/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'joint',
            path: 'joint/:oid',
            component: () => import('pages/app/joint/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'links',
            path: 'links/:oid',
            component: () => import('pages/app/links/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'sphere',
            path: 'sphere/:oid/:page?',
            component: () => import('pages/app/sphere/index.vue'),
            children: [
               {
                  name: 'sphere.nodes',
                  path: 'nodes',
                  component: () => import('pages/app/sphere/page_nodes/index.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'sphere.spheres',
                  path: 'spheres',
                  component: () => import('pages/app/sphere/page_spheres/index.vue'),
                  meta: { roleMinimal: 'GUEST' }
               }
            ],
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'trends',
            path: 'trends/:oid?',
            component: () => import('pages/app/trends/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'content',
            path: 'content/:oid',
            props: (route) => ({ oid: route.params.oid, query: route.query }),
            component: () => import('src/pages/app/content/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            path: 'notifications',
            component: () => import('pages/app/notifications/index.vue'),
            children: [
               {
                  name: 'notifications',
                  path: '',
                  component: () => import('pages/app/notifications/view_index.vue'),
                  meta: { roleMinimal: 'MEMBER' }
               }
            ],
            meta: { roleMinimal: 'MEMBER' }
         },
         {
            name: 'workspace',
            path: 'workspace',
            component: () => import('pages/app/workspace/index.vue'),
         },
         {
            name: 'workspace.watch-later',
            path: 'workspace/watch-later',
            component: () => import('pages/app/workspace/page_watch_later/index.vue')
         },
         {
            name: 'workspace.history',
            path: 'workspace/history',
            component: () => import('pages/app/workspace/page_history/index.vue')
         },
         {
            name: 'workspace.bookmarks',
            path: 'workspace/bookmarks',
            component: () => import('pages/app/workspace/page_bookmarks/index.vue')
         },
         {
            name: 'workspace.create',
            path: 'workspace/create',
            component: () => import('pages/app/workspace/page_create/index.vue')
         },
         {
            name: 'fallback',
            path: '*',
            redirect: startPage()
         }
      ],
      meta: { roleMinimal: 'GUEST' },
      beforeEnter: async (to, from, next) => {
         if (to.query.originalUrl) { // редирект на полную версию (после успешного входа перейдет на этот url)
            logD('redirect command received!', to.query.originalUrl)
            sessionStorage.setItem('k_originalUrl', to.query.originalUrl)
         }
         logD('router :: try systemInit...')
         // alert(' /root router :: try systemInit... from=' + from.path + JSON.stringify(from.query) + '. to=' + to.path + JSON.stringify(to.query))
         await systemInit() // для гостей тоже надо входить (если уже войдено - ничего не сделает)
         //  assert(to.meta.roleMinimal, '!to.meta.roleMinimal')
         if (!AuthApi.userMatchMinimalRole(to.meta.roleMinimal || 'GUEST')) {
            logD('router::need more privileges')
            return next('/auth') // если маршрут требует повышения - переходим на форму входа
         } else {
            logD('router:: its ok! ')
            return next()
         }
      }
   }
]

// Always leave this as last one
routes.push({
   path: '*',
   redirect: '/auth'
})

// на эту регулярку опирается сервисворкер, когда отдает index.html вместо vue route. нужно чтобы все роуты ей соответствовали
// при добавлении роута - добавить его в vueRoutesRegexp
for (let route of routes) {
   assert(route.path, '!route.path')
   if (route.children) {
      for (let cr of route.children) {
         assert(cr.path, '!cr.path' + JSON.stringify(cr))
         let path = (route.path + '/' + cr.path).split('/').filter(p => p)[0]
         assert(path, '!path')
         assert(vueRoutesRegexp.test(`https://kalpa.app/${path}/params`), '!vueRoutesRegexp.test not pass: bad path: ' + `https://kalpa.app/${path}/params`)
      }
   } else {
      assert(vueRoutesRegexp.test(`https://kalpa.app/${route.path}/params`), '!vueRoutesRegexp.test not pass: bad path: ' + `https://kalpa.app/${route.path}/params`)
   }
}

export default routes
