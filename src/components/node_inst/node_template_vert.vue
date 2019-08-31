<template lang="pug">
div(:style=`{height: '600px'}`).column.full-width.items-start.content-start
  node-header(:node="node" :nodeFull="nodeFull")
    template(v-slot:actions)
      k-menu-popup(name="Choose template" :actions="nodeTemplates" @action="$event => $emit('nodeTemplate', $event.id)")
        q-btn(icon="brush" color="grey-5" round flat)
  .col
    .row.fit
      div(v-for="(f, fi) in 2" :key="fi" :style=`{position: 'relative'}`).col.full-height
        img(:src="node.thumbUrl[fi]" :style=`{height: '100%', width: '100%', objectFit: 'cover'}`)
        div(:style=`{position: 'absolute', top: '0px', overflow: 'hidden'}`).row.fit.bg-red
          video(:src="nodeFull.fragments[fi].url" :style=`{width: '100%', height: '100%', objectFit: 'cover'}` autoplay loop)
        //-   node-video(:url="nodeFull.fragments[fi].url" :style=`{height: '100%'}`)
      //- .col.full-height
      //-   img(:src="node.thumbUrl[1]" :style=`{height: '100%', width: '100%', objectFit: 'cover'}`)
  node-actions(:node="node" :nodeFull="nodeFull")
  node-spheres(:node="node" :nodeFull="nodeFull")
  node-timestamp(:node="node")
</template>

<script>
import nodeHeader from './node_header'
import nodeSpheres from './node_spheres'
import nodeActions from './node_actions'
import nodeTimestamp from './node_timestamp'
import kMenuPopup from 'components/k_menu_popup'
import nodeVideo from './node_fragment_video'

export default {
  name: 'nodeTempalteVert',
  components: {nodeHeader, nodeSpheres, nodeActions, nodeTimestamp, kMenuPopup, nodeVideo},
  props: ['index', 'zIndex', 'node', 'nodeFull', 'active', 'needFull', 'nodeTemplates'],
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
