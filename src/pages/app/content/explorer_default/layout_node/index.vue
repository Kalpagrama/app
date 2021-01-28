<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  :class=`{
    'bg-black': (player && !player.figure),
    'b-30': (player && player.figure),
  }`)
  q-page-container
    q-page(
      :class=`{
        'q-pt-sm': (player && player.figure),
        'q-px-sm': (player && player.figure),
      }`
      :style=`{}`
      ).row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
          height: contentHeight+'px',
          maxWidth: contentWidth+'px',
          borderRadius: '10px',
        }`
        ).row.full-width
        content-player(
          @player="player = $event"
          :contentKalpa="contentKalpa"
          :style=`{
            zIndex: 100,
            height: '100%',
          }`
          :options=`{
            showHeader: false,
            showBar: true,
            showFooter: true,
            //- footerOverlay: true
          }`
          :styles=`{
            height: '100%',
            objectFit: 'contain',
            borderRadius: '10px',
          }`
          ).full-width.bg-black
        div(
          v-if="player && player.figure"
          :style=`{
            marginTop: '-20px',
            marginBottom: '400px',
          }`
          ).row.full-width
          div(
            :style=`{
              paddingTop: '28px',
              borderRadius: '0 0 10px 10px',
            }`
            ).row.full-width.b-40
            q-input(
              v-model="name"
              borderless dark
              placeholder="В чем суть ?"
              :input-style=`{
                fontSize: '18px',
                textAlign: 'center',
              }`
              ).full-width
          .row.full-width
            span spheres
          .row.full-width
            span category
          div(
            :style=`{
            }`
            ).row.full-width.q-pa-sm
            .col
            q-btn(color="green" no-caps) Publish
        component(
          v-if="player"
          :is="`page-${pageId}`"
          :contentKalpa="contentKalpa"
          :player="player"
          :query="query"
          :height="$q.screen.height-contentHeight-70").br
  //- footer default
  //- transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
  div(
    v-if="player && !player.figure"
    :style=`{
      position: 'fixed', zIndex: 1000,
      bottom: '0px',
      minHeight: 70+'px',
      maxHeight: $q.screen.height-contentHeight-70+'px',
    }`
    ).row.full-width.items-start.content-start.justify-center
    nav-mobile(
      @pageId="pageIdChange"
      :pageId="pageId"
      :style=`{
        zIndex: 1000,
      }`)
  //- footer node
  //- transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
  div(
    v-if="player && player.figure"
    v-show="$q.platform.is.mobile ? !$store.state.ui.userTyping : true"
    :style=`{
      position: 'fixed', zIndex: 1000,
      bottom: '0px',
      height: 70+'px',
    }`
    ).row.full-width.items-start.content-start.justify-center
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        background: 'rgb(30,30,30)',
        borderRadius: '10px 10px 0 0',
        minHeight: '70px',
        background: 'rgba(30,30,30,1)',
      }`
      ).row.fit.items-start.content-start
      div(:style=`{height: '70px',}`).row.full-width.items-center.content-center.q-px-sm
        q-btn(
          @click="player.setState('figure', null)"
          round flat color="white" icon="clear")
        .col
        q-btn(round flat color="white" icon="play_arrow")
        .col
        q-btn(round flat color="white" icon="refresh")
</template>

<script>
import navMobile from '../nav_mobile.vue'
import contentPlayer from 'components/content_player/index.vue'

import pageNodes from '../page_nodes/index.vue'
import pageDrafts from '../page_drafts/index.vue'
import pageDetails from '../page_details/index.vue'
import pageCreator from '../page_creator/index.vue'
import pageNode from '../page_node/index.vue'

export default {
  name: 'layoutNode',
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
      player: null,
      contentHeight: 0,
      contentWidth: 0,
      pageId: null,
    }
  },
  computed: {
    contentHeightMin () {
      return 300
    },
    contentHeightMax () {
      return this.$q.screen.height - 70
    },
    contentWidthMin () {
      return Math.min(this.$q.screen.width, 700)
    },
    contentWidthMax () {
      return this.$q.screen.width
    },
    // heightPageMin () {
    //   let width = Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth)
    //   let d = this.contentKalpa.thumbHeight / this.contentKalpa.thumbWidth
    //   let height = width * d
    //   // return height
    //   return 300
    //   // return Math.min(height, width)
    // },
  },
  watch: {
    'player.figure': {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$tween.to(this, 0.3, {
            contentHeight: this.contentHeightMin,
            contentWidth: this.contentWidthMin,
            onComplete: async () => {
              this.pageId = null
            }
          })
        }
        else {
          this.$tween.to(this, 0.3, {
            contentHeight: this.contentHeightMax,
            contentWidth: this.contentWidthMax,
            onComplete: async () => {
              this.pageId = null
            }
          })
        }
      }
    },
    pageId: {
      handler (to, from) {
        if (to) {
          this.$tween.to(this, 0.3, {
            contentHeight: this.$q.screen.height / 3,
            contentWidth: this.contentWidthMax,
          })
        }
        else {
          this.$tween.to(this, 0.3, {
            contentHeight: this.contentHeightMax,
            contentWidth: this.contentWidthMax,
          })
        }
      }
    }
  },
  methods: {
    pageIdChange (pageId) {
      this.$log('pageIdChange', pageId)
      if (this.pageId === pageId) {
        this.pageId = null
      }
      else {
        this.pageId = pageId
      }
    }
  }
}
</script>
