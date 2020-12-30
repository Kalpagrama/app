<template lang="pug">
div(
  view="hHh Lpr lff"
  :style=`{
    minHeight: $q.screen.height+'px'
  }`).row.full-width.bg-black
  q-resize-observer(@resize="onResize" :debounce="300")
  //- footer
  div(
    v-if="showMenu"
    reveal
    :style=`{
      position: 'fixed', zIndex: 1000, bottom: '0px',
    }`).row.full-width
    .row.full-width.justify-center
      div(
        :style=`{
          height: headerHeight+'px',
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px 10px 0 0',
          //- paddingBottom: 'env(safe-area-inset-bottom)',
        }`
        ).row.full-width.items-start.content-start.b-40
        node-creator(
          v-if="player && nodeCreating"
          :contentKalpa="contentKalpa"
          :player="player"
          @cancel="nodeCancelled"
          @publish="nodePublished")
        //- navigation
        div(
          v-if="!nodeCreating"
          ).column.fit
          div(v-if="pageId").col.full-width.scroll
            component(
              :is="`page-${pageId}`"
              :contentKalpa="contentKalpa"
              :player="player")
          nav-mobile(
            v-if="!node"
            @create-start="essenceCreateStart()"
            @pageId="pageIdChange"
            :pageId="pageId"
            :style=`{
              zIndex: 1000,
            }`)
  //- body
  .row.full-width.justify-center
    div(
      :style=`{
        position: 'relative',
        //- paddingBottom: 'env(safe-area-inset-bottom)',
        maxWidth: player ? player.isFullscreen ? '100%' : $store.state.ui.pageWidth+'px' : $store.state.ui.pageWidth+'px',
        height: (pageId || nodeCreating) ? heightSquare+'px' : ($q.screen.height-65)+'px',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
        }`
        ).row.fit
        content-player(
          @player="player = $event"
          :contentKalpa="contentKalpa"
          :style=`{
            height: '100%',
          }`
          ).full-width.bg-black
        //- actions
        div(
          :style=`{
            position: 'absolute', zIndex: 3000, bottom: '0px',
          }`
          ).row.full-width.justify-center
          div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
            //- q-btn(
              v-if="showMenu && !pageId"
              @click="essenceCreateStart()"
              round flat dense color="green" icon="add_circle_outline"
              :style=`{
                position: 'absolute', zIndex: 3000,
                right: '12px', top: '-44px'
              }`)
            //- q-btn(
              v-if="!showMenu && !pageId"
              @click="showMenu = true"
              round flat dense color="white" icon="keyboard_arrow_up"
              :style=`{
                position: 'absolute', zIndex: 3000,
                right: '12px', top: '-44px'
              }`)
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
      return this.$q.screen.height - this.heightSquare
    }
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
      this.$tween.to(this, 0.3, {
        headerHeight: this.$q.screen.height - this.heightSquare
      })
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
        this.$tween.to(this, 0.3, {
          headerHeight: this.heightPage
        })
      }
    },
  },
  mounted () {
    this.$log('mounted')
    document.body.style.background = 'black !important'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
