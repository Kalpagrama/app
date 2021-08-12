import { getLogFunc, localStorage, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { AuthApi } from 'src/api/auth'
import { systemInit } from 'src/system/services'
import { assert } from 'src/system/utils'
import { vueRoutesRegexp } from 'public/scripts/common_func'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'

// components
// import settingsDocs from 'src/pages/app/settings/view_docs/index.vue'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.ROUTER)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.ROUTER)

async function saveHistory (oid) {
   logD('saveHistory', oid)
   let item = await rxdb.get(RxCollectionEnum.OBJ, oid)
   if (item) {
      let res = await rxdb.find({
         selector: {
            rxCollectionEnum: RxCollectionEnum.WS_HISTORY
         },
         sort: [{ createdAt: 'asc' }]
      }, false)
      await res.next(100500, 100500)
      // console.log('history before=', res.items.map(item => item.name))
      // for (let item of res.items){
      //    for (let item2 of res.items){
      //       if (item.oid === item2.oid){
      //          console.log('history remove item=', item)
      //          item.remove(true)
      //          item.flushDebounce()
      //       }
      //    }
      // }
      // res = await rxdb.find({
      //    selector: {
      //       rxCollectionEnum: RxCollectionEnum.WS_HISTORY
      //    },
      //    sort: [{ createdAt: 'asc' }]
      // }, true)

      let existing = res.items.find(el => el.oid === oid)
      if (existing) {
         console.log('existing=', existing.name)
         await existing.remove(true)
         existing.flushDebounce()
      }
      // console.log('history after remove=', res.items.map(item => item.name))
      let historyItemInput = {
         type: item.type,
         oid: item.oid,
         name: item.name,
         thumbUrl: item.thumbUrl
      }
      let historyItem = await rxdb.set(RxCollectionEnum.WS_HISTORY, historyItemInput)
      // console.log('history after=', res.items.map(item => item.name))
      for (let i = 0; i < res.items.length - 100; i++) { // максимум 100 в истории
         console.log('history remove=', res.items[i].name)
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
      component: () => import('layouts/auth_layout.vue'),
      children: [
         { name: 'signIn', path: 'sign-in', component: () => import('src/pages/auth/home/index.vue') }
         // { name: 'signIn', path: 'sign-in', component: () => import('src/pages/auth/sign_in.vue') }
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
      // beforeEnter: async (to, from, next) => {
      //    if (to.query.originalUrl) { // редирект на полную версию (после успешного входа перейдет на этот url)
      //       logD('redirect command received!', to.query.originalUrl)
      //       sessionStorage.setItem('k_originalUrl', to.query.originalUrl)
      //    }
      //    if (to.query.masterToken) {
      //       logD('clone session!', to.query.masterToken)
      //       if (localStorage.getItem('k_token') !== to.query.masterToken) { // userIdentify на сервере аннулирует текущую сессию
      //          await AuthApi.userIdentify(null, to.query.masterToken)
      //          await AuthApi.userAuthenticate(null)
      //       }
      //    }
      //    logD('router :: try systemInit...')
      //    // alert(' /root router :: try systemInit... from=' + from.path + JSON.stringify(from.query) + '. to=' + to.path + JSON.stringify(to.query))
      //    await systemInit() // для гостей тоже надо входить (если уже войдено - ничего не сделает)
      //    //  assert(to.meta.roleMinimal, '!to.meta.roleMinimal')
      //    if (!AuthApi.userMatchMinimalRole(to.meta.roleMinimal || 'GUEST')) {
      //       logD('router::need more privileges')
      //       return next('/auth') // если маршрут требует повышения - переходим на форму входа
      //    } else {
      //       logD('router:: its ok! ')
      //       return next()
      //    }
      // }
   },
   {
      path: '/share' // этот маршрут обрабатыватся хуком в initPWA()
   },
   {
      path: '/',
      component: () => import('src/layouts/main_layout'),
      children: [
         {
            name: 'about',
            path: 'about',
            component: () => import('src/pages/app/about/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'feeds',
            path: 'feeds/:id?',
            component: () => import('src/pages/app/feeds/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'settings',
            path: 'settings',
            redirect: 'settings/account',
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
            meta: { roleMinimal: 'GUEST' }
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
            component: () => import('src/pages/app/node_render/index.vue'),
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
            component: () => import('src/pages/app/joint_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
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
                  redirect: 'nodes'
               },
               {
                  name: 'user.collections',
                  path: 'collections',
                  component: () => import('src/pages/app/user/page_collections/index.vue')
               },
               {
                  name: 'user.nodes',
                  path: 'nodes',
                  component: () => import('src/pages/app/user/page_nodes/index.vue')
               },
               {
                  name: 'user.joints',
                  path: 'joints',
                  component: () => import('src/pages/app/user/page_joints/index.vue')
               },
               {
                  name: 'user.votes',
                  path: 'votes',
                  component: () => import('src/pages/app/user/page_votes/index.vue')
               },
               {
                  name: 'user.following',
                  path: 'following',
                  component: () => import('src/pages/app/user/page_following/index.vue')
               },
               {
                  name: 'user.followers',
                  path: 'followers',
                  component: () => import('src/pages/app/user/page_followers/index.vue')
               }
            ],
            beforeEnter: async (to, from, next) => {
               if (to) saveHistory(to.params.oid)
               next()
            }
         },
         {
            name: 'user-render',
            path: 'user-render/:oid/:page?',
            component: () => import('src/pages/app/user_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'sphere',
            path: 'sphere/:oid/:page?',
            component: () => import('src/pages/app/sphere/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            beforeEnter: async (to, from, next) => {
               if (to) saveHistory(to.params.oid)
               next()
            }
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
            component: () => import('src/pages/app/sphere_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         {
            name: 'trends',
            path: 'trends/:oid?',
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
            component: () => import('src/pages/app/content_render/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         // notifications
         {
            name: 'notifications',
            path: 'notifications',
            component: () => import('src/pages/app/notifications/index.vue'),
            meta: { roleMinimal: 'GUEST' }
         },
         // workspace
         {
            path: 'workspace',
            component: () => import('src/pages/app/workspace/index.vue'),
            meta: { roleMinimal: 'GUEST' },
            children: [
               {
                  name: 'workspace',
                  path: '',
                  component: () => import('src/pages/app/workspace/page_home/index.vue')
               },
               {
                  name: 'workspace.collections',
                  path: 'collections',
                  component: () => import('src/pages/app/workspace/page_collections/index.vue')
               },
               {
                  name: 'workspace.collection',
                  path: 'collection/:id',
                  component: () => import('src/pages/app/workspace/page_collection/index.vue')
               },
               {
                  name: 'workspace.bookmarks',
                  path: 'bookmarks',
                  component: () => import('src/pages/app/workspace/page_bookmarks/index.vue')
               },
               {
                  name: 'workspace.drafts',
                  path: 'drafts',
                  component: () => import('src/pages/app/workspace/page_drafts/index.vue')
               },
               {
                  name: 'workspace.history',
                  path: 'history',
                  component: () => import('src/pages/app/workspace/page_history/index.vue')
               },
               {
                  name: 'workspace.contents',
                  path: 'contents',
                  component: () => import('src/pages/app/workspace/page_contents/index.vue')
               },
               {
                  name: 'workspace.create',
                  path: 'create',
                  component: () => import('src/pages/app/workspace/page_create/index.vue')
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
         // logD('router :: try systemInit...')
         await systemInit() // для гостей тоже надо входить (если уже войдено - ничего не сделает)
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
