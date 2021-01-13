<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  ).b-30
  //- q-resize-observer(@resize="onResize" :debounce="300")
  q-header().bg-black
    .row.full-width.justify-center
      div(
        :style=`{
          //- height: 'calc('+ ($q.screen.height-500) +'px - 70px - 0px - env(safe-area-inset-bottom))',
          position: 'relative',
          height: 'calc('+ heightContent +'px - 0px - 0px - env(safe-area-inset-bottom))',
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '0 0 10px 10px',
        }`
        ).column.full-width.bg-black
        div(:style=`{position: 'relative',}`).col
          content-player(
            @player="player = $event"
            :contentKalpa="contentKalpa"
            :style=`{
              height: '100%',
            }`
            :styles=`{
              height: '100%',
              objectFit: 'contain',
              padding: {
                paddingTop: '50px',
              }
            }`
            ).full-width.bg-black
        .row.full-width.q-py-sm
  q-footer(
    v-if="!nodeCreating"
    reveal
    :style=`{
      //- paddingBottom: 'env(safe-area-inset-bottom)',
    }`)
    .row.full-width.justify-center
      div(
        :style=`{
          borderRadius: '10px 10px 0 0',
          maxWidth: $store.state.ui.pageWidth+'px',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }`
        ).row.full-width.b-40
        nav-mobile(
          v-if="!nodeCreating"
          @create-start="essenceCreateStart()"
          @pageId="pageIdChange"
          :pageId="pageId"
          :style=`{
            zIndex: 1000,
          }`)
  q-page-container
    q-page(
      :style=`{
        paddingTop: '15px',
      }`).row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        node-creator(
          v-if="player && nodeCreating"
          :contentKalpa="contentKalpa"
          :player="player"
          @cancel="nodeCancelled"
          @publish="nodePublished")
        component(
          v-if="!nodeCreating"
          :is="`page-${pageId}`"
          :contentKalpa="contentKalpa"
          :player="player")
</template>

<script>
import navMobile from './nav_mobile.vue'
import contentPlayer from 'components/content_player/index.vue'
import pageNodes from './page_nodes/index.vue'
import pageDrafts from './page_drafts/index.vue'
import pageDetails from './page_details/index.vue'
import nodeCreator from './node_creator/index.vue'

export default {
  name: 'explorerDefault',
  props: ['contentKalpa', 'query'],
  components: {
    navMobile,
    contentPlayer,
    pageNodes,
    pageDrafts,
    pageDetails,
    nodeCreator,
  },
  data () {
    return {
      width: 0,
      height: 0,
      player: null,
      pageId: null,
      headerHeight: 65,
      showMenu: true,
      nodeCreating: false,
    }
  },
  computed: {
    heightSquare () {
      if (this.$q.screen.width > this.$store.state.ui.pageWidth) {
        return this.$store.state.ui.pageWidth
      }
      else {
        return this.$q.screen.width
      }
    },
    heightPage () {
      // this.width / this.contentKalpa.thumbWidth this.contentKalpa.thumbHeight
      let width = Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth)
      // let height = (width * this.contentKalpa.thumbHeight) / this.contentKalpa.thumbWidth
      let d = this.contentKalpa.thumbHeight / this.contentKalpa.thumbWidth
      let height = width * d
      return height + 20
      // return Math.min(height, width)
    },
    heightContent () {
      return (this.pageId || this.nodeCreating) ? this.heightPage : this.$q.screen.height - 70 - 15
    },
  },
  watch: {
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      this.width = e.width
      this.height = e.height
      if (this.$q.platform.is.mobile) {
        if (this.width > this.height) {
          // alert('HORIZONTAL')
        }
        if (this.width < this.height) {
          // alert('VERTICAL')
        }
      }
    },
    essenceCreateStart () {
      this.$log('essenceCreateStart')
      // go to square/essence height
      this.nodeCreating = true
      // this.$tween.to(this, 0.3, {
      //   headerHeight: this.$q.screen.height - this.heightSquare
      // })
    },
    nodeCancelled () {
      this.$log('nodeCancelled')
      this.pageId = null
      this.headerHeight = 70
      this.nodeCreating = false
    },
    nodePublished () {
      this.$log('nodePublished')
      // this.pageId = 'nodes'
      this.pageIdChange('nodes')
      this.nodeCreating = false
      // do what?
    },
    pageIdChange (pageId) {
      // go back to
      if (this.pageId === pageId) {
        // this.pageId = null
        this.$tween.to(this, 0.3, {
          headerHeight: 70,
          onComplete: () => {
            this.pageId = null
          }
        })
      }
      else {
        this.pageId = pageId
        // this.$tween.to(this, 0.3, {
        //   headerHeight: this.heightPage
        // })
      }
    },
  },
  mounted () {
    this.$log('mounted')
    // document.body.style.background = 'black'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    document.body.style.background = 'rgb(30,30,30)'
  }
}
</script>
