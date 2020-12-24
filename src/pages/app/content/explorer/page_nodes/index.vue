<template lang="pug">
q-page(
  :style=`{
    paddingTop: '0px'
  }`).row.full-width.items-start.content-start.justify-center
  slot
  kalpa-loader(
    :immediate="true"
    @items="nodesLoaded"
    :query="nodesQuery" v-slot=`{items,next,nexting}`)
    list-middle(
      :items="items" :itemStyles=`{marginBottom: '0px',}`
      :style=`{position: 'relative', maxWidth: '700px',}`).q-pa-sm
      template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
        node-item(
          :ref="'node-'+item.oid"
          :node="item" :player="player" :contentKalpa="contentKalpa"
          :nodeQuery="nodeQuery"
          :isActive="isActive" :isVisible="isVisible"
          :isSelected="item.oid === nodeSelectedOid"
          :style=`{
            zIndex: 2
          }`
          @select="nodeSelectedOid = item.oid")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './node_item.vue'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player', 'nodeQuery', 'headerHeight'],
  components: {
    nodeItem,
  },
  data () {
    return {
      nodeSelectedOid: null,
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
  methods: {
    // async nodeScroll (node, nodeIndex) {
    //   this.$log('nodeScroll', node, nodeIndex)
    //   // alert('nodeScroll::' + node.oid)
    //   await this.$wait(300)
    //   let ref = this.$refs[`node-${node.oid}`]
    //   this.$log('ref', ref)
    //   if (ref) {
    //     let top = ref.$vnode.elm.getBoundingClientRect().top
    //     this.$log('top', top)
    //     window.scrollTo(0, top - this.headerHeight - 8)
    //   }
    // },
    async nodesLoaded (nodes) {
      this.$log('nodesLoaded', nodes.length)
      let figures = nodes.reduce((acc, node) => {
        node.items.map(i => {
          if (i.layers) {
            if (i.layers[0].contentOid === this.contentKalpa.oid) {
              let figureInput = i.layers[0].figuresAbsolute[0]
              acc.push([figureInput])
            }
          }
        })
        return acc
      }, [])
      this.figures = figures
      this.player.stateSet('points', figures)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
