<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, right: '-300px',
      width: '300px', height: '300px',
    }`).row.q-pl-sm
    .row.fit.bg-red
  router-view
//- kalpa-page
  //- template(v-slot:panelLeft)
  //-   kalpa-menu
  //- template(v-slot:panelRight)
  //-   menu-right(:pages="pages").b-50
  //- template(v-slot:body)
  //-   router-view
//- div(
//-   :style=`{
//-     position: 'relative',
//-     height: $q.screen.height+'px'
//-   }`).row.full-width.items-start.content-start.justify-center
  //- body
  //- component(
  //-   v-if="!$route.params.id"
  //-   :is="page.comp"
  //-   :style=`{
  //-     maxWidth: $store.state.ui.maxWidthPage+'px',
  //-   }`
  //-   ).fit
  //- ws-content-explorer(
  //-   v-if="$route.params.id")
  //- router-view
  //- menu right mobile
  //- q-drawer(
  //-   v-model="showMenuRight" side="right"
  //-   @show="$store.commit('ui/stateSet', ['wsShowMenu', false])"
  //-   @hide="$store.commit('ui/stateSet', ['wsShowMenu', true])")
  //-   menu-right(:pages="pages" :inDrawer="true").b-50
  //- menu right desktop
  //- kalpa-menu-right
  //-   menu-right(:pages="pages").b-50
  //- menu mobile
  //- transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
  //-   div(
  //-     v-if="$q.screen.xs && $store.state.ui.wsShowMenu && !$store.state.ui.appShowMenu"
  //-     :style=`{position: 'absolute', bottom: '0px', zIndex: 10000, borderRadius: '10px 10px 0 0'}`
  //-     ).row.full-width.items-center.content-center.q-px-sm.b-50
  //-     q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])").b-60
  //-     .col.q-pb-sm.q-px-sm
  //-       kalpa-buttons(
  //-         :value="pagesHot" :id="$route.params.page"
  //-         screenSet="gt.xs"
  //-         @id="$router.push({params: {page: $event}})").justify-center
  //-     q-btn(round flat dense color="white" icon="menu_open" @click="showMenuRight = !showMenuRight").b-60
</template>

<script>
import wsNoteList from './ws_note_list'
import wsContentList from './ws_content_list'
import wsNodeList from './ws_node_list'
import wsChainList from './ws_chain_list'
import wsSphereList from './ws_sphere_list'
import wsSettings from './ws_settings'
import menuRight from './menu_right'
import wsContentExplorer from './ws_content_explorer'

export default {
  name: 'workspaceIndex',
  components: {wsNoteList, wsContentList, wsNodeList, wsChainList, wsSphereList, wsSettings, menuRight, wsContentExplorer},
  data () {
    return {
      showMenuRight: false,
      pages: [
        {id: 'note', name: 'Notes', comp: 'ws-note-list'},
        {id: 'content', name: 'Content', comp: 'ws-content-list'},
        {id: 'node', name: 'Nodes', comp: 'ws-node-list'},
        {id: 'chain', name: 'Chains', comp: 'ws-chain-list'},
        {id: 'sphere', name: 'Spheres', comp: 'ws-sphere-list'},
        {id: 'settings', name: 'Settings', comp: 'ws-settings'}
      ],
      pagesHot: [
        {id: 'content', name: 'Content'},
        {id: 'node', name: 'Nodes'},
      ]
    }
  },
  computed: {
    page () {
      return this.pages.find(p => p.id === this.$route.params.page)
    }
  },
  watch: {
    // '$route.params.page': {
    //   immediate: true,
    //   handler (to, from) {
    //     this.$log('$route.params.page CHANGED', to)
    //     if (to) {
    //     } else {
    //       this.$router.replace({params: {page: 'content'}})
    //     }
    //   }
    // }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
    // this.$q.addressbarColor.set('rgb(30,30,30)')
    // document.body.style.background = 'rgb(30,30,30)'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
