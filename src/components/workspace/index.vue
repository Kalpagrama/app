<template lang="pug">
div(
  :class=`{}`
  :style=`{
    position: 'relative',
    height: $q.screen.height+'px'
  }`).column.full-width
  kalpa-menu-right
    menu-right(:pages="pages").b-50
  //- footer
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    kalpa-menu-footer(
      v-if="$store.state.workspace.showFooter"
      :options=`{showMenuPage: true}`)
      template(v-slot:menuRight=`{inDrawer}`)
        menu-right(:pages="pages" :inDrawer="inDrawer").b-50
  //- header
  //- body
  div(:style=`{}`).col.full-width.q-mb-sm
    .row.fit.items-start.content-start.justify-center
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.fit
        ws-note-list(v-if="$route.params.page === 'note'")
        ws-content-list(v-if="$route.params.page === 'content'")
        ws-node-list(v-if="$route.params.page === 'node'")
        ws-chain-list(v-if="$route.params.page === 'chain'")
        ws-sphere-list(v-if="$route.params.page === 'sphere'")
        ws-settings(v-if="$route.params.page === 'settings'")
</template>

<script>
import wsNoteList from './ws_note_list'
import wsContentList from './ws_content_list'
import wsNodeList from './ws_node_list'
import wsChainList from './ws_chain_list'
import wsSphereList from './ws_sphere_list'
import wsSettings from './ws_settings'
import menuRight from './menu_right'

export default {
  name: 'workspaceIndex',
  components: {wsNoteList, wsContentList, wsNodeList, wsChainList, wsSphereList, wsSettings, menuRight},
  data () {
    return {
      pages: [
        {id: 'note', name: 'Notes'},
        {id: 'content', name: 'Contents'},
        {id: 'node', name: 'Nodes'},
        {id: 'chain', name: 'Chains'},
        {id: 'sphere', name: 'Spheres'},
        {id: 'settings', name: 'Settings'}
      ]
    }
  },
  computed: {
  },
  watch: {
    '$route.params.page': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.params.page CHANGED', to)
        if (to) {
        } else {
          this.$router.replace({params: {page: 'content'}})
        }
      }
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
    this.$q.addressbarColor.set('rgb(30,30,30)')
    document.body.style.background = 'rgb(30,30,30)'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
