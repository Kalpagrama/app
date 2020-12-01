<template lang="pug">
q-page(
  :style=`{
    paddingTop: '16px',
    paddingBottom: '100vh',
  }`
  ).row.full-width.justify-center
  kalpa-loader(
    :immediate="true"
    @items="nodesLoaded"
    :query="nodesQuery" v-slot=`{items,next,nexting}`)
    div(
      :style=`{
        maxWidth: '100%',
      }`
      ).row.full-width.items-start.content-start.q-px-sm
      node-item(
        v-for="(node, nodei) in items" :key="node.oid"
        v-if="node.items.length === 1"
        :node="node" :player="player" :contentKalpa="contentKalpa"
        :isFocused="nodeFocused ? nodeFocused.oid === node.oid : false"
        @isFocused="$event => nodeFocusedHandle(node, $event)"
        :style=`{
          marginBottom: '40px',
        }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './node_item.vue'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player'],
  components: {
    nodeItem,
  },
  data () {
    return {
      nodeFocused: null,
      figures: []
    }
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.contentKalpa.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
      return res
    },
  },
  watch: {
    'player.currentTime': {
      handler (to, from) {
        if (this.nodeFocused) {
          let start = this.nodeFocused.items[0].layers[0].figuresAbsolute[0].t
          let end = this.nodeFocused.items[0].layers[0].figuresAbsolute[1].t
          if (to < start || to > end) {
            this.player.setCurrentTime(start)
          }
        }
      }
    }
  },
  methods: {
    nodeFocusedHandle (node, isFocused) {
      this.$log('nodeFocusedHandle', node, isFocused)
      if (isFocused) {
        this.nodeFocused = node
        let start = node.items[0].layers[0].figuresAbsolute[0].t
        let end = node.items[0].layers[0].figuresAbsolute[1].t
        this.player.setCurrentTime(start)
        this.player.play()
        // TODO: set this.player.setFigures([[],[]], true)
        // this.player.setFigures([[],[]], false)
        this.$emit('figures', [node.items[0].layers[0].figuresAbsolute])
      }
      else {
        this.nodeFocused = null
        this.$emit('figures', this.figures)
      }
    },
    nodesLoaded (nodes) {
      // this.$emit('figures')
      this.$log('figuresUpdate', nodes.length)
      // get figures
      let figures = nodes.reduce((acc, node) => {
        if (node.items.length === 1 && node.items[0].layers) {
          node.items.map(i => {
            if (i.layers[0].contentOid === this.contentKalpa.oid) {
              let figureInput = i.layers[0].figuresAbsolute[0]
              if (node.items.length === 1) acc.push([figureInput])
            }
          })
        }
        return acc
      }, [])
      this.figures = figures
      this.$emit('figures', figures)
    }
  },
  // beforeDestroy () {
  //   this.$emit('figures', [])
  // }
}
</script>
