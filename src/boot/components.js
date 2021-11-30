import { boot } from 'quasar/wrappers'
// kalpa
import kalpaLayout from 'src/components/kalpa_layout/index.vue'
import kalpaTutorial from 'src/components/kalpa_tutorial/index.vue'
import kalpaShare from 'src/components/kalpa_share/index.vue'
import kalpaLogo from 'src/components/kalpa_logo/index.vue'
import kalpaFinder from 'src/components/kalpa_finder/index.vue'
import kalpaBookmark from 'src/components/kalpa_bookmark/index.vue'
import kalpaPay from 'src/components/kalpa_pay/pay_button.vue'
import kalpaSave from 'src/components/kalpa_save/index.vue'
import kalpaDocs from 'src/components/kalpa_docs/index.vue'
import addCollectionBtn from 'src/components/collection/add_collection_btn.vue'
import collectionList from 'src/components/collection/collection_list.vue'
import graphView from 'src/components/graph/graph_view.vue'

// menus
import kalpaMenuMobile from 'src/components/kalpa_menu_mobile/index.vue'
import kalpaMenuActions from 'src/components/kalpa_menu_actions/index.vue'
import kalpaMenuPopupGlobal from 'src/components/kalpa_menu_popup_global/index.vue'
// lists
import listFeed from 'src/components/list_feed/list_feed_custom.vue'
import tabListFeed from 'src/components/list_feed/tab_list_feed.vue'
import kalpaTree from 'src/components/kalpa_tree/index.vue'
// essence
import composition from 'src/components/composition/index.vue'
import itemFeed from 'src/components/kalpa_item/item_feed/index.vue'
import itemEditor from 'src/components/kalpa_item/item_editor'
// user
import userAvatar from 'src/components/user_avatar/index.vue'
import { LogSystemModulesEnum, getLogFunctions, performance } from 'src/boot/log'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
  const f = { nameExtra: 'boot::components' }
  logD(f, 'start')
  const t1 = performance.now()
  // kalpa
  app.component('kalpaLayout', kalpaLayout)
  app.component('kalpaTutorial', kalpaTutorial)
  app.component('kalpaShare', kalpaShare)
  app.component('kalpaLogo', kalpaLogo)
  app.component('kalpaFinder', kalpaFinder)
  app.component('kalpaBookmark', kalpaBookmark)
  app.component('kalpaPay', kalpaPay)
  app.component('kalpaSave', kalpaSave)
  app.component('kalpaDocs', kalpaDocs)
  // menus
  app.component('kalpaMenuMobile', kalpaMenuMobile)
  app.component('kalpaMenuActions', kalpaMenuActions)
  app.component('kalpaMenuPopupGlobal', kalpaMenuPopupGlobal)
  // lists
  app.component('kalpaTree', kalpaTree)
  app.component('listFeed', listFeed)
  app.component('tabListFeed', tabListFeed)
  // essence
  // eslint-disable-next-line vue/multi-word-component-names
  app.component('composition', composition)
  app.component('itemFeed', itemFeed)
  app.component('itemEditor', itemEditor)
  // user
  app.component('userAvatar', userAvatar)

  app.component('addCollectionBtn', addCollectionBtn)
  app.component('graphView', graphView)
  app.component('collectionList', collectionList)
  logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
})
