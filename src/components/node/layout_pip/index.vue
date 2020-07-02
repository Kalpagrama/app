<template lang="pug">
div(
  :class=`{
    'b-50': !active,
    'b-70': active,
  }`
  :style=`{
    position: 'relative',
    borderRadius: $store.state.ui.borderRadius+'px',
    overflow: 'hidden',
    marginBottom: '50px',
  }`
  ).row.full-width.items-start.content-start
  //- kalpa-debug(:style=`{position: 'absolute', zIndex: 10000, top: '240px'}` :options=`{ctx,visible,active,mini}`)
  div(:style=`{position: 'relative'}`).row.full-width
    node-items(
      v-if="true"
      v-bind="$props" :stateNode="stateNode"
      :style=`{
        transform: 'translate3d(0,0,0)',
        borderRadius: $store.state.ui.borderRadius+'px',
        //- overflow: 'hidden',
      }`).b-60
    node-vote(
      v-if="stateNode.voteShow"
      v-bind="$props"
      :stateNode="stateNode")
  node-essence(
    v-if="true"
    v-bind="$props"
    :stateNode="stateNode"
    :style=`{
      order: 2
    }`)
  node-author(
    v-if="true"
    v-bind="$props"
    :stateNode="stateNode"
    :style=`{
      order: 3
    }`)
  node-spheres(
    v-if="true"
    v-bind="$props"
    :stateNode="stateNode"
    :style=`{
      order: 4
    }`)
</template>

<script>
import nodeTools from './node_tools'
import nodeItems from './node_items'
import nodeVote from './node_vote'
import nodeEssence from './node_essence'
import nodeAuthor from './node_author'
import nodeSpheres from './node_spheres'

export default {
  name: 'nodeLayoutPip',
  props: ['ctx', 'index', 'node', 'nodeFull', 'visible', 'active', 'essence', 'mini', 'opened'],
  components: {nodeTools, nodeItems, nodeVote, nodeEssence, nodeAuthor, nodeSpheres},
  data () {
    return {
      voteShow: false
    }
  },
  computed: {
    nodeIsMine () {
      if (this.nodeFull) {
        return this.nodeFull.author.oid === this.$store.getters.currentUser().oid
      }
      else {
        return true
      }
    },
    stateNode () {
      return {
        voteShow: this.voteShow,
        nodeIsMine: this.nodeIsMine,
        set: (key, val) => {
          this[key] = val
        }
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
