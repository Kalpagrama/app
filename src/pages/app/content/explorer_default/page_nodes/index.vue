<template lang="pug">
div(
  :style=`{
    height: height+'px',
  }`
  ).column.full-width
  //- header: sticky ?
  div(
    :style=`{
      height: '60px',
    }`
    ).row.full-width.items-center.content-center.justify-start.q-px-sm
    .col.q-px-sm
      span().text-grey-7.text-bold.q-mr-xs Ядра
      span(v-if="itemsLoaded").text-grey-7.text-bold - {{ itemsLocal.length }}
    q-btn(
      round flat color="grey-7" icon="tune")
  div(
    ref="items-scroll"
    :style=`{
      //- position: 'relative',
    }`
    ).col.full-width.scroll
    div(
      :style=`{
        position: 'absolute', zIndex: 1000, top: '60px',
        height: '10px',
        background: 'linear-gradient(0deg, rgba(30,30,30,0.1) 0%, rgba(30,30,30,1) 100%)',
        pointerEvents: 'none',
      }`
      ).row.full-width
    div(
      :style=`{
        marginTop: 10+'px',
        marginBottom: height-120+'px',
      }`
      ).row.full-width.items-start.content-start.q-px-sm
      node-item(
        v-for="(i,ii) in itemsLocal" :key="i.oid"
        :ref="`item-${i.oid}`"
        :node="i.node"
        :composition="i.composition"
        :contentKalpa="contentKalpa"
        :player="player"
        :isSelected="itemSelectedOid === i.oid"
        @click.native="itemSelectedOid = i.oid")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './node_item.vue'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player', 'height'],
  components: {
    nodeItem,
  },
  data () {
    return {
      itemSelectedOid: null,
      items: [],
      findRes: null,
      itemsLocal: [],
      itemsLoaded: false
    }
  },
  computed: {
    itemsQuery () {
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
    items: {
      deep: true,
      async handler (to, from) {
        if (this.findRes && this.findRes.hasPrev()){
          this.$logE('hasPrev! TODO нужно реализовать логику прокрутки вверх!!!!')
          await this.findRes.prev(10)
        }
        await this.itemsUpdated(to)
      }
    },
    'player.currentTime': {
      handler (to, from) {
        // this.$log('player.currentTime TO', to)
        let item = this.itemsLocal.find(i => {
          return to >= i.composition.layers[0].figuresAbsolute[0].t && to < i.composition.layers[0].figuresAbsolute[1].t
        })
        if (item) {
          let refItemsScroll = this.$refs['items-scroll']
          let refItem = this.$refs[`item-${item.oid}`][0].$el
          let refItemOffsetTop = refItem.offsetTop
          // this.$log({refItemsScroll, refItem, refItemOffsetTop})
          // this.$log('ref')
          this.$tween.to(refItemsScroll, 0.5, {
            scrollTop: refItemOffsetTop - 120
          })
        }
        // find item with composition of mine, scrollto its position ?
      }
    }
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
    async itemsUpdated (nodes) {
      this.$log('itemsUpdated', nodes.length)
      let items = nodes.map(n => {
        // get composition
        let composition
        n.items.map(i => {
          if (i.type === 'COMPOSITION' && i.layers[0].contentOid === this.contentKalpa.oid) {
            composition = i
          }
          if (i.type === 'NODE' && i.items[0].layers[0].contentOid === this.contentKalpa.oid) {
            composition = i.items[0]
          }
        })
        return {
          oid: n.oid,
          composition: composition,
          node: n
        }
      })
      // filter
      items = items.filter(i => {
        return i.composition
      })
      // sort items for video ASC
      if (this.contentKalpa.type === 'VIDEO') {
        items = items.sort((a, b) => {
          return a.composition.layers[0].figuresAbsolute[0].t - b.composition.layers[0].figuresAbsolute[0].t
        })
      }
      let figures = items.map(i => {
        return {
          oid: i.node.oid,
          nodeOid: i.node.oid,
          name: i.node.name || i.node.vertices,
          thumbUrl: i.composition.thumbUrl,
          figures: i.composition.layers[0].figuresAbsolute,
          node: i.node
        }
      })
      this.player.setState('figures', figures)
      this.itemsLocal = items
      this.itemsLoaded = true
    }
  },
  async mounted () {
    this.$log('mounted')
    this.findRes = await this.$rxdb.find(this.itemsQuery, true) // {items, next, hasNext, prev, hasPrev}
    while (this.findRes.hasNext()) {
      // this.$log('items.next !!!')
      await this.findRes.next(12)
      // this.$log('items.length', items.length)
    }
    this.items = this.findRes.items
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
