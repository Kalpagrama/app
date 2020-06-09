<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  div(
    :style=`{borderRadius: '0 0 10px 10px'}`
    ).row.full-width.items-center.content-center.q-pa-md.b-50
    //- kalpa-debug(:options=`{nodeActive,nodeVisible,stateNodeExplorer}`)
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
    span(:style=`{fontSize: '18px'}`).text-white.text-bold Node explorer
  //- menu right
  div(
    v-if="$q.screen.width > 1260"
    :style=`{
      position: 'absolute', zIndex: 1000,
      right: -$store.state.ui.panelMaxWidth+'px',
      maxWidth: $store.state.ui.panelMaxWidth+'px',
      height: '300px',
    }`).row.full-width.justify-start.q-px-sm.q-pt-sm
    menu-right(:style=`{maxWidth: '240px'}`).b-50.fit
  //- menu bottom
  div(
    v-if="$q.screen.width <= 1260"
    :style=`{
      position: 'absolute', zIndex: 9999, bottom: '0px',
      borderRadius: '10px 10px 0 0', overflow: 'hidden'
    }`
    ).row.full-width.q-pa-sm.b-50
    q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
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
  //- body
  .col.full-width.scroll
    div(v-if="node").row.full-width.justify-center
        div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.q-pt-sm
          kalpa-debug(:options=`{nodeActive,nodeVisible,stateNodeExplorer}`)
          node(
            ctx="list"
            :node="node" :needFull="true"
            :visible="nodeVisible" :active="nodeActive" :mini="nodeMini")
    div(v-if="node").row.full-width
      //- node-nodes(:node="node" :stateNodeExplorer="stateNodeExplorer")
      router-view(:node="node")
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
    },
    stateNodeExplorer () {
      return {
        nodeVisible: this.nodeVisible,
        nodeActive: this.nodeActive,
        set: (key, val) => {
          this[key] = val
        }
      }
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
