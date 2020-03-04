<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  div(:style=`{height: '60px'}`).row.full-width
    kalpa-buttons(:value="tabs" :id="tab" @id="tab = $event")
  .col.full-width.scroll
    component(:is="`extra-${tab}`" :mode="mode" :content="content")
</template>

<script>
import extraInfo from './extra_info'
import extraNodes from './extra_nodes'
import extraWs from './extra_ws'

export default {
  name: 'contentExplorer_extra',
  components: {extraInfo, extraNodes, extraWs},
  props: ['mode', 'content'],
  data () {
    return {
      tab: 'nodes',
      tabs: [
        {id: 'info', name: 'Info'},
        {id: 'nodes', name: 'Nodes'},
        {id: 'ws', name: 'Workspace'}
      ]
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
