export default {
  initialized: false,
  width: window.innerWidth,
  height: window.innerHeight,
  show_right_drawer: false,
  show_left_drawer: false,
  radiusDesktop: 4,
  radiusDefault: 4,
  radiusMobile: 0,
  pageMaxWidth: 1100,
  menuMaxWidth: 240,
  nodeMaxWidth: 640,
  page: null,
  pages: [
    {id: '/app/home', name: 'home', icon: 'home', hidden: false, desktop: true, mobile: true},
    {id: '/app/node', name: 'Ядро', icon: 'menu', hidden: true, desktop: true, mobile: false},
    {id: '/app/explore', name: 'explore', icon: 'explore', hidden: false, desktop: true, mobile: true},
    {id: '/app/create', name: 'create', icon: 'add', hidden: false, desktop: true, mobile: true},
    {id: '/app/workspace', name: 'workspace', icon: 'cloud_queue', hidden: false, desktop: true, mobile: false},
    {id: '/app/settings', name: 'settings', icon: 'settings', hidden: false, desktop: true, mobile: false},
    {id: '/app/account', name: 'account', icon: 'account_circle', hidden: false, desktop: true, mobile: true},
    {id: '/app/menu', icon: 'menu', name: 'menu', hidden: false, desktop: true, mobile: true}
  ],
  fragment: null,
  fragmentActionDialogOpened: false,
  fragmentDialogOpened: false,
  bookmark: null,
  bookmarkDialogOpened: false,
  node: null,
  nodeRateDialogOpened: false,
  nodeCreatorDialogOpened: false,
  gtxs: true
}
