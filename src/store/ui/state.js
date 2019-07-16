export default {
  width: window.innerWidth,
  height: window.innerHeight,
  show_right_drawer: false,
  show_left_drawer: false,
  radiusDesktop: 4,
  radiusDefault: 4,
  radiusMobile: 0,
  pageMaxWidth: 1100,
  menuMaxWidth: 240,
  nodeMaxWidth: 540,
  page: null,
  pages: [
    {id: '/app/home', name: 'home', icon: 'home', hidden: false, mobile: true},
    {id: '/app/node', name: 'Ядро', icon: 'menu', hidden: true, mobile: false},
    {id: '/app/explore', name: 'explore', icon: 'explore', hidden: true, mobile: false},
    {id: '/app/create', name: 'create', icon: 'add', hidden: false, mobile: true},
    {id: '/app/workspace', name: 'workspace', icon: 'cloud_queue', hidden: false, mobile: false},
    {id: '/app/settings', name: 'settings', icon: 'settings', hidden: false, mobile: false},
    {id: '/app/account', name: 'account', icon: 'account_circle', hidden: false, mobile: true},
    {id: '/app/menu', icon: 'menu', name: 'menu', hidden: false, mobile: true}
  ]
}
