// kalpa
import kalpaLayout from 'components/kalpa_layout/index.vue'
import kalpaWelcome from 'components/kalpa_welcome/index.vue'
import kalpaShare from 'components/kalpa_share/index.vue'
import kalpaLogo from 'components/kalpa_logo/index.vue'
import kalpaFinder from 'components/kalpa_finder/index.vue'
import kalpaBookmark from 'components/kalpa_bookmark/index.vue'
import kalpaSave from 'components/kalpa_save/index.vue'
// menus
import kalpaMenuMobile from 'components/kalpa_menu_mobile/index.vue'
import kalpaMenuActions from 'components/kalpa_menu_actions/index.vue'
import kalpaMenuPopupGlobal from 'components/kalpa_menu_popup_global/index.vue'
// lists
import listFeed from 'components/list_feed/index.vue'
import kalpaTree from 'components/kalpa_tree/index.vue'
// essence
import composition from 'components/composition/index.vue'
import nodeFeed from 'components/node_feed/index.vue'
// import jointFeed from 'components/joint_feed/index.vue'
// user
import userAvatar from 'components/user_avatar/index.vue'

export default async ({ Vue, store: storeVue, router: VueRouter }) => {
  // kalpa
  Vue.component('kalpaLayout', kalpaLayout)
  Vue.component('kalpaWelcome', kalpaWelcome)
  Vue.component('kalpaShare', kalpaShare)
  Vue.component('kalpaLogo', kalpaLogo)
  Vue.component('kalpaFinder', kalpaFinder)
  Vue.component('kalpaBookmark', kalpaBookmark)
  Vue.component('kalpaSave', kalpaSave)
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
}
