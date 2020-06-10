<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- menu right
  div(
    v-if="$q.screen.width > 1260"
    :style=`{
      position: 'absolute', zIndex: 9999,
      right: -$store.state.ui.panelMaxWidth+'px',
      maxWidth: $store.state.ui.panelMaxWidth+'px',
    }`).row.full-width.justify-start.q-px-sm.q-pt-sm
    menu-right(
      :stateWorkspace="stateWorkspace"
      :style=`{
        maxWidth: '300px',
      }`).b-50
  //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
  //-   div(
  //-     v-if="$q.screen.width < 1260 && !$store.state.ui.appShowMenu"
  //-     :style=`{
  //-       position: 'absolute', zIndex: 9999,
  //-       bottom: '0px',
  //-       borderRadius: '10px 10px 0 0',
  //-       transform: 'translate3d(0,0,0)',
  //-       overflow: 'hidden',
  //-     }`
  //-     ).row.full-width.q-pa-sm.b-50
  //-     q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
  //-     .col
  //-     q-btn(round flat dense color="white" icon="menu_open")
  .col.full-width
    router-view
  //- q-layout(
  //-   view="hHh lpR fFf"
  //-   container :style=`{position: 'relative', height: $q.screen.height+'px', overflow: 'auto'}`).b-30
  //-   q-drawer(
  //-     v-model="showMenu" side="right"
  //-     @before-show="showFooter = false"
  //-     @before-hide="showFooter = true"
  //-     )
  //-     menu-right(:stateWorkspace="stateWorkspace").full-height.b-50
  //-   q-page-container
  //-     q-page(:style=`{height: $q.screen.height+'px'}`)
  //-       router-view
</template>

<script>
import menuRight from './menu_right'

export default {
  name: 'workspaceIndex',
  components: {menuRight},
  data () {
    return {
      showMenuRight: false,
      pages: [
        {id: 'content-list', name: 'Content', comp: 'ws-content-list'},
        {id: 'node-list', name: 'Nodes', comp: 'ws-node-list'},
        {id: 'chain-list', name: 'Chains', comp: 'ws-chain-list'},
        {id: 'sphere', name: 'Spheres', comp: 'ws-sphere-list'},
        {id: 'ws-settings', name: 'Settings', comp: 'ws-settings'}
      ],
      pagesHot: [
        {id: 'content-list', name: 'Content'},
        {id: 'node-list', name: 'Nodes'},
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
