export default {
  initialized: false,
  workspace: {
    bookmarks: [],
    contents: [],
    fragments: [],
    nodes: [],
    spheres: []
  },
  version: 0,
  synced: false,
  syncing: false,
  fork: null,
  contentTypes: {
    VIDEO: {name: 'Видео', icon: 'movie_creation', color: 'red'},
    IMAGE: {name: 'Изображение', icon: 'panorama', color: 'green'},
    AUDIO: {name: 'Аудио', icon: 'music_note', color: 'orange'},
    HTML: {name: 'Веб-страница', icon: 'language', color: 'blue'},
    BOOK: {name: 'Книга', icon: 'menu_book', color: 'brown'},
    CODE: {name: 'Репозиторий', icon: 'code', color: 'black'}
  },
  menuOpened: false,
  content: null,
  contentFragment: null,
  contentEditorDialogOpened: false,
  fragment: null,
  fragmentDraft: null,
  fragmentEditorDialogOpened: false,
  bookmark: null,
  bookmarkContent: null,
  bookmarkEditorDialogOpened: false,
  draft: null,
  draftNode: null,
  draftEditorDialogOpened: false,
  answer: null,
  answerDialogOpened: false,
  types: {
    WSBookmark: {name: 'Закладка'},
    WSContent: {name: 'Контент'},
    WSFragment: {name: 'Фрагмент'},
    WSNode: {name: 'Черновик'},
    WSSphere: {name: 'Сфера'}
  }
}
