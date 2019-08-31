<template lang="pug">
.row.full-width.items-start.content-start
  div(v-for="(n, ni) in nodes" :key="n.oid").row.full-width
    //- :title="n.name"
    node-inst(
      :index="ni" :node="n" :lang="ni"
      :needFull="ni >= fullNodes[0] && ni <= fullNodes[1]"
      :active="activeNode ? activeNode[0] === ni : false"
      :class=`{
        'bg-grey-3': activeNode ? activeNode[0] !== ni : false,
        'bg-white': activeNode ? activeNode[0] === ni : false,
        'shadow-1': activeNode ? activeNode[0] === ni : false}`
      :style=`{borderRadius: '4px'}`
      v-touch-swipe.mouse.left="nodeSwipeLeft"
      v-observe-visibility=`{
        callback: nodeVisible,
        throttle: 300,
        intersection: {
          threshold: 0.8
        }
      }`).q-mb-md
  div(:style=`{height: '80px'}`).row.full-width.items-center.justify-center
    q-spinner(v-show="fetchingMore" :thickness="2" color="primary" size="50px")
</template>

<script>
import nodeInst from 'components/node_inst'

export default {
  name: 'nodeLoader__feed',
  components: {nodeInst},
  props: ['nodes', 'fetchingMore'],
  data () {
    return {
      visibleNodes: []
    }
  },
  computed: {
    fullNodes () {
      if (this.activeNode) {
        let index = this.activeNode[0]
        let res = []
        if (index < 3) res = [0, index + 3]
        else res = [index - 3, index + 3]
        return res
      } else {
        return [0, 0]
      }
    },
    activeNode () {
      if (this.visibleNodes.length > 0) return this.visibleNodes[0]
      else return null
    }
  },
  watch: {
    activeNode: {
      async handler (to, from) {
        // this.$log('activeNode CHANGED', to)
        if (to && to !== from && this.nodes.length - to[0] < 4) {
          if (!this.fetchingMore) {
            this.$log('MORE')
            this.$emit('more')
          }
        }
      }
    }
  },
  methods: {
    nodeSwipeLeft () {
      this.$log('nodeSwipeLeft')
    },
    async nodeVisible (isVisible, entry) {
      let top = entry.target.offsetTop
      let name = entry.target.title
      let index = parseInt(entry.target.lang)
      if (isVisible) {
        this.$log('nodeVisible SHOW', index)
        this.visibleNodes.unshift([index, top])
      } else if (this.visibleNodes.find(([i, t]) => (i === index)) && this.visibleNodes.length > 1) {
        this.$log('nodeVisible HIDE', index)
        this.visibleNodes = this.visibleNodes.filter(([i, t]) => (i !== index))
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    // setInterval(() => {
    //   this.$emit('more')
    // }, 2000)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
