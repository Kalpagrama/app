<template lang="pug">
kalpa-layout(
  :title="node ? node.name : ''"
  :pageId="$route.name" :pages="pages"
  @pageId="$router.push({name: $event})"
  :style=`{height: $q.screen.height+'px'}`)
  template(v-slot:header)
    div(:style=`{maxWidth: '800px', borderRadius: '0 0 10px 10px',}`).row.full-width.q-pa-sm.b-60
      q-btn(round flat color="white" icon="keyboard_arrow_left")
      .col.full-height
        .row.fit.items-center.content-center.q-px-sm
          span(v-if="node" :style=`{fontSize: '16px',}`).text-white.text-bold {{ node.name }}
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
