<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- menu right drawer
  q-drawer(
    v-model="showMenuRight" side="right"
    @show="$store.commit('ui/stateSet', ['wsShowMenu', false])"
    @hide="$store.commit('ui/stateSet', ['wsShowMenu', true])")
    menu-right(:stateWorkspace="stateWorkspace" :inDrawer="true").b-50
  //- menu right panel
  div(
    v-if="$route.name !== 'content-explorer'"
    :style=`{
      position: 'absolute', zIndex: 1000,
      top: $store.state.ui.appFullscreen ? '8px' : '0px',
      right: $store.state.ui.appFullscreen ? '8px' : '-300px',
      width: '300px', height: '300px',
    }`).row.q-pl-sm
    .row.fit
      menu-right(:stateWorkspace="stateWorkspace").b-50
  //- menu mobile bottom
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
  router-view
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
    },
    stateWorkspace () {
      return {
        showMenuRight: this.showMenuRight,
        pages: this.pages,
        pagesHot: this.pagesHot,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
