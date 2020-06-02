<template lang="pug">
div(
  :class=`{
    'b-50': !active,
    'b-70': active,
  }`
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden'
  }`
  ).row.full-width.items-start.content-start
  //- kalpa-debug(:style=`{position: 'absolute', zIndex: 10000, top: '240px'}` :options=`{ctx,visible,active,mini}`)
  node-items(
    v-if="true"
    v-bind="$props" :meta="meta"
    :style=`{
      transform: 'translate3d(0,0,0)',
      borderRadius: '10px',
      overflow: 'hidden',
    }`).b-60
  node-vote(
    v-if="false"
    v-bind="$props" :meta="meta")
  node-essence(
    v-if="true"
    v-bind="$props" :meta="meta"
    :style=`{
      order: -2
    }`)
  node-author(
    v-if="nodeFull"
    v-bind="$props" :meta="meta"
    :style=`{
      order: 1
    }`)
  node-spheres(
    v-if="nodeFull && nodeFull.spheres.length > 0"
    v-bind="$props" :meta="meta"
    :style=`{
      order: 2
    }`)
</template>

<script>
import nodeItems from './node_items'
import nodeVote from './node_vote'
import nodeEssence from './node_essence'
import nodeAuthor from './node_author'
import nodeSpheres from './node_spheres'

export default {
  name: 'nodeLayoutPip',
  props: ['ctx', 'index', 'node', 'nodeFull', 'visible', 'active', 'essence', 'mini', 'opened', 'nodeLoad'],
  components: {nodeItems, nodeVote, nodeEssence, nodeAuthor, nodeSpheres},
  data () {
    return {
      showVote: false
    }
  },
  computed: {
    meta () {
      return {
        showVote: this.showVote
      }
    }
  },
  watch: {
  },
  methods: {
  },
  mounted () {
  },
  beforeDestroy () {
  }
}
</script>
