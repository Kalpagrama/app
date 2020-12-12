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
         { name: 'signUp', path: 'sign-up', component: () => import('pages/auth/sign_up') }
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
      path: '/share', // этот маршрут обрабатыватся хуком в initPWA()
   },
   {
      path: '/',
      component: () => import('layouts/main_layout'),
      children: [
         {
            name: 'feeds',
            path: 'feeds/:id?',
            component: () => import('pages/app/feeds/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         // {
         //    name: 'welcome',
         //    path: 'welcome',
         //    component: () => import('pages/app/welcome/index.vue'),
         //    meta: { roleMinimal: 'MEMBER' }
         // },
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
               },
               {
                  name: 'settings.workspace',
                  path: 'workspace',
                  component: () => import('pages/app/settings/view_workspace/index.vue'),
                  meta: { roleMinimal: 'MEMBER' }
               },
               {
                  name: 'settings.docs',
                  path: 'docs',
                  component: () => import('pages/app/settings/view_docs/index.vue'),
                  meta: { roleMinimal: 'GUEST' }
               }
            ],
            // meta: { roleMinimal: 'MEMBER' }
         },
         {
            path: 'user/:oid',
            component: () => import('pages/app/user/index.vue'),
            children: [
               {
                  path: ':tab?',
                  name: 'user',
                  component: () => import('pages/app/user/page_profile/index.vue')
               },
               {
                  path: 'workspace/:tab?',
                  name: 'user.workspace',
                  redirect: '/workspace',
                  // component: () => import('pages/app/user/page_workspace/index.vue')
               },
               {
                  path: 'settings/:tab?',
                  name: 'user.settings',
                  redirect: '/settings'
                  // component: () => import('pages/app/user/page_settings/index.vue')
               }
            ],
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'node',
            path: 'node/:oid',
            // redirect: 'node/:oid/joints',
            component: () => import('pages/app/node/index.vue'),
            // children: [
            //    {
            //       name: 'node.joints',
            //       path: 'joints',
            //       component: () => import('pages/app/node/view_joints/index.vue'),
            //       meta: { roleMinimal: 'GUEST' }
            //    }
            // ],
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'joint',
            path: 'joint/:oid',
            component: () => import('pages/app/joint/index.vue')
         },
         {
            name: 'sphere',
            path: 'sphere/:oid',
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
            component: () => import('pages/app/content/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
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
            name: 'messages',
            path: 'messages',
            component: () => import('pages/app/messages/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
         },
         {
            name: 'workspace.create',
            path: 'workspace/create',
            component: () => import('pages/app/ws_create/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
         },
         {
            name: 'workspace',
            path: 'workspace/:viewId?',
            component: () => import('pages/app/ws_index/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
         },
         // {
         //    name: 'workspace.collection',
         //    path: 'workspace/collection/:id',
         //    component: () => import('pages/app/ws_collection/index.vue'),
         //    meta: { roleMinimal: 'MEMBER' }
         // },
         // {
         //    name: 'workspace.collection-view',
         //    path: 'workspace/collection-view/:id/:viewid',
         //    component: () => import('pages/app/ws_collection_view/index.vue'),
         //    meta: { roleMinimal: 'MEMBER' }
         // },
         // {
         //    name: 'workspace.node',
         //    path: 'workspace/node/:id',
         //    component: () => import('pages/app/ws_node/index.vue'),
         //    meta: { roleMinimal: 'MEMBER' }
         // },
         // {
         //    name: 'workspace.joint',
         //    path: 'workspace/joint/:id',
         //    component: () => import('pages/app/ws_joint/index.vue'),
         //    meta: { roleMinimal: 'MEMBER' }
         // },
         // {
         //    name: 'workspace.trash',
         //    path: 'workspace/trash',
         //    component: () => import('pages/app/ws_joint/index.vue'),
         //    meta: { roleMinimal: 'MEMBER' }
         // },
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
// for (let r of routes[2].children) {
//    assert(r.path, '!r.path' + JSON.stringify(r))
//    let path = r.path.split('/')[0]
//    assert(path, '!path')
//    if (path === '*') continue
//    assert(vueRoutesRegexp.test(`https://kalpa.app/${path}/params`), '!vueRoutesRegexp.test not pass: bad path: ' + `https://kalpa.app/${path}/params`)
// }

export default routes
