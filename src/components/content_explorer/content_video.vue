<template lang="pug">
.row.fit
  //- div(:style=`{maxWidth: isDesktop ? '100%' : '100%'}`).col.full-height
  //-   q-tab-panels(ref="kpanels" v-model="tab" :swipeable="!isDesktop" animated keep-alive :style=`{background: 'none'}`).fit
  //-     //- content video
  //-     q-tab-panel(name="content" :style=`{padding: '0px', background: 'none'}`).column.fit
  //-       q-resize-observer(ref="kresize" @resize="onResize")
  //-       div(style=`height: 60px`).row.full-width.items-center.q-px-md.bg-black
  //-         //- h6.q-ma-xs {{content.name}}/{{width}}/{{height}}
  //-         //- q-btn(round flat color="grey-9" icon="keyboard_arrow_left")
  //-         q-icon(name="movie_creation" color='red' size="40px").q-mr-sm
  //-         .col.full-height
  //-           .row.fit.items-center.no-wrap.scroll
  //-             span(style=`whiteSpace: nowrap`).text-bold.text-white {{content.name}}
  //-         //- q-btn(round flat color="grey-4" icon="more_vert" @click="contentMenuClick")
  //-       .col.full-width
  //-         .row.fit
  //-           div(:style=`{position: 'relative', maxHeight: 'calc(100vh - 120px)'}`).row.fit
  //-             video(ref="kvideo" playsinline autoplay type="video/mp4" :src="content.url" preload="none"
  //-               :style=`{width: '100%', height: '100%', objectFit: 'contain'}`)
  //-       //- bar
  //-       div(v-if="false" :style=`{height: '60px', paddingLeft: '10px', paddingRight: '10px'}`).row.full-width.items-center.bg-black
  //-         div(style=`height: 40px; borderRadius: 4px; overflow: hidden`).row.full-width.bg-grey-9
  //-           div(:style=`{width: barNow+'px'}`).row.items-center.bg-white {{nowSec}}/{{content.duration}}
  //-       div(:style=`{height: '60px'}`).row.full-width.justify-end.items-center.q-px-sm.bg-black
  //-         q-btn(v-if="!isDesktop" no-caps color="primary" icon-right="keyboard_arrow_right" @click="$refs.kpanels.goTo('nodes')") {{nodes.length}} nodes
  //-       //- debug
  //-       div(v-if="false").row.full-width.bg-purple
  //-         small width: {{width}}
  //-     //- nodes mobile
  //-     q-tab-panel(name="nodes" :style=`{padding: '0px'}` v-if="!isDesktop")
  //-       content-video-nodes(:nodes="nodes" @nodeClick="nodeClick" @back="$refs.kpanels.goTo('content')")
  //- nodes desktop
  //- div(v-if="isDesktop").col.full-height.bg-black
  //-   content-video-nodes(:nodes="nodes" @nodeClick="nodeClick")
  video-editor(:fragment="fragment" :left="20" :content="content")
</template>

<script>
import contentVideoNodes from './content_video_nodes'
import videoEditor from 'components/video_editor'
// TODO: when nodeClick not go to this node? find this node in this content? logic yeah
// TODO: remember extra information of the route for caching
// TODO: remembering last route when opens the app again? like node creator?
export default {
  name: 'contentExplorer__contentVideo',
  components: {contentVideoNodes, videoEditor},
  props: {
    content: {type: Object}
  },
  data () {
    return {
      me: null,
      player: null,
      width: 500,
      nodes: [],
      nowSec: 0,
      menus: [],
      tab: 'content'
    }
  },
  computed: {
    isDesktop () {
      return this.$q.screen.width > 850
    },
    barNow () {
      return (this.nowSec * (this.width - 20)) / this.content.duration
    },
    fragment () {
      return {
        id: 'zxc',
        tags: ['isdfji'],
        relativePoints: [],
        relativeScale: [],
        content: this.content
      }
    }
  },
  watch: {
    content: {
      immediate: true,
      async handler (to, from) {
        this.$log('content CHANGED', to)
        this.nodes = await this.nodesLoad(to.oid)
      }
    }
  },
  methods: {
    contentMenuClick () {
      this.$log('contentMenuClick')
    },
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      // this.$router.push(`/app/node/${n.oid}`)
      // TODO: open context menu for  desiding what to do
      // TODO: context menu for app?
      // TODO: what fragment to take? first or second? takes first...
      if (!this.isDesktop) this.$refs.kpanels.goTo('content')
      this.player.setCurrentTime(n.fragmentsPoints[0].relativePoints[0]['x'])
    },
    async nodesLoad (oid) {
      this.$log('nodesLoad start')
      let {data: {contentTopNodes: nodes}} = await this.$apollo.query({
        query: gql`
          query contentTopNodes($oid: OID!) {
            contentTopNodes (contentOid: $oid) {
              objectShort{
                oid
                name
                type
                createdAt
                thumbUrl(preferWidth: 600)
              }
              fragments{
                relativePoints{x}
                relativeScale
              }
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('nodesLoad done', nodes)
      // return nodes
      // return nodes.map(n => n.objectShort)
      return nodes.map(n => {
        return {fragmentsPoints: n.fragments, ...n.objectShort}
      })
    },
    timeUpdate (e) {
      this.nowSec = this.player.currentTime
      this.$emit('now', this.player.currentTime)
    },
    playing (e) {
      this.$log('VIDEO STARTED')
    },
    onResize (e) {
      this.$log('onResize', e)
      this.$set(this, 'width', e.width)
    }
  },
  mounted () {
    this.$log('mounted')
    // this.$refs.kresize.trigger()
    // this.me = new self.MediaElementPlayer(this.$refs.kvideo, {
    //   loop: true,
    //   autoplay: true,
    //   controls: false,
    //   showPosterWhenPaused: false,
    //   clickToPlayPause: true,
    //   iPadUseNativeControls: false,
    //   iPhoneUseNativeControls: false,
    //   AndroidUseNativeControls: false,
    //   pauseOtherPlayers: false,
    //   alwaysShowControls: true,
    //   stretching: 'fill',
    //   success: async (mediaElement, originalNode, instance) => {
    //     this.player = mediaElement
    //     this.player.addEventListener('timeupdate', this.timeUpdate, false)
    //     this.player.addEventListener('playing', this.playing, false)
    //     this.$log('player LOADED')
    //   }
    // })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.player.removeEventListener('timeupdate', this.timeUpdate)
    // this.player.removeEventListener('playing', this.playing)
  }
}
</script>
