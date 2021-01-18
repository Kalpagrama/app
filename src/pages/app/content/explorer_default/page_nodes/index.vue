<template lang="pug">
div(
  :style=`{
    paddingTop: '0px'
  }`).row.full-width.items-start.content-start.justify-center
  .row.full-width.items-center.content-center.justify-start.q-pa-sm
    .col
      span().text-grey-7.text-bold.q-ml-xs.q-mr-xs Ядра
      span(v-if="nodesLoaded").text-grey-7.text-bold - {{ nodes.length }}
    q-btn(
      round flat color="grey-7" icon="tune")
  slot
  kalpa-loader(
    :immediate="true"
    @items="nodesUpdated" :limit="10"
    :query="nodesQuery" v-slot=`{items,next,nexting}`)
    list-middle(
      :items="items" :itemStyles=`{marginBottom: '0px',}`
      :style=`{position: 'relative', maxWidth: '700px',}`).q-pa-sm
      q-infinite-scroll(@load="next" :offset="$q.screen.height")
      template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
        node-item(
          :ref="'node-'+item.oid"
          :node="item" :player="player" :contentKalpa="contentKalpa"
          :nodeSelected="query.nodeOid === item.oid"
          :isActive="isActive" :isVisible="isVisible"
          :isSelected="item.oid === nodeSelectedOid"
          :style=`{
            zIndex: 2
          }`
          @select="$emit('node', item)"
          ).q-mb-md
      template(v-slot:append)
        div(:style=`{height: '50px'}`).row.full-width.justify-center
          q-spinner-dots(v-show="nexting" color="green" size="50px")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './node_item.vue'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player', 'nodeQuery', 'headerHeight', 'query'],
  components: {
    nodeItem,
  },
  data () {
    return {
      nodes: [],
      nodesLoaded: false,
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
    async nodesUpdated (nodes) {
      this.$log('nodesUpdated', nodes.length)
      this.nodes = nodes
      this.nodesLoaded = true
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
      this.player.setState('points', figures)
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
