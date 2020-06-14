
const routes = [
  {
    path: '/auth',
    component: () => import('layouts/auth_layout.vue'),
    children: [
      { name: 'index', path: '', component: () => import('pages/auth/index.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/main_layout'),
    children: [
      { name: 'welcome', path: 'welcome', component: () => import('pages/app/welcome') },
      { name: 'home', path: '', component: () => import('components/home_explorer') },
      // { name: ''}
      { name: 'settings', path: 'settings/:page?', component: () => import('pages/app/settings') },
      { name: 'report', path: 'report', component: () => import('pages/app/report') },
      // items
      { name: 'user',
        path: 'user/:oid',
        redirect: 'user/:oid/created',
        component: () => import('pages/app/user'),
        children: [
          { name: 'created', path: 'created', component: () => import('components/user_explorer/user_created') },
          { name: 'voted', path: 'voted', component: () => import('components/user_explorer/user_voted') },
          { name: 'following', path: 'following', component: () => import('components/user_explorer/user_following') },
          { name: 'followers', path: 'followers', component: () => import('components/user_explorer/user_followers') },
        ]
      },
      {
        name: 'node',
        path: 'node/:oid',
        redirect: 'node/:oid/nodes',
        component: () => import('pages/app/node'),
        children: [
          { name: 'nodes', path: 'nodes', component: () => import('components/node_explorer/node_nodes') },
          { name: 'contents', path: 'contents', component: () => import('components/node_explorer/node_contents') },
          { name: 'chains', path: 'chains', component: () => import('components/node_explorer/node_chains') },
        ]
      },
      { name: 'sphere', path: 'sphere/:oid?', component: () => import('pages/app/sphere') },
      { name: 'trends', path: 'trends/:oid?', component: () => import('pages/app/sphere') },
      { name: 'content', path: 'content/:oid?/:page?', component: () => import('pages/app/content') },
      { name: 'chain', path: 'chain/:oid?', component: () => import('pages/app/chain') },
      {
        name: 'workspace',
        path: 'workspace',
        redirect: 'workspace/content',
        component: () => import('components/workspace'),
        children: [
          // content
          { name: 'content-list', path: 'content', component: () => import('components/workspace/ws_content_list') },
          { name: 'content-import', path: 'content/import', component: () => import('components/workspace/ws_content_import') },
          { name: 'content-explorer', path: 'content/:id', component: () => import('components/workspace/ws_content_explorer') },
          // composition
          { name: 'composition-list', path: 'composition', component: () => import('components/workspace/ws_composition_list') },
          { name: 'composition-editor', path: 'composition/:id', component: () => import('components/workspace/ws_composition_editor') },
          // node
          { name: 'node-list', path: 'node', component: () => import('components/workspace/ws_node_list') },
          { name: 'node-import', path: 'node/import', component: () => import('components/workspace/ws_node_import') },
          { name: 'node-editor', path: 'node/:id', component: () => import('components/workspace/ws_node_editor') },
          // chain
          { name: 'chain-list', path: 'chain', component: () => import('components/workspace/ws_chain_list') },
          { name: 'chain-editor', path: 'chain/:id', component: () => import('components/workspace/ws_chain_editor') },
          // sphere
          { name: 'sphere-list', path: 'sphere', component: () => import('components/workspace/ws_sphere_list') },
          // { name: 'sphere-editor', path: 'sphere/:id', component: () => import('components/workspace/ws_sphere_editor') },
          // other
          { name: 'ws-settings', path: 'settings', component: () => import('components/workspace/ws_settings') },
        ]
      },
    ]
  }
]

export default routes
