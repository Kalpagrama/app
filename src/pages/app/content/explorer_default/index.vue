<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  //- q-resize-observer(@resize="onResize" :debounce="300")
  //- header: content player
  q-header(:style=`{opacity: 1,}`).bg-black
    .row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
          height: 'calc('+ heightPage +'px - env(safe-area-inset-bottom))',
          //- maxWidth: $store.state.ui.pageWidth+'px',
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
            :options=`{
              showHeader: false,
            }`
            :styles=`{
              height: '100%',
              objectFit: 'contain',
            }`
            ).full-width.bg-black
        //- .row.full-width.q-py-sm
  //- footer: navigation
  q-footer(
    v-if="!['node', 'creator'].includes(pageId)"
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
        //- @create-start="essenceCreateStart()"
        nav-mobile(
          v-if="!nodeCreating"
          @pageId="pageIdChange"
          :pageId="pageId"
          :style=`{
            zIndex: 1000,
          }`)
  //- pages or node creator...
  q-page-container
    q-page(
      :style=`{
        //- paddingTop: heightPage+'px',
      }`).row.full-width.justify-center
      div(
        v-if="contentKalpa && player"
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px 10px 0 0',
          //- marginBottom: '-10px',
        }`
        ).row.full-width.b-30
        component(
          v-if="pageId === 'node' ? node : true"
          :is="`page-${pageId}`"
          :node="node"
          :contentKalpa="contentKalpa"
          :player="player"
          :query="query"
          :height="$q.screen.height-heightPage-70"
          @cancel="nodeCancelled"
          @publish="nodePublished"
          @nodeCancel="pageId = 'nodes', node = null"
          @node="node = $event, pageId = 'node'")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import navMobile from './nav_mobile.vue'
import contentPlayer from 'components/content_player/index.vue'

import pageNodes from './page_nodes/index.vue'
import pageDrafts from './page_drafts/index.vue'
import pageDetails from './page_details/index.vue'
import pageCreator from './page_creator/index.vue'
import pageNode from './page_node/index.vue'

export default {
  name: 'explorerDefault',
  props: ['contentKalpa', 'query'],
  components: {
    navMobile,
    contentPlayer,
    pageNodes,
    pageDrafts,
    pageDetails,
    pageCreator,
    pageNode,
  },
  data () {
    return {
      // width: 0,
      // height: 0,
      player: null,
      pageId: 'nodes',
      // headerHeight: 65,
      // showMenu: true,
      // nodeCreating: false,
      heightPage: 0,
      // heightPageMin: 0,
      node: null,
    }
  },
  computed: {
    heightPageMin () {
      // this.width / this.contentKalpa.thumbWidth this.contentKalpa.thumbHeight
      let width = Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth)
      // let height = (width * this.contentKalpa.thumbHeight) / this.contentKalpa.thumbWidth
      let d = this.contentKalpa.thumbHeight / this.contentKalpa.thumbWidth
      let height = width * d
      return height + 20
      // return Math.min(height, width)
    },
    heightPageMax () {
      return this.$q.screen.height - 70 - 0
    },
    // heightContent () {
    //   return (this.pageId || this.nodeCreating) ? this.heightPage : this.$q.screen.height - 70 - 15
    // },
  },
  watch: {
    pageId: {
      immediate: true,
      async handler (to, from) {
        this.$log('pageId TO', to)
        // if (this.query.nodeOid) {
        //   let query = Object.assign({}, this.$route.query)
        //   delete query.nodeOid
        //   this.$router.replace({ query })
        //   this.pageId = 'node'
        //   this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, this.query.nodeOid)
        // }
        // else {
        //   // do stuff
        // }
        if (to) {
          this.$tween.to(this, 0.3, {
            heightPage: this.heightPageMin,
            onComplete: () => {
              this.$log('pageId Done to ', to)
              // this.pageId = null
            }
          })
        }
        else {
          this.$tween.to(this, 0.3, {
            heightPage: this.heightPageMax,
            onComplete: () => {
              this.$log('pageId Done to null')
              // this.pageId = null
            }
          })
        }
      }
    },
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
    // essenceCreateStart () {
    //   this.$log('essenceCreateStart')
    //   // go to square/essence height
    //   this.nodeCreating = true
    //   // this.$tween.to(this, 0.3, {
    //   //   headerHeight: this.$q.screen.height - this.heightSquare
    //   // })
    // },
    nodeCancelled () {
      this.$log('nodeCancelled')
      this.pageId = null
      // this.headerHeight = 70
      // this.nodeCreating = false
    },
    nodePublished () {
      this.$log('nodePublished')
      // this.pageId = 'nodes'
      this.pageIdChange('nodes')
      // this.nodeCreating = false
      // do what?
    },
    pageIdChange (pageId) {
      this.$log('pageIdChange', pageId)
      if (this.pageId === pageId) {
        this.pageId = null
      }
      else {
        this.pageId = pageId
      }
    },
  },
  mounted () {
    this.$log('mounted')
    document.body.style.background = 'rgb(0,0,0) !important'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    document.body.style.background = 'rgb(30,30,30)'
  }
}
</script>
