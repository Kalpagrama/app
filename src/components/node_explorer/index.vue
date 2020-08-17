<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: $q.screen.height+'px',
  }`
  ).column.full-width
  q-btn(
    @click="$store.commit('ui/stateSet', ['appShowMenu', true])"
    round flat color="white" icon="menu"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '24px', right: '24px',}`)
  q-btn(
    @click="$router.back()"
    round flat color="white" icon="keyboard_arrow_left"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '24px', left: '24px',}`)
  //- header: navigation back, and tabs
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      //- q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="$router.back()")
      span.text-white.text-bold.q-mx-md {{$t('nodeExplorer_title', 'Ядро')}}
      .col
        .row.fit.justify-end
          q-tabs(
            v-model="tab"
            dense active-color="green" switch-indicator
            no-caps align="right" :breakpoint="300"
            ).text-white
            q-tab(name="nodes" :label="$t('nodeExplorer_nodeClips', 'Образы')")
            q-tab(name="chains" :label="$t('nodeExplorer_nodeChains', 'Связи')")
  //- body
  q-tab-panels(
    v-model="tab"
    swipeable infinite animated :style=`{background: 'none !important'}`).col.full-width
    q-tab-panel(name="nodes" :style=`{padding: 0, margin: 0, background: 'none !important'}`).row.fit.justify-center
      node-nodes(v-if="node" :node="node" :style=`{maxWidth: '800px'}`)
    q-tab-panel(name="chains" :style=`{padding: 0, margin: 0, background: 'none !important'}`).row.fit.justify-center
      node-chains(v-if="node" :node="node" :style=`{maxWidth: '800px'}`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import nodeNodes from './node_nodes'
import nodeChains from './node_chains'

export default {
  name: 'nodeExplorer',
  components: {nodeNodes, nodeChains},
  props: ['node', 'nodeProgress'],
  data () {
    return {
      nodeActive: true,
      nodeVisible: true,
      nodeMini: false,
      showMenuRight: false,
      tab: 'nodes'
    }
  },
  computed: {
    pageId () {
      return this.$route.params.page
    },
    pages () {
      return [
        {id: 'nodes', name: this.$t('nodeExplorer_Node nodes', 'Ядра')},
        {id: 'contents', name: this.$t('nodeExplorer_Content', 'Контент')},
        {id: 'chains', name: this.$t('nodeExplorer_Chains', 'Связи')}
      ]
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
