<template lang="pug">
.row
  //- div(:style=`{color: 'white'}`).row.full-width.bg-purple
  //-   small colCount: {{colCount}}
  q-resize-observer(ref="kresize" @resize="onResize")
  q-scroll-observer(@scroll="onScroll")
  div(v-if="ready" :style=`{position: 'relative'}`).row.full-width.items-start.content-start.justify-start
    masonry(
      :cols=`colCount`
      :gutter="{default: colGap}").row.full-width.justify-start
      node-css(
        v-for="(n, ni) in nodes" :key="n.oid" :index="ni" :node="n" maxHeight="80vh"
        @click.native="$emit('nodeClick', n, ni)" :active="false" :needFull="false"
        noHeader noActions noSpheres noFragmentMenu
        :style=`{minWidth: colWidth+'px', maxWidth: colWidth+'px', ...getRadius}`).q-mb-md.bg-white
</template>

<script>
import { scroll } from 'quasar'
import node from 'components/node'
import nodeCss from 'components/node/node_css'

// TODO: justify-start for items in masonry columns...
// TODO: element with toggling dummy render element of this...
export default {
  name: 'nodeMasonry',
  components: {node, nodeCss},
  props: {
    nodes: {
      type: Array
    }
  },
  data () {
    return {
      ready: false,
      width: 0,
      height: 0,
      scroll: 0
    }
  },
  computed: {
    colWidth () {
      return 120
    },
    colGap () {
      return 10
    },
    colCount () {
      return Math.floor(this.width / (this.colWidth + this.colGap))
    },
    getRadius () {
      return {
        borderBottomLeftRadius: '100%12px !important',
        borderBottomRightRadius: '100%12px !important',
        borderTopLeftRadius: '100%12px !important',
        borderTopRightRadius: '100%12px !important'
      }
    }
  },
  watch: {
  },
  methods: {
    onResize (e) {
      // this.$log('onResize', e)
      this.ready = true
      this.$set(this, 'width', e.width)
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      this.$set(this, 'scroll', e.position)
      // this.$emit(e.position)
    },
    imgError(e, ni) {
      // this.$log('imgError', ni)
      e.target.src = 'https://storage.yandexcloud.net/kalpa-thumbs/7n/r9/132596514735333573_600_1.jpg'
    }
  },
  mounted () {
    this.$log('mounted')
    this.$refs.kresize.trigger()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
