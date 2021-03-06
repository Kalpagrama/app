import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { AuthApi } from 'src/api/auth'
import { systemInit } from 'src/system/services'
import { assert } from 'src/system/common/utils'
import { vueRoutesRegexp } from 'src/system/common/common_func'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.ROUTER)

async function saveHistory (oid) {
   logD('saveHistory', oid)
   let item = await rxdb.get(RxCollectionEnum.OBJ, oid)
   if (item) {
      let res = await rxdb.find({
         selector: {
            rxCollectionEnum: RxCollectionEnum.WS_HISTORY,
            deletedAt: 0
         },
         sort: [{ createdAt: 'asc' }]
      })
      // console.log('history before=', res.items)

      for (let item of res.items) {
         if (item.oid === oid) await item.remove(true)
      }
      // logT('history after remove=', res.items.length)
      let historyItemInput = {
         type: item.type,
         oid: item.oid,
         name: item.name,
         thumbUrl: item.thumbUrl
      }
      let historyItem = await rxdb.set(RxCollectionEnum.WS_HISTORY, historyItemInput)
      // logT('history after=', res.items.length)
      for (let i = 0; i < res.items.length - 100; i++) { // максимум 100 в истории
         // console.log('history remove=', res.items[i].name)
         res.items[i].remove(true)
      }
      // console.log('history after trim=', res.items.map(item => item.name))
   }
}

function startPage () {
   let res = '/home'
   if (AuthApi.isGuest()) res = '/trends'
   return res
}

const routes = [
   {
      path: '/auth',
      redirect: '/auth/sign-in',
      component: () => import('src/layouts/auth_layout.vue'),
      children: [
         { name: 'signIn', path: 'sign-in', component: () => import('src/pages/auth/home/index.vue') }
         // { name: 'signIn', path: 'sign-in', component: () => import('src/pages/auth/sign_in.vue') }
      ],
      beforeEnter: (to, from, next) => {
         // alert('/auth beforeEnter... from=' + from.path + JSON.stringify(from.query) + '. to=' + to.path + JSON.stringify(to.query))
         // // если уже авторизованы, то нельзя переходить на /auth (сначала надо выйти по кнопке logout)
         window.KALPA_LOAD_COMPLETE = true // чтобы крутилка не показывалась
         return next('/')
      }
   },
   {
      path: '/help',
      redirect: '/help/home',
      component: () => import('layouts/help_layout.vue'),
      children: [
         {
            path: 'home',
            component: () => import('src/pages/help/home.vue')
         },
         {
            path: ':docId',
            component: () => import('src/pages/help/doc.vue')
         }
      ],
      meta: { roleMinimal: 'GUEST' },
      beforeEnter: (to, from, next) => {
         window.KALPA_LOAD_COMPLETE = true // чтобы крутилка не показывалась
         next()
      }
   },
   {
      path: '/ui',
      component: () => import('layouts/ui_layout.vue'),
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
      // redirect: startPage(),
      component: () => import('src/layouts/main_layout'),
      children: [
         { name: 'root', path: '', redirect: startPage() },
         {
            name: 'about',
            path: 'about',
            component: () => import('src/pages/app/about/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'home',
            path: 'home',
            component: () => import('src/pages/app/home/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
         },
         {
            name: 'settings',
            path: 'settings',
            redirect: '/settings/account',
            component: () => import('src/pages/app/settings'),
            children: [
               {
                  name: 'settings.account',
                  path: 'account',
                  component: () => import('src/pages/app/settings/view_account/index.vue')
                  // meta: { roleMinimal: 'GUEST' }
               },
               {
                  name: 'settings.docs',
                  path: 'docs',
                  // component: settingsDocs,
                  component: () => import('src/pages/app/settings/view_docs/index.vue')
               }
            ],
            meta: { roleMinimal: 'MEMBER' }
         },
         {
            name: 'node',
            path: 'node/:oid',
            // alias: 'node2/:oid',
            component: () => import('src/pages/app/node/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            beforeEnter: async (to, from, next) => {
               if (to) saveHistory(to.params.oid)
               next()
            }
         },
         {
            name: 'node-render',
            path: 'node-render/:oid',
            component: () => import('src/pages/app/snippet_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'joint',
            path: 'joint/:oid',
            component: () => import('src/pages/app/joint/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            beforeEnter: async (to, from, next) => {
               if (to) saveHistory(to.params.oid)
               next()
            }
         },
         {
            name: 'joint-render',
            path: 'joint-render/:oid',
            component: () => import('src/pages/app/snippet_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'block',
            path: 'block/:oid',
            // alias: 'node2/:oid',
            component: () => import('src/pages/app/block/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            beforeEnter: async (to, from, next) => {
               if (to) saveHistory(to.params.oid)
               next()
            }
         },
         {
            name: 'block-render',
            path: 'block-render/:oid',
            // alias: 'node2/:oid',
            component: () => import('src/pages/app/snippet_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'graph',
            path: 'graph/:oid',
            props: (route) => ({ oid: route.params.oid }),
            component: () => import('src/pages/app/graph/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            beforeEnter: async (to, from, next) => {
               if (to) saveHistory(to.params.oid)
               next()
            }
         },
         {
            name: 'cube',
            path: 'cube/:oid',
            component: () => import('src/pages/app/cube/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            path: 'user/:oid',
            component: () => import('src/pages/app/user/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            children: [
               {
                  name: 'user.home',
                  path: '',
                  component: () => import('src/pages/app/user/home.vue')
               },
            ],
            beforeEnter: async (to, from, next) => {
               if (to) saveHistory(to.params.oid)
               next()
            }
         },
         {
            name: 'user-render',
            path: 'user-render/:oid/:page?',
            component: () => import('src/pages/app/snippet_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'sphere',
            path: 'sphere/:oid/:sort?',
            component: () => import('src/pages/app/sphere/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            beforeEnter: async (to, from, next) => {
               if (to) saveHistory(to.params.oid)
               next()
            }
         },
         {
            name: 'category',
            // path: 'category/:categoryId',
            path: 'category/:oid/:sort?',
            // component: () => import('src/pages/app/trends/category.vue'),
            component: () => import('src/pages/app/sphere/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'sphere-threads',
            path: 'sphere-threads/:oid',
            component: () => import('src/pages/app/sphere_threads/index'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'sphere-render',
            path: 'sphere-render/:oid/:page?',
            component: () => import('src/pages/app/snippet_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'trends',
            path: 'trends',
            component: () => import('src/pages/app/trends/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'content',
            path: 'content/:oid',
            props: (route) => ({ oid: route.params.oid }),
            component: () => import('src/pages/app/content/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            beforeEnter: async (to, from, next) => {
               if (to) saveHistory(to.params.oid)
               next()
            }
         },
         {
            name: 'cover',
            path: 'cover/:oid',
            props: (route) => ({ oid: route.params.oid }),
            component: () => import('src/pages/app/cover/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            beforeEnter: async (to, from, next) => {
               if (to) saveHistory(to.params.oid)
               next()
            }
         },
         {
            name: 'content-render',
            path: 'content-render/:oid',
            props: (route) => ({ oid: route.params.oid }),
            component: () => import('src/pages/app/snippet_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         // notifications
         {
            name: 'notifications',
            path: 'notifications',
            component: () => import('src/pages/app/notifications/index.vue'),
            meta: { roleMinimal: 'MEMBER' }
         },
         // workspace
         {
            path: 'workspace',
            component: () => import('src/pages/app/workspace/index.vue'),
            meta: { roleMinimal: 'MEMBER' },
            children: [
               {
                  name: 'workspace',
                  path: '',
                  component: () => import('src/pages/app/workspace/page_home/index.vue')
               },
               {
                  name: 'workspace.collections',
                  path: 'collections',
                  props: (route) => ({ listName: route.name.split('.')[1] }),
                  component: () => import('src/pages/app/list/index.vue')
               },
               {
                  name: 'workspace.collection',
                  path: 'collection/:id',
                  component: () => import('src/pages/app/workspace/page_collection/index.vue')
               },
               {
                  name: 'workspace.search',
                  path: 'search',
                  props: (route) => ({ listName: route.name.split('.')[1] }),
                  component: () => import('src/pages/app/list/index.vue')
               },
               {
                  name: 'workspace.drafts',
                  path: 'drafts',
                  props: (route) => ({ listName: route.name.split('.')[1] }),
                  component: () => import('src/pages/app/list/index.vue')
               },
               {
                  name: 'workspace.published',
                  path: 'published',
                  props: (route) => ({ listName: route.name.split('.')[1] }),
                  component: () => import('src/pages/app/list/index.vue')
               },
               {
                  name: 'workspace.history',
                  path: 'history',
                  props: (route) => ({ listName: route.name.split('.')[1] }),
                  component: () => import('src/pages/app/list/index.vue')
               },
               {
                  name: 'workspace.contents',
                  path: 'contents',
                  props: (route) => ({ listName: route.name.split('.')[1] }),
                  component: () => import('src/pages/app/list/index.vue')
               },
               {
                  name: 'workspace.edit',
                  path: 'edit',
                  component: () => import('src/pages/app/workspace/page_edit/index.vue')
               }
            ]
         }
      ],
      meta: { roleMinimal: 'GUEST' },
      beforeEnter: async (to, from, next) => {
         // alert('router / beforeEnter...' + to.path)
         // logD('router / beforeEnter...', to, from)
         return next()
      }
   }
]

// Always leave this as last one
routes.push({
   name: 'fallback',
   path: '/:catchAll(.*)*',
   component: () => import('src/pages/Error404.vue'),
})

// на эту регулярку опирается сервисворкер, когда отдает index.html вместо vue route. нужно чтобы все роуты ей соответствовали
// при добавлении роута - добавить его в vueRoutesRegexp
for (let route of routes) {
   assert(route.path, '!route.path')
   if (route.children) {
      for (let cr of route.children) {
         if (!cr.path) continue
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
