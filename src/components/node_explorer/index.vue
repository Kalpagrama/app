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
    menu-right(
      v-if="node"
      :style=`{maxWidth: '300px'}`)
  template(v-slot:page)
    router-view(
      v-if="node"
      :node="node"
      :stateNodeExplorer="stateNodeExplorer")
    div(v-if="!node && nodeProgress").row.full-width.justify-center
      div(
        :style=`{
          marginTop: '70px',
          maxWidth: '800px', height: '500px',
          borderRadius: '10px', overflow: 'hidden'
        }`).row.full-width.justify-center.items-center.content-center.b-70
        h1(v-if="nodeProgress").text-white {{nodeProgress}}
        .row.full-width.justify-center
          q-spinner(size="50px" color="green")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import menuRight from './menu_right'
import nodeNodes from './node_nodes'

export default {
  name: 'nodeExplorer',
  components: {menuRight, nodeNodes},
  props: ['node', 'nodeProgress'],
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
    },
    // nodeInProgress () {
    //   return this.$store.state.core.progressInfo.CREATE[this.node.oid]
    // }
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
