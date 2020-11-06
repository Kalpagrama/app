import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { AuthApi } from 'src/api/auth'
import { systemInit } from 'src/system/services'
import assert from 'assert'

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
         }
         else return next()
      }
   },
   {
      path: '/share_target/:page?',
      component: () => import('layouts/share_layout.vue')
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
         {
            name: 'welcome',
            path: 'welcome',
            component: () => import('pages/app/welcome/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
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
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'settings.feeds',
                  path: 'feeds',
                  component: () => import('pages/app/settings/view_feeds/index.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'settings.feed',
                  path: 'feed/:id',
                  component: () => import('pages/app/settings/view_feeds/feed_editor.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'settings.workspace',
                  path: 'workspace',
                  component: () => import('pages/app/settings/view_workspace/index.vue'),
                  meta: { roleMinimal: 'GUEST' }
               }
            ],
            meta: { roleMinimal: 'MEMBER' }
         },
         {
            name: 'user',
            path: 'user/:oid',
            redirect: 'user/:oid/nodes',
            component: () => import('pages/app/user/index.vue'),
            children: [
               {
                  name: 'user.feeds',
                  path: 'feeds',
                  component: () => import('pages/app/user/user_feeds.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'user.nodes',
                  path: 'nodes',
                  component: () => import('pages/app/user/user_nodes.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'user.joints',
                  path: 'joints',
                  component: () => import('pages/app/user/user_joints.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'user.votes',
                  path: 'votes',
                  component: () => import('pages/app/user/user_votes.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'user.followers',
                  path: 'followers',
                  component: () => import('pages/app/user/user_followers.vue'),
                  meta: { roleMinimal: 'GUEST' }
               }
            ],
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'node',
            path: 'node/:oid',
            redirect: 'node/:oid/joints',
            component: () => import('pages/app/node/index.vue'),
            children: [
               {
                  name: 'node.joints',
                  path: 'joints',
                  component: () => import('pages/app/node/view_joints/index.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
            ],
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
                  component: () => import('pages/app/sphere/view_nodes/index.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'sphere.spheres',
                  path: 'spheres',
                  component: () => import('pages/app/sphere/view_spheres/index.vue'),
                  meta: { roleMinimal: 'GUEST' }
               }
            ],
            meta: { roleMinimal: 'GUEST' }
         },
         // {
         //    name: 'search',
         //    path: 'search',
         //    component: () => import('pages/app/search/index.vue')
         // },
         {
            name: 'trends',
            path: 'trends/:oid?',
            component: () => import('pages/app/trends/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'content',
            path: 'content/:oid',
            props: (route) => ({oid: route.params.oid, query: route.query}),
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
            // children: [
            //    {
            //       name: 'notifications',
            //       path: '',
            //       component: () => import('pages/app/notifications/view_index.vue'),
            //       meta: { roleMinimal: 'MEMBER' }
            //    }
            // ],
            meta: { roleMinimal: 'MEMBER' }
         },
         {
            name: 'workspace',
            path: 'workspace/:viewId?',
            component: () => import('pages/app/ws_index/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
         },
         // {
         //    name: 'workspace.feeds',
         //    // props: (route) => ({mode: 'standalone', type: route.params.type, query: route.query}),
         //    path: 'workspace/feeds',
         //    component: () => import('pages/app/ws_feeds/index.vue'),
         //    meta: { roleMinimal: 'MEMBER' }
         // },
         {
            name: 'workspace.collection',
            path: 'workspace/collection/:id',
            component: () => import('pages/app/ws_collection/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
         },
         // {
         //    name: 'workspace.nodes',
         //    path: 'workspace/nodes',
         //    component: () => import('pages/app/ws_nodes/index.vue'),
         //    meta: { roleMinimal: 'MEMBER' }
         // },
         {
            name: 'workspace.node',
            path: 'workspace/node/:id',
            component: () => import('pages/app/ws_node/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
         },
         // {
         //    name: 'workspace.joints',
         //    path: 'workspace/joints',
         //    component: () => import('pages/app/ws_joints/index.vue'),
         //    meta: { roleMinimal: 'MEMBER' }
         // },
         {
            name: 'workspace.joint',
            path: 'workspace/joint/:id',
            component: () => import('pages/app/ws_joint/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
         },
         {
            name: 'workspace.trash',
            path: 'workspace/trash',
            component: () => import('pages/app/ws_joint/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
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

export default routes
