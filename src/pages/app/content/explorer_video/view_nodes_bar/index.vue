<template lang="pug">
.row.full-width.justify-center.q-px-sm
  kalpa-loader(
    :immediate="true"
    :query="nodesQuery" @items="nodesLoaded" v-slot=`{items, next}`)
  div(
    @click="onClick"
    @mousemove="onMousemove"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
    accessKey="bar"
    :style=`{
      maxWidth: '770px',
      position: 'relative',
      height: '120px',
    }`
    ).row.full-width.items-start.content-start.q-py-sm
    item(
      v-for="(node,ii) in nodes" :key="node.node.oid"
      :node="node.node" :nodeIndex="ii"
      :nodeClosest="nodeClosest ? node.percent === nodeClosest.percent : false"
      v-bind="$props"
      :style=`{
        pointerEvents: 'none',
      }`
      )
  //- .row.full-width.bg-green
    small.text-white {{ mousePercent }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import item from './item.vue'

export default {
  name: 'viewNodesBar',
  props: ['player', 'contentKalpa', 'contentBookmark'],
  components: {
    item,
  },
  data () {
    return {
      // mousePercent: null,
      mouseOver: false,
      nodeClosest: null,
      nodes: []
    }
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.contentKalpa.oid
        },
        populateObjects: true,
      }
      // if (this.onlyMine) {
      //   res.selector.oidAuthor = {$eq: this.$store.getters.currentUser().oid}
      // }
      return res
    },
  },
  watch: {
    'player.currentTime': {
      handler (to, from) {
        // this.$log('player.curentTime TO', to)
        if (this.mouseOver) return
        let percent = to / this.contentKalpa.duration
        if (percent >= 0 && percent <= 1) {
          this.nodeClosest = this.nodes.reduce((prev, curr) => Math.abs(curr.percent - percent) < Math.abs(prev.percent - percent) ? curr : prev)
        }
      }
    }
  },
  methods: {
    onClick (e) {
      this.$log('onClick', e)
      if (this.nodeClosest) {
        this.player.setCurrentTime(this.nodeClosest.start)
      }
    },
    onMouseenter (e) {
      this.$log('onMouseEnter', e)
      this.mouseOver = true
    },
    onMouseleave (e) {
      this.$log('onMouseLeave', e)
      this.mouseOver = false
      // this.nodeClosest = null
    },
    onMousemove (e) {
      // this.$log('onMousemove', e)
      if (e.target.accessKey !== 'bar') return
      let {left, width} = e.target.getBoundingClientRect()
      // this.$log('left,e.clientX', left, e.clientX)
      let percent = (e.clientX - left) / width
      // this.$log('percent', percent)
      if (percent >= 0 && percent <= 1) {
        this.nodeClosest = this.nodes.reduce((prev, curr) => Math.abs(curr.percent - percent) < Math.abs(prev.percent - percent) ? curr : prev)
      }
    },
    nodesLoaded (nodes) {
      this.$log('nodesLoaded', nodes)
      // sort nodes with its item...
      nodes.map(n => {
        let item = n.items.find(i => {
          return i.layers[0].contentOid === this.contentKalpa.oid
        })
        let start = item.layers[0].figuresAbsolute[0].t
        this.nodes.push({
          start: start,
          percent: start / this.contentKalpa.duration,
          node: n
        })
      })
      // sort it...
      this.nodes.sort((a, b) => {
        return a.start - b.start
      })
    }
  }
}
</script>
