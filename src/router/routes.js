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
            name: 'home',
            path: 'home/:id?',
            component: () => import('pages/app/feeds/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
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
            redirect: 'user/:oid/created',
            component: () => import('pages/app/user/index.vue'),
            children: [
               {
                  name: 'user.created',
                  path: 'created',
                  component: () => import('pages/app/user/user_created.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'user.voted',
                  path: 'voted',
                  component: () => import('pages/app/user/user_voted.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'user.following',
                  path: 'following',
                  component: () => import('pages/app/user/user_following.vue'),
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
            redirect: 'node/:oid/nodes',
            component: () => import('pages/app/node/index.vue'),
            children: [
               {
                  name: 'node.nodes',
                  path: 'nodes',
                  component: () => import('pages/app/node/node_nodes/index.vue'),
                  meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'node.chains',
                  path: 'chains',
                  component: () => import('pages/app/node/node_chains/index.vue'),
                  meta: { roleMinimal: 'GUEST' }
               }
            ],
            meta: { roleMinimal: 'GUEST' }
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
            name: 'workspace',
            path: 'workspace',
            redirect: 'workspace/contents',
            component: () => import('pages/app/ws_index/index.vue'),
            children: [
               // pages
               {
                  name: 'workspace.pages',
                  path: 'pages',
                  // redirect: '',
                  component: () => import('pages/app/ws_pages/index.vue')
               },
               {
                  name: 'workspace.page',
                  path: 'page/:id',
                  component: () => import('pages/app/ws_pages/page_editor.vue')
               },
               // contents
               {
                  name: 'workspace.contents',
                  path: 'contents',
                  redirect: 'contents/video',
                  component: () => import('pages/app/ws_contents/index.vue'),
                  children: [
                     {
                        name: 'workspace.contents.video',
                        path: 'video',
                        component: () => import('pages/app/ws_contents/type_video.vue'),
                        meta: { roleMinimal: 'MEMBER' }
                     },
                     {
                        name: 'workspace.contents.image',
                        path: 'image',
                        component: () => import('pages/app/ws_contents/type_image.vue'),
                        meta: { roleMinimal: 'MEMBER' }
                     },
                     {
                        name: 'workspace.contents.audio',
                        path: 'audio',
                        component: () => import('pages/app/ws_contents/type_audio.vue'),
                        meta: { roleMinimal: 'MEMBER' }
                     },
                     {
                        name: 'workspace.contents.books',
                        path: 'books',
                        component: () => import('pages/app/ws_contents/type_books.vue'),
                        meta: { roleMinimal: 'MEMBER' }
                     }
                  ]
               },
               // {
               //   name: 'workspace.content',
               //   path: 'content/:id',
               //   // redirect: 'content/:id/fragments',
               //   component: () => import('pages/app/ws_content/index.vue'),
               //   children: [
               //     // { name: 'workspace.content.details', path: 'details', component: () => import('pages/app/ws_content/view_details.vue') },
               //     // { name: 'workspace.content.fragments', path: 'fragments', component: () => import('pages/app/ws_content/view_fragments.vue') },
               //     // { name: 'workspace.content.nodes', path: 'nodes', component: () => import('pages/app/ws_content/view_nodes.vue') }
               //   ]
               // },
               // { name: 'workspace.content.import', path: 'content/import', component: () => import('components/workspace/ws_content_import') },
               // nodes
               {
                  name: 'workspace.nodes',
                  path: 'nodes',
                  redirect: 'nodes/drafts',
                  component: () => import('pages/app/ws_nodes/index.vue'),
                  children: [
                     {
                        name: 'workspace.nodes.saved',
                        path: 'saved',
                        component: () => import('pages/app/ws_nodes/type_saved.vue'),
                        meta: { roleMinimal: 'MEMBER' }
                     },
                     {
                        name: 'workspace.nodes.drafts',
                        path: 'drafts',
                        component: () => import('pages/app/ws_nodes/type_drafts.vue'),
                        meta: { roleMinimal: 'MEMBER' }
                     },
                     {
                        name: 'workspace.nodes.fragments',
                        path: 'fragments',
                        component: () => import('pages/app/ws_nodes/type_fragments.vue'),
                        meta: { roleMinimal: 'MEMBER' }
                     },
                     {
                        name: 'workspace.nodes.published',
                        path: 'published',
                        component: () => import('pages/app/ws_nodes/type_published.vue'),
                        meta: { roleMinimal: 'MEMBER' }
                     }
                  ]
               },
               { name: 'workspace.node', path: 'node/:id', component: () => import('pages/app/ws_node/index.vue') },
               // spheres
               {
                  name: 'workspace.spheres',
                  path: 'spheres',
                  component: () => import('pages/app/ws_spheres/index.vue')
               },
               {
                  name: 'workspace.sphere',
                  path: 'sphere/:id',
                  redirect: 'sphere/:id/items',
                  component: () => import('pages/app/ws_sphere/index.vue'),
                  children: [
                     {
                        name: 'workspace.sphere.details',
                        path: 'details',
                        component: () => import('pages/app/ws_sphere/sphere_details.vue'),
                        meta: { roleMinimal: 'MEMBER' }
                     },
                     {
                        name: 'workspace.sphere.items',
                        path: 'items',
                        component: () => import('pages/app/ws_sphere/sphere_items.vue'),
                        meta: { roleMinimal: 'MEMBER' }
                     },
                     {
                        name: 'workspace.sphere.explore',
                        path: 'explore',
                        component: () => import('pages/app/ws_sphere/sphere_explore.vue'),
                        meta: { roleMinimal: 'MEMBER' }
                     }
                  ]
               }
            ],
            meta: { roleMinimal: 'MEMBER' }
         },
         {
            // name: 'notifications',
            path: 'notifications',
            component: () => import('pages/app/notifications/index.vue'),
            children: [
               {
                  name: 'notifications',
                  path: '',
                  component: () => import('pages/app/notifications/view_home.vue'),
                  meta: { roleMinimal: 'MEMBER' }
               }
            ],
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
