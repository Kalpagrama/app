import { getLogFunc, localStorage, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { AuthApi } from 'src/api/auth'
import { systemInit, systemReset } from 'src/system/services'
import assert from 'assert'
import { vueRoutesRegexp } from 'public/scripts/common_func'

// components
// import settingsDocs from 'pages/app/settings/view_docs/index.vue'

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
         { name: 'signIn', path: 'sign-in', component: () => import('pages/auth/home/index.vue') },
         // { name: 'signIn', path: 'sign-in', component: () => import('pages/auth/sign_in.vue') }
      ],
      beforeEnter: (to, from, next) => {
         // alert('/auth beforeEnter... from=' + from.path + JSON.stringify(from.query) + '. to=' + to.path + JSON.stringify(to.query))
         // // если уже авторизованы, то нельзя переходить на /auth (сначала надо выйти по кнопке logout)
         window.KALPA_LOAD_COMPLETE = true // чтобы крутилка не показывалась
         if (localStorage.getItem('k_user_oid')) {
            logD('user is Auth! goto /root')
            return next('/')
         } else return next()
      }
   },
   {
      path: '/help',
      redirect: '/help/home',
      component: () => import('layouts/help_layout.vue'),
      children: [
         {
            path: 'home',
            component: () => import('pages/help/home.vue'),
         },
         {
            path: ':docId',
            component: () => import('pages/help/doc.vue')
         }
      ],
      meta: { roleMinimal: 'GUEST' },
      beforeEnter: (to, from, next) => {
         window.KALPA_LOAD_COMPLETE = true // чтобы крутилка не показывалась
         next()
      }
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
                  // meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'settings.docs',
                  path: 'docs',
                  // component: settingsDocs,
                  component: () => import('pages/app/settings/view_docs/index.vue')
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
            name: 'node-render',
            path: 'node-render/:oid',
            component: () => import('pages/app/node_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'joint',
            path: 'joint/:oid',
            component: () => import('pages/app/joint/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'joint-render',
            path: 'joint-render/:oid',
            component: () => import('pages/app/joint_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'graph',
            path: 'graph/:oid',
            component: () => import('pages/app/graph/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            path: 'user/:oid',
            component: () => import('pages/app/user/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            children: [
               {
                  name: 'user.home',
                  path: '',
                  redirect: 'nodes',
               },
               {
                  name: 'user.collections',
                  path: 'collections',
                  component: () => import('pages/app/user/page_collections/index.vue'),
               },
               {
                  name: 'user.nodes',
                  path: 'nodes',
                  component: () => import('pages/app/user/page_nodes/index.vue'),
               },
               {
                  name: 'user.joints',
                  path: 'joints',
                  component: () => import('pages/app/user/page_joints/index.vue'),
               },
               {
                  name: 'user.votes',
                  path: 'votes',
                  component: () => import('pages/app/user/page_votes/index.vue'),
               },
               {
                  name: 'user.following',
                  path: 'following',
                  component: () => import('pages/app/user/page_following/index.vue'),
               },
               {
                  name: 'user.followers',
                  path: 'followers',
                  component: () => import('pages/app/user/page_followers/index.vue'),
               }
            ]
         },
         {
            name: 'user-render',
            path: 'user-render/:oid/:page?',
            component: () => import('pages/app/user_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'sphere',
            path: 'sphere/:oid/:page?',
            component: () => import('pages/app/sphere/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'sphere-threads',
            path: 'sphere-threads/:oid',
            component: () => import('pages/app/sphere_threads/index'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'sphere-render',
            path: 'sphere-render/:oid/:page?',
            component: () => import('pages/app/sphere_render/index.vue'),
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
            props: (route) => ({ oid: route.params.oid }),
            component: () => import('src/pages/app/content/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'content-render',
            path: 'content-render/:oid',
            props: (route) => ({ oid: route.params.oid }),
            component: () => import('src/pages/app/content_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         // notifications
         {
            name: 'notifications',
            path: 'notifications',
            component: () => import('pages/app/notifications/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         // workspace
         {
            path: 'workspace',
            component: () => import('pages/app/workspace/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            children: [
               {
                  name: 'workspace',
                  path: '',
                  component: () => import('pages/app/workspace/page_home/index.vue'),
               },
               {
                  name: 'workspace.collections',
                  path: 'collections',
                  component: () => import('pages/app/workspace/page_collections/index.vue'),
               },
               {
                  name: 'workspace.collection',
                  path: 'collection/:id',
                  component: () => import('pages/app/workspace/page_collection/index.vue'),
               },
               {
                  name: 'workspace.bookmarks',
                  path: 'bookmarks',
                  component: () => import('pages/app/workspace/page_bookmarks/index.vue'),
               },
               {
                  name: 'workspace.create',
                  path: 'create',
                  component: () => import('pages/app/workspace/page_create/index.vue'),
               }
            ]
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
         if (to.query.masterToken) {
            logD('clone session!', to.query.masterToken)
            if (localStorage.getItem('k_token') !== to.query.masterToken) { // userIdentify на сервере аннулирует текущую сессию
               await AuthApi.userIdentify(null, to.query.masterToken)
               await AuthApi.userAuthenticate(null)
            }
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
