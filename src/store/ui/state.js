import { Screen } from 'quasar'
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
  pageMinWidthDesktop: 768,
  isDesktop: Screen.width >= 768,
  isMobile: Screen.width < 768,
  isMobileLarge: Screen.width < 768 && Screen.width >= 601,
  isMobileNormal: Screen.width < 601 && Screen.width >= 321,
  isMobileTiny: Screen.width < 321,
  // user
  userTyping: false,
  userScrolling: false,
  // navigations
  mobileNavigationShow: true,
  mobileNavigationStyles: {},
  mobileMenuShown: false,
  desktopNavigationShow: true,
  desktopNavigationStyles: {},
  // data exchanges
  // nodeCategories: [],
  nodeOnContent: null,
  nodeCreating: false,
  // debug
  useDebug: false,
  authGuard: null,
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
  ],
  // graph (последний запомненный граф (чтобы вернуться назад - и граф не стерся))
  graph: null,
  pageIdFinder: null,
  pageIdPublished: null,
  pageIdCollectionCollections: null,
  pageIdCollections: null,
  pageIdSearch: null,
}
