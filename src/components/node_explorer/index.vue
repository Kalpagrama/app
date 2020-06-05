<template lang="pug">
q-layout(view="hHh lpR fFf" ref="nodeExplorerLayout").b-30
  //- actions
  //- dialogs
  //- node
  q-dialog(v-model="nodeEditorOpened" persistent position="bottom")
    node-editor(
      ctx="workspace"
      :node="nodeEditorItem"
      @cancel="nodeEditorOpened = false"
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px',
        minHeight: $q.screen.height+'px',
        maxHeight: $q.screen.height+'px',
        height: $q.screen.height+'px',
      }`)
  //- menu right desktop
  kalpa-menu-right
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        maxHeight: '70vh'
      }`
      ).column.full-width
      menu-right.b-50
  //- header
  q-header(reveal).row.full-width.justify-center
    div(
      :style=`{maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius: '0 0 10px 10px'}`
      ).row.full-width.q-pa-md.b-50
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
      .col.full-height
        .row.fit.items-center.content-center.q-px-sm
          span(:style=`{fontSize: '16px'}`).text-white.text-bold Node explorer
  //- footer
  q-footer(reveal)
    div(
      v-if="$q.screen.xs && $store.state.ui.wsShowMenu && !$store.state.ui.appShowMenu"
      :style=`{position: 'absolute', bottom: '0px', zIndex: 10000, borderRadius: '10px 10px 0 0'}`
      ).row.full-width.items-center.content-center.q-px-sm.b-50
      q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])").b-60
      .col.q-pb-sm.q-px-sm
        //- kalpa-buttons(:value="pages" :id="$route.params.page" @id="$router.push({params: {page: $event}})").justify-center
      q-btn(round flat dense color="white" icon="menu_open" @click="showMenuRight = !showMenuRight").b-60
  //- kalpa-menu-footer(v-if="!nodeEditorOpened" :options=`{showMenuPage: true}`)
  //-   template(v-slot:menuRight=`{inDrawer}`)
  //-     menu-right(:inDrawer="inDrawer")
  //- reply
  q-btn(
    v-if="true"
    push color="green" no-caps @click="nodeAdd()"
    :style=`{
      position: 'fixed', zIndex: 2000, left: '50%', transform: 'translate(-50%, 0)',
      bottom: $q.screen.xs ? 60+8+'px' : 8+'px',
      height: '50px'
    }`
    ).q-px-md Reply to node
  //- page body
  q-page-container
    q-page
      .row.full-width.justify-center
        div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.q-pt-sm
          node(
            v-if="node"
            ctx="list"
            :node="node" :needFull="true"
            :essence="true" :opened="true"
            :visible="true" :active="true" :mini="false")
      div(v-if="node").row.full-width
        node-nodes(:node="node")
</template>

<script>
import menuRight from './menu_right'
import nodeNodes from './node_nodes'

export default {
  name: 'nodeExplorer',
  components: {menuRight, nodeNodes},
  props: ['node'],
  data () {
    return {
      nodeVisible: true,
      nodeActive: true,
      nodeMini: false,
      nodeHeight: 0,
      nodeEssenceOffsetTop: 0,
      nodeEssenceStickyShow: false,
      scrollTop: 0,
      nodeEditorOpened: false,
      nodeEditorItem: null,
      showMenuRight: false,
      pages: [
        {id: 'nodes', name: 'Nodes'},
        {id: 'chains', name: 'Chains'}
      ]
    }
  },
  computed: {
    pageId () {
      return this.$route.params.page
    }
  },
  watch: {
    '$router.params.page': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.params.page CHANGED', to)
        if (to) {
        }
        else {
          this.$router.replace({params: {page: 'nodes'}}).catch(e => e)
        }
      }
    }
  },
  methods: {
    nodeAdd () {
      this.$log('nodeAdd')
      let nodeInput = {
        name: this.node.name,
        wsItemType: 'WS_NODE',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP'
      }
      this.nodeEditorItem = nodeInput
      this.nodeEditorOpened = true
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
