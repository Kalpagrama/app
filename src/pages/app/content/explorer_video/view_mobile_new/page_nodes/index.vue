<template lang="pug">
q-page(
  :style=`{
    paddingTop: '8px',
    paddingBottom: '100vh',
  }`
  ).row.full-width.items-start.content-start.justify-center
  slot
  kalpa-loader(
    :immediate="true"
    @items="nodesLoaded"
    :query="nodesQuery" v-slot=`{items,next,nexting}`)
    //- div(
      :style=`{
        maxWidth: '100%',
      }`
      ).row.full-width.items-start.content-start.q-px-sm
    list-middle(
      :items="items" :itemStyles=`{marginBottom: '40px',}`
      :style=`{maxWidth: '700px',}`).q-px-sm
      template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
        node-item(
          :node="item" :player="player" :contentKalpa="contentKalpa"
          :isActive="isActive" :isVisible="isVisible"
          :isFocused="nodeFocused ? nodeFocused.oid === item.oid : false"
          @isFocused="$event => nodeFocusedHandle(item, $event[0], $event[1])"
          :style=`{
            marginBottom: '0px',
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
          objectTypeEnum: { $in: ['NODE', 'JOINT'] },
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
    nodeFocusedHandle (node, item, isFocused) {
      this.$log('nodeFocusedHandle', node, item, isFocused)
      if (isFocused) {
        this.nodeFocused = node
        let start = item.layers[0].figuresAbsolute[0].t
        let end = item.layers[0].figuresAbsolute[1].t
        this.player.setCurrentTime(start)
        this.player.play()
        // TODO: set this.player.setFigures([[],[]], true)
        // this.player.setFigures([[],[]], false)
        this.$emit('figures', [item.layers[0].figuresAbsolute])
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
