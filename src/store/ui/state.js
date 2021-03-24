export default {
  initialized: false,
  // viewport
  viewportHeight: 0,
  viewportWidth: 0,
  viewportOffsetTop: 0,
  viewportVertical: false,
  // page
  // pageHeight: 0,
  // pageWidthDefault: 700,
  pageWidth: 700,
  pageWidthMini: 400,
  pageWidthMedi: 600,
  pageWidthMaxi: 800,
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
  // debug
  useDebug: false,
  // other
  docs: [
    {id: 'terms', name: 'Пользовательское соглашение'},
    {id: 'policy', name: 'Политика конфиденциальности'},
    {id: 'dmca', name: 'DMCA (Регламент рассмотрения заявлений правообладателей)'},
  ],
  kalpaWelcome: null,
  bookmarkTypes: [
    {
      id: 'content',
      name: 'Медиа',
      selector: {type: {$in: ['IMAGE', 'VIDEO', 'BOOK']}},
    },
    {
      id: 'nodes',
      name: 'Ядра',
      selector: {type: {$in: ['NODE']}},
    },
    {
      id: 'joints',
      name: 'Связи',
      selector: {type: {$in: ['JOINT']}},
    },
    {
      id: 'spheres',
      name: 'Сферы',
      selector: {type: {$in: ['SPHERE', 'WORD', 'SENTENCE']}},
    },
    {
      id: 'users',
      name: 'Users',
      selector: {type: {$in: ['USER']}},
    }
  ]
}
