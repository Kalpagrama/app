export default {
  initialized: false,
  // viewport
  viewportHeight: 0,
  viewportWidth: 0,
  viewportOffsetTop: 0,
  viewportVertical: false,
  // page
  pageHeight: 0,
  pageWidth: 700,
  pageWidthDefault: 700,
  // user
  userTyping: false,
  userScrolling: false,
  // navigations
  mobileNavigationShow: true,
  mobileNavigationStyles: {},
  mobileMenuShow: false,
  desktopNavigationShow: true,
  desktopNavigationStyles: {},
  // data exchanges
  nodeCategories: [],
  nodeOnContent: null,
  nodeDraft: null,
  nodeCreating: false,
  listFeedNeedDrop: false,
  authGuard: null,
  // other
  docs: [
    {id: 'terms', name: 'Пользовательское соглашение'},
    {id: 'policy', name: 'Политика конфиденциальности'},
    {id: 'dmca', name: 'DMCA (Регламент рассмотрения заявлений правообладателей)'},
  ]
}
