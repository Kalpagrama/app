<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.justify-center.bg-grey-3
  //- header
  div(:style=`{position: 'sticky', zIndex: 1000, top: headerTop+'px', height: '60px'}`).row.full-width.justify-center
    div(:style=`{maxWidth: '500px', borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).row.full-width.items-center.justify-between.bg-white.q-px-sm
      slot(name="default")
      .col.full-height
        .row.fit.items-center.q-px-sm
          span.text-bold {{ name }}
      q-btn(round dense flat :color="muted ? 'grey-6' : 'green'" :icon="muted ? 'volume_off' : 'volume_up'" @click="volumeToggle()")
      q-btn(round dense flat color="grey-6" icon="more_vert" @click="feedOptions()")
  //- body
  div(:style=`{maxWidth: '500px'}`).row.full-width.q-pt-sm
    q-resize-observer(@resize="onResize")
    div(v-for="(n, ni) in nodes" :key="n.oid").row.full-width
      node(
        :index="ni" :node="n" :lang="ni"
        :needFull="ni >= fullNodes[0] && ni <= fullNodes[1]"
        :active="activeNode ? activeNode[0] === ni : false"
        :class=`{
          'bg-grey-2': activeNode ? activeNode[0] !== ni : false,
          'bg-white': activeNode ? activeNode[0] === ni : false}`
        :style=`{zIndex: activeNode ? activeNode[0] === ni ? 200 : 10 : 10, borderRadius: '10px'}`
        :noActions="true" :noSpheres="true" :noTimestamp="true"
        :width="width" :muted="muted"
        v-observe-visibility=`{
          callback: nodeVisible,
          throttle: 300,
          intersection: {
            threshold: 0.98
          }
        }`).q-mb-xl
    div(:style=`{height: '80px'}`).row.full-width.items-center.justify-center
      q-spinner(v-show="fetchingMore" :thickness="2" color="primary" size="50px")
</template>

<script>
import node from 'components/node'

export default {
  name: 'nodeFeed',
  components: {node},
  props: ['name', 'nodes', 'fetchingMore'],
  data () {
    return {
      visibleNodes: [],
      width: 0,
      headerTop: 0,
      muted: true
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
    scrollDirectionChanged (b) {
      this.$log('scrollDirectionChanged')
      this.$tween.to(this, 0.3, {headerTop: b ? -60 : 0})
    },
    feedOptions () {
      this.$log('feedOptions')
    },
    volumeToggle () {
      this.$log('volumeToggle')
      this.$set(this, 'muted', !this.muted)
      // this.muted = !this.muted
    },
    onResize (e) {
      // this.$log('onResize', e)
      this.width = e.width
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
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
