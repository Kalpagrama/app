export default {
  initialized: false,
  wsItem: null,
  revision: 0,
  item: null,
  itemType: undefined,
  pages: [
    // { name: 'Trends', icon: 'whatshot', path: '/trends' },
    // { name: 'Workspace', icon: 'img:statics/icons/anvil.svg', path: '/workspace' },
    // // { name: 'Subscriptions', icon: 'subscriptions', path: '/subscriptions' },
    // // { name: 'Notifications', icon: 'notifications', path: '/notifications' },
    // // { name: 'test web-push', icon: 'message', path: '/test_message' },
    // // { name: 'sentry log send', icon: 'message', path: '/sentry_log' },
    // // { name: 'test share', icon: 'share', path: '/share_target' },
    // { name: 'Exit', icon: 'exit_to_app', path: '/logout' }
    { id: 'trends', name: 'Trends', icon: 'whatshot' },
    // { id: 'byte', name: 'Byte', icon: 'filter_center_focus'},
    { id: 'workspace', name: 'Workspace', icon: 'school' },
    // { id: 'settings', name: 'Settings', icon: 'settings' }
  ]
}
