<template lang="pug">
.row.full-width
  //- div(:style=`{color: 'white'}`).row.full-width.bg-purple
  //-   small colCount: {{colCount}}
  q-resize-observer(ref="kresize" @resize="onResize")
  //- q-scroll-observer(@scroll="onScroll")
  div(v-if="ready" :style=`{position: 'relative'}`).row.full-width.justify-center
    masonry(:cols=`colCount` :gutter="{default: colGap}" :style=`{}`).full-width
      //- div(
      //-   v-for="n in 100" :key="n"
      //-   :style=`{width: '50px', height: '50px'}`).row.bg-red hello
      div(v-for="(n, ni) in nodes" :key="n.oid").row.items-start.content-start
        node-css(
          :index="ni" :node="n" maxHeight="30vh"
          @click.native="$emit('nodeClick', n, ni)" :active="false" :needFull="false"
          noHeader noActions noSpheres noFragmentMenu :nameAtTheBottom="nameAtTheBottom"
          :style=`{minWidth: colWidth+'px', maxWidth: colWidth+'px', ...getRadius}`).bg-white.q-mb-md
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
    nodes: {type: Array},
    nameAtTheBottom: {type: Boolean}
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
      return 90
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
