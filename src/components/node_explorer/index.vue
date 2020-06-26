<template lang="pug">
//- div(:style=`{position: 'relative'}`).column.fit
//-   //- node editor
//-   q-dialog(
//-     v-model="nodeEditorOpened" position="bottom")
//-     ws-node-editor(
//-       @published="nodePublished"
//-       @close="nodeEditorOpened = false"
//-       :value="nodeEditorItem"
//-       :options=`{
//-         essenceEditable: false,
//-       }`
//-       :style=`{
//-         maxWidth: '800px',
//-         maxHeight: $q.screen.height-60+'px',
//-         minHeight: $q.screen.height-60+'px',
//-       }`)
//-   //- header
//-   div(
//-     :style=`{borderRadius: '0 0 10px 10px'}`
//-     ).row.full-width.items-center.content-center.q-pa-md.b-50
//-     //- kalpa-debug(:options=`{nodeActive,nodeVisible,stateNodeExplorer}`)
//-     q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
//-     span(:style=`{fontSize: '18px'}`).text-white.text-bold Node explorer
//-   //- menu right
//-   div(
//-     v-if="$q.screen.width > 1260"
//-     :style=`{
//-       position: 'absolute', zIndex: 1000,
//-       right: -$store.state.ui.panelMaxWidth+'px',
//-       maxWidth: $store.state.ui.panelMaxWidth+'px',
//-       height: '300px',
//-     }`).row.full-width.justify-start.q-px-sm.q-pt-sm
//-     menu-right(:style=`{maxWidth: '240px'}`).b-50.fit
//-   //- menu bottom
//-   div(
//-     v-if="$q.screen.width <= 1260"
//-     :style=`{
//-       position: 'absolute', zIndex: 9999, bottom: '0px',
//-       borderRadius: '10px 10px 0 0', overflow: 'hidden'
//-     }`
//-     ).row.full-width.q-pa-sm.b-50
//-     q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
//-   //- reply
//-   q-btn(
//-     v-if="true"
//-     push color="green" no-caps @click="nodeAdd()"
//-     :style=`{
//-       position: 'fixed', zIndex: 2000, left: '50%', transform: 'translate(-50%, 0)',
//-       bottom: $q.screen.xs ? 60+8+'px' : 8+'px',
//-       height: '50px'
//-     }`
//-     ).q-px-md
//-     span.text-white.text-bold Добавить образ
//-   //- body
//-   .col.full-width.scroll
//-     div(v-if="node").row.full-width.justify-center
//-         div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.q-pt-sm
//-           //- kalpa-debug(:options=`{nodeActive,nodeVisible,stateNodeExplorer}`)
//-           node(
//-             ctx="list"
//-             :node="node" :needFull="true"
//-             :visible="nodeVisible" :active="nodeActive" :mini="nodeMini")
//-     div(v-if="node").row.full-width
//-       router-view(
//-         :node="node"
//-         :stateNodeExplorer="stateNodeExplorer")
//- div(:style=`{height: $q.screen.height+'px'}`)
kalpa-layout(:style=`{height: $q.screen.height+'px'}`)
  template(v-slot:header)
    div(:style=`{maxWidth: '800px', borderRadius: '0 0 10px 10px',}`).row.full-width.q-pa-sm.b-60
      q-btn(round flat color="white" icon="keyboard_arrow_left")
      .col
  template(v-slot:footer)
    div(:style=`{maxWidth: '800px', borderRadius: '10px 10px 0 0',}`).row.full-width.q-pa-sm.b-60
      q-btn(round flat color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
      .col
      q-btn(round flat color="white" icon="menu_open")
  template(v-slot:drawerRight)
    menu-right(:style=`{maxWidth: '300px'}`)
  template(v-slot:page)
    router-view(
      v-if="node"
      :node="node"
      :stateNodeExplorer="stateNodeExplorer")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import menuRight from './menu_right'
import nodeNodes from './node_nodes'

export default {
  name: 'nodeExplorer',
  components: {menuRight, nodeNodes},
  props: ['node'],
  data () {
    return {
      nodeActive: true,
      nodeVisible: true,
      nodeMini: false,
      nodeEditorItem: null,
      nodeEditorOpened: false,
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
        nodeActive: this.nodeActive,
        nodeVisible: this.nodeVisible,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  watch: {
    nodeEditorOpened: {
      handler (to, from) {
        this.$log('nodeEditorOpend', to)
        if (to === false) {
          this.stateNodeExplorer.set('nodeActive', true)
        }
      }
    }
  },
  methods: {
    async nodeAdd () {
      this.$log('nodeAdd', this.node)
      // create nodeInput
      let nodeInput = {
        name: this.node.name,
        wsItemType: 'WS_NODE',
        items: [],
        spheres: [],
        category: this.node.category,
        layout: this.node.layout,
      }
      this.$log('nodeInput', nodeInput)
      // create item
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeAdd item', item)
      // mute all
      this.stateNodeExplorer.set('nodeActive', false)
      // open editor
      this.nodeEditorItem = item
      this.nodeEditorOpened = true
    },
    async nodePublished (oid) {
      this.$log('nodePublished', oid)
      this.$q.notify({
        type: 'positive',
        message: 'Образ успешно добавлен!',
      })
      // await this.$wait(200)
      // this.$router.push(`/node/${oid}`).catch(e => e)
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
