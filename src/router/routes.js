
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
    path: '/',
    component: () => import('layouts/main_layout'),
    children: [
      { name: 'home', path: '', component: () => import('pages/app/home/index.vue') },
      // { name: 'welcome', path: 'welcome', component: () => import('pages/app/welcome') },
      {
        name: 'settings',
        path: 'settings/:page?',
        redirect: 'settings/account',
        component: () => import('pages/app/settings'),
        children: [
          { name: 'account', path: 'account', component: () => import('pages/app/settings/page_account') },
          // {}
        ]
      },
      // { name: 'report', path: 'report', component: () => import('pages/app/report') },
      // items
      { name: 'user',
        path: 'user/:oid',
        // redirect: 'user/:oid/created',
        component: () => import('pages/app/user/index.vue'),
        children: [
          // { name: 'created', path: 'created', component: () => import('components/user_explorer/user_created') },
          // { name: 'voted', path: 'voted', component: () => import('components/user_explorer/user_voted') },
          // { name: 'following', path: 'following', component: () => import('components/user_explorer/user_following') },
          // { name: 'followers', path: 'followers', component: () => import('components/user_explorer/user_followers') },
        ]
      },
      {
        name: 'node',
        path: 'node/:oid',
        redirect: 'node/:oid/nodes',
        component: () => import('pages/app/node/index.vue'),
        children: [
          { name: 'nodes', path: 'nodes', component: () => import('pages/app/node/node_nodes/index.vue') },
          { name: 'chains', path: 'chains', component: () => import('pages/app/node/node_chains/index.vue') },
        ]
      },
      { name: 'sphere', path: 'sphere/:oid?', component: () => import('pages/app/sphere') },
      { name: 'trends', path: 'trends/:oid?', component: () => import('pages/app/trends/index.vue') },
      {
        name: 'content',
        path: 'content/:oid',
        redirect: 'content/:oid/nodes',
        component: () => import('pages/app/content/index.vue'),
        children: [
          { name: 'content-details', path: 'details', component: () => import('pages/app/content/content_details.vue') },
          { name: 'content-nodes', path: 'nodes', component: () => import('pages/app/content/content_nodes.vue') },
        ]
      },
      { name: 'chain', path: 'chain/:oid?', component: () => import('pages/app/chain') },
      {
        name: 'workspace',
        path: 'workspace',
        redirect: 'workspace/contents',
        component: () => import('pages/app/ws_index/index.vue'),
        children: [
          // content
          { name: 'content-list', path: 'contents', component: () => import('pages/app/ws_contents/index.vue') },
          { name: 'content-explorer', path: 'content/:id', component: () => import('pages/app/ws_content/index.vue') },
          // { name: 'content-import', path: 'content/import', component: () => import('components/workspace/ws_content_import') },
          // node
          { name: 'node-list', path: 'nodes', component: () => import('pages/app/ws_nodes/index.vue') },
          { name: 'node-editor', path: 'node/:id', component: () => import('pages/app/ws_node/index.vue') },
          // { name: 'node-import', path: 'node/import', component: () => import('components/workspace/ws_node_import') },
          // chain
          // { name: 'chain-list', path: 'chain', component: () => import('components/workspace/ws_chain_list') },
          // { name: 'chain-editor', path: 'chain/:id', component: () => import('components/workspace/ws_chain_editor') },
          // sphere
          // { name: 'sphere-list', path: 'sphere', component: () => import('components/workspace/ws_sphere_list') },
          // { name: 'sphere-editor', path: 'sphere/:id', component: () => import('components/workspace/ws_sphere_editor') },
          // other
          { name: 'ws-settings', path: 'settings', component: () => import('pages/app/ws_settings/index.vue') },
        ]
      },
      { name: 'subscriptions', path: 'subscriptions', component: () => import('pages/app/subscriptions') },
      { name: 'notifications', path: 'notifications', component: () => import('pages/app/notifications') },
      { name: 'twitter', path: 'twitter', component: () => import('pages/app/twitter/index.vue') },
      // { name: 'feeds', path: 'feeds', component: () => import('pages/app/feeds/index.vue') },
      {
        name: 'feeds',
        path: 'feeds',
        component: () => import('pages/app/feeds/index.vue'),
        children: [
          { path: '', component: () => import('pages/app/feeds/home.vue') },
          { path: 'feed/:oid', component: () => import('pages/app/feeds/feed.vue') },
          { path: 'add', component: () => import('pages/app/feeds/add.vue') }
        ]
      },
    ]
  }
]

export default routes
