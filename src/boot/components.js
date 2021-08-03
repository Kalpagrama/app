// kalpa
import kalpaLayout from 'src/components/kalpa_layout/index.vue'
import kalpaWelcome from 'src/components/kalpa_welcome/index.vue'
import kalpaShare from 'src/components/kalpa_share/index.vue'
import kalpaLogo from 'src/components/kalpa_logo/index.vue'
import kalpaFinder from 'src/components/kalpa_finder/index.vue'
import kalpaBookmark from 'src/components/kalpa_bookmark/index.vue'
import kalpaPay from 'src/components/kalpa_pay/index.vue'
import kalpaSave from 'src/components/kalpa_save/index.vue'
import kalpaDocs from 'src/components/kalpa_docs/index.vue'
import addCollectionBtn from 'src/components/collection/add_collection_btn.vue'
import graphView from 'src/components/graph/graph_view.vue'

// menus
import kalpaMenuMobile from 'src/components/kalpa_menu_mobile/index.vue'
import kalpaMenuActions from 'src/components/kalpa_menu_actions/index.vue'
import kalpaMenuPopupGlobal from 'src/components/kalpa_menu_popup_global/index.vue'
// lists
import listFeed from 'src/components/list_feed/index.vue'
import kalpaTree from 'src/components/kalpa_tree/index.vue'
// essence
import composition from 'src/components/composition/index.vue'
import nodeFeed from 'src/components/node_feed/index.vue'
// import jointFeed from 'src/components/joint_feed/index.vue'
// user
import userAvatar from 'src/components/user_avatar/index.vue'

export default async ({ Vue, store: storeVue, router: VueRouter }) => {
  // kalpa
  Vue.component('kalpaLayout', kalpaLayout)
  Vue.component('kalpaWelcome', kalpaWelcome)
  Vue.component('kalpaShare', kalpaShare)
  Vue.component('kalpaLogo', kalpaLogo)
  Vue.component('kalpaFinder', kalpaFinder)
  Vue.component('kalpaBookmark', kalpaBookmark)
  Vue.component('kalpaPay', kalpaPay)
  Vue.component('kalpaSave', kalpaSave)
  Vue.component('kalpaDocs', kalpaDocs)
  // menus
  Vue.component('kalpaMenuMobile', kalpaMenuMobile)
  Vue.component('kalpaMenuActions', kalpaMenuActions)
  Vue.component('kalpaMenuPopupGlobal', kalpaMenuPopupGlobal)
  // lists
  Vue.component('kalpaTree', kalpaTree)
  Vue.component('listFeed', listFeed)
  // essence
  Vue.component('composition', composition)
  Vue.component('nodeFeed', nodeFeed)
  // Vue.component('jointFeed', jointFeed)
  // user
  Vue.component('userAvatar', userAvatar)

  Vue.component('addCollectionBtn', addCollectionBtn)
  Vue.component('graphView', graphView)
}
