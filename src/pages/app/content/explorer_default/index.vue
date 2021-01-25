<template lang="pug">
//- q-layout(
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
          maxWidth: widthPage+'px',
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
              showBar: true,
              showFooter: true,
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
//- q-layout(
  view="hHh Lpr lff").bg-black
  q-page-container
    q-page
div
  div(
    :style=`{
      position: 'fixed', top: '0px', bottom: '0px', zIndex: 10,
      //- transform: 'translate3d(0, 0, 0)',
      //- height: 500+'px',
      //- minHeight: 500+'px',
    }`
    ).row.full-width.bg-black
    div(
      :style=`{
        position: 'relative',
        height: heightPage+'px',
      }`
      ).row.full-width
      content-player(
        @player="player = $event"
        :contentKalpa="contentKalpa"
        :style=`{
          height: '100%',
        }`
        :options=`{
          showHeader: false,
          showBar: true,
          showFooter: true,
        }`
        :styles=`{
          height: '100%',
          objectFit: 'contain',
        }`
        ).full-width.bg-black
  //- header name
  //- transition(enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
    div(
      v-if="player && player.figure"
      :style=`{
        position: 'fixed', zIndex: 1000,
        transform: 'translate3d(0, 0, 0)',
        top: '0px',
        //- height: heightFooter+'px',
        minHeight: '70px',
      }`
      ).row.full-width.items-start.content-start.justify-center.q-pt-sm.q-px-sm.br
      div(
        :style=`{
          maxWidth: '500px',
          borderRadius: '10px',
        }`
        ).row.full-width.b-30
        q-input(
          ref="nodeNameInput"
          v-model="name"
          borderless dark
          type="textarea" autogrow
          :rows="1"
          :maxlength="120"
          placeholder="В чем суть?"
          :input-style=`{
            textAlign: 'center',
            fontSize: '20px',
          }`
          ).full-width
        //- div(v-if="nodeEditing").row.full-width
          div(:style=`{height: '300px'}` @click="nodeEditing = false").row.full-width.br
  //- footer default
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="player && !player.figure"
      :style=`{
        position: 'fixed', zIndex: 1000,
        bottom: '0px',
        height: 70+'px',
      }`
      ).row.full-width.items-start.content-start.justify-center
      nav-mobile(
        @pageId="pageIdChange"
        :pageId="pageId"
        :style=`{
          zIndex: 1000,
        }`)
  //- footer node
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="player && player.figure"
      v-show="!$store.state.ui.userTyping"
      :style=`{
        position: 'fixed', zIndex: 1000,
        bottom: '0px',
        //- height: 70+'px',
        height: heightFooter+'px',
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
            round flat color="white" icon="clear"
          )
          .col
          q-btn(
            round flat color="white" icon="play_arrow"
            )
          //- div(:style=`{position: 'relative',}`).col.q-px-sm
            //- q-btn(
              outline no-caps color="red"
              @click="nodeEditing = false, player.setState('figure', null)").full-width Delete
            //- div(
              v-if="nodeEditing === false"
              @click="nodeEditing = true"
              :style=`{
                position: 'absolute', zIndex: 1000,
              }`
              ).row.fit.br
            //- q-input(
              @click.native="nodeEditing = true"
              ref="nodeNameInput"
              v-model="name"
              borderless dark
              type="textarea" autogrow
              :rows="1"
              :maxlength="120"
              :disable="heightFooter !== $q.screen.height - 170"
              placeholder="В чем суть?"
              :input-style=`{
                textAlign: 'center',
                fontSize: '20px',
              }`
              ).full-width
          .col
          q-btn(
            round flat color="white" icon="refresh"
            )
        .row.full-width.justify-center.q-pt-lg.q-px-xl
          div(:style=`{
            maxWidth: '400px',
          }`).row.full-width
            q-input(
              v-model="name"
              borderless dark dense
              :maxlength="120"
              placeholder="Введите сферу"
              :input-style=`{
                //- textAlign: 'center',
                //- fontSize: '20px',
                background: 'rgb(35,35,35)',
                borderRadius: '10px',
                paddingLeft: '8px',
              }`
              ).full-width
            div().row.full-width.q-pt-sm
              div(v-for="n in 5" :key="n" :style=`{height: '35px', background: 'rgb(35,35,35)', borderRadius: '10px',}`).row.full-width.q-mb-xs
        .row.full-width.justify-center.q-py-sm.q-px-xl
          div(:style=`{maxWidth: '400px'}`).row.full-width
            q-btn(
              outline no-caps color="red"
              @click="nodeEditing = false, player.setState('figure', null)").full-width Delete
            q-btn(
              flat no-caps color="grey-8"
              @click="nodeEditing = false").full-width Close
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
      name: '',
      player: null,
      pageId: null,
      heightPage: 0,
      widthPage: 0,
      node: null,
      nodeEditing: false,
      heightFooter: 70,
    }
  },
  computed: {
    heightPageMin () {
      let width = Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth)
      let d = this.contentKalpa.thumbHeight / this.contentKalpa.thumbWidth
      let height = width * d
      // return height
      return 300
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
    nodeEditing: {
      handler (to, from) {
        if (to) {
          this.$tween.to(this, 0.5, {
            heightPage: this.heightPageMin,
            heightFooter: this.$q.screen.height - 170,
            onComplete: async () => {
              // await this.$wait(500)
              let ref = this.$refs.nodeNameInput
              // this.$log('ref', ref)
              ref.focus()
            }
          })
        }
        else {
          this.$tween.to(this, 0.5, {
            heightPage: this.heightPageMax,
            heightFooter: 70
          })
        }
      }
    },
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
            widthPage: Math.min(this.$q.screen.width, this.$store.state.ui.pageWidth),
            onComplete: () => {
              this.$log('pageId Done to ', to)
              // this.pageId = null
            }
          })
        }
        else {
          this.$tween.to(this, 0.3, {
            heightPage: this.heightPageMax,
            widthPage: Math.max(this.$q.screen.width, this.$store.state.ui.pageWidth),
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
