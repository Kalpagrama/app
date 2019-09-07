<template lang="pug">
div(:style=`{position: 'relative', height: '500px', marginTop: '100px'}`).row.full-width.items-end.content-end.bg-white
  div(:style=`{position: 'absolute', zIndex: zIndex+100, top: '-70px', left: '5%', width: '80%', borderRadius: '8px', overflow: 'hidden'}`
    ).row.shadow-20.bg-grey-3
    img(:src="node.thumbUrl[0]" :style=`{width: '100%', objectFit: 'contain'}`)
  div(:style=`{position: 'absolute', zIndex: zIndex+90, top: '-40px', right: '5%', width: '80%', maxHeight: 'calc(500px - 20%)', borderRadius: '8px', overflow: 'hidden'}`
    ).row.shadow-5.bg-grey-3
    img(:src="node.thumbUrl[1]" :style=`{width: '100%', objectFit: 'contain'}`)
  //- div(:style=`{height: '600px', paddingTop: '230px'}`).row.full-width
  //-   .row.full-width.justify-center
  //-     span.text-bold {{node.name}}
  node-header(:node="node" :nodeFull="nodeFull")
    template(v-slot:actions)
      k-menu-popup(name="Choose template" :actions="nodeTemplates" @action="$event => $emit('nodeTemplate', $event.id)")
        q-btn(icon="brush" color="grey-5" round flat)
  node-actions(:node="node" :nodeFull="nodeFull")
  node-timestamp(:node="node")
</template>

<script>
import nodeHeader from './node_header'
import nodeActions from './node_actions'
import nodeTimestamp from './node_timestamp'
import kMenuPopup from 'components/k_menu_popup'

export default {
  name: 'nodeTemplateCards',
  components: {nodeHeader, nodeActions, nodeTimestamp, kMenuPopup},
  props: ['index', 'zIndex', 'node', 'nodeFull', 'active', 'needFull', 'nodeTemplates', 'inCreator'],
  data () {
    return {
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
