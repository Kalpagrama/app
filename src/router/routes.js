import {getLogFunc, LogLevelEnum, LogSystemModulesEnum} from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX)

const routes = [
  {
    path: '/auth',
    redirect: '/auth/sign-in',
    component: () => import('layouts/auth_layout.vue'),
    children: [
      { name: 'signIn', path: 'sign-in', component: () => import('pages/auth/sign_in') },
      { name: 'signUp', path: 'sign-up', component: () => import('pages/auth/sign_up') },
    ]
  },
  {
    path: '/share_target/:page?',
    component: () => import('layouts/share_layout.vue'),
  },
  {
    path: '/',
    redirect: '/home',
    component: () => import('layouts/main_layout'),
    children: [
      {
        name: 'home',
        path: 'home',
        // component: () => import('pages/app/home/index.vue'),
        component: () => import('pages/app/home/home.vue'),
      },
      {
        name: 'welcome',
        path: 'welcome',
        component: () => import('pages/app/welcome/index.vue'),
        // children: []
      },
      {
        name: 'settings',
        path: 'settings',
        redirect: 'settings/account',
        component: () => import('pages/app/settings'),
        children: [
          { name: 'settings.account', path: 'account', component: () => import('pages/app/settings/view_account/index.vue') },
          { name: 'settings.feeds', path: 'feeds', component: () => import('pages/app/settings/view_feeds/index.vue') },
          { name: 'settings.workspace', path: 'workspace', component: () => import('pages/app/settings/view_workspace/index.vue') }
        ]
      },
      {
        name: 'user',
        path: 'user/:oid',
        redirect: 'user/:oid/created',
        component: () => import('pages/app/user/index.vue'),
        children: [
          { name: 'user.created', path: 'created', component: () => import('pages/app/user/user_created.vue') },
          { name: 'user.voted', path: 'voted', component: () => import('pages/app/user/user_voted.vue') },
          { name: 'user.following', path: 'following', component: () => import('pages/app/user/user_following.vue') },
          { name: 'user.followers', path: 'followers', component: () => import('pages/app/user/user_followers.vue') },
        ]
      },
      {
        name: 'node',
        path: 'node/:oid',
        redirect: 'node/:oid/nodes',
        component: () => import('pages/app/node/index.vue'),
        children: [
          { name: 'node.nodes', path: 'nodes', component: () => import('pages/app/node/node_nodes/index.vue') },
          { name: 'node.chains', path: 'chains', component: () => import('pages/app/node/node_chains/index.vue') },
        ]
      },
      {
        name: 'sphere',
        path: 'sphere/:oid',
        component: () => import('pages/app/sphere/index.vue'),
        children: [
          { name: 'sphere.nodes', path: 'nodes', component: () => import('pages/app/sphere/view_nodes/index.vue') },
          { name: 'sphere.spheres', path: 'spheres', component: () => import('pages/app/sphere/view_spheres/index.vue') }
        ]
      },
      { name: 'trends', path: 'trends/:oid?', component: () => import('pages/app/trends/index.vue') },
      {
        name: 'content',
        path: 'content/:oid',
        redirect: 'content/:oid/nodes',
        component: () => import('pages/app/content/index.vue'),
        children: [
          { name: 'content.details', path: 'details', component: () => import('pages/app/content/content_details.vue') },
          { name: 'content.nodes', path: 'nodes', component: () => import('pages/app/content/content_nodes.vue') },
        ]
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
            component: () => import('pages/app/ws_pages/index.vue'),
          },
          {
            name: 'workspace.page',
            path: 'page/:id',
            component: () => import('pages/app/ws_pages/page_editor.vue'),
          },
          // contents
          {
            name: 'workspace.contents',
            path: 'contents',
            redirect: 'contents/video',
            component: () => import('pages/app/ws_contents/index.vue'),
            children: [
              { name: 'workspace.contents.video', path: 'video', component: () => import('pages/app/ws_contents/type_video.vue') },
              { name: 'workspace.contents.image', path: 'image', component: () => import('pages/app/ws_contents/type_image.vue') },
              { name: 'workspace.contents.audio', path: 'audio', component: () => import('pages/app/ws_contents/type_audio.vue') },
              { name: 'workspace.contents.books', path: 'books', component: () => import('pages/app/ws_contents/type_books.vue') },
            ]
          },
          {
            name: 'workspace.content',
            path: 'content/:id',
            // redirect: 'content/:id/fragments',
            component: () => import('pages/app/ws_content/index.vue'),
            children: [
              // { name: 'workspace.content.details', path: 'details', component: () => import('pages/app/ws_content/view_details.vue') },
              // { name: 'workspace.content.fragments', path: 'fragments', component: () => import('pages/app/ws_content/view_fragments.vue') },
              // { name: 'workspace.content.nodes', path: 'nodes', component: () => import('pages/app/ws_content/view_nodes.vue') }
            ]
          },
          // { name: 'workspace.content.import', path: 'content/import', component: () => import('components/workspace/ws_content_import') },
          // nodes
          {
            name: 'workspace.nodes',
            path: 'nodes',
            redirect: 'nodes/drafts',
            component: () => import('pages/app/ws_nodes/index.vue'),
            children: [
              { name: 'workspace.nodes.saved', path: 'saved', component: () => import('pages/app/ws_nodes/type_saved.vue') },
              { name: 'workspace.nodes.drafts', path: 'drafts', component: () => import('pages/app/ws_nodes/type_drafts.vue') },
              { name: 'workspace.nodes.fragments', path: 'fragments', component: () => import('pages/app/ws_nodes/type_fragments.vue') },
              { name: 'workspace.nodes.published', path: 'published', component: () => import('pages/app/ws_nodes/type_published.vue') },
            ]
          },
          { name: 'workspace.node', path: 'node/:id', component: () => import('pages/app/ws_node/index.vue') },
          // spheres
          { name: 'workspace.spheres', path: 'spheres', component: () => import('pages/app/ws_spheres/index.vue') },
          {
            name: 'workspace.sphere',
            path: 'sphere/:id',
            redirect: 'sphere/:id/items',
            component: () => import('pages/app/ws_sphere/index.vue'),
            children: [
              { name: 'workspace.sphere.details', path: 'details', component: () => import('pages/app/ws_sphere/sphere_details.vue') },
              { name: 'workspace.sphere.items', path: 'items', component: () => import('pages/app/ws_sphere/sphere_items.vue') },
              { name: 'workspace.sphere.explore', path: 'explore', component: () => import('pages/app/ws_sphere/sphere_explore.vue') }
            ]
          },
        ]
      },
      {
        // name: 'notifications',
        path: 'notifications',
        component: () => import('pages/app/notifications/index.vue'),
        children: [
          { name: 'notifications', path: '', component: () => import('pages/app/notifications/view_home.vue') },
        ]
      },
      {
        name: 'fallback',
        path: '*',
        redirect: '/home'
      },
    ],
    beforeEnter: (to, from, next) => {
      if (to.query.originalUrl){ // редирект на полную версию
        logD('redirect command received!', to.query.originalUrl)
        localStorage.setItem('k_originalUrl', to.query.originalUrl)
      }
      next()
    }
  }
]

export default routes
