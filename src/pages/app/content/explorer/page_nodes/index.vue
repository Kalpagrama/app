<template lang="pug">
q-page(
  :style=`{
    position: 'relative',
    paddingTop: '0px',
    paddingBottom: '50vh',
  }`
  ).row.full-width.items-start.content-start.justify-center
  slot
  //- div(
    :style=`{
      position: 'absolute', left: '27px', top: '-8px', zIndex: 1,
      width: '1px',
    }`
    ).row.full-height.bg-grey-8
  kalpa-loader(
    :immediate="true"
    @items="nodesLoaded"
    :query="nodesQuery" v-slot=`{items,next,nexting}`)
    list-middle(
      :items="items" :itemStyles=`{marginBottom: '40px',}`
      :style=`{position: 'relative', maxWidth: '700px',}`).q-px-sm
      //- div(
        v-if="items && items.length > 0"
        :style=`{
          position: 'absolute', left: '27px', top: '-8px', zIndex: 1,
          width: '1px',
          minHeight: 'calc(100% + 50vh + 16px)',
        }`
        ).row.bg-grey-8
      template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
        node-item(
          :ref="'node-'+item.oid"
          :node="item" :player="player" :contentKalpa="contentKalpa"
          :nodeQuery="nodeQuery"
          :isActive="isActive" :isVisible="isVisible"
          :style=`{
            zIndex: 2
          }`
          @scrollme="nodeScroll(item,itemIndex)")
          //- node-item(
            :ref="'node-'+item.oid"
            :node="item" :player="player" :contentKalpa="contentKalpa"
            :nodeQuery="nodeQuery"
            :isActive="isActive" :isVisible="isVisible"
            :style=`{
              zIndex: 2
            }`)
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
    async nodeScroll (node, nodeIndex) {
      this.$log('nodeScroll', node, nodeIndex)
      // alert('nodeScroll::' + node.oid)
      await this.$wait(300)
      let ref = this.$refs[`node-${node.oid}`]
      this.$log('ref', ref)
      if (ref) {
        let top = ref.$vnode.elm.getBoundingClientRect().top
        this.$log('top', top)
        window.scrollTo(0, top - this.headerHeight - 8)
      }
    },
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
